import { invariant } from 'ts-invariant'
import { 
  ApiJSON, 
  BaseApi, 
  MessageContent, 
  MessageOwner, 
  MessageTransport 
} from '@catalyze/basic'
import { WxAssetsBundle } from '@catalyze/asset'
import { WxApiTransport } from './transport'
import WxApiJSON from './api.json'

export enum WxQRCodeStateKind {
  Uncreated = 'uncreated',
  Created = 'created',
  Alive = 'alive',
  Cancelled = 'cancelled',
  Scanned = 'scanned',
  Timeout = 'timeout'
}

export interface WxQRCode {
  base64: string
}

export interface WxUser {
  nickname: string,
  avatarURL: string
}


export interface WxLogin {
  code: string,
  appname: string,
  appicon_url: string,
  state: string
}

export type WxApiEvent = `Auth.signIn` | `Auth.signOut` | `Auth.initialed` | `Auth.WxQRCodeStateKindChanged`

export interface WxApiService<T extends string> extends BaseApi<WxApiEvent | T> {
  Auth: {
    commands: {
      getUser (): Promise<WxUser>
      getAuthenticateWxQRCode (): Promise<string>
    }

    events: {
      WxQRCodeStateKindChanged (status: WxQRCodeStateKind): Promise<void>,
      signIn (user: WxUser): Promise<void>
    }
  }, 
  Program: {
    commands: {
      getWxAssetsBundle (): Promise<WxAssetsBundle>
      compile (): Promise<string[]>
      invoke (name: string, data: unknown, id: number): Promise<unknown>
      login (): Promise<WxLogin>
      createRequestTask (data: unknown): Promise<unknown>
    },
    events: {
      publish (name: string, options: unknown, parameters: unknown[]): Promise<void>
    }
  }
}

export enum WxApiStateKind {
  Created = 1,
  Connecting = 2,
  Connected = 4,
  Ready = 8,
  Disconnected = 16,
  Error = 32,
}

export type ReadyHandle = () => void

export abstract class WxApiService<T extends string> extends BaseApi<WxApiEvent | T> {
  constructor (transport?: MessageTransport) {
    super(WxApiJSON as ApiJSON, transport ?? null)
  }
}

export type WxApiQueueHandle = () => void

export abstract class WxApi extends WxApiService<'ready' | 'connected' | 'disconnected' | 'error'> {
  public state: WxApiStateKind = WxApiStateKind.Created
  public queue: WxApiQueueHandle[] = []

  constructor () {
    super()

    this.once('connected', () => {
      if (this.queue.length > 0) {
        let q = this.queue.shift() ?? null
        while (q !== null) {
          q()
          q = this.queue.pop() ?? null
        }
      }
    })
  }

  send (content: MessageContent): Promise<MessageOwner> {
    if (this.state & WxApiStateKind.Connected) {
      invariant(this.transport)
      return this.transport.send(content)
    }

    return new Promise((resolve, reject) => {
      this.queue.push(() => {
        this.send(content).then(resolve).catch(reject)
      })
    })
  }

  connect (uri: unknown): void
  connect (transport: WxApiTransport): void {
    this.state |= WxApiStateKind.Created

    transport.on('error', () => {
      this.state &= ~WxApiStateKind.Connecting
      this.state = WxApiStateKind.Error
      this.emit('error', this.state)
    }).on('open', () => {
      this.state &= ~WxApiStateKind.Connecting
      this.state = WxApiStateKind.Connected
      this.emit('connected', this.state)
    }).on('close', () => {
      this.state = WxApiStateKind.Disconnected | WxApiStateKind.Connected
      this.emit('disconnected', this.state)
    })

    this.transport = transport
  }

  disconnect () {
    this.transport?.close()
  }
}