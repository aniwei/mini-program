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
  MessageTransportState 
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

export class WorkTransport<T extends string = string> extends MessageTransport<WorkPort<T>> {
  static LIMIT: number = bytes.parse('2mb')
  
  public index: number = 0

  /**
   * 连接
   * @param {string} uri 
   * @param {WorkPort} port 
   */
  connect (uri: unknown)
  connect (port: WorkPort) {
    ;(port as WorkPort).on('message', async (event: MessageEvent) => MessageReceivers.receive(event, async (message: MessageOwner) => {
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
      this.state = MessageTransportState.Error

      ;(port as WorkPort).removeAllListeners()
      this.emit('error', error)
    }).on(`open`, () => {
      this.state = MessageTransportState.Connected
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
      const id = `message::id::${this.index++}`

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
    if (data instanceof Blob) {
      return data.arrayBuffer().then(buffer => this.decoder.decode(buffer))
    } else {
      return Promise.resolve().then(() => this.decoder.decode(data as Buffer))
    }
  }
  
  encode (data: string) {
    return Promise.resolve().then(() => this.encoder.encode(data))
  }
}

export class MessageReceiver extends EventEmitter<'data' | 'end'> {
  public id:  string
  public chunks: ArrayBufferLike[] = []

  constructor (id: string) {
    super()
    this.id = id
  }

  receive (content) {
    debugger
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
  
  static async receive (event: MessageEvent, OnEndHandle: (message: MessageOwner) => void) {
    const data = await MessageConv.decode(event.data ?? event)
    const content = JSON.parse(data as string)
    
    if (content.command !== 'message::content') {
      throw new UnsupportError(`Unsupport this command "${content.command}".`)
    }

    let receiver = MessageReceivers.get(content.id) as MessageReceiver ?? null

    if (receiver === null) {
      receiver = new MessageReceiver(content.id)
      receiver.once('end', OnEndHandle)
      MessageReceivers.set(content.id, receiver) 
    }

    receiver.receive(content)
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

  createFibers (content: ArrayBufferLike) {
    if (content.byteLength <= WorkTransport.LIMIT) {
      return [content]
    }

    const filbers: ArrayBuffer[] = []
    let count = Math.ceil(content.byteLength / WorkTransport.LIMIT)
    while (count > 0) {
      const offset = count * WorkTransport.LIMIT
      filbers.push(content.slice(offset, offset + WorkTransport.LIMIT))
      count--
    }

    return filbers
  }

  send (content: unknown) {
    return MessageConv.encode(JSON.stringify({ content })).then(content => {
      const fibers = this.createFibers(content)
      return Promise.all(fibers.map((chunk, index) => {
        return MessageConv.encode(JSON.stringify({
          id: this.id,
          command: 'message::content',
          payload: {
            index,
            chunk,
            count: fibers.length,
          }
        })).then(data => this.transport.send(data))
      }))
    })
  }
}
