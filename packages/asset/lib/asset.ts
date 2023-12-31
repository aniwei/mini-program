import path from 'path'
import { invariant } from 'ts-invariant'
import { 
  Asset, 
  AssetHash, 
  AssetJSON, 
  AssetsBundle, 
  AssetsBundleJSON 
} from '@catalyzed/basic'
import { 
  WxAppJSON, 
  WxAppUsingJSON, 
  WxAppWindowJSON 
} from '@catalyzed/types'

// => WxAssetHash
export interface WxAssetHash extends AssetHash {
  hash: string,
  relative: string
}

// => component / page .json
export interface WxAssetSetJSON extends WxAppWindowJSON {
  component?: boolean,
  usingComponents?: WxAppUsingJSON,
}

// project.config.json
export interface WxAssetProjJSON {
  appid: string
}

// => WxAssetFactory<T>
// 微信资源类类型
export interface WxAssetFactory<T> {
  create <T> (filename: string, root: string, source?: Buffer | string): T
  new (filename: string, root: string, source?: Buffer | string): T
}

//// => WxAsset
// 微信资源对象
// index.js 
// index.wxml
// index.wxss
// app.js => WxAsset.create() 
export class WxAsset extends Asset {
  static create <T extends  WxAsset> (filename: string, root: string, source?: ArrayBufferLike | ArrayBufferView | string): T
  static create <T extends  WxAsset> (filename: string, root: string, source?: Buffer | string): T {
    const WxAssetFactory = this as unknown as WxAssetFactory<T>
    return new WxAssetFactory(filename, root, source) as unknown as T
  }

  static fromJSON (json: AssetJSON) {
    return WxAsset.create(json.relative, json.root, json.source)
  }

  // => owner
  public _owner: WxAssetsBundleOwner | null = null
  public get owner () {
    return this._owner
  }
  public set owner (owner: WxAssetsBundleOwner | null) {
    if (this._owner !== owner) {
      this._owner = owner
    }
  }
}

// 资源组类型，针对微信小程序只有两种
export enum WxAssetSetKind {
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
  static create (app: WxAsset, relative: string, root: string) {
    const { dir, name } = path.parse(relative)
    const key = dir ? `${dir}/${name}` : name

    return new WxAssetSet(app, key, root)
  }

  // => window
  protected _window: WxAppWindowJSON | null = null
  public get window () {
    if (this.type === WxAssetSetKind.Component || this.type === WxAssetSetKind.Page) {
      if (this._window === null) {
        const app = this.app.data as WxAppJSON
        const window: WxAppWindowJSON = {}

        for (const key in app.window) {
          const value =  app.window[key] as string
          window[key] = value
        }

        const json = (this.json?.data as WxAssetSetJSON) as WxAssetSetJSON ?? {}

        this._window = {
          ...window,
          navigationBarBackgroundColor: json.navigationBarBackgroundColor ?? window.navigationBarBackgroundColor,
          navigationBarTitleText: json.navigationBarTitleText ?? window.navigationBarTitleText,
          navigationBarTextStyle: json.navigationBarTextStyle ?? window.navigationBarTextStyle,
          backgroundTextStyle: json.backgroundTextStyle ?? window.backgroundTextStyle,
          backgroundColor: json.backgroundColor ?? window.backgroundColor,
        }
      }
    }

    return this._window
  }

  // => usingComponent
  protected _usingComponents: WxAppUsingJSON | null = null
  public get usingComponents () {
    if (this.type === WxAssetSetKind.Component || this.type === WxAssetSetKind.Page) {
      if (this._usingComponents === null) {
        const app = this.app.data as WxAppJSON
        const usingComponents: WxAppUsingJSON = {}

        const dir = path.parse(this.relative).dir

        for (const key in app.usingComponents) {
          const value = path.relative(dir,  app.usingComponents[key])
          usingComponents[key] = value
        }

        const components = this.json ? (this.json.data as WxAssetSetJSON).usingComponents ?? {} : {}
        this._usingComponents = {
          ...usingComponents,
          ...components
        }
      }
    }

    return this._usingComponents
  }

  // => wxml
  public get wxml (): WxAsset {
    return this.findByExt('.wxml')[0] as WxAsset ?? null
  }
  // => wxss
  public get wxss (): WxAsset {
    return this.findByExt('.wxss')[0] as WxAsset ?? null
  }
  // => js
  public get js (): WxAsset {
    return this.findByExt('.js')[0] as WxAsset ?? null
  }
  // => ts
  public get ts (): WxAsset {
    return this.findByExt('.ts')[0] as WxAsset ?? null
  }
  // => json
  public get json (): WxAsset {
    return this.findByExt('.json')[0] as WxAsset ?? null
  }
  // => type
  public get type (): WxAssetSetKind {
    // 有 JSON 文件
    if (this.json) {
      if ((this.json.data as WxAssetSetJSON).component) {
        return WxAssetSetKind.Component
      } 
    } 
    
    // 无 JSON 文件，但有 wxml & js 文件
    if (this.wxml && this.js) {
      return WxAssetSetKind.Page
    } else if (this.wxml && this.ts) {
      return WxAssetSetKind.Page
    }

    return WxAssetSetKind.Unknown
  }

  // app 配置
  public app: WxAsset
  // 相对路径
  // pages/index/index
  // component/test/index
  public relative: string

  constructor (...rests: unknown[])
  constructor (app: WxAsset, relative: string, root: string) {
    super(root)
    this.app = app
    this.relative = relative
  }

  /**
   * 加入 Asset
   * @param {WxAsset} asset 
   */
  put (asset: WxAsset) {
    const { dir, name } = path.parse(asset.relative)
    const relative = dir ? `${dir}/${name}` : name

    if (relative === this.relative) {
      super.put(asset)
    }
  }
}

//// => WxAssetSets 
// key: 相对路径
// value: WxAsset
export class WxAssetSets {
  static create (app: WxAsset, root: string) {
    return new WxAssetSets(app, root)
  }

  // => pages
  public get pages () {
    return Array.from(this.sets)
      .filter(([key, set]) => set.type === WxAssetSetKind.Page)
      .map(([key, set]) => set)
  }

  // => components
  public get components () {
    return Array.from(this.sets)
      .filter(([key, set]) => set.type === WxAssetSetKind.Component)
      .map(([key, set]) => set)
  }

  // app 配置
  public app: WxAsset
  // 根目录
  public root: string
  // Sets 集合
  public sets: Map<string, WxAssetSet> = new Map()

  constructor (app: WxAsset, root: string) {
    this.app = app
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
    const { dir, name } = path.parse(asset.relative)
    const key = dir ? `${dir}/${name}` : name

    return this.sets.get(key) ?? null
  }

  /**
   * 加入 asset
   * @param {WxAsset} asset 
   */
  put (asset: WxAsset) {
    let set = this.findByAsset(asset) ?? null

    if (set === null) {
      set = WxAssetSet.create(this.app, asset.relative, asset.root) as WxAssetSet
      this.sets.set(set.relative, set)
    }

    set.put(asset)
  }
}

//// => WxAssetsBundle
// 微信资源包类
export class WxAssetsBundle extends AssetsBundle {
  /**
   * 
   * @param {AssetsBundleJSON} json 
   * @returns {WxAssetsBundle}
   */
  static fromJSON (json: AssetsBundleJSON) {
    const bundle = new WxAssetsBundle(json.root)
    bundle.fromAssetsBundleJSON(json)
    
    return bundle
  }

  // => sets
  protected _sets: WxAssetSets | null = null
  public get sets () {
    if (this._sets === null) {
      const sets = WxAssetSets.create(this.app, this.root)
      
      for (const asset of this.assets) {
        sets.put(asset as WxAsset)
      }
      
      this._sets = sets
    }

    return this._sets
  }

  // => app.json
  protected  _app: WxAsset | null = null
  public get app () {
    if (this._app === null) {
      this._app = this.findByFilename('app.json') as WxAsset
    }

    invariant(this._app)
    return this._app
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

  // => owner
  public get owner (): unknown {
    return super.owner as unknown
  }
  public set owner (owner: unknown) {
    super.owner = owner
  }

  /**
   * 从 JSON 加载 Assets
   * @param {AssetsBundleJSON} param
   */
  fromAssetsBundleJSON ({ root, assets }: AssetsBundleJSON) {
    this.put(assets.map(asset => WxAsset.create(asset.relative, asset.root, asset.source)))
  }

  /**
   * 
   * @param {string} filename 
   * @returns {WxAssetSet}
   */
  findSetByFilename (filename: string) {
    return this.sets.findByFilename(filename)
  }
}


//// => WxAssetsBundleOwner
export interface ExtensionsFactory<T> {
  create (...rests: unknown[]): T
  new (...rests: unknown[]): T
  new (...rests: any[]): T
}

export interface WxAssetsBundleOwner {
  root: string
  bundle: WxAssetsBundle
  assets: WxAsset[],
  components: WxAssetSet[]
  pages: WxAssetSet[]
  put (...rests: unknown[]): void
  put (assets: WxAsset[]): void
  mount (): Promise<void>
  exists (filename: string): boolean
  findByExt (ext: string): WxAsset[]
  findSetByFilename (filename: string): WxAssetSet | null
  findByFilename (filename: string): WxAsset | null
  replaceByFilename (filename: string, asset: WxAsset): void
  toJSON(): { root: string, assets: AssetJSON[] }
}

export function MixinWxAssetsBundle <T> (Extension: ExtensionsFactory<T>) {
  abstract class AssetsBundleOwner extends (Extension as any) implements WxAssetsBundleOwner {
    static create (...rests: unknown[]) {
      const wx =  super.create(...rests) as T & WxAssetsBundleOwner
      const root = rests[rests.length - 1]
      wx.root = root as string
      return wx as T & WxAssetsBundleOwner
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
        this.bundle.owner = this
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
      return this.bundle.assets as WxAsset[]
    }

    // => components
    public get components () {
      return this.bundle.components
    }

    // => pages
    public get pages () {
      return this.bundle.pages
    }

    constructor (...rests: any[])
    constructor (...rests: unknown[]) {
      super(...rests)
    }

    // 添加 WxAsset
    put (...rests: unknown[]): void
    put (assets: WxAsset[]): void {
      this.bundle.put(assets)
    }

    // 挂载 WxAsset 数据
    mount () {
      return this.bundle.mount()
    }

    // 初始化
    fromAssetsBundleJSON ({ root, assets }: AssetsBundleJSON) {
      this.root = root
      this.put(assets.map(asset => WxAsset.create(asset.relative, asset.root, asset.source)))
    }

    // 根据文件名查找 Set
    findSetByFilename (filename: string) {
      return this.bundle.findSetByFilename(filename) ?? null
    }

    // 根据文件名查找 WxAsset
    findByFilename (filename: string) {
      return this.bundle.findByFilename(filename) as WxAsset | null
    }

    // 根据文件名替换 WxAsset
    replaceByFilename (filename: string, asset: WxAsset) {
      this.bundle.replaceByFilename(filename, asset)
    }

    // 根据文件名判断 WxAsset 是否存在
    exists (filename: string) {
      return this.bundle.exists(filename)
    }

    // 根据后缀名查找
    findByExt (ext: string) {
      return this.bundle.findByExt(ext) as WxAsset[]
    }

    toJSON () {
      return this.bundle.toJSON()
    }
  }

  return AssetsBundleOwner
}