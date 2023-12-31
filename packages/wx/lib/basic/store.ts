import { invariant } from 'ts-invariant'
import { parse, sep } from 'path'
import { AssetHash, AssetJSON, EventEmitter } from '@catalyzed/basic'
import * as BrowserFS from 'browserfs'

import type { FSModule } from 'browserfs/dist/node/core/FS'

//// => FileSystem
abstract class FileSystem extends EventEmitter<string> {
  public fsModule: FSModule

  constructor (fsModule: FSModule) {
    super()
    this.fsModule = fsModule
  }

  existsAsync (path: string): Promise<boolean> {
    return new Promise((resolve, reject) => this.fsModule.exists(path, (exists: boolean) => resolve(exists ?? false)))
  }

  mkdirAsync (path: string): Promise<void> {
    return new Promise((resolve, reject) => this.fsModule.mkdir(path, (error: any) => error ? reject(error): resolve()))
  }

  mkdirpAsync (path: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.fsModule.exists(path, (exists) => {
        if (exists) {
          resolve()
        } else {
          this.mkdirAsync(path).then(resolve).catch(async () => {
            const dirs = path.split(sep)
  
            if (dirs.length > 0) {
              const paths: string[] = []
              for (const dir of dirs) {
                const prefix = paths[paths.length - 1]
                const path = prefix ? `${prefix}${sep}${dir}` : dir
                
                if (path) {
                  paths.push(path)
                }
              }
  
              for (const path of paths) {
                await this.mkdirAsync(path).catch(error => {
                  if (error.code !== 'EEXIST') {
                    return Promise.reject(error)
                  } 
                  return Promise.resolve()
                })
              }
            }
            resolve()
          })

        }
      })
    })
  }

  readdirAsync (path: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.fsModule.readdir(path, (error: any, dirs?: string[]) => {
        if (error) {
          reject(error)
        } else {
          resolve(dirs ?? [])
        }
      })
    })
  }

  readFileAsync (filename: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      this.fsModule.readFile(filename, (error: any, data?: Buffer) => {
        if (error) {
          reject(error)
        } else {
          resolve(data as Buffer)
        }
      })
    })
  }

  readJSONAsync (filename: string) {
    return this.readFileAsync(filename).then(result => {
      try {
        return Promise.resolve(JSON.parse(result?.toString() as string))
      } catch (error: any) {
        return Promise.reject(error)
      }
    })
  }

  writeFileAsync (filename: string, data: Buffer | string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.fsModule.writeFile(filename, data, (error: any) => {
        if (error) {
          if (error.code === 'EEXIST') {
            resolve()
          } else {
            reject(error)
          }
        } else {
          resolve()
        }
      })
    })
  }

  removeAsync (path: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.fsModule.rmdir('/apps', (error: any) => {
        if (error) {
          reject(error)
        } else {
          resolve()
        }
      })
    })
  }
}


//// => Store
interface App {
  appid: string,
  assets: AssetHash[]
}

// WxAsset 资源 Store
export class Store extends FileSystem {
  // => assets
  public _assets: AssetJSON[] | null = null
  public get assets () {
    invariant(this._assets)
    return this._assets
  }
  public set assets (assets: AssetJSON[]) {
    this._assets = assets
  }

  async ensure (): Promise<App[]> {
    await this.mkdirpAsync('/apps')
    const apps = await this.readdirAsync('/apps')

    return Promise.all(apps.map(appid => {
      const filename = `/apps/${appid}/assets.json`
      return this.existsAsync(filename).then((exists: boolean) => {
        return exists 
          ? this.readJSONAsync(filename).then(assets => {
            return {
              appid,
              assets
            }
          })
          : {
            appid,
            assets: []
          }
      })
    }))
  }

  static async create (): Promise<Store> {
    return new Promise((resolve, reject) => {
      BrowserFS.configure({
        fs: 'MountableFileSystem',
        options: {
          '/': { 
            fs: 'IndexedDB',
            options: {
              storeName: 'mini-program',
            }
          }
        }
      }, (error: any) => {
        if (error) {
          reject(error)
        } else {
          resolve(new Store(BrowserFS.BFSRequire('fs')))
        }
      })
    })
  }

  async read (app: App) {
    const { appid, assets } = app
    
    return Promise.all(assets.map(asset => {
      const filename = `/apps/${appid}/${asset.relative}`
      return this.readFileAsync(filename).then((source) => {
        return {
          ...asset,
          source: source.toString(),
          sourceMap: null
        }
      })
    })).then(asssets => {
      this.assets = asssets
    })
  }

  async save (appid: string, assets: AssetJSON[]): Promise<void> {
    if (assets.length > 0) {
      return this.mkdirpAsync(`/apps/${appid}`).then(() => {
        if (assets.length > 0) {
          Promise.all([
            this.writeFileAsync(
              `/apps/${appid}/assets.json`,
              JSON.stringify(assets.map(asset => {
                return {
                  ext: asset.ext,
                  hash: asset.hash,
                  root: asset.root,
                  relative: asset.relative,
                }
              }))
            ),
            ...assets.map(asset => {
              const { dir } = parse(asset.relative)
  
              if (dir) {
                return this.mkdirpAsync(`/apps/${appid}/${dir}`)
                  .then(() => this.writeFileAsync(`/apps/${appid}/${asset.relative}`, asset.source as Buffer))
              } else {
                return this.writeFileAsync(`/apps/${appid}/${asset.relative}`, asset.source as Buffer)
              }
            })
          ]).then(() => {
            for (const asset of assets) {
              const index = this.assets.findIndex((current) => {
                if (current.relative === asset.relative) {
                  return current
                }
              }) ?? null

              if (index === -1) {
                this.assets.push(asset)
              } else if (index > -1) {
                this.assets.splice(index, 1, asset)
              }
            }
          })
        }
      })
    }
  }

  async clear () {
    return this.readdirAsync('/apps')
  }
}