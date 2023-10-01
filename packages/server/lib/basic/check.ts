import Axios from 'axios'
import debug from 'debug'
import { EventEmitter } from '@catalyze/basic'

const wx_debug = debug(`wx:auth:check`)
const axios = Axios.create({
  baseURL: `https://long.open.weixin.qq.com`
})

export enum WxErrorCodeKind {
  Timeout = 402,
  Cancelled = 403,
  Scanned = 404,
  Success = 405,
  KeepAlive = 408,
  Error = 500,
}

export class WxScanCheck extends EventEmitter<`success` | `cancelled` | `scanned` | `timeout` | `error` | `alive`> {
  private timer: NodeJS.Timeout | null = null
  private duration: number
  private aborted: boolean
  
  constructor (duration: number = 1500) {
    super()
    this.duration = duration
    this.aborted = false
  }

  run (code: string) {
    const request = () => {
      this.timer = setTimeout(() => {
        axios
          .get(`/connect/l/qrconnect?uuid=${code}`)
          .then(result => {
  
            if (!this.aborted) {
              const func = new Function(`window`, `window = window || {};${result.data}return window;`)
              const { wx_errcode, wx_code } = func()

              wx_debug(`二维码状态查询 「state: ${wx_code}」`)
      
              switch (wx_errcode) {
                case WxErrorCodeKind.Success: {
                  clearTimeout(this.timer as NodeJS.Timeout)
                  this.emit(`success`, wx_code)
                  break
                }
      
                case WxErrorCodeKind.Cancelled: {
                  clearTimeout(this.timer as NodeJS.Timeout)
                  this.emit(`cancelled`)
                  break
                }
      
                case WxErrorCodeKind.Scanned: {
                  this.emit(`scanned`)
                  request()
                  break
                }
      
                default: {
                  this.emit('alive')
                  request()
                  break
                }
              }
            }
          })
      }, this.duration)
    }

    request()    
  }

  abort () {
    if (this.timer !== null) {
      clearTimeout(this.timer)
      this.timer = null 
      this.aborted = true
    }
  }
}