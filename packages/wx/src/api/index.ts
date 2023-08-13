import invariant from 'ts-invariant'
import debug from 'debug'
import { WorkPort } from '@catalyze/basic'
import * as Api from '@catalyze/wx-api'

const api_debug = debug('wx:api')

export type ReadyHandle = () => void


export  class WxApiTransport extends Api.WxApiTransport {
  connect (uri: string) {
    const socket = new WebSocket(uri)
    const port = new WorkPort(socket as unknown as MessagePort)

    super.connect(port)
  }
}

export class WxApi extends Api.WxApi {
  static create () {
    return new WxApi()
  }

  public uri: string | null = null

  reconnect () {
    invariant(this.uri !== null, `The "uri" member value cannot be null.`)
    this.connect(this.uri)
  }

  connect (uri: unknown) {
    api_debug(`开始连接服务器 <uri:%s>`, uri)

    if (
      this.state & Api.WxApiState.Created || 
      this.state & Api.WxApiState.Disconnected
    ) {
      this.transport?.close()
      this.state |= Api.WxApiState.Connecting
      const transport = new WxApiTransport()
  
      transport.connect(uri as string)
      super.connect(transport)
    }

    this.uri = uri as string
  }

  disconnect () {
    this.transport?.close()
  }
}