import { WxCapability } from '../../../capability'
import { ProxyApp } from '../..'

export class Controller extends WxCapability<ProxyApp> {
  static kSymbol = Symbol.for('controller')
  static create (proxy: ProxyApp): Promise<Controller> {
    return new Promise((resolve) => {
      resolve(new Controller(proxy))
    })
  }

  constructor (proxy: ProxyApp) {
    super(proxy)

    this
      .on('navigateTo', this.navigateTo)
      .on('navigateBack', this.navigateBack)
  }

  navigateTo = (data: { url: string }) => {
    return Promise.resolve().then(() => {
      let url = data.url.replace(/^\/|\.html$/g, '')

      if (url.indexOf('/') === 0) {
        url = data.url.slice(1)
      }

      this.proxy.navigateTo({ path: url })
    })
  }

  navigateBack = (delta: number = -1) => {
    return Promise.resolve().then(() => this.proxy.navigateBack(delta))
  }
  
}