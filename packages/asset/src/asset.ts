import path from 'path-browserify'
import invariant from 'ts-invariant'
import { Bundle, File, FileJSON } from '@catalyze/basic'

export interface WxFileJSON extends FileJSON { }

export interface WxFileCreate<T> {
  create <T> (filename: string, root: string): T
  new (filename: string, root: string): T
}

export class WxFile extends File {
  static create (filename: string, root: string)
  static create <T extends  WxFile> (filename: string, root: string): T {
    const WxFileCreate = this as unknown as WxFileCreate<T>
    return new WxFileCreate(filename, root) as unknown as T
  }

  deserialize () {
    invariant(this.source !== null)
    this.data = this.source
  }

  serialize (): string | Buffer {
    return this.source as string | Buffer
  }

  read (): Promise<void> {
    throw new Error('Unimplemented.')
  }
}

export enum WxBundleType {
  Unknown,
  Component,
  Page,
}
export interface WxBundleJSON {
  root: string,
  relative: string,
  files: WxFileJSON[]
}
export class WxBundle extends Bundle {
  static fromJSON (json: WxBundleJSON) {
    const bundle = new WxBundle(json.relative, json.root)
    for (const f of json.files) {
      const file = WxFile.create(f.realtive, f.root) 
      file.source = f.source
      bundle.push(file)
    }

    return bundle
  }

  // => wxml
  public get wxml () {
    return this.findBundleByExt('.wxml')
  }

  // => wxss
  public get wxss () {
    return this.findBundleByExt('.wxss') as WxFile
  }

  // => wxss
  public get wxs () {
    return this.findBundleByExt('.wxs') as WxFile
  }

  // => json
  public get json () {
    return this.findBundleByExt('.json') as WxFile
  }

  // => type
  public get type () {
    if (this.json && (this.json.data as { component: boolean }).component) {
      if (
        (this.js || this.ts) && 
        this.wxml
      ) {
        return WxBundleType.Component
      }
    }

    if (this.js || this.ts) {
      if (this.wxml) {
        return WxBundleType.Page
      }
    }

    return WxBundleType.Unknown
  }

  read (): Promise<void> {
   return Promise.all(this.files.map(file => file.read())).then(() => void 0)
  }

  toJSON () {
    return {
      root: this.root,
      relative: this.relative,
      files: this.files
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
export function MixinWxBundles (BaseContext) {
  abstract class WxBundles extends BaseContext {
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

    // => components
    public get components () {
      return this.findByType(WxBundleType.Component)
    }

    // => pages
    public get pages () {
      return this.findByType(WxBundleType.Component)
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