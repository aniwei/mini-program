import debug from 'debug'
import bytes from 'bytes'
import { EventEmitter } from './events'
import { 
  MessageContent, 
  MessageError,
  MessageOwner, 
  MessageTransport, 
  MessageTransportCommands, 
  MessageTransportPort, 
  MessageTransportStateKind 
} from './transport'
import invariant from 'ts-invariant'
import { UnsupportError } from './unsupport'

const transport_debug = debug('work')


export type MessagePort = {
  onmessage: null | ((data: MessageEvent<unknown>) => void)
  onmessageerror?: null | ((error: any) => void),
  onerror?: null | ((error: any) => void),
  onopen?: null | (() => void),
  postMessage?: (data: string | ArrayBufferLike | ArrayBufferView | Blob | unknown) => void
  send?: (data: string | ArrayBufferLike | ArrayBufferView | Blob | unknown) => void
  close: () => void
}

export class WorkPort<T extends string = string> extends EventEmitter<'open' | 'message' | 'error' | 'close' | 'connected' | T> implements MessageTransportPort {
  protected port: MessagePort

  constructor (port: MessagePort) {
    super()

    port.onmessage = this.handleMessage
    port.onmessageerror = this.handleError
    port.onerror = this.handleError
    port.onopen = this.handleOpen

    this.port = port
  }

  handleMessage = (...args: unknown[]) => this.emit('message', ...args)
  handleError = (error: unknown) => this.emit('error', error)
  handleOpen = (...args: unknown[]) => this.emit('open', ...args)
  
  // 发送数据
  send (message: unknown) {
    return this.port.postMessage 
      ? this.port.postMessage(message as string) 
      : this.port.send ? this.port.send(message as string) : null
  }

  // 关闭连接
  close () {
    this.port.onmessage = null
    this.port.onmessageerror = null
    this.port.onopen = null
    this.port.close()
  }
}

export class MessageConv {
  static conv = new MessageConv()
  
  static decode (data: unknown) {
    return MessageConv.conv.decode(data)
  }

  static encode (data: string) {
    return MessageConv.conv.encode(data)
  }

  public decoder: TextDecoder = new TextDecoder()
  public encoder: TextEncoder = new TextEncoder()
  
  decode (data: unknown) {
    if (typeof globalThis.Blob !== 'undefined' && data instanceof Blob) {
      return data.arrayBuffer().then(buffer => this.decoder.decode(buffer))
    } else {
      return Promise.resolve().then(() => this.decoder.decode(data as Buffer))
    }
  }
  
  encode (data: string) {
    return Promise.resolve().then(() => this.encoder.encode(data))
  }
}

export class MessageData {
  static LIMIT: number = bytes.parse('2mb')
  
  static ID_LENGTH = String(Number.MAX_SAFE_INTEGER).length
  static MESSAGE_ID_LENGTH = String('message::id::').length + MessageData.ID_LENGTH
  static INDEX_LENGTH = 1
  static COUNT_LENGTH = 1
  static HEADER_LENGTH = MessageData.MESSAGE_ID_LENGTH + MessageData.INDEX_LENGTH + MessageData.COUNT_LENGTH

  static encode (
    id: string, 
    index: number, 
    count: number, 
    chunk: Uint8Array
  ) {
    return Promise.all([
      MessageConv.encode(id),
      MessageConv.encode(String(index)),
      MessageConv.encode(String(count))
    ]).then(buffers => {
      const view = new Uint8Array(MessageData.HEADER_LENGTH + chunk.length)
      let offset = 0
      for (const buffer of buffers) {
        view.set(buffer, offset)
        offset += buffer.byteLength
      }
      view.set(chunk, offset)

      return view
    })
  }

  static decode (content: Uint8Array) {


    let offset = 0
    return Promise.all([
      MessageConv.decode(content.subarray(0, offset = MessageData.MESSAGE_ID_LENGTH)),
      MessageConv.decode(content.subarray(offset, offset = offset + MessageData.INDEX_LENGTH)),
      MessageConv.decode(content.subarray(offset, offset = offset + MessageData.COUNT_LENGTH)),
      content.subarray(offset, content.length)
    ]).then(data => data)
  }
}

export class WorkTransport<T extends string = string> extends MessageTransport<WorkPort<T>> {
  public _index: number = 0
  public get index () {
    let index = (this._index++)
    if (index >= Number.MAX_SAFE_INTEGER) {
      index = this._index = 0
    }
    
    const value = String(index)
    return Array(MessageData.ID_LENGTH - value.length).fill(0).join('') + value
  }

  /**
   * 连接
   * @param {string} uri 
   * @param {WorkPort} port 
   */
  connect (uri: unknown)
  connect (port: WorkPort) {
    ;(port as WorkPort).on('message', async (event: MessageEvent) => MessageReceivers.receive(event, async (data) => {
      const message = new MessageOwner(this, data as MessageContent<{ [key: string]: unknown} >)
      try {
        const handle = this.commands?.get(message.command as string)

        if (handle) {
          await handle(message)
        } else {
          transport_debug(`无指令处理 %s`, message.command)
        }
      } catch (error: any) {
        if (message?.id) {
          this.except(message.id, error)
        }
      }
    })).on(`error`, (error: any) => {
      this.transport = null
      this.state = MessageTransportStateKind.Error

      ;(port as WorkPort).removeAllListeners()
      this.emit('error', error)
    }).on(`open`, () => {
      this.state = MessageTransportStateKind.Connected
      this.emit('open')
    })

    super.connect(port)
  }

  /**
   * 发送数据
   * @param {MessageContent} content 
   * @returns {Promise<unknown>}
   */
  send (content: MessageContent<string | { [key: string]: unknown }, MessageTransportCommands>): Promise<MessageOwner> {
    return new Promise(async (resolve, reject) => {
      const id = `message::id::${this.index}`

      this.once(id, (messager: MessageOwner) => {
        messager.command === 'message::except' 
          ? reject(new MessageError(messager)) 
          : resolve(messager)
      })

      try {        
        invariant(this.transport)
        const sender = new MessageSender(id, this.transport)
        sender.send({
          ...content,
          id,
          state: this.state
        })  
      } catch (error: any) {
        this.except(content.id!, error)
        reject(error)
      }
    })
  }
}

export interface MessageChunk {
  index: number,
  data: Uint8Array
}

export class MessageReceiver extends EventEmitter<'finished' | 'progress'> {
  public id:  string
  public count: number
  public byteLength: number = 0
  public chunks: MessageChunk[] = []

  constructor (id: string, count: number) {
    super()
    this.id = id
    this.count = count
  }

  receive (index: number, chunk: Uint8Array) {
    this.chunks.push({ index, data: chunk })
    this.byteLength += chunk.byteLength
    
    if (this.count > this.chunks.length) {
      this.emit('progress', this.chunks.length / this.count)
    } else {
      let offset = 0
      const view = new Uint8Array(this.byteLength)

      for (const chunk of this.chunks.sort((chunkA, chunkdB) => {
        return chunkA.index > chunkdB.index ? 1 : 1
      })) {
        view.set(chunk.data, offset)
        offset = offset + chunk.data.byteLength
      }

      MessageConv.decode(view.buffer).then(data => this.emit('finished', JSON.parse(data)))
    }
  }
}

export class MessageReceivers {
  static receivers: Map<string, MessageReceiver> = new Map()

  static get (id: string) {
    return this.receivers.get(id)
  }

  static set (id: string, receiver: MessageReceiver) {
    return this.receivers.set(id, receiver)
  }

  static has (id: string) {
    return this.receivers.has(id)
  }

  static delete (id: string) {
    return this.receivers.delete(id)
  }
  
  static async receive (event: MessageEvent, OnEndHandle: (data: MessageContent<unknown>) => void) {
    const [id, index, count, chunk] = await MessageData.decode(new Uint8Array(event.data ?? event))
    
    if (!id || !index || !count || !chunk) {
      throw new UnsupportError(`Unsupport this message.`)
    }

    let receiver = MessageReceivers.get(id) as MessageReceiver ?? null

    if (receiver === null) {
      receiver = new MessageReceiver(id, parseInt(count))
      receiver.once('finished', (data) => {
        OnEndHandle(data)
        MessageReceivers.delete(id)
      })
      MessageReceivers.set(id, receiver) 
    }

    receiver.receive(parseInt(index), chunk)
    return receiver
  }

}

export class MessageSender extends EventEmitter<string> {
  public id: string
  public transport: WorkPort

  constructor (
    id: string, 
    transport: WorkPort, 
  ) {
    super()

    this.id = id
    this.transport = transport
  }

  createFibers (content: Uint8Array) {
    if (content.byteLength <= MessageData.LIMIT) {
      return [content]
    }

    const filbers: Uint8Array[] = []
    const count = Math.ceil(content.byteLength / MessageData.LIMIT)
    let index = 0
    while (index < count) {
      const offset = index * MessageData.LIMIT
      filbers.push(content.subarray(offset, offset + MessageData.LIMIT))
      index++
    }

    return filbers
  }

  send (content: unknown) {
    return MessageConv.encode(JSON.stringify(content)).then(content => {
      const fibers = this.createFibers(content)
      return Promise.all(fibers.map((chunk, index) => {
        return MessageData.encode(this.id, index, fibers.length, chunk).then(data => this.transport.send(data.buffer))
      }))
    })
  }
}
