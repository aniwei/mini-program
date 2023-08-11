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

// 资源读写器
export type AssetReaderHandle = (file: string) => Promise<unknown>

// 资源数据解析器 
export class AssetReader {
  static create () {
    return new AssetReader()
  }

  public exts: Map<AssetExt, AssetReaderHandle> = new Map()

  constructor () {
    this.exts.set('*', async () => {})
  }

  register (ext: AssetExt, handle: AssetReaderHandle) {
    this.exts.set(ext, handle)
  }

  read <T> (file: string): Promise<T> {
    const { ext } = path.parse(file)
    const reader = this.exts.get(ext) ?? this.exts.get('*') as AssetReaderHandle
    return reader(file) as Promise<T>
  }
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

  // 数据
  // => data
  protected _data: unknown | null = null
  public get data () {
    invariant(this._data !== null)
    return this._data
  }
  public set data (data: unknown) {
    this._data = data
  }

  // 原数据
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

  // 文件根目录
  public root: string
  // 路径解析对象
  public parsed: ParsedPath
  // 文件绝对路径
  public absolute: string
  // 文件相对路径
  public relative: string
  // 文件存储类型 内存 / 本地
  public type: AssetStoreType = AssetStoreType.Locale
  
  /**
   * 构造函数
   * @param {string} file 
   * @param {string} root 
   */
  constructor (relative: string, root: string) {
    const absolute = path.resolve(root, relative)
    
    this.root = root
    this.relative = relative
    this.absolute = absolute
    this.parsed = path.parse(relative)
  }

  // 读取
  abstract read (): Promise<void> | void
  // 反序列化数据
  // base64 > buffer
  // JSON > string | buffer
  abstract deserialize (): unknown
  // 序列化数据
  // buffer > base64
  // string | buffer > JSON
  abstract serialize (): string | Buffer

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
  root: string,
  relative: string,
  assets: AssetJSON[],
}

// 文件资源包
export abstract class AssetsBundle {
  static reader: AssetReader = AssetReader.create()

  // 读取文件方法
  static read (filename: string) {
    return AssetsBundle.reader.read(filename)
  }

  // 
  static fromJSON (bundle: AssetsJSON) {
    throw new Error('Method not implemented.')
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

  // 文件类型查找文件
  findByExt (ext: AssetExt) {
    return this.assets.filter(file => file.ext === ext)
  }

  /**
   * 序列化
   */
  toJSON () {
    return {
      root: this.root,
      assets: this.assets
    }
  }
}

