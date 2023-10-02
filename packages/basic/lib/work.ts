import debug from 'debug'
import { invariant } from 'ts-invariant'
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
import { 
  MessageData, 
  MessageReceivers, 
  MessageSender 
} from './message'
import { paddingLeft } from './helpers'

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
  public _index: number = 0
  public get index () {
    let index = (this._index++)
    if (index >= Number.MAX_SAFE_INTEGER) {
      index = this._index = 0
    }
    
    return paddingLeft(index, MessageData.ID_LENGTH)
  }

  /**
   * 连接
   * @param {string} uri 
   * @param {WorkPort} port 
   */
  connect (uri: unknown): void
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
