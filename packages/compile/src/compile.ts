import { WxAssetsBundle } from './asset'

export class WxAssetsCompile extends WxAssetsBundle {
  compile () {
    return this.mount().then(() => {
      return Promise.all([
        this.runTask(this.xmlsExecArgs, 'XML'),
        this.runTask(this.cssesExecArgs, 'CSS')
      ]).then((results: string[]) => {
        results[0] = { filename: 'wxml.js', source: results[0] }
        results[1] = { filename: 'wxss.js', source: results[1] }

        return results
      }).then((results: { filename: string, source: string }[]) => {
        for (const result of results) {
          const asset = WxAsset.create('@wx/' + file.filename, this.root, file.source)
          asset.type = AssetStoreType.Memory
          this.put(asset)
        }
      })
    })
  }
}