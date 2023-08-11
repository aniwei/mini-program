import invariant from 'ts-invariant'
import path from 'path-browserify'

// 资源类型
export enum AssetStoreType {
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
export type AssetExt = '.xml' | '.scss' | '.css' | '.less' | '.json' | '.js' | '.ts' | '.png' | '.jpg' | '.jpeg' | string

// 文件JSON化结构
export type AssetJSON = {
  ext: string,
  root: string,
  source: Buffer | string,
  realtive: string,
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
  
  // => relative
  public get relative () {
    const { dir, name, ext } = this.parsed
    return `${dir ? `${dir}/` : ''}${name}${ext}`
  }

  // => data
  protected _data: unknown | null = null
  public get data () {
    invariant(this._data !== null)
    return this._data
  }
  public set data (data: unknown) {
    this._data = data
  }

  // => source
  protected _source: Buffer | string | null = null
  public get source () {
    invariant(this._source !== null)
    return this._source
  }
  public set source (source: Buffer | string) {
    if (this._source !== source) {
      this._source = source.toString()
      this.deserialize()
    }
  }

  protected root: string
  protected parsed: ParsedPath
  protected absolute: string
  protected type: AssetStoreType = AssetStoreType.Locale
  
  /**
   * 构造函数
   * @param file 
   * @param root 
   */
  constructor (file: string, root: string) {
    const absolute = path.resolve(root, file)
    
    this.root = root
    this.absolute = absolute
    this.parsed = path.parse(file)
  }

  // 读取
  abstract read (): Promise<void>
  // 反序列化数据
  abstract deserialize (): unknown
  // 序列化数据
  abstract serialize (): string | Buffer

  // 序列号数据
  toJSON (): AssetJSON {
    invariant(this.source !== null)

    return {
      ext: this.ext,
      root: this.root,
      source: this.source,
      realtive: this.relative,
    }
  }
}

// 包结构
export type AssetsJSON = {
  files: AssetJSON[],
  root: string,
  relative: string
}

// 资源读写器
export type AssetReaderHandle = <T extends string>(file: string) => Promise<T>

// 资源数据解析器 
export class AssetReader {
  static create () {
    return new AssetReader()
  }

  public readers: Map<AssetExt, AssetReaderHandle> = new Map()

  constructor () {
    this.readers.set('*', () => Promise.resolve(void 0))
  }

  register (ext: AssetExt, handle: AssetReaderHandle) {
    this.readers.set(ext, handle)
  }

  read <T> (file: string) {
    const { ext } = path.parse(file)
    const reader = this.readers.get(ext) ?? this.readers.get('*')
    return reader(file)
  }
}

// 文件资源包
export abstract class AssetsBundle {
  static readers: AssetReader = AssetReader.create()

  static fromJSON (bundle: AssetsJSON) {
    throw new Error('Method not implemented.')
  }

  // 包根路径
  public root: string
  // 绝对路径
  public absolute: string
  // 包文件列表
  public assets: Asset[] = []
  // 相对路径
  public relative: string | null = null

  /**
   * 构造函数
   * @param {string} relative 
   * @param {string} root 
   */
  constructor (relative: string, root: string) {
    this.root = root
    this.relative = relative

    this.absolute = path.resolve(this.root, this.relative)
  }

  // 查找文件
  findByExt (ext: AssetExt) {
    return this.assets.filter(file => file.ext === ext)
  }

  // 查找文件
  findByRelative (relative: string) {
    return this.assets.filter(file => file.relative === relative)
  }

  /**
   * 序列化
   */
  toJSON () {
    return {
      root: this.root,
      relative: this.relative,
      assets: this.assets
    }
  }
}

