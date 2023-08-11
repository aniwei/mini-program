import { ProxyApp } from '../app'
import { WxCapability } from '.'


export class System extends WxCapability {
  static kSymbol = Symbol.for('system')
  static create (proxy: ProxyApp): Promise<System> {
    return new Promise((resolve) => {
      resolve(new System(proxy))
    })
  }

  constructor (proxy: ProxyApp) {
    super(proxy)

    this
      .on('getSystemInfo', this.getSystemInfoSync, 'sync')
      .on('getSystemInfoSync', this.getSystemInfoSync, 'sync')
  }

  getSystemInfoSync = () => {
    return {
      SDKVersion: '2.33.0'
    }
  }
}