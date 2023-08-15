import { WxAsset } from '@catalyze/wx-asset'
import { AssetStoreType, unescape } from '@catalyze/basic'
import { WxAssetsBundle } from './asset'

export interface WxAssetCompiledFile {
  filename: string,
  source: string
}

const parse = (wxss: string) => {
  const wxsses = wxss.split('=')
  let ret = ''

  for (let i = 0; i < wxsses.length; i++) {
    const k = wxsses[i]
    const v = wxsses[++i]

    if (k === 'version') {
      ret += `/// ${k}: ${unescape(v)} \n`
    } else if (k === 'comm') {
      ret += `${unescape(v)}\n`
    } else if (v) {
      ret += `${unescape(v)}()\n`
    }
  }
  
  return ret
}

export class WxAssetsCompile extends WxAssetsBundle {
  compile () {
    return Promise.all([
      this.runTask(this.xmlsExecArgs, 'XML'),
      this.runTask(this.cssesExecArgs, 'CSS')
    ]).then((results: string[]) => {
      const wxml = results[0]
      const wxss = results[1]

      const files: WxAssetCompiledFile[] = []

      files[0] = { filename: 'wxml.js', source: wxml }
      files[1] = { filename: 'wxss.js', source: parse(wxss) }

      return files
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