
import { ProxyApp } from '../app'
import { WxCapability } from '.'


export class Controller extends WxCapability {
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
    return this.proxy.send({
      command: 'message::invoke',
      payload: {
        method: 'Invoke',
        parameters: ['navigateTo', data]
      }
    })
  }

  navigateBack = (delta: number = -1) => {
    return this.proxy.send({
      command: 'message::invoke',
      payload: {
        parameters: ['navigateBack', delta]
      }
    })
  }
}