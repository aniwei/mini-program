import debug from 'debug'
import { invariant } from 'ts-invariant'
import { WxAuth } from './auth'
import { WxProgram } from './program'
import { WxAssetHash } from '@catalyzed/asset'
import { Asset } from '@catalyzed/basic'
import type { WxProj } from '@catalyzed/types'

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

    this.api.Program.commands.subscribe('login', () => this.program.login())
    this.api.Program.commands.subscribe('current', () => this.program.current())
    this.api.Program.commands.subscribe('createRequestTask', (data: unknown) => this.program.createRequestTask(data))
    this.api.Program.commands.subscribe('getWxAssetsBundle', (assets: WxAssetHash[]) => this.program.getWxAssetsBundle(assets))
    
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