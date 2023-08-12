import debug from 'debug'
import { AssetsBundleJSON, MessageOwner, PodStatus, WorkPort } from '@catalyze/basic'
import { defineReadAndWriteWxProperty, tick } from '@catalyze/basic'
import { MixinWxAssetsBundle, WxAsset, WxAssetAppJSON } from '@catalyze/wx-asset'
import { WxLibs } from './libs'
import { WxInit, WxSettings } from '../context'

type ConnectionPayload = {
  type: string,
  port: MessagePort
}

type MessagePayload = {
  parameters: string[]
}

const worker_debug = debug('wx:app:worker')


export class WxApp extends MixinWxAssetsBundle(WxLibs) {
  constructor () {
    super()

    this.command('message::init', async (message: MessageOwner) => {
      const payload = message.payload as unknown as MessagePayload
      const { settings, assets } = payload.parameters[0] as unknown as WxInit

      await this.fromAssetsBundleAndSettings(assets, settings)
    })

    this.once('inited', () => {
      defineReadAndWriteWxProperty(globalThis, 'window', globalThis)
      defineReadAndWriteWxProperty(globalThis, '__wxConfig', this.configs)
      defineReadAndWriteWxProperty(globalThis, 'WeixinJSCore', this)
      defineReadAndWriteWxProperty<string>(globalThis, '__wxRoute', '')
      defineReadAndWriteWxProperty<boolean>(globalThis, '__wxRouteBegin', false)
      defineReadAndWriteWxProperty<string>(globalThis, '__wxAppCurrentFile__', '')
      defineReadAndWriteWxProperty<object>(globalThis, '__wxAppData', {})
      defineReadAndWriteWxProperty<object>(globalThis, '__wxAppCode__', {})
      
      tick(() => this.startup())
    })

    this.on('subscribe', (...rest: unknown[]) => {
      worker_debug('处理来自 View 层消息  <name: %s, data: %o, parameters: %o>', rest[0], rest[1], rest[2])
      globalThis.WeixinJSBridge.subscribeHandler(...rest)
    }) 
  }

  inject (name: string, code: string) {
    if (code !== null) {
      this.eval(code, `wx://app/${name}`)
    }
  }

  boot () {
    this.findByFilename('@wx/service.js')
    this.inject('boot.js', this.proj.bootJavaScript)
  }

  async injectWxAppCode () {
    for (const [key, code] of this.proj.codes) {
      this.inject(`${this.proj.appid}/${key}`, code)
    }
  }

  fromAssetsBundleAndSettings (assets: AssetsBundleJSON, settings: WxSettings) {
    return this.fromAssetsBundleJSON(assets).then(() => {
      const app = (this.findByFilename('app.json') as WxAsset).data as WxAssetAppJSON
      const configs = {
        appLaunchInfo: {
          scene: settings.scene,
          path: settings.path
        },
        accountInfo: settings.account,
        pages: app.pages,
        env: settings.env,
        entryPagePath: settings.entry
      }
  
      this.configs = configs
      this.settings = settings
    })
  }
 
  async startup () {
    this.boot()
    this.injectWxAppCode()

    this.inject('start.js', this.proj.startJavaScript)

    this.status |= PodStatus.On
  }
}

const main = async (event: MessageEvent<ConnectionPayload>) => {
  const payload = event.data
  if (payload.type === 'connection') {
    worker_debug('开始链接 Worker')
    const wx = WxApp.create(new WorkPort(payload.port)) as unknown as WxApp
    wx.emit('connected')
  }
  
  self.postMessage({ status: 'connected' })
}

self.addEventListener('message', main)
