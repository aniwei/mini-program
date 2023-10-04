import qs from 'qs'
import Axios from 'axios'
import debug from 'debug'
import qrcode from 'qrcode'
import { WxQRCodeStateKind, WxUser } from '@catalyze/api'
import { WxStore } from './store'
import { WxScanCheck } from './basic/check'

const wx_debug = debug(`wx:auth`)


export class WxAuth extends WxStore {
  // => code
  protected _code: string | null = null
  public get code () {
    return this._code
  }
  public set code (code: string | null) {
    if (this._code === null || this._code !== code) {
      this._code = code
    }
  }

  protected checker: WxScanCheck | null = null

  constructor () {
    super()

    this.api
      .subscribe(`Auth.getUser`, () => {
        if (this.user !== null) {
          return this.user
        }

        return null
      }).subscribe(`Auth.getAuthenticateWxQRCode`, async () => this.getAuthenticateWxQRCode().then(code => qrcode.toDataURL(`https://open.weixin.qq.com/connect/confirm?uuid=${code}`)))
  }

  /**
   * 获取用户信息及票据
   * @param {string} code 
   * @returns {WxUser}
   */
  getUser (code: string): Promise<WxUser & {
    ticket: string,
    signature: string
  }> {
    return Axios.get(`https://mp.weixin.qq.com/debug/cgi-bin/webdebugger/qrcode?${qs.stringify({
      code,
      state: this.platform
    })}`).then(result => {
      const { openid, nickname, headurl, sex, province, city, contry } = result.data
      const signature = result.headers[`debugger-signature`]
      const ticket = result.headers[`debugger-newticket`]

      wx_debug(`微信登录成功 <result: %o>`, result.data)

      return Promise.resolve({
        ticket,
        signature,
        openid,
        nickname,
        sex,
        province,
        city,
        country: contry,
        avatarURL: headurl,
      })
    })
  }

  // 获取授权二维码
  getAuthenticateWxQRCode (): Promise<string> {
    return new Promise((resolve, reject) => {
      return Axios.get(`https://open.weixin.qq.com/connect/qrconnect?${qs.stringify({
        appid: `wxde40e023744664cb`,
        redirect_uri: `https://mp.weixin.qq.com/debug/cgi-bin/webdebugger/qrcode`,
        scope: `snsapi_login`,
        state: `login`,
        os: `darwin`
      })}`).then(result => {
        const rimg = /<img.+?src="\/connect\/qrcode\/(.+?)"\/>/g
        const matched = rimg.exec(result.data)

        if (matched !== null) {
          wx_debug(`微信登录二维码地质 <uri: %s>`, matched[0])
          const code = matched[1]
          this.code = code    
    
          wx_debug(`微信登录 <code: %s>`, code)
  
          if (this.checker !== null) {
            this.checker.abort()
            this.checker = null
          }
    
          const checker = new WxScanCheck()
          checker.on('alive', () => {
            this.api?.Auth.events.WxQRCodeStateKindChanged(WxQRCodeStateKind.Alive)
          }).on('success', async (code: string) => {
            const { ticket, signature, ...user } = await this.getUser(code)
            this.user = user
            this.ticket = ticket
            this.signature = signature

            await this.store()
            this.api.Auth.events.signIn(user)
          }).on(`scanned`, () => {
            this.api?.Auth.events.WxQRCodeStateKindChanged(WxQRCodeStateKind.Scanned)
          }).on(`cancelled`, () => {
            this.api?.Auth.events.WxQRCodeStateKindChanged(WxQRCodeStateKind.Cancelled)
          }).on(`timeout`, () => {
            this.api?.Auth.events.WxQRCodeStateKindChanged(WxQRCodeStateKind.Timeout)
          })
    
          checker.run(code)
          this.checker = checker
  
          resolve(code)
        } else {
          reject(new Error(`Cannot get authenticate QRCode.`))
        }
        
      })
    })
  
  }
}