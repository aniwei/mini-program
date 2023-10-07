import { invariant } from 'ts-invariant'
import { Asset, AssetProcess } from '@catalyzed/basic'
import { WxAssetsBundle } from '@catalyzed/asset'


class AssetJSON extends AssetProcess {
  static create <T extends AssetJSON> (): T {
    return super.create('.json')
  }

  decode (asset: Asset): Promise<void> {
    return Promise.resolve().then(() => {
      invariant(asset.source !== null && asset.source !== undefined)
      asset.data = JSON.parse(asset.source.toString())
    })
  }
}

// Default
class AssetDefault extends AssetProcess {
  static create <T extends AssetDefault> (): T {
    return super.create('*')
  }

  decode (asset: Asset): Promise<void> {
    return Promise.resolve().then(() => {
      invariant(asset.source !== null && asset.source !== undefined)
      asset.data = asset.source as string
    })
  }
}

WxAssetsBundle.processor.register(AssetDefault.create())
WxAssetsBundle.processor.register(AssetJSON.create())