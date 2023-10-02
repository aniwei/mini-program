import debug from 'debug'
import { create } from 'zustand'
import { WxApiStateKind, WxQRCodeStateKind, WxUser } from '@catalyze/api'
import { api } from '../api'


const api_debug = debug(`app:stores:wx`)

export interface WxState {
  QRCodeURL: string | null,
  QRCodeState: WxQRCodeStateKind,
  user: WxUser | null,
  state: WxApiStateKind
}

export const useWx = create<WxState>(set => {
  api.Auth.commands.getUser().then((user: WxUser | null = null) => {
    if (user === null) {
      api.Auth.commands.getAuthenticateWxQRCode().then(QRCodeURL => {
        api_debug('获取 QRCodeURL 二维码 「QRCodeURL: %s」', QRCodeURL.slice(0, 10) + '...')
        set(() => ({ 
          QRCodeURL, 
          QRCodeState: WxQRCodeStateKind.Alive 
        }))
      })
    } else {
      api_debug('获取 User 「User: %o」', user)
      set(() => ({ user: { ...user } }))
    }
  })
  
  api.on('Auth.signIn', (user: WxUser) => {
    api_debug('登录成功 「user: %o」', user)
    set(() => ({ user: { ...user } }))
  }).on('Auth.WxQRCodeStateKindChanged', (QRCodeState: WxQRCodeStateKind) => {
    api_debug(`QRCode 状态改变 「api: %s」`, QRCodeState)
    set(() => ({ QRCodeState }))
  }).on('connected', () => {
    set({ state: WxApiStateKind.Connected })
  })

  return {
    state: WxApiStateKind.Created,
    user: null,
    QRCodeURL: null,
    QRCodeState: WxQRCodeStateKind.Uncreated,
  }
})