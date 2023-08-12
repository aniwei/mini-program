
import { ProxyApp } from '../../app'
import { WxCapability } from '..'

export class Request extends WxCapability {
  static kSymbol: string = 'request'
  static create (proxy: ProxyApp): Promise<Request> {
    return new Promise((resolve) => resolve(new Request(proxy)))
  }

  constructor (proxy: ProxyApp) {
    super(proxy)

    this
      .on('createRequestTask', this.createRequestTask)
  }

  createRequestTask = (data: unknown) => {
    return Promise.resolve().then(() => {
      // return useWx.getState().api.Program.commands.createRequestTask(data)
    })
  }
}