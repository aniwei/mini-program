import debug from 'debug'
import invariant from 'ts-invariant'
import { 
  AssetsBundleJSON,
  PodStatus, 
  defineReadOnlyWxProperty 
} from '@catalyze/basic'
import { MixinWxAssetsBundle, WxAsset, WxAssetAppJSON } from '@catalyze/wx-asset'
import { WxContext, WxSettings } from '../context'
import { WxCapability, WxCapabilityCreate } from '../capability'
import { ProxyView, WxViewEvents } from '../view'
import { MainBuilder } from '../builder'
import { Controller } from '../capability/proxy/controller'
import { UI } from '../capability/proxy/ui'
import { Request } from '../capability/proxy/request'


const app_debug = debug(`wx:app:proxy`)

export interface WxAppRouteOptions {
  path: string,
  query?: object,
  scene?: number,
  notFound?: boolean,
  renderer?: 'webview',
  openType?: 'appLaunch' | 'navigateTo' | 'navigate'
}

export interface ProxyApp {
  controller: Controller,
  request: Request
  ui: UI
}

/**
 * View 创建及持有类
 */
export abstract class ProxyApp extends MixinWxAssetsBundle(WxContext) {
  static proxyId: number = 1
  static boot (...rests: unknown[]) {
    // @ts-ignore
    const wx = super.boot((new URL('./boot', import.meta.url)).toString(), ...rests)
    wx.register(Controller),
    wx.register(Request),
    wx.register(UI)

    return wx
  }

  // => settings
  public get settings () {
    return super.settings
  }
  public set settings (settings: WxSettings) {
    super.settings = settings
  }

  public builder: MainBuilder = MainBuilder.create(4)
  public capabilities: WxCapability[] = []
  public views: ProxyView[] = []
  public deps: number = 0

  register (WxCapability: WxCapabilityCreate, ...options: unknown[]) {
    this.deps++
    WxCapability.create(this, ...options).then(capability => {
      defineReadOnlyWxProperty(this, WxCapability.kSymbol as PropertyKey, capability)
      this.capabilities.push(capability)
      if (this.deps === 0) {
        this.status |= PodStatus.Prepared
      }
    })
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

  /**
   * 创建 View
   * @param path 
   * @param container 
   * @returns 
   */
  create (
    path: string, 
    container: HTMLIFrameElement
  ) {
    const view = ProxyView.create(container)
    invariant(this.proj !== null)

    view.path = path
    view.id = ProxyApp.proxyId++
    view.config = this.config
    view.settings = this.settings

    this.views.push(view)

    return view
  }

  invokeHandler (name: string, data: unknown, id: number) {
    app_debug('调用 Delegate Libs 能力 <name: %s,data: %o, id: %s>', name, data, id)
    
    for (const capability of this.capabilities) {
      if (capability.has(name)) {
        return capability.invoke(name, data)
      }
    }
  }

  async routing (
    container: HTMLIFrameElement, 
    options: WxAppRouteOptions
  ) {
    options = {
      scene: 1001,
      query: {},
      renderer: 'webview',
      openType: 'appLaunch',
      ...options,
    }

    const view = this.create(options.path, container)
    
    view.on('publish', (name: string, data: unknown, ids: unknown[]) => {
      app_debug('来自 View -> AppDelegate 逻辑层推送事件 <name: %s, data: %o, ids: %o>', name, data, ids)

      switch (name) {
        case WxViewEvents.GenerateFuncReady: {
          this.subscribe('onAppRoute', {
            ...options,
            webviewId: view.id,
          }, view.id)
          break
        }

        case WxViewEvents.PageEvent: {
          this.subscribe('onAppRouteDone', {
            ...options,
            webviewId: view.id,
          }, view.id)
          break
        }
      }

      this.subscribe(name, data, view.id)
    })

    view.once('destroy', () => {
      const index = this.delegates.findIndex(v => v === view)
      if (index > -1) {
        this.delegates.splice(index, 1)
      }
    })

    view.on('active', () => {
      this.subscribe('onAppRoute', {
        ...options,
        openType: 'navigateBack',
        webviewId: view.id,
      }, view.id)

      this.subscribe('onAppRouteDone', {
        ...options,
        openType: 'navigateBack',
        webviewId: view.id,
      }, view.id)
    })
    
    return view
  }
 
  init (assets: AssetsBundleJSON, settings: WxSettings) {
    return this.fromAssetsBundleAndSettings(assets, settings).then(() => {
      super.init(this.bundle, this.config, settings)
    })
  }
}
