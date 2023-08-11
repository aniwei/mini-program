import { EventEmitter } from './events'


export type MessageTransportCommands = 'message::received' | 'message::callback' | 'message::except' | 'message::content' | 'endpoint::connect' | 'endpoint::authenticate' | string


/**
 * 指令处理函数
 */
type MessageHandle = (messager: MessageOwner) => Promise<MessageOwner | MessageContent | void> | void

export type MessageContent<T = {
  [key: string]: unknown
} | string | null | undefined | void, C extends MessageTransportCommands = MessageTransportCommands> = {
  id?: string,
  sid?: string
  command?: C,
  count?: number,
  payload?: T,
}

export enum MessageOwnerState {
  Active = 1,
  Replied = 2
}

export abstract class MessageTransportPort {
  abstract send (message: unknown): void
  abstract close (): void
  abstract on (event: 'message' | 'close' | 'error', listener: () => void): this
  abstract once (event: 'message' | 'close' | 'error', listener: () => void): this
  abstract off (event: 'message' | 'close' | 'error', listener: () => void): this
  abstract removeAllListeners (event?: string | symbol): this
}

export class MessageError extends Error {
  public sid: string
  public detail: string
  public command: MessageTransportCommands

  /**
   * 
   * @param messager 
   */
  constructor (messager: MessageOwner) {
    const payload = messager.payload as ({
      message: string,
      stack: string
    })

    super(payload?.message as string)

    this.command = messager.command as MessageTransportCommands
    this.sid = messager.sid as string
    this.detail = payload?.stack as string
    this.stack = payload.stack
  }
}

/**
 * 信息对象
 */
export class MessageOwner {
  public transport: MessageTransport
  public content: MessageContent
  public state: MessageOwnerState = MessageOwnerState.Active

  public get id () {
    return this.content.id
  }

  public get sid () {
    return this.content.sid
  }

  public get payload () {
    return this.content.payload
  }

  public get command () {
    return this.content.command
  }

  /**
   * 构造信息对象
   * @param {MessageTransport} transport 终端
   * @param {MessageContent} content 
   */
  constructor (transport: MessageTransport, content: MessageContent) {
    this.transport = transport
    this.content = content
  }

  /**
   * 发送指令
   * @param {MessageContent} content 
   * @returns {Promise<Messager>}
   */
  send (content: MessageContent) {
    return this.transport.send({ ...content, sid: this.id })
  }

  /**
   * 回复指令
   * @param {MessageContent} content 
   */
  reply (content: MessageContent) {
    if (this.state === MessageOwnerState.Active) {
      this.state = MessageOwnerState.Replied
      this.send({ ...content, command: 'message::callback' })
    }
  }

  /**
   * 回复收到指令
   */
  receive () {
    if (this.state === MessageOwnerState.Active) {
      this.state = MessageOwnerState.Replied
      this.send({ command: 'message::received' })
    }
  }
}


export enum MessageTransportState {
  // 活跃
  Ready = 1,
  // 空闲
  Connected = 2,
  // 销毁
  Disconnected = 4,
  // 错误
  Error = 8
}

/**
 * 终端
 */
export abstract class MessageTransport<
  T extends MessageTransportPort = MessageTransportPort, 
  S extends MessageTransportState = MessageTransportState,
  Command extends MessageTransportCommands = MessageTransportCommands,
> extends EventEmitter<`open` | `close` | `message` | `error` | string> {
  public state: S
  public transport: T | null = null
  
  // 指令集
  public commands: Map<Command, MessageHandle> | null = new Map()

  constructor () {
    super()
    this.state = MessageTransportState.Ready as S
  }

  /**
   * 注册指令
   * @param {MessageCommands} command
   * @param {MessageHandle} handle 
   * @returns 
   */
  public command (command: Command, handle: MessageHandle) {
    this.commands?.set(command, async (messager: MessageOwner) => {
      const resp = await handle(messager)

      if (messager.command !== 'message::received') {
        resp !== undefined 
          ? messager.reply(resp) 
          : messager.receive()
      }
    })
    return this
  }

  /**
   * 注册基本指令
   */
  protected registerCommands () {
    [
      'message::received', 
      'message::callback', 
      'message::except',
    ].forEach(command => this.command(command as Command, async messager => { this.emit(messager.sid as string, messager)}))
  }
  
  connect (transport: unknown): void {
    this.transport = transport as T
    this.registerCommands()
  }

  /**
   * 指令异常
   * @param sid 
   * @param error 
   */
  except (sid: string, error: any) {
    this.send({
      sid,
      command: 'message::except',
      payload: {
        message: error.message,
        stack: error.stack
      }
    })
  }

  abstract send (content: MessageContent): Promise<MessageOwner>


  /**
   * 关闭终端
   */
  close () {
    this.transport?.close()
  }

  /**
   * 终端描述
   * @returns {{}} 
   */
  toJSON () {
    return {
      state: this.state
    }
  }
}