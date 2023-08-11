
import { ProxyApp } from '../app'
import { WxCapability } from '.'


export class Request extends WxCapability {
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

