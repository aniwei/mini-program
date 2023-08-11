import { ProxyApp } from '../app'
import { WxCapability } from '.'


export class Network extends WxCapability {
  static kSymbol = Symbol.for('network')
  static create (delegate: ProxyApp): Promise<Network> {
    return new Promise((resolve) => {
      return resolve(new Network(delegate))
    })
  }

  constructor (proxy: ProxyApp) {
    super(proxy)

    this.on('getNetworkType', this.getNetworkType)
  }

  getNetworkType = () => {
    return Promise.resolve({
      networkType: 'wifi' 
    })
  }
}

