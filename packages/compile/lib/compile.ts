import { WxAsset } from '@catalyzed/asset'
import { AssetStoreKind, unescape } from '@catalyzed/basic'
import { WxAssetsBundle } from './asset'

export interface WxAssetCompiledFile {
  filename: string,
  source: string
}

export enum WxWxssAssetKind {
  Version = 'version',
  Common = 'comm',
  IgnoreAppWXSS = './app.wxss'
}

export class WxAssetsCompile extends WxAssetsBundle {
  unescape (wxss: string) {
    const wxsses = wxss.split('=')
    const files: WxAssetCompiledFile[] = []
    let version = ''
  
    for (let i = 0; i < wxsses.length; i++) {
      const k = wxsses[i]
      const v = wxsses[++i]

      if (k && v) {
        if (k === WxWxssAssetKind.Version) {
          version = v
        } else if (k === WxWxssAssetKind.Common) {
          files.push({
            source: `// version - ${version}\n${unescape(v)}`,
            filename: `wxss/${k}.wxss`
          })
        } else if (k === WxWxssAssetKind.IgnoreAppWXSS) {
          // 
        } else {
          files.push({
            source: unescape(v),
            filename: `wxss/${k}`
          })
        }
      }
    }
    
    return files
  }

  compile () {
    return Promise.all([
      this.runTask(this.xmlsExecArgs, 'XML'),
      this.runTask(this.cssesExecArgs, 'CSS')
    ]).then((results: string[]) => {
      const wxml = results[0]
      const wxss = results[1]

      const files: WxAssetCompiledFile[] = this.unescape(wxss).concat({ filename: 'wxml.js', source: wxml })
      return files
    }).then((files: WxAssetCompiledFile[]) => {
      
      this.put(files.map(file => {
        const asset = WxAsset.create('@wx/' + file.filename, this.root, file.source)
        asset.type = AssetStoreKind.Memory
        return asset
      }))

      return this.mount()
    })
  }
}