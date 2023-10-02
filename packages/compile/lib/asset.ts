import fs from 'fs-extra'
import { invariant } from 'ts-invariant'
import { glob } from 'glob'
import { 
  Asset, 
  AssetProcess, 
  AssetStoreKind 
} from '@catalyze/basic'

import * as Wx from '@catalyze/asset'
import { MainCompilePod } from './pod/proxy'

import type { WxAppUsingJSON } from '@catalyze/types'

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
          const using = Object.keys((file.json.data as Wx.WxAssetSetJSON).usingComponents as WxAppUsingJSON)
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
      let cssesExecArgs: (string | number)[] = csses.reduce((args, file) => {
        const set = this.findSetByFilename(file.relative)

        if (set && set.json) {
          count++
          args.unshift(file.relative)
        } else {
          args.push(file.relative)
        }
        return args
      }, [] as (string | number)[])
  
      if (count > 0) {
        cssesExecArgs.unshift(String(count))
      }
      
      this._cssesExecArgs = ['-db', '-pc', ...cssesExecArgs]
    }

    return this._cssesExecArgs
  }
  public set cssesExecArgs (cssesExecArgs: Array<string | number> | null) {
    if (this._cssesExecArgs !== cssesExecArgs) {
      this._cssesExecArgs = cssesExecArgs
    }
  }

  put (assets: Wx.WxAsset): void
  put (assets: Wx.WxAsset[]): void
  put (assets: Wx.WxAsset[] | Wx.WxAsset): void {
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
class AssetJSON extends AssetProcess {
  static create <T extends AssetJSON> (): T {
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
class AssetImage extends AssetProcess {
  static create <T extends AssetImage> (): T {
    return super.create(['.png', '.jpg', 'jpeg'])
  }

  decode (asset: Asset): Promise<void> {
    if (asset.source === null) {
      return fs.readFile(asset.absolute).then(source => {
        asset.source = source.toString('base64url')
        asset.data = asset.source
      })
    } else {
      return Promise.resolve().then(() => {
        invariant(asset.source)
        asset.data = asset.source
      })
    }
  }
}

// Default
class AssetDefault extends AssetProcess {
  static create <T extends AssetDefault> (): T {
    return super.create('*')
  }

  decode (asset: Asset): Promise<void> {
    if (asset.source === null && asset.type === AssetStoreKind.Locale) {
      return fs.readFile(asset.absolute).then(source => {
        asset.source = source.toString()
        asset.data = asset.source as string
      })
    } else {
      return Promise.resolve().then(() => {
        invariant(asset.source !== null)
        asset.data = asset.source as string
      })
    }
  }
}

Wx.WxAssetsBundle.processor.register(AssetDefault.create())
Wx.WxAssetsBundle.processor.register(AssetJSON.create())
Wx.WxAssetsBundle.processor.register(AssetImage.create())