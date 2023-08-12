import debug from 'debug'
import { useNavigationContainerRef } from '@react-navigation/native'
import { useEffect } from 'react'
import { ProxyApp } from '@catalyze/wx'
import { useProgram } from '@stores/program'
import { useWx } from '@stores/wx'

const app_debug = debug(`wx:hooks:app`)

export const useApp = () => {
  const api = useWx(state => state).api
  const program = useProgram(state => state)
  const navigationRef = useNavigationContainerRef()

  useEffect(() => {
    app_debug('开始获取项目配置')
    if (navigationRef.current !== null) {
      api.ready(() => {
        api.Program.commands.getWxAssetsBundle().then(assets => {
          const wx = ProxyApp.boot()
          wx.on('connected', () => wx.init(assets, program.settings).then(() => {
            const json = wx.findByFilename('app.json').data as WxAssetAppJSON
            
            program.set({ app: wx })
          }))
        })
      })
    }
  }, [navigationRef.current])

  return navigationRef
}