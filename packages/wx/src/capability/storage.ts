import { ProxyApp } from '../app'
import { WxCapability } from '.'


export class Storage extends WxCapability {
  static kSymbol = Symbol.for('storage')
  static create (proxy: ProxyApp): Promise<Storage> {
    return new Promise((resolve) => {
      resolve(new Storage(proxy))
    })
  }

  constructor (proxy: ProxyApp) {
    super(proxy)

    this
      .on('setStorage', this.setStorage)
      .on('setStorage', this.getStorage)
  }

  setStorage = (key: string, value: unknown) => {
    localStorage.setItem(
      key, 
      JSON.stringify({
        type: typeof value === 'string' ? 'string' : 'object',
        value
      })
    )
  }

  getStorage = (key: string) => {
    const data = localStorage.getItem(key) ?? null
    if (data !== null) {
      const result = JSON.parse(data)
      if (result.type === 'object') {
        return JSON.parse(result.value)
      }

      return result.value
    }
  }
}
