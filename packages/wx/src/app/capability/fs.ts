import { FSModule } from 'browserfs/dist/node/core/FS'
import * as BrowserFS from 'browserfs'
import { WxCapability } from '../../capability'
import { ProxyApp } from '..'

export interface FSCreateOptions {
  [key: string]: {
    fs: string, 
    options: {
      [key: string]: unknown
    }
  }
}

export class FS extends WxCapability<ProxyApp> {
  static create (proxy: ProxyApp, options: FSCreateOptions): Promise<FS> {
    return new Promise((resolve, reject) => {
      BrowserFS.configure({
        fs: 'MountableFileSystem',
        options
      }, (error: any) => {
        if (error) {
          reject(error)
        }

        resolve(new FS(proxy, BrowserFS.BFSRequire('fs')))
      })
    })
  }

  static kSymbol = Symbol.for('fs')
  
  protected module: FSModule  

  constructor (proxy: ProxyApp, module: FSModule) {
    super(proxy)
    this.module = module

    this
      .on('mkdir', this.mkdir)
      .on('readFile', this.readFile)
      .on('writeFile', this.writeFile)
  }

  readFile = () => {}
  writeFile = () => {}  
  mkdir = () => {}
}


