import debug from 'debug'
import fs from 'fs-extra'
import path from 'path'
import invariant from 'ts-invariant'
import { Axios } from 'axios'
import { WxBundles } from '@catalyze/compile'
import { WxProjJSON } from '@catalyze/wx-api'
import { FileType, PodStatus } from '@catalyze/basic'
import { WxFile } from '@catalyze/bundle'

const mini_debug = debug(`wx:program`)

class WxVirt extends WxFile {
  read () {
    return Promise.resolve(void 0)
  }
}

class WxMiniBundles extends WxBundles {
  async mount () {
    const relative = path.join(__dirname, '../wx')
    const files: { filename: string, source: Buffer | string}[] = await Promise.all([
      'app.js',
      'view.js'
    ].map(filename => fs.readFile(path.join(relative, filename)).then(source => ({ filename, source }))))

    for (const file of files) {
      const virt = WxVirt.create(file.filename, '@wx')
      virt.source = file.source
      virt.type = FileType.Memory
      this.findByFilename(file.filename).push(virt)
    }

    return super.mount()
  }
}

export class MiniProgram extends Axios {

  protected _appid: string | null = null
  public get appid () {
    if (this._appid === null) {
      const proj = this.bundles.findByFilename('project.config')?.json ?? null
      invariant(proj !== null)

      this._appid = (proj.data as WxProjJSON).appid
    }

    return this._appid
  }

  protected root: string
  protected bundles: WxMiniBundles

  constructor (root: string) {
    super({ baseURL: `https://servicewechat.com` })
    const bundles = WxMiniBundles.create<WxMiniBundles>(root, 4)

    this.root = root
    this.bundles = bundles
  }

  async ensure () {
    mini_debug(`开始读取小程序项目`)
    await this.start()
  }

  getWxAppBundles () {
    return this.bundles.toJSON()
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
    if (this.bundles.status & PodStatus.Inited) {
      return this.bundles.mount()
    }

    return new Promise(resolve => resolve(this.bundles.mount()))
  }
}