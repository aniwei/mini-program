import Koa from 'koa'
import debug from 'debug'
import { Server } from 'http'
import { WebSocketServer } from 'ws'
import { WorkTransport } from '@catalyze/basic'
import * as Wx from '@catalyze/wx-api'

const app_debug = debug(`app:base`)

class WxApi extends Wx.WxApi {

}

export class WxBase extends Koa {
  protected port: number
  protected server: Server
  protected ws: WebSocketServer

  protected transport: WorkTransport | null = null
  protected api: WxApi = new WxApi()

  constructor (port: number = 3000) {
    super()

    const server = new Server()
    const ws = new WebSocketServer({ noServer: true })

    server.on(`upgrade`, (req, socket, head) => {
      ws.handleUpgrade(req, socket, head, socket => {
        
        this.api.disconnect()
        const transport = new Wx.WxApiTransport()
        transport.connect(socket)
        this.api.connect(transport)
        
        this.emit(`connected`)
      })
    })
    
    this.ws = ws
    this.port = port
    this.server = server
  }

  
  // /**
  //  * 提交代码包
  //  */
  // commit () {
  //   return axios.post(`/wxa-dev/testsource?${qs.stringify({
  //     _r: '0.8530581592723374',
  //     appid: this.appid,
  //     platform: this.platform,
  //     ext_appid: this.extAppid,
  //     os: this.platform,
  //     clientversion: '101171018',
  //     gzip: 1,
  //     path: 'pages/home?',// 预览页面的路径
  //     newticket: this.ticket,
  //     clientversion: '1.01.171018'
  //   })}`).then(result => {

  //   })
  // }

  // /**
  //  * 预览
  //  */
  // preview (path: string) {
  //   return axios.post(`/wxa-dev/testsource?${qs.stringify({
  //     _r: '0.8530581592723374',
  //     appid: this.appid,
  //     platform: this.platform,
  //     ext_appid: this.extAppid,
  //     os: this.platform,
  //     clientversion: '101171018',
  //     gzip: 1,
  //     path: 'pages/home?',// 预览页面的路径
  //     newticket: this.ticket,
  //     clientversion: '1.01.171018'
  //   })}`).then(result => {

  //   })
  // }

  start (): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server?.on('request', this.callback())
      this.server?.listen(this.port, () => resolve())
      app_debug(`启动 HTTP 服务 <port: %s>`, this.port)
    })
  }

  stop () {
    this.api?.disconnect()
  
    this.ws.close()
    this.ws.removeAllListeners()

    this.server.removeAllListeners()
    this.server.close()
  }
}