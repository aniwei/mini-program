import debug from 'debug'
import { invariant } from 'ts-invariant'
import { WxAuth } from './auth'
import { WxProgram } from './program'
import type { WxProj } from '@catalyze/types'
import { WxAssetHash } from '@catalyze/asset'
import { Asset } from '@catalyze/basic'

export type AppStartCallback = () => void

const app_debug = debug(`app:wx`)


export interface WxAppOptions {
  port: number,
  proj: WxProj,
}

export class WxApp extends WxAuth {
  public proj: WxProj
  public program: WxProgram

  constructor (options: WxAppOptions) {
    super()
    
    invariant(options.proj.appid)

    this.port = options.port
    this.proj = options.proj
    this.program = new WxProgram({ 
      dir: this.dir,
      ...this.proj 
    })

    this.program.interceptors.request.use((config) => {
      app_debug('请求微信服务 「api: %s, params: %o」', config.url, config.params)

      config.params.ticket = this.ticket
      config.params.os = this.os
      config.params.platform = this.platform
      config.params.clientversion = this.version
      config.params.gzip = 1
      return config
    })  

    this.api.subscribe('Program.login', () => this.program.login())
    this.api.subscribe('Program.current', () => this.program.current())
    this.api.subscribe('Program.createRequestTask', (data: unknown) => this.program.createRequestTask(data))
    this.api.subscribe('Program.getWxAssetsBundle', (assets: WxAssetHash[]) => this.program.getWxAssetsBundle(assets))
    
    // this.use(view())
  }

  // 监控文件变化
  async watch () {
    await this.program.watch()
    
    this.program.on('change', (asset: Asset) => {
      this.api.Program.events.publish('File.change', [
        this.proj.appid, 
        asset.toJSON()
      ])
    })
  }

  async stop () {
    await this.program.stop()
    await super.stop()
  }

  async start () {
    await this.ensure()
    await this.program.ensure()
    
    await super.start()
    app_debug('服务启动成功')
    console.log('✨ 程序启动成功.')
  }
}