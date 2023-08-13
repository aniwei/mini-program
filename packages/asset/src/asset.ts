import path from 'path-browserify'
import invariant from 'ts-invariant'
import { Asset, AssetJSON, AssetsBundle, AssetsBundleJSON, MainPod, ProxyPod } from '@catalyze/basic'

export type WxAssetSetJSON = {
  component?: boolean,
  usingComponents: {
    [key: string]: string
  },
  [key: string]: unknown
}

export type WxAssetAppJSON = {
  pages: string[]
}

// 微信资源类类型
export interface WxAssetCreate<T> {
  create <T> (filename: string, root: string, source?: Buffer | string): T
  new (filename: string, root: string, source?: Buffer | string): T
}
// 微信资源对象
// index.js 
// index.wxml
// index.wxss
// app.js => WxAsset.create() 
export class WxAsset extends Asset {
  static create (filename: string, root: string, source?: Buffer | string)
  static create <T extends  WxAsset> (filename: string, root: string, source?: Buffer | string): T {
    const WxAssetCreate = this as unknown as WxAssetCreate<T>
    return new WxAssetCreate(filename, root, source) as unknown as T
  }

  static fromJSON (json: AssetJSON) {
    return WxAsset.create(json.relative, json.root, json.source)
  }
}

// 资源组类型，针对微信小程序只有两种
export enum WxAssetSetType {
  Component,
  Page,
  Unknown
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
    const { dir, name } = path.parse(relative)
    const key = dir ? `${dir}/${name}` : name

    return new WxAssetSet(key, root)
  }

  // => wxml
  public get wxml (): WxAsset {
    return this.findByExt('.wxml')[0] ?? null
  }
  // => wxss
  public get wxss (): WxAsset {
    return this.findByExt('.wxss')[0] ?? null
  }
  // => js
  public get js (): WxAsset {
    return this.findByExt('.js')[0] ?? null
  }
  // => json
  public get json (): WxAsset {
    return this.findByExt('.json')[0] ?? null
  }
  // => type
  public get type (): WxAssetSetType {
    if (this.json) {
      if ((this.json.data as WxAssetSetJSON).component) {
        return WxAssetSetType.Component
      // TODO 
      // 需要支持 ts
      } else if (this.wxml && this.js) {
        return WxAssetSetType.Page
      }
    }

    return WxAssetSetType.Unknown
  }

  // 相对路径
  // pages/index/index
  // component/test/index
  public relative: string

  constructor (relative: string, root: string) {
    super(root)
    this.relative = relative
  }

  put (asset: WxAsset) {
    const { dir, name } = path.parse(asset.relative)
    const relative = dir ? `${dir}/${name}` : name

    if (relative === this.relative) {
      super.put(asset)
    }
  }
}

// WxAssetSets 
// key: 相对路径
// value: WxAsset
export class WxAssetSets {
  static create (root: string) {
    return new WxAssetSets(root)
  }

  // => pages
  public get pages () {
    return Array.from(this.sets)
      .filter(([key, set]) => set.type === WxAssetSetType.Page)
      .map(([key, set]) => set)
  }

  // => components
  public get components () {
    return Array.from(this.sets)
      .filter(([key, set]) => set.type === WxAssetSetType.Component)
      .map(([key, set]) => set)
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
  findByFilename (relative: string) {
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
      set = WxAssetSet.create(asset.relative, asset.root) as WxAssetSet
      this.sets.set(set.relative, set)
    }

    set.put(asset)
  }
}


// 微信资源包类
export class WxAssetsBundle extends AssetsBundle {
  static fromJSON (json: AssetsBundleJSON) {
    const bundle = new WxAssetsBundle(json.root)
    bundle.mount(json.assets.map(asset => WxAsset.create(asset.relative, asset.root, asset.source)))

    return bundle
  }

  // => sets
  protected _sets: WxAssetSets | null = null
  public get sets () {
    if (this._sets === null) {
      const sets = WxAssetSets.create(this.root)
      
      for (const asset of this.assets) {
        sets.put(asset)
      }
      
      this._sets = sets
    }

    return this._sets
  }

  // => components
  protected  _components: WxAssetSet[] | null = null
  public get components () {
    if (this._components === null) {
      this._components = this.sets.components
    }

    invariant(this._components)

    return this._components
  }

  // => pages
  protected  _pages: WxAssetSet[] | null = null
  public get pages () {
    if (this._pages === null) {
      this._pages = this.sets.pages
    }

    invariant(this._pages)
    return this._pages
  }

  findSetByFilename (filename: string) {
    return this.sets.findByFilename(filename)
  }
  
  mount (...rests: unknown[]): Promise<void>
  mount (assets: Asset[]): Promise<void> {
    this.assets = this.assets.concat(assets)
    
    return Promise.all(this.assets.map(asset => {
      return AssetsBundle.decode(asset)
    })).then(() => void 0)
  }
}


export interface WxAssetsBundleCreate {
  create (...rests: unknown[])
  new (...rests: unknown[])
}

export function MixinWxAssetsBundle (PodContext) {
  // TODO
  abstract class WxAssetsBundleOwner extends PodContext {
    static create <T extends WxAssetsBundleOwner> (...rests: unknown[])
    static create <T extends WxAssetsBundleOwner> (root: string, ...rests: unknown[]): T {
      const wx =  super.create(root, ...rests) as unknown as  T
      wx.root = root
      return wx as T
    }

    // => root
    public _root: string | null = null
    public get root () {
      invariant(this._root !== null)
      return this._root
    }
    public set root (root: string) {
      if (this._root !== root) {
        this._root = root
        this.bundle = new WxAssetsBundle(root)
      }
    }

    // => bundle
    public _bundle: WxAssetsBundle | null = null
    public get bundle () {
      invariant(this._bundle !== null)
      return this._bundle
    }
    public set bundle (bundle: WxAssetsBundle) {
      this._bundle = bundle
    }

    // => assets
    public get assets () {
      return this.bundle.assets
    }

    // => components
    public get components () {
      return this.bundle.components
    }

    // => pages
    public get pages () {
      return this.bundle.pages
    }

    findSetByFilename (filename: string) {
      return this.bundle.findSetByFilename(filename) ?? null
    }

    findByFilename (filename: string) {
      return this.bundle.findByFilename(filename)
    }

    mount (...rests: unknown[]) {
      return this.bundle.mount(...rests)
    }

    put (asset: WxAsset) {
      this.bundle.put(asset)
    }

    fromAssetsBundleJSON ({ root, assets }: AssetsBundleJSON) {
      this.root = root
      return this.mount(assets.map(asset => WxAsset.fromJSON(asset)))
    }

    toJSON () {
      return this.bundle.toJSON()
    }
  }

  return WxAssetsBundleOwner
}