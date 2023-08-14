import invariant from 'ts-invariant'
import { Asset, AssetDataProcessor } from '@catalyze/basic'
import { WxAssetsBundle } from '@catalyze/wx-asset'
import { BuildType, MainBuilder } from './builder'

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

class AssetJSProcessor extends AssetDataProcessor {
  static create () {
    return super.create('.js')
  }

  public builder = MainBuilder.create()

  decode (asset: Asset): Promise<void> {
    return Promise.resolve().then(() => {
      invariant(asset.source !== null && asset.source !== undefined)
      return this.builder.runTask({
        name: asset.relative,
        content: asset.source,
        sourceMaps: true
      }, BuildType.JS).then((result) => {
        console.log(result)
        debugger;
        asset.data = result
      })
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
WxAssetsBundle.processor.register(AssetJSProcessor.create())
WxAssetsBundle.processor.register(AssetJSONProcessor.create())