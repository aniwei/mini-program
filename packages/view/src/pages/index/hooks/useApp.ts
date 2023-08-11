import debug from 'debug'
import { useNavigationContainerRef } from '@react-navigation/native'
import { useEffect } from 'react'
import { ProxyApp } from '@catalyze/wx'
import { useProgram } from '@stores/program'
import { useWx } from '@stores/wx'
import { WxAppJSON } from '@catalyze/wx-api'

const app_debug = debug(`wx:hooks:app`)

export const useApp = () => {
  const api = useWx(state => state).api
  const program = useProgram(state => state)
  const navigationRef = useNavigationContainerRef()

  useEffect(() => {
    app_debug('开始获取项目配置')
    if (navigationRef.current !== null) {
      api.ready(() => {
        api.Program.commands.getWxAppBundles().then(bundles => {
          const wx = ProxyApp.boot()
          wx.from(bundles)
          wx.on('connected', () => wx.init(bundles, program.settings).then(() => {
            const app = wx.findFile('app.json') as WxAppJSON
            
          }))
        })
      })
    }
  }, [navigationRef.current])

  return navigationRef
}