import invariant from 'ts-invariant'
import { Asset, AssetDataProcessor } from '@catalyze/basic'
import { WxAssetsBundle } from '@catalyze/wx-asset'

class AssetJSONProcessor extends AssetDataProcessor {
  static create () {
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
class AssetDefaultProcessor extends AssetDataProcessor {
  static create () {
    return super.create('*')
  }

  decode (asset: Asset): Promise<void> {
    return Promise.resolve().then(() => {
      invariant(asset.source !== null && asset.source !== undefined)
      asset.data = asset.source as string
    })
  }
}

WxAssetsBundle.processor.register(AssetDefaultProcessor.create())
WxAssetsBundle.processor.register(AssetJSONProcessor.create())