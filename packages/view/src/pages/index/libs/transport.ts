import { WorkPort, WorkTransport, MessagePort } from '@catalyze/basic'

export class WxTransport extends WorkTransport {
  protected index: number = 0
  protected count: number = 0

  connect (uri: string) {
    const socket = new WebSocket(uri)
    const port = new WorkPort(socket as unknown as MessagePort)

    super.connect(port)
  }
}