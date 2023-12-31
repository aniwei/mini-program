import path from 'path'
import { invariant } from 'ts-invariant'
import { UnimplementError } from './unimplement'
import { isRegExp } from './is'

// 资源指纹
export interface AssetHash {
  hash: string,
  ext: string,
  root: string,
  relative: string
}

// 资源类型
export enum AssetStoreKind {
  Memory,
  Locale
}

// 路径结构
export type ParsedPath = {
  root: string
  dir: string
  base: string
  ext: string
  name: string
}

// 文件类型
export type AssetExt = '.xml' | '.scss' | '.css' | '.less' | '.json' | '.js' | '.ts' | '.png' | '.jpg' | '.jpeg' | '.svg' | string

// 文件JSON化结构
export type AssetJSON = {
  ext: string,
  root: string,
  hash: string | null,
  source: ArrayBufferView | ArrayBufferLike | string,
  relative: string,
  sourceMap: boolean | null
}

export enum AssetStatusKind {
  Created,
  Unmount,
  Mounted
}

export abstract class Asset {
  static fromJSON (...rests: unknown[]) {
    throw new Error('Method not implemented.')
  }

  // => ext
  public get ext () {
    return this.parsed.ext as AssetExt
  }

  // => name
  public get name () {
    return this.parsed.name
  }

  // => mounted
  public get mounted () {
    return (this.status & AssetStatusKind.Mounted) === AssetStatusKind.Mounted
  }

  // => data
  // 编码数据
  // JSON / base64 / string
  public _data: JSON | string | unknown | null = null
  public get data () {
    invariant(this.mounted)
    return this._data ?? this._source
  }
  public set data (data: JSON | string | unknown) {
    if (this._data !== data) {
      this._data = data
      this.status = (this.status &~ AssetStatusKind.Unmount) | AssetStatusKind.Mounted
    }
  }

  // => source
  // 原数据
  public _source: ArrayBufferLike | ArrayBufferView | string | null = null
  public get source () {
    return this._source
  }
  public set source (source: ArrayBufferLike | ArrayBufferView | string | null) {
    if (this._source !== source) {
      this._source = source
      this.status = (this.status &~ AssetStatusKind.Mounted) | AssetStatusKind.Unmount
    }
  }

  // => relative
  // 文件相对路径
  public _relative: string | null = null
  public get relative () {
    invariant(this._relative)
    return this._relative
  }
  public set relative (relative: string) {
    if (this._relative !== relative) {
      const absolute = path.resolve(this.root, relative)
    
      this._relative = relative
      this.absolute = absolute
      this.parsed = path.parse(relative)
    }
  }

  public type: AssetStoreKind = AssetStoreKind.Locale
  
  // 状态
  public status: AssetStatusKind = AssetStatusKind.Created
  // 文件根目录
  public root: string
  // 路径解析对象
  public parsed: ParsedPath
  // 文件绝对路径
  public absolute: string
  // 文件指纹 hash
  public hash: string | null = null
  // sourceMap
  public sourceMap: boolean = false
  // owner
  abstract owner: unknown
  
  constructor (...rests: unknown[])
  /**
   * 构造函数
   * @param {string} file 
   * @param {string} root 
   */
  constructor (relative: string, root: string, source?: Buffer | string, ...rests: unknown[]) {
    const absolute = path.resolve(root, relative)
    
    this.root = root
    this.source = source ?? null
    this.relative = relative
    this.absolute = absolute
    this.parsed = path.parse(relative)
  }

  // 挂载数据 source > data
  mount () {
    return AssetsBundle.decode(this)
  }

  toJSON (): AssetJSON {
    invariant(this.source !== null)
    invariant(this.mounted)

    return {
      ext: this.ext,
      hash: this.hash,
      root: this.root,
      sourceMap: this.sourceMap,
      source: this.source.toString(),
      relative: this.relative,
    }
  }
}

// 资源数据处理
export interface AssetProcessFactory<T> {
  create (...rests: unknown[]): T
  create (ext: string): T
  new (...rests: unknown[]): T
  new (ext: string): T
}
// 资源数据处理抽象类
export class AssetProcess {
  static create <T extends AssetProcess> (...rests: unknown[]): T
  static create <T extends AssetProcess> (exts: string[] | string, exclude: (string | RegExp)[]): T {
    const AssetProcessFactory = this as unknown as AssetProcessFactory<T>
    const process = new AssetProcessFactory(exts, exclude)

    return process as T
  }

  // 扩展名
  public exts: string[]
  public exclude: (string | RegExp)[] 

  constructor (exts: string[] | string, exclude: (string | RegExp)[] = []) {
    this.exts = typeof exts === 'string' ? [exts] : exts
    this.exclude = exclude ?? []
  }

  decode (data: unknown): Promise<void> {
    throw new UnimplementError('decode')
  }
}

// 资源数据解析器 
export class AssetProcesses {
  static create () {
    return new AssetProcesses()
  }

  public exts: Map<AssetExt, AssetProcess> = new Map()

  constructor () {
    this.exts.set('*', AssetProcess.create('*'))
  }

  // 注册数据转换器
  // image / json
  register (processor: AssetProcess) {
    for (const ext of processor.exts) {
      this.exts.set(ext, processor)
    }
  }

  /**
   * 
   * @param {Asset} asset 
   * @returns {boolean}
   */
  exclude (asset: Asset) {
    const processor = this.exts.get(asset.ext) ?? this.exts.get('*') as AssetProcess

    if (processor && processor.exclude.length > 0) {
      for (const exclude of processor.exclude) {
        if (isRegExp(exclude as RegExp)) {
          const { source, flags } = exclude as RegExp
          const reg = new RegExp(source, flags)
          return reg.test(asset.relative)
        } else if (typeof exclude === 'string') {
          return exclude === asset.relative
        }
      }
    }

    return false
  }

  // string -> JSON / base64url / ...
  /**
   * 数据转换
   * @param {Asset} asset 
   * @returns {JSON | string}
   */
  decode (asset: Asset) {
    const processor = this.exts.get(asset.ext) ?? this.exts.get('*') as AssetProcess

    if (this.exclude(asset)) {
      asset.status |= AssetStatusKind.Mounted
    } else {
      return processor.decode(asset)
    }
  }
}

// 包结构
export type AssetsBundleJSON = {
  root: string,
  assets: AssetJSON[],
}

// 文件资源包
export abstract class AssetsBundle {
  static processor: AssetProcesses = AssetProcesses.create()

  // 读取文件方法
  static decode (asset: Asset) {
    return AssetsBundle.processor.decode(asset)
  }

  // 根据 JSON
  static fromJSON (bundle: AssetsBundleJSON) {
    throw new Error('Method not implemented.')
  }

  // => owner
  protected _owner: unknown | null = null
  public get owner (): unknown {
    return this._owner
  }
  public set owner (owner: unknown) {
    this._owner = owner
  }

  // 包根路径
  public root: string
  // 包文件列表
  public assets: Asset[] = []

  /**
   * 构造函数
   * @param {string} relative 
   * @param {string} root 
   */
  constructor (root: string) {
    this.root = root
  }

  // 添加数据
  put (assets: Asset[] | Asset): void
  put (assets: Asset): void {
    if (Array.isArray(assets)) {
      assets.forEach(asset => this.put(asset))
    } else {
      const current = this.findByFilename(assets.relative) ?? null
      if (current !== null) {
        const index = this.assets.indexOf(current)
        this.assets.splice(index, 1, assets)
      } else {
        this.assets.push(assets)
      }

      assets.owner = this.owner ?? this
    }
  }

  // 挂载数据
  // source > JSON / base64url / ...
  mount () {
    return Promise.all(this.assets.filter(asset => !asset.mounted).map(asset => asset.mount())).then(() => void 0)
  }

  exists (filename: string) {
    return !!this.findByFilename(filename)
  }

  // 文件类型查找文件
  findByExt (ext: AssetExt) {
    return this.assets.filter(file => file.ext === ext)
  }

  /**
   * 根据相对路径查找
   * @param relative 
   * @returns 
   */
  findByFilename (relative: string) {
    relative = relative.replace(/^\//g, '')
    return this.assets.find(file => file.relative === relative) ?? null
  }

  /**
   * 替换
   * @param {string} relative 
   * @param {Asset} asset 
   */
  replaceByFilename (relative: string, asset: Asset) {
    invariant(asset.mounted)
    const index = this.assets.findIndex(file => file.relative === relative)

    if (index > -1) {
      this.assets.splice(index, 1, asset)
    } else {
      this.put(asset)
    }
  }

  /**
   * 序列化
   */
  toJSON () {
    return {
      root: this.root,
      assets: this.assets.map(asset => asset.toJSON())
    }
  }
}