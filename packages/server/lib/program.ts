import debug from 'debug'
import fs from 'fs-extra'
import path from 'path'
import chokidar, { FSWatcher } from 'chokidar'
import { Axios } from 'axios'
import { WxAsset, WxAssetHash } from '@catalyzed/asset'
import { WxAssetsCompile } from '@catalyzed/compile'
import { Asset, AssetJSON, AssetStoreKind, EventEmitter, PodStatusKind } from '@catalyzed/basic'
import type { WxProj } from '@catalyzed/types'

const mini_debug = debug(`wx:program`)


//// => MiniAssetsBundle
class MiniAssetsBundle extends WxAssetsCompile {
  async search () {
    const relative = path.join(__dirname, '../wx')
    const files: { filename: string, source: Buffer | string}[] = await Promise.all([
      'app.js',
      'view.js'
    ].map(filename => fs.readFile(path.join(relative, filename)).then(source => ({ filename, source }))))

    for (const file of files) {
      const asset = WxAsset.create('@wx/' + file.filename, this.root, file.source)
      asset.type = AssetStoreKind.Memory
      this.put(asset)
    }

    return super.search().then((result) => {
      return result
    })
  }
}

//// => WxCached
interface WxCachedOptions extends WxProj {
  dir: string,
}

interface AssetCache {
  relative: string,
  hash: string
}

abstract class WxCached extends EventEmitter<'change'> {
  protected dir: string
  protected root: string
  protected appid: string

  protected cached: AssetCache[] = []

  constructor (options: WxCachedOptions) {
    super()

    this.dir = options.dir
    this.root = options.root
    this.appid = options.appid
  } 

  async read () {
    const filename = path.resolve(this.dir, `apps/${this.appid}.json`)
    
    if (!await fs.exists(filename)) {
      await fs.writeFile(filename, '[]')
      this.cached = []
    } else {
      this.cached = await fs.readJSON(filename)
    }
  }

  async write () {
    const filename = path.resolve(this.dir, `apps/${this.appid}.json`)
    await fs.writeFile(filename, JSON.stringify(this.cached))
  }
}

//// => WxProgram
export type OnChangeHandle = (asset: Asset) => void
export type OnUnlinkHandle = (asset: Asset) => void

export interface WxProgramOptions extends WxCachedOptions {
  dir: string
}

export class WxProgram extends WxCached {
  // => interceptors
  public get interceptors () {
    return this.axios.interceptors
  }

  protected axios: Axios
  protected root: string
  protected appid: string
  protected bundle: MiniAssetsBundle

  protected watcher: FSWatcher | null = null

  constructor (options: WxProgramOptions) {
    super(options)
    

    this.root = options.root
    this.appid = options.appid
    this.bundle = MiniAssetsBundle.create(4, options.root)
    this.axios = new Axios({ baseURL: 'https://servicewechat.com' })
  }

  async ensure () {
    mini_debug(`➜ 开始读取小程序项目`)
    await this.read()
    await this.start()
  }

  async watch () {
    const watcher = chokidar.watch(path.resolve(this.root), {
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '*.d.ts',
      ]
    })

    watcher.on('change', (file) => {
      const relative = path.relative(this.root, file)
      const asset = WxAsset.create(relative, this.root)

      asset.mount()?.then(() => {
        const current = this.bundle.findByFilename(relative) ?? null

        if (current === null) {
          this.bundle.put(asset)
          this.emit('change', asset)
          mini_debug('内容变化 「文件 %s」', relative)
        } else if (asset.hash !== current.hash) {
          this.bundle.replaceByFilename(relative, asset)
          this.emit('change', asset)
          mini_debug('内容变化 「文件 %s」', relative)
        }
      })
    })

    this.watcher = watcher
    mini_debug('正在监听项目 「目录地址 %s」', this.root)
  }

  stop () {
    this.watcher?.removeAllListeners()
    this.watcher?.close()
  }

  // 启动
  start () {
    if (this.bundle.status & PodStatusKind.Booted) {
      return this.bundle.search()
    }

    return this.bundle.init().then(() => this.bundle.search())
  }

  ////// API 方法
  // 获取当前项目信息及启动配置
  current (): WxProj {
    return {
      root: this.root,
      appid: this.appid,
      settings: {
        watch: !!this.watcher 
      }
    }
  }

  // 获取当前项目资源包
  getWxAssetsBundle (assets: WxAssetHash[]) {
    return this.bundle.compile().then(() => {
      const data = this.bundle.toJSON()
      
      if (assets.length > 0) {
        const diffs: AssetJSON[] = []

        for (const asset of assets) {
          const current = data.assets.find(current => {
            if (current.relative === asset.relative) {
              if (current.hash !== asset.hash) {
                return current
              }
            }
          }) ?? null
  
          if (current !== null) {
            diffs.push(current as AssetJSON)
          }
        }

        return {
          root: data.root,
          assets: diffs
        }
      }

      return data
    })
  }

  // 登陆
  login () {
    return this.axios.post('/wxa-dev-logic/jslogin?', { scope: ['snsapi_base'] }, {
      headers: {
        'Content-Type': 'application/json'
      },
      params: { appid: this.appid }
    }).then(res => {
      return res.data
    })
  }

  // 创建请求
  // TODO
  createRequestTask (data: unknown) {
    data
  }
}