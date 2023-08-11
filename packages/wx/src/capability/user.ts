import { WxUserLogin } from '@catalyze/wx-api'
import { WxCapability } from '.'
import { ProxyApp } from '../app'


export class User extends WxCapability {
  static kSymbol = Symbol.for('user')
  static create (proxy: ProxyApp): Promise<User> {
    return new Promise((resolve, reject) => {
      resolve(new User(proxy))
    })
  }

  constructor (proxy: ProxyApp) {
    super(proxy)

    this
      .on('login', this.login)
      .on('getUserInfo', this.getUserInfo)
      .on('getPhoneNumber', this.getPhoneNumber)
  }

  login = () => {
    // return wx.api.Program.commands.login().then((resp: WxUserLogin) => {
    //   return resp.code
    // })
  }

  getPhoneNumber = () => {

  }

  getUserInfo = () => {

  }
}