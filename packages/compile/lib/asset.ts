import fs from 'fs-extra'
import path from 'path'
import crypto from 'crypto'
import { invariant } from 'ts-invariant'
import { glob } from 'glob'
import { 
  Asset, 
  AssetProcess, 
  AssetStoreKind 
} from '@catalyzed/basic'
import { WxAsset, WxAssetSetJSON, WxAssetSetKind, WxAssetsBundle } from '@catalyzed/asset'
import { MixinWxssTemplate } from '@catalyzed/wxss'
import { MainCompilePod } from './pod/proxy'
import { BuildTypeKind, MainBuilder } from './builder'
import type { WxAppUsingJSON } from '@catalyzed/types'

/**
 * 创建资源 Hash
 * @param {string | Buffer} source 
 * @returns {string}
 */
const createHash = (source: string | Buffer) => {
  const hash = crypto.createHash('md5')
  hash.update(source)
  return hash.digest('hex')
}

export class WxAssetsBundleOwner extends MixinWxssTemplate(MainCompilePod) {
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

        if ((file.json.data as WxAssetSetJSON).usingComponents) {
          const using = Object.keys((file.json.data as WxAssetSetJSON).usingComponents as WxAppUsingJSON)
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

        if (file.relative === 'app.wxss') {
          count++
          args.unshift(file.relative)
        } else if (
          set &&
          set.type !== WxAssetSetKind.Unknown
        ) {
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

  put (assets: WxAsset): void
  put (assets: WxAsset[]): void
  put (assets: WxAsset[] | WxAsset): void {
    this.bundle.put(assets)
  }

  search () {
    const builder = MainBuilder.create(4)

    const js = AssetJS.create()
    const less = AssetLess.create()
    const scss = AssetSass.create()

    js.builder = builder
    less.builder = builder
    scss.builder = builder

    WxAssetsBundle.processor.register(js)
    WxAssetsBundle.processor.register(less)
    WxAssetsBundle.processor.register(scss)
    WxAssetsBundle.processor.register(AssetDefault.create())
    WxAssetsBundle.processor.register(AssetJSON.create())
    WxAssetsBundle.processor.register(AssetImage.create())

    return builder.init().then(() => WxAssetsBundleOwner.searchByExts(this.root, [ 
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
      'jpeg',
      'svg'
    ]).then((files) => {
      
      this.put(files.map(filename => WxAsset.create(filename, this.root)))
      return this.mount()
    }))
  }
}

// Default
class AssetDefault extends AssetProcess {
  static create <T extends AssetDefault> (ext: string | string[] = '*', ...rests: unknown[]): T {
    return super.create(ext, ...rests)
  }

  decode (asset: Asset): Promise<void> {
    if (asset.source === null && asset.type === AssetStoreKind.Locale) {
      return fs.readFile(asset.absolute).then(source => {
        asset.hash = createHash(source)
        asset.source = source.toString()
        asset.data = asset.source as string
      })
    } else {
      return Promise.resolve().then(() => {
        invariant(asset.source !== null)
        asset.hash = createHash(asset.source as Buffer)
        asset.data = asset.source as string
      })
    }
  }
}

abstract class AssetBuilder extends AssetDefault {
  // => builder
  // JS compile
  public _builder: MainBuilder | null = null
  public get builder () {
    invariant(this._builder)
    return this._builder
  }
  public set builder (builder: MainBuilder) {
    if (this._builder !== builder) {
      this._builder = builder
    }
  }
}

// JS 文件处理器
// @TO-FIX TS
// @ts-ignore
class AssetJS extends AssetBuilder {
  static create <T extends AssetJS> (): T {
    return super.create(['.js', '.ts'], [
      /^@wx\/.+/gi
    ])
  }

  /**
   * 
   * @param {Asset} asset 
   * @returns {Promise<void>}
   */
  decode (asset: Asset): Promise<void> {
    return super.decode(asset).then(() => {
      invariant(asset.source !== null && asset.source !== undefined, `Asset relative is "${asset.relative}"`)
      return this.builder.runTask({
        root: asset.root,
        ext: asset.ext,
        name: asset.relative,
        content: asset.source,
        sourceMaps: 'inline'
      }, BuildTypeKind.JS).then((result) => {
        const owner = asset.owner as WxAssetsBundleOwner
        // 如果是 typescript 则增加 WxAsset
        if (asset.ext === '.ts') {
          const ts = WxAsset.create(
            asset.relative,
            asset.root,
            result as string
          ) 

          ts.data = ts.source
          owner.put(ts)
        } else {
          // 需要注意顺序，source 资源 status 会设置为未解析
          asset.source = result as string
          asset.data = result
        }
      })
    })
  }
}

// Sass 文件处理器
// @TO-FIX TS
// @ts-ignore
class AssetSass extends AssetBuilder {
  static create <T extends AssetSass> (): T {
    return super.create('.scss')
  }

  /**
   * 
   * @param {Asset} asset 
   * @returns {Promise<void>}
   */
  decode (asset: Asset): Promise<void> {
    return super.decode(asset).then(() => {
      invariant(asset.source !== null && asset.source !== undefined)
      return this.builder.runTask({
        root: asset.root,
        ext: asset.ext,
        name: asset.relative,
        content: asset.source,
        sourceMaps: 'inline'
      }, BuildTypeKind.Sass).then((result) => {
        asset.data = result
      })
    })
  }
}

// Less 文件处理器
// @TO-FIX TS
// @ts-ignore
class AssetLess extends AssetBuilder {
  static create <T extends AssetLess> (): T {
    return super.create('.less')
  }

  /**
   * 
   * @param {Asset} asset 
   * @returns {Promise<void>}
   */
  decode (asset: Asset): Promise<void> {
    return super.decode(asset).then(() => {
      invariant(asset.source !== null && asset.source !== undefined)
      return this.builder.runTask({
        root: asset.root,
        ext: asset.ext,
        name: asset.relative,
        content: asset.source,
        sourceMaps: 'inline'
      }, BuildTypeKind.Less).then((result) => {
        asset.data = result
      })
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
        asset.hash = createHash(source)
        asset.source = source.toString()
        asset.data = JSON.parse(asset.source as string)
      })
    } else {
      return Promise.resolve().then(() => {
        invariant(asset.source)
        asset.hash = createHash(asset.source as Buffer)
        asset.data = JSON.parse(asset.source.toString())
      })
    }
  }
}

// Image
class AssetImage extends AssetProcess {
  static create <T extends AssetImage> (): T {
    return super.create(['.png', '.jpg', '.jpeg', '.svg'])
  }

  decode (asset: Asset): Promise<void> {
    if (asset.source === null) {
      return fs.readFile(asset.absolute).then(source => {
        asset.hash = createHash(source)
        asset.source = source.toString('base64')
        asset.data = asset.source
      })
    } else {
      return Promise.resolve().then(() => {
        invariant(asset.source)
        asset.hash = createHash(asset.source as Buffer)
        asset.data = asset.source
      })
    }
  }
}
