import path from 'path-browserify'
import invariant from 'ts-invariant'
import { Asset, AssetsBundle } from '@catalyze/basic'

// 微信资源类类型
export interface WxAssetCreate<T> {
  create <T> (filename: string, root: string): T
  new (filename: string, root: string): T
}

// 微信资源对象
// index.js 
// index.wxml
// index.wxss
// app.js => WxAsset.create() 
export class WxAsset extends Asset {
  static create (filename: string, root: string)
  static create <T extends  WxAsset> (filename: string, root: string): T {
    const WxAssetCreate = this as unknown as WxAssetCreate<T>
    return new WxAssetCreate(filename, root) as unknown as T
  }

  deserialize () {
    invariant(this.source !== null)
    this.data = this.source
  }

  serialize (): string | Buffer {
    return this.source as string | Buffer
  }

  read () {
    AssetsBundle.read(this.absolute).then(source => this.source)
  }
}

// 资源组类型，针对微信小程序只有两种
export enum WxAssetSetType {
  Component,
  Page,
}

// 微信资源组对象，用于表示 Page / Component 
// index.js / index.wxml / index.wxss
// TODO:: 后期需要支持 Typescript / Sass / Less
export class WxAssetSet extends AssetsBundle {
  /**
   * 创建 资源组
   * @param {string} relative 
   * @param {string} root 
   * @returns {WxAssetSet}
   */
  static create (relative: string, root: string) {
    return new WxAssetSet(relative, root)
  }

  // => wxml
  public get wxml () {
    return this.findByExt('.wxml') ?? null
  }
  // => wxss
  public get wxss () {
    return this.findByExt('.wxss') ?? null
  }
  // => js
  public get js () {
    return this.findByExt('.js') ?? null
  }
  // => json
  public get json () {
    return this.findByExt('.json') ?? null
  }

  // 相对路径
  // pages/index/index
  // component/test/index
  public relative: string

  constructor (relative: string, root: string) {
    super(root)
    this.relative = relative
  }

  add (filename: string) {

  }


}

// WxAssetSets 
// key: 相对路径
// value: WxAsset
export class WxAssetSets {
  static create (root: string) {
    return new WxAssetSets(root)
  }

  // 根目录
  public root: string
  // Sets 集合
  public sets: Map<string, WxAssetSet> = new Map()

  constructor (root: string) {
    this.root = root
  }

  /**
   * 根据文件路径获取 WxAsset
   * @param {string} filename 
   * @returns {WxAssetSet | null}
   */
  findByFilename (filename: string) {
    const relative = path.realtive(this.root, filename)
    const { dir, name } = path.parse(relative)
    const key = dir ? `${dir}/${name}` : name

    return this.sets.get(key) ?? null
  }

  /**
   * 根据 WxAsset 获取
   * @param {WxAsset}  
   * @returns {WxAssetSet | null}
   */
  findByAsset (asset: WxAsset) {
    return this.sets.get(asset.absolute) ?? this.sets.get(asset.relative) ?? null
  }

  /**
   * 
   * @param {WxAsset} asset 
   */
  put (asset: WxAsset) {
    let set = this.findByAsset(asset) ?? null

    if (set === null) {
      const { dir, name } = path.parse(asset.absolute)
      const key = dir ? `${dir}/${name}` : name
      
      set = WxAssetSet.create(asset.relative, asset.root) as WxAssetSet
      this.sets.set(key, set)
    }

    return set
  }
}

export class WxAssetsBundle extends AssetsBundle {
  static fromJSON (json: WxBundleJSON) {
    const bundle = new WxBundle(json.relative, json.root)
    for (const f of json.files) {
      const file = WxFile.create(f.realtive, f.root) 
      file.source = f.source
      bundle.push(file)
    }

    return bundle
  }

  // => sets
  protected _sets: WxAssetSets | null = null
  public get sets () {
    if (this._sets === null) {
      const sets = WxAssetSets.create(this.root)

      for (const asset of this.assets) {
        
      }

      this._sets = sets
    }

    return this._sets
  }

  read (): Promise<void> {
   return Promise.all(this.assets.map(asset => asset.read())).then(() => void 0)
  }

  toJSON () {
    return {
      root: this.root,
      assets: this.assets
    }
  }
}
export interface WxBundlesMap extends Array<unknown> {
  0: string,
  1: WxBundleJSON
} 
export interface WxBundlesJSON {
  root: string,
  relative: string,
  bundles: WxBundlesMap[]
}

export interface WxBundles {
  new (...rests: unknown[]),
}

export interface WxBundlesCreate {
  create (...rests: unknown[])
  new (...rests: unknown[])
}
export function MixinWxAssetsBundle (BaseContext) {
  abstract class WxAssetsBundle extends BaseContext {
    static create <T extends WxBundles> (...rests: unknown[])
    static create <T extends WxBundles> (root: string, ...rests: unknown[]): T {
      const bundles =  super.create(root, ...rests) as WxBundles
      bundles.root = root
      return bundles as T
    }

    static fromJSON ({ root, bundles }: WxBundlesJSON) {
      const wx = WxBundles.create(root)
      wx.bundles = new Map(bundles.map(([key, json]) => [key, WxBundle.fromJSON(json)]))
      return wx
    }

    // => root
    public _root: string | null = null
    public get root () {
      invariant(this._root !== null)
      return this._root
    }
    public set root (root: string) {
      this._root = root
    }

    public bundles: Map<string, WxBundle> = new Map()


    findFile (filename: string): WxFile | null {
      const bundle = this.findBundleByFilename(filename) ?? null
      if (bundle) {
        const { ext } = path.parse(filename)

        switch (ext) {
          case '.json':
            return bundle.json

          case '.js':
            return bundle.js

            case '.js':
              return bundle.js
        }

      }

      return null
    }

    /**
     * 
     * @param type 
     * @returns 
     */
    findBundleByType (type: WxBundleType) {
      return Array.from(this.bundles)
        .filter(([key, bundle]) => bundle.type === type)
        .map(([key, bundle]) => bundle)
    }

    /**
     * 
     * @param filename 
     * @returns 
     */
    findBundleByFilename (filename: string) {
      const { dir, name, ext } = path.parse(filename)
      const full = path.join(this.root, dir, name)  
      const bundle = this.bundles.get(full) ?? null

      if (bundle === null) {
        const bundle = new WxBundle(this.root, `${dir ? `${dir}/` : ''}${name}`) 
        this.bundles.set(full, bundle)
        return bundle
      }

      return bundle
    }

    /**
     * 
     * @param {string[]} files 
     */
    async mount (files?: WxFile[])
    async mount (files: WxFile[] | string[] = []) {
      let file: string | WxFile | null = files.pop() ?? null
  
      while (file !== null) {
        const filename = (file as WxFile).relative ?? file

        this.findBundleByFilename(filename).push(
          typeof file === 'string' 
            ? WxFile.create(filename, this.root) 
            : file as WxFile
        )
        file = files.pop() ?? null
      }
  
      await this.read()
    }

    /**
     * 
     * @param {WxBundlesJSON} json 
     */
    from (json: WxBundlesJSON) {
      this.root = json.root
      this.bundles = new Map(json.bundles.map(([key, json]) => [key, WxBundle.fromJSON(json)]))
    }

    /**
     * 
     * @returns 
     */
    toJSON () {
      return {
        root: this.root,
        bundles: Array.from(this.bundles)
      }
    }
  }

  return WxBundles
}