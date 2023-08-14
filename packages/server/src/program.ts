import debug from 'debug'
import fs from 'fs-extra'
import path from 'path'
import invariant from 'ts-invariant'
import { Axios } from 'axios'
import { WxProjJSON } from '@catalyze/wx-api'
import { WxAsset, WxAssetAppJSON } from '@catalyze/wx-asset'
import { WxAssetsBundle } from '@catalyze/wx-compile'
import { AssetStoreType, PodStatus } from '@catalyze/basic'

const mini_debug = debug(`wx:program`)

class MiniAssetsBundle extends WxAssetsBundle {
  async mount () {
    const relative = path.join(__dirname, '../wx')
    const files: { filename: string, source: Buffer | string}[] = await Promise.all([
      'app.js',
      'view.js'
    ].map(filename => fs.readFile(path.join(relative, filename)).then(source => ({ filename, source }))))

    for (const file of files) {
      const asset = WxAsset.create('@wx/' + file.filename, this.root, file.source)
      asset.type = AssetStoreType.Memory
      this.put(asset)
    }

    return super.mount()
  }
}

export class MiniProgram extends Axios {

  protected _appid: string | null = null
  public get appid () {
    if (this._appid === null) {
      const proj = this.bundle.findByFilename('project.config')?.data ?? null
      invariant(proj !== null)

      this._appid = (proj as WxAssetAppJSON).appid
    }

    return this._appid
  }

  protected root: string
  protected bundle: MiniAssetsBundle

  constructor (root: string) {
    super({ baseURL: `https://servicewechat.com` })
    

    this.root = root
    this.bundle = MiniAssetsBundle.create<MiniAssetsBundle>(root, 4)
  }

  async ensure () {
    mini_debug(`开始读取小程序项目`)
    await this.start()
  }

  getWxAssetsBundle () {
    return this.bundle.toJSON()
  }

  login () {
    return this.post('/wxa-dev-logic/jslogin?', {
      scope: ['snsapi_base']
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      params: {
        appid: this.appid
      }
    }).then(res => {
      return res.data
    })
  }

  createRequestTask (data: unknown) {
    debugger
  }

  start () {
    if (this.bundle.status & PodStatus.Booted) {
      return this.bundle.mount()
    }

    return new Promise(resolve => this.bundle.on('booted', () => resolve(this.bundle.mount())))
  }
}