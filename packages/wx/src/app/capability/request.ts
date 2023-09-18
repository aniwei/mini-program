
import { ProxyApp } from '..'
import { WxCapability } from '../../capability'


export class Request extends WxCapability<ProxyApp> {
  static kSymbol = Symbol.for('request')

  static create (proxy: ProxyApp): Promise<Request> {
    return new Promise((resolve) => {
      return resolve(new Request(proxy))
    })
  }

  constructor (proxy: ProxyApp) {
    super(proxy)

    this.on('createRequestTask', this.createRequestTask)
  }

  createRequestTask = (data: unknown) => {
    return this.proxy.send({
      command: 'message::invoke',
      payload: {
        parameters: ['createRequestTask', data]
      }
    })
  }
}

