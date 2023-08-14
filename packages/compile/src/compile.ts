import { WxAssetsBundle } from './asset'

export interface WxAssetCompiledFile {
  filename: string,
  source: string
}

export class WxAssetsCompile extends WxAssetsBundle {
  compile () {
    return Promise.all([
      this.runTask(this.xmlsExecArgs, 'XML'),
      this.runTask(this.cssesExecArgs, 'CSS')
    ]).then((results: string[]) => {
      results[0] = { filename: 'wxml.js', source: results[0] }
      results[1] = { filename: 'wxss.js', source: results[1] }

      return results
    }).then((files: WxAssetCompiledFile[]) => {
      this.put(files.map(file => {
        const asset = WxAsset.create('@wx/' + file.filename, this.root, file.source)
        asset.type = AssetStoreType.Memory
        return asset
      }))

      return this.mount()
    })
  }
}