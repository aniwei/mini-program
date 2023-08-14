import invariant from 'ts-invariant'
import fs from 'fs-extra'
import { glob } from 'glob'
import { Asset, AssetDataProcessor } from '@catalyze/basic'

import * as Wx from '@catalyze/wx-asset'
import { MainCompilePod } from './pod/proxy'

export class WxAssetsBundle extends Wx.MixinWxAssetsBundle(MainCompilePod) {
  /**
   * 根据文件后缀名搜索文件
   * @param {string} root 
   * @param {string[]} exts 
   * @returns {Promise<string[]>}
   */
  static searchByExts (root: string, exts: string[]): Promise<string[]> {
    return glob(exts.map(ext => `**/*.${ext}`), {
      cwd: root,
      nodir: true,
      dot: false,
      ignore: [...exts.map(ext => `node_modules/**/*.${ext}`)]
    })
  }

  // => xmlsExecArgs
  protected _xmlsExecArgs: Array<string | number> | null = null
  public get xmlsExecArgs () {
    if (this._xmlsExecArgs === null) {
      const components = this.components
        .filter((file) => !!file.wxml)
  
      const xmlsExecArgs: Array<number | string> = ['-d', '-cc']
  
      const args = components.reduce((args, file, index) => {
        invariant(file.json !== null)
        invariant(file.wxml !== null)

        if ((file.json.data as Wx.WxAssetSetJSON).usingComponents) {
          const using = Object.keys((file.json.data as Wx.WxAssetSetJSON).usingComponents)
          args.push(file.wxml.relative)
          args.push(using.length)
          args.concat(using)
        }
        
        return args
      }, [components.length] as Array<number | string>)
  
      const xmls = Array.from(this.assets)
        .filter(file => file.ext === '.wxml')
        .map(file => file.relative)

      const wxses = Array.from(this.assets)
        .filter(file => file.ext === '.wxs')
        .map(file => file.relative)

      this._xmlsExecArgs = xmlsExecArgs
        .concat(args.length > 0 ? [args.join(' ')]: [])
        .concat([...xmls, ...wxses,'-gn', '$gwx'])
    }

    return this._xmlsExecArgs
  }
  public set xmlsExecArgs (xmlsExecArgs: Array<string | number> | null) {
    if (this._xmlsExecArgs !== xmlsExecArgs) {
      this._xmlsExecArgs = xmlsExecArgs
    }
  }

  // => _cssesExecArgs
  protected _cssesExecArgs: Array<string | number> | null = null
  public get cssesExecArgs () {
    if (this._cssesExecArgs === null) {
      const csses = Array.from(this.assets).filter(file => file.ext === '.wxss')
  
      let count: number = 0
      const cssesExecArgs = csses.reduce((args, file) => {
        const set = this.findSetByFilename(file.relative)

        if (set && set.json) {
          args.unshift(file.relative)
        } else {
          args.push(file.relative)
        }
        return args
      }, [] as Array<string | number>)
  
      if (count > 0) {
        cssesExecArgs.unshift(count)
      }
      
      this._cssesExecArgs = cssesExecArgs
    }

    return this._cssesExecArgs
  }
  public set cssesExecArgs (cssesExecArgs: Array<string | number> | null) {
    if (this._cssesExecArgs !== cssesExecArgs) {
      this._cssesExecArgs = cssesExecArgs
    }
  }

  put (assets: Wx.WxAsset[]) {
    this.bundle.put(assets)
  }

  search () {
    return WxAssetsBundle.searchByExts(this.root, [ 
      'js', 
      'ts', 
      'wxml', 
      'wxss', 
      'wxs', 
      'json', 
      'less', 
      'scss', 
      'png', 
      'jpg', 
      'jpeg'
    ]).then((files) => {
      this.put(files.map(filename => Wx.WxAsset.create(filename, this.root)))
      return this.mount()
    })
  }
}

// JSON
class AssetJSONProcessor extends AssetDataProcessor {
  static create () {
    return super.create('.json')
  }

  decode (asset: Asset): Promise<void> {
    if (asset.source === null) {
      return fs.readFile(asset.absolute).then(source => {
        asset.source = source.toString()
        asset.data = JSON.parse(asset.source as string)
      })
    } else {
      return Promise.resolve().then(() => {
        invariant(asset.source)
        asset.data = JSON.parse(asset.source.toString())
      })
    }
  }
}

// Image
class AssetImageProcessor extends AssetDataProcessor {
  static create () {
    return super.create('.png', '.jpg', 'jpeg')
  }

  decode (asset: Asset): Promise<void> {
    if (asset.source === null) {
      return fs.readFile(asset.absolute).then(source => {
        asset.source = source.toJSON('base64url')
        asset.data = JSON.parse(asset.source as string)
      })
    } else {
      return Promise.resolve().then(() => {
        invariant(asset.source)
        asset.data = JSON.parse(asset.source.toString())
      })
    }
  }
}

// Default
class AssetDefaultProcessor extends AssetDataProcessor {
  static create () {
    return super.create('*')
  }

  decode (asset: Asset): Promise<void> {
    if (asset.source === null) {
      return fs.readFile(asset.absolute).then(source => {
        asset.source = source.toString()
        asset.data = asset.source as string
      })
    } else {
      return Promise.resolve().then(() => {
        invariant(asset.source)
        asset.data = asset.source as string
      })
    }
  }
}

Wx.WxAssetsBundle.processor.register(AssetDefaultProcessor.create())
Wx.WxAssetsBundle.processor.register(AssetJSONProcessor.create())
Wx.WxAssetsBundle.processor.register(AssetImageProcessor.create())