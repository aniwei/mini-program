import debug from 'debug'
import { invariant } from 'ts-invariant'
import { WxApiService } from '@catalyze/wx-api'
import { WxTransport } from './transport'

const wx_debug = debug(`app:libs:wx`)

export enum WxApiState {
  Created,
  Connecting,
  Connected,
  Ready,
  Disconnected,
  Error,
}

export type ReadyHandle = () => void

export class WxApi extends WxApiService<'ready' | 'connected' | 'disconnected' | 'error'> {
  static create () {
    return new WxApi()
  }

  public state: WxApiState = WxApiState.Created
  public uri: string | null = null

  public queue: ReadyHandle[] = []

  ready (readyHandle?: ReadyHandle) {
    if (readyHandle === undefined) {
      this.state |= WxApiState.Ready
      let readyHandle = this.queue.shift() ?? null

      while (readyHandle !== null) {
        readyHandle()
        readyHandle = this.queue.shift() ?? null
      }
    } else {
      if (this.state & WxApiState.Ready) {
        readyHandle()
      } else {
        this.queue.push(readyHandle)
      }
    }
  }

  reconnect () {
    invariant(this.uri !== null, `The "uri" member value cannot be null.`)
    this.connect(this.uri)
  }

  connect (uri: string) {
    wx_debug(`开始连接服务器 <uri:%s>`, uri)

    
    if (
      this.state & WxApiState.Created || 
      this.state & WxApiState.Disconnected
    ) {
      this.transport?.close()
      this.state |= WxApiState.Connecting
  
      const transport = new WxTransport()
      transport.on(`error`, () => {
        this.state &= ~WxApiState.Connecting

        this.state = WxApiState.Error
        this.emit(`error`, this.state)
      }).on(`open`, () => {
        this.state &= ~WxApiState.Connecting
        this.state = WxApiState.Connected
        this.emit(`connected`, this.state)
      }).on(`close`, () => {
        this.state = WxApiState.Disconnected | WxApiState.Connected
        this.emit(`disconnected`, this.state)
      })
  
      transport.connect(uri)
      this.transport = transport
    }

    this.uri = uri
  }
}
