import debug from 'debug'
// @TODO
// @ts-ignore
import { WxAuth } from './auth'
import { MiniProgram } from './program'

import type { WxProj } from '@catalyze/types'

export type AppStartCallback = () => void

const app_debug = debug(`app:wx`)

export interface WxProgram {
  appid: string,
}

export interface WxAppOptions {
  port: number,
  proj: WxProj,
}

export class WxApp extends WxAuth {
  public proj: WxProj
  public program: MiniProgram

  constructor (options: WxAppOptions) {
    super()

    this.port = options.port
    this.proj = options.proj
    this.program = new MiniProgram(this.proj)

    this.program.interceptors.request.use((config) => {
      app_debug('请求微信服务 <api: %s, params: %o>', config.url, config.params)

      config.params.ticket = this.ticket
      config.params.os = this.os
      config.params.platform = this.platform
      config.params.clientversion = this.version
      config.params.gzip = 1
      return config
    })  

    this.api.subscribe('Program.login', () => this.program.login())
    this.api.subscribe('Program.createRequestTask', (data: unknown) => this.program.createRequestTask(data))
    this.api.subscribe('Program.getWxAssetsBundle', () => this.program.getWxAssetsBundle())
    
    // @TODO
    // this.use(view())
  }

  async start () {
    await this.program.ensure()
    await super.start()
    app_debug('服务启动成功')
    console.log('程序启动成功.')
  }
}