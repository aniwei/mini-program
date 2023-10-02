import debug from 'debug'
import fs from 'fs-extra'
import path from 'path'
import invariant from 'ts-invariant'
import { Axios } from 'axios'
import { WxAsset, WxAssetProjJSON } from '@catalyze/asset'
import { WxAssetsCompile } from '@catalyze/compile'
import { AssetStoreKind, PodStatusKind } from '@catalyze/basic'
import type { WxProj } from '@catalyze/types'

const mini_debug = debug(`wx:program`)

class MiniAssetsBundle extends WxAssetsCompile {
  async search () {
    const relative = path.join(__dirname, '../wx')
    const files: { filename: string, source: Buffer | string}[] = await Promise.all([
      'app.js',
      'view.js'
    ].map(filename => fs.readFile(path.join(relative, filename)).then(source => ({ filename, source: source.toString() }))))

    for (const file of files) {
      const asset = WxAsset.create('@wx/' + file.filename, this.root, file.source)
      asset.type = AssetStoreKind.Memory
      this.put(asset)
    }

    return super.search()
  }
}

export class MiniProgram extends Axios {

  protected _appid: string | null = null
  public get appid () {
    if (this._appid === null) {
      const proj = this.bundle.findByFilename('project.config')?.data ?? null
      invariant(proj !== null)

      this._appid = (proj as WxAssetProjJSON).appid
    }

    return this._appid
  }

  protected root: string
  protected bundle: MiniAssetsBundle

  constructor (proj: WxProj) {
    super({ baseURL: `https://servicewechat.com` })
    

    this.root = proj.root
    this.bundle = MiniAssetsBundle.create(4, proj.root)
  }

  async ensure () {
    mini_debug(`开始读取小程序项目`)
    await this.start()
  }

  ////// API 方法
  getWxAssetsBundle () {
    return this.bundle.compile().then(() => this.bundle.toJSON())
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