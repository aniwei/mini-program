import fs from 'fs-extra'
import path from 'path'
import debug from 'debug'
// @TODO
// @ts-ignore
import resolve from 'resolve-dir'
import { WxUser } from '@catalyzed/api'
import { WxBase } from './base'

const store_debug = debug(`wx:store`)

export class WxStore extends WxBase {
  protected dir: string

  protected ticket: string | null = null
  protected signature: string | null = null
  protected user: WxUser | null = null
  
  public os: string
  public platform: string
  public version: string
  
  constructor () {
    super()

    this.dir = resolve(`~/.config/catalyze`)
    store_debug(`数据缓存路径 「%s」`, this.dir)

    this.platform = process.platform === 'darwin' 
      ? `darwin`
      : `window`

    this.os = `MacOS`
    this.version = `1.0`

    store_debug(`执行版本 「%s」`, this.version)
    store_debug(`执行环境 「%s, %s」`, this.platform, this.os)
  }

  resolve (appid: string) {
    return path.join(this.dir, 'apps', appid)
  }

  async ensure () {
    await fs.mkdirp(this.dir)
    await fs.mkdirp(path.resolve(this.dir, `apps`))

    const filename = path.resolve(this.dir, `wx.json`)
    
    if (!await fs.exists(filename)) {
      store_debug(`创建缓存数据文件 「%s」`, filename)
      this.store()
    }

    await this.read()
  }

  async clean () {
    await fs.remove(this.dir)
    await this.ensure()
  }

  async read () {
    const filename = path.resolve(this.dir, `wx.json`)

    const buffer = await fs.readFile(filename)
    const config = JSON.parse(buffer.toString())

    this.user = config.user
    this.ticket = config.ticket
    this.signature = config.signature

    store_debug(`读取缓存数据文件 「%o」`, config)
  }
  
  async start () {
    // 确认是否已经创建缓存数据
    store_debug(`数据缓存启动完成`)
    super.start()
  }

  async store () {
    const string = JSON.stringify({
      user: this.user,
      ticket: this.ticket,
      signature: this.signature
    }, null, 2)


    const filename = path.resolve(this.dir, `wx.json`)
    await fs.writeFile(filename, string)
  }
}