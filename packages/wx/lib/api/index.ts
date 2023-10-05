import { invariant } from 'ts-invariant'
import debug from 'debug'
import { WorkPort } from '@catalyzed/basic'
import * as Api from '@catalyzed/api'

const api_debug = debug('wx:api')

export type ReadyHandle = () => void


export  class WxApiTransport extends Api.WxApiTransport {
  connect (uri: string) {
    const socket = new WebSocket(uri)
    socket.binaryType = 'arraybuffer'
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
      this.state & Api.WxApiStateKind.Created || 
      this.state & Api.WxApiStateKind.Disconnected
    ) {
      this.transport?.close()
      this.state |= Api.WxApiStateKind.Connecting
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