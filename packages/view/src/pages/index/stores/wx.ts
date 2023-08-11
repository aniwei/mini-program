import debug from 'debug'
import { create } from 'zustand'
import { WxApi } from '@catalyze/wx'
import { WxApiState, WxQRCodeState, WxUser } from '@catalyze/wx-api'


const api_debug = debug(`app:stores:wx`)

export interface WxState {
  QRCodeURL: string | null,
  QRCodeState: WxQRCodeState,
  user: WxUser | null,
  state: WxApiState,
  api: WxApi
}

export const useWx = create<WxState>(set => {
  const api = WxApi.create()

  api.on('Auth.signIn', (user: WxUser) => {
    api_debug('登录成功 <user: %o>', user)
    set(() => ({ user: { ...user } }))
    api.ready()
  }).on('Auth.WxQRCodeStateChanged', (QRCodeState: WxQRCodeState) => {
    api_debug(`QRCode 状态改变 <api: %s>`, QRCodeState)
    set(() => ({ QRCodeState }))
  }).on('connected', () => {
    set({ state: WxApiState.Connected })

    if (useWx.getState().user === null) {
      api.Auth.commands.getUser().then((user: WxUser | null = null) => {
        if (user === null) {
          api.Auth.commands.getAuthenticateWxQRCode().then(QRCodeURL => {
            api_debug('获取 QRCodeURL 二维码 <QRCodeURL: %s>', QRCodeURL.slice(0, 10) + '...')
            set(() => ({ 
              QRCodeURL, 
              QRCodeState: WxQRCodeState.Alive 
            }))
          })
        } else {
          api_debug('获取 User <User: %o>', user)
          set(() => ({ user: { ...user } }))
          api.ready()
        }
      })
    }
  })
  
  api.connect('ws://localhost:4001')

  return {
    api,
    state: WxApiState.Created,
    user: null,
    QRCodeURL: null,
    QRCodeState: WxQRCodeState.Uncreated,
  }
})