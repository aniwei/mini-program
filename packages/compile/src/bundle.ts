import invariant from 'ts-invariant'
import fs from 'fs-extra'
import path from 'path-browserify'
import { glob } from 'glob'
import * as Wx from '@catalyze/bundle'
import { MainCompilePod } from './pod/proxy'

export type WxComponentJSON = {
  component: boolean,
  usingComponents: {
    [key: string]: string
  },
  [key: string]: unknown
}

class WxFile extends Wx.WxFile {
  static create (filename: string, root: string) {
    const { ext } = path.parse(filename)
    switch (ext) {
      case '.json':
        return new WxJSON(filename, root)

      default: 
        return super.create(filename, root)
    }
  }

  read(): Promise<void> {
    return fs.readFile(this.absolute).then(source => this.source = source)
  }
}

class WxJSON extends WxFile {
  // => data
  public get data () {
    return super.data as WxComponentJSON
  }
  public set data (data: WxComponentJSON) {
    super.data = data
  }

  deserialize () {
    invariant(this.source !== null)
    this.data = JSON.parse(this.source as string)
  }

  serialize(): string | Buffer {
    return JSON.stringify(this.data as WxComponentJSON)
  }

  toJSON () {
    return {
      ...super.toJSON(),
      source: this.serialize(),
    }
  }
}

export class WxBundles extends Wx.MixinWxBundles(MainCompilePod) {
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

        if ((file.json as WxJSON).data.usingComponents) {
          const using = Object.keys((file.json as WxJSON).data.usingComponents)
          args.push(file.wxml.relative)
          args.push(using.length)
          args.concat(using)
        }
        
        return args
      }, [components.length] as Array<number | string>)
  
      const xmls = Array.from(this.bundles)
        .map(([key, file]) => file)
        .filter(file => !!file.wxml)
        .map(file => {
          invariant(file.wxml !== null)
          return file.wxml.relative
        })

        const wxses = Array.from(this.bundles)
        .map(([key, file]) => file)
        .filter(file => !!file.wxs)
        .map(file => {
          invariant(file.wxs !== null)
          return file.wxs.relative
        })

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
      const csses = Array.from(this.bundles)
        .filter(([key, file]) => !!file.wxss)
        .map(([key, file]) => file)
  
      let count: number = 0
      const cssesExecArgs = csses.reduce((args, file, index) => {
        invariant(file.wxss)
        if (file.json) {
          args.unshift(file.wxss.relative)
        } else {
          args.push(file.wxss.relative)
        }
        return args
      }, [] as Array<string | number>)
  
      if (count > 0) {
        cssesExecArgs.unshift(count)
      }
      
      this._cssesExecArgs = cssesExecArgs
    }

    return this._cssesExecArgs
  }
  public set cssesExecArgs (cssesExecArgs: Array<string | number> | null) {
    if (this._cssesExecArgs !== cssesExecArgs) {
      this._cssesExecArgs = cssesExecArgs
    }
  }

  async read () {
    const promises =  Array.from(this.bundles).map(([key, bundle]) => bundle.read())
    return Promise.all(promises)
  }

  async mount () {
    const files = await this.search()
    await super.mount(files.map(filename => WxFile.create(filename, this.root)))
  }

  async search () {
    return await WxBundles.searchByExts(this.root, [ 
      'js', 'ts', 'wxml', 'wxss', 'wxs', 'json', 'less', 'scss'
    ])
  }
}