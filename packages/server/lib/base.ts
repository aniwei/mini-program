import Koa from 'koa'
import { Server } from 'http'
import { invariant } from 'ts-invariant'
import { createVite } from '@catalyzed/view'
import { WebSocket, WebSocketServer } from 'ws'
import { WorkTransport } from '@catalyzed/basic'

import * as Wx from '@catalyzed/api'
import type { ViteDevServer } from 'vite'

class WxApi extends Wx.WxApi {}

export class WxBase extends Koa {
  // => server
  protected _server: Server | null = null
  public get server () {
    invariant(this._server)
    return this._server
  }
  public set server (server: Server) {
    this._server = server
  }

  
  
  protected port: number
  protected ws: WebSocketServer
  
  protected api: WxApi = new WxApi()
  protected vite: ViteDevServer | null = null
  protected transport: WorkTransport | null = null

  constructor (port: number = 3000) {
    super()

    const ws = new WebSocketServer({ noServer: true })
    
    this.ws = ws
    this.port = port

    createVite(port).then(vite => {
      const server = vite.httpServer as Server
  
      server.on('upgrade', (req, socket, head) => {
        if (req.url === '/api') {
          ws.handleUpgrade(req, socket, head, (socket: WebSocket) => {
            this.api.disconnect()
            const transport = new Wx.WxApiTransport()
            transport.connect(socket)
            this.api.connect(transport)
            this.api.state |= Wx.WxApiStateKind.Connected
            
            this.emit(`connected`)
          })
        }

      })

      // server.on('request', this.callback())
      
      this.vite = vite
      this.server = server
      
      this.emit('vite')
    })
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
    return new Promise((resolve) => {
      const listen = () => {
        this.vite?.listen().then(() => {
          this.vite?.printUrls()
          resolve()
        })
        
      }
      if (this.vite) {
        listen()
      } else {
        this.on('vite', () => listen())
      }
    })
  }

  stop () {
    this.api?.disconnect()
  
    this.ws.close()
    this.ws.removeAllListeners()

    this.vite?.close()
  }
}