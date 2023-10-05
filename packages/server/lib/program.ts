import debug from 'debug'
import fs from 'fs-extra'
import path from 'path'
import { Axios } from 'axios'
import { WxAsset, WxAssetHash } from '@catalyze/asset'
import { WxAssetsCompile } from '@catalyze/compile'
import { AssetJSON, AssetStoreKind, PodStatusKind } from '@catalyze/basic'
import type { WxProj } from '@catalyze/types'

const mini_debug = debug(`wx:program`)

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
      debugger
      return result
    })
  }
}

interface WxCachedOptions extends WxProj {
  dir: string,
}

interface AssetCache {
  relative: string,
  hash: string
}

abstract class WxCached extends Axios {
  protected dir: string
  protected root: string
  protected appid: string

  protected cached: AssetCache[] = []

  constructor (options: WxCachedOptions) {
    super({ baseURL: `https://servicewechat.com` })

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


export interface WxProgramOptions extends WxCachedOptions {
  dir: string
}

export class WxProgram extends WxCached {
  protected bundle: MiniAssetsBundle
  constructor (options: WxProgramOptions) {
    super(options)
    
    this.bundle = MiniAssetsBundle.create(4, options.root)
  }

  async ensure () {
    mini_debug(`➜ 开始读取小程序项目`)
    await this.read()
    await this.start()
  }

  ////// API 方法
  current () {
    return {
      root: this.root,
      appid: this.appid
    }
  }

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
    return this.post('/wxa-dev-logic/jslogin?', { scope: ['snsapi_base'] }, {
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

  // 启动
  start () {
    if (this.bundle.status & PodStatusKind.Booted) {
      return this.bundle.search()
    }

    return this.bundle.init().then(() => this.bundle.search())
  }
}