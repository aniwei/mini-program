
import { ProxyView } from '../../proxy'
import { WxCapability } from '../../../capability'
import { Asset } from '@catalyzed/basic'



export class Utililty extends WxCapability<ProxyView> {
  static kSymbol = Symbol.for('utility')
  static create (proxy: ProxyView): Promise<Utililty> {
    return new Promise((resolve) => resolve(new Utililty(proxy)))
  }

  

  constructor (proxy: ProxyView) {
    super(proxy)

    this.on('getCurrentRoute', this.getCurrentRoute, 'sync')
    this.on('getLocalImgData', this.getLocalImgData, 'sync')
  }

  getLocalImgData = (data: { path: string }) => {
    const asset = this.proxy.findByFilename(data.path) as Asset ?? null

    if (asset !== null) {
      return {
        localData: `data:image/png;base64,${asset.data}`
      }
    }
  }

  getCurrentRoute = () => {
    return {
      route: this.proxy.path
    }
  }
}

