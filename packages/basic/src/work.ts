import debug from 'debug'
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
  
  send (message: unknown) {
    return this.port.postMessage 
      ? this.port.postMessage(message as string) 
      : this.port.send ? this.port.send(message as string) : null
  }

  close () {
    this.port.onmessage = null
    this.port.onmessageerror = null
    this.port.onopen = null
    this.port.close()
  }
}

export class WorkTransport<T extends string = string> extends MessageTransport<WorkPort<T>> {
  public index: number = 0
  public count: number = 0

  /**
   * 
   * @param port 
   */
  connect (uri: unknown)
  connect (port: WorkPort) {

    (port as WorkPort).on('message', async (event: MessageEvent) => {
      let content

      try {
        content = JSON.parse(event.data ?? event)
        transport_debug('接收信息 %o', { command: content.command, id: content.id })

        const messager = new MessageOwner(this, { ...content })
        const handle = this.commands?.get(content.command)

        if (handle) {
          await handle(messager)
        } else {
          transport_debug(`无指令处理 %s`, content.command)
        }
      } catch (error: any) {
        if (content?.id) {
          this.except(content.id, error)
        }
      }
    }).on(`error`, (error: any) => {
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
   * 
   * @param content 
   * @returns 
   */
  send (content: MessageContent<string | { [key: string]: unknown }, MessageTransportCommands>): Promise<MessageOwner> {
    return new Promise((resolve, reject) => {
      const id = `_message_id_${this.index++}`

      try {        
        this.transport?.send(JSON.stringify({ 
          ...content, 
          id, 
          count: this.count, 
          state: this.state 
        }))
        
        this.once(id, (messager: MessageOwner) => {
          messager.command === 'message::except' 
            ? reject(new MessageError(messager)) 
            : resolve(messager)
        })
      } catch (error: any) {
        this.except(content.id!, error)
        reject(error)
      }
    })
  }
}