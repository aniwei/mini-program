import invariant from 'ts-invariant'
import path from 'path-browserify'
import { UnimplementedError } from './helpers'

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
  relative: string,
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
  // 原数据
  public source: Buffer | string | null = null
  // 编码数据
  // JSON / base64 / string
  public data: JSON | string | unknown | null = null
  
  /**
   * 构造函数
   * @param {string} file 
   * @param {string} root 
   */
  constructor (relative: string, root: string, source?: Buffer | string) {
    const absolute = path.resolve(root, relative)
    
    this.root = root
    this.source = source ?? null
    this.relative = relative
    this.absolute = absolute
    this.parsed = path.parse(relative)
  }

  toJSON (): AssetJSON {
    invariant(this.source !== null)

    return {
      ext: this.ext,
      root: this.root,
      source: this.source,
      relative: this.relative,
    }
  }
}

// 资源数据处理
export interface AssetDataProcessorCreate<T> {
  create (...rests: unknown[]): T
  create (ext: string): T
  new (...rests: unknown[]): T
  new (ext: string): T
}
// 资源数据处理抽象类
export class AssetDataProcessor {
  static create <T extends AssetDataProcessor> (...rests: unknown[])
  static create <T extends AssetDataProcessor> (...exts: string[]): T {
    const AssetDataProcessorCreate = this as unknown as AssetDataProcessorCreate<T>
    const process = new AssetDataProcessorCreate(exts)

    return process as T
  }

  // 扩展名
  public exts: string[]

  constructor (exts: string[]) {
    this.exts = exts
  }

  decode <T> (data: unknown) {
    throw new UnimplementedError('decode')
  }
}

// 资源数据解析器 
// 
export class AssetDataProcessores {
  static create () {
    return new AssetDataProcessores()
  }

  public exts: Map<AssetExt, AssetDataProcessor> = new Map()

  constructor () {
    this.exts.set('*', AssetDataProcessor.create('*'))
  }

  register (processor: AssetDataProcessor) {
    for (const ext of processor.exts) {
      this.exts.set(ext, processor)
    }
  }

  decode (asset: Asset) {
    const processor = this.exts.get(asset.ext) ?? this.exts.get('*') as AssetDataProcessor
    return processor.decode(asset)
  }
}


// 包结构
export type AssetsBundleJSON = {
  root: string,
  relative: string,
  assets: AssetJSON[],
}

// 文件资源包
export abstract class AssetsBundle {
  static processor: AssetDataProcessores = AssetDataProcessores.create()

  // 读取文件方法
  static decode (asset: Asset) {
    return AssetsBundle.processor.decode(asset)
  }

  // 
  static fromJSON (bundle: AssetsBundleJSON) {
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

  put (asset: Asset) {
    this.assets.push(asset)
  }

  // 文件类型查找文件
  findByExt (ext: AssetExt) {
    return this.assets.filter(file => file.ext === ext)
  }

  // 根据相对路径查找
  findByFilename (relative: string) {
    return this.assets.find(file => file.relative === relative) ?? null
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