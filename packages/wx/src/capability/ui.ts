import { ProxyApp } from '../app'
import { WxCapability } from '.'


export class UI extends WxCapability {
  static kSymbol = Symbol.for('ui')
  static create (proxy: ProxyApp, ...rests: unknown[])
  static create (proxy: ProxyApp): Promise<UI> {
    return new Promise((resolve) => {
      resolve(new UI(proxy))
    })
  }

  constructor (proxy: ProxyApp) {
    super(proxy)

    this
      .on('showToast', this.showToast)
      .on('showNavigationBarLoading', this.showNavigationBarLoading)
      .on('setNavigationBarTitle', this.setNavigationBarTitle)
      .on('setNavigationBarColor', this.setNavigationBarColor)
  }

  showNavigationBarLoading = (options: unknown) => {
    return this.proxy.send({
      command: 'message::invoke',
      payload: {
        parameters: ['showNavigationBarLoading', options]
      }
    })
  }

  setNavigationBarTitle = (options: unknown) => {
    return this.proxy.send({
      command: 'message::invoke',
      payload: {
        parameters: ['setNavigationBarTitle', options]
      }
    })
  }

  setNavigationBarColor = (options: unknown) => {
    return this.proxy.send({
      command: 'message::invoke',
      payload: {
        parameters: ['setNavigationBarColor', options]
      }
    })
  }

  showToast = (options: unknown) => {
    return this.proxy.send({
      command: 'message::invoke',
      payload: {
        parameters: ['showToast', options]
      }
    })
  }
}