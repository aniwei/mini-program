import debug from 'debug'
import invariant from 'ts-invariant'
import { AssetsBundleJSON, PodStatus } from '@catalyze/basic'
import { NavigationContainerRef, StackActions } from '@react-navigation/native'
import { 
  MixinWxAssetsBundle, 
  WxAsset, 
  WxAssetAppJSON 
} from '@catalyze/wx-asset'
import { WxLibs } from './libs'
import { WxSettings } from '../context'
import { ProxyView, WxViewEvents } from '../view'
import { Controller } from '../capability/proxy/controller'
import { UI } from '../capability/proxy/ui'
import { Request } from '../capability/proxy/request'

import '../asset'

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

export interface ProxyLibs {
  navigateTo ()
}

/**
 * View 创建及持有类
 */
export abstract class ProxyApp extends MixinWxAssetsBundle(WxLibs) {
  static proxyId: number = 1
  static boot (...rests: unknown[]) {
    // @ts-ignore
    const wx = super.boot((new URL('./boot.js', import.meta.url)).toString(), ...rests)
    wx.register(Controller),
    wx.register(Request),
    wx.register(UI)

    return wx
  }

  // => navigation
  protected _navigation: NavigationContainerRef<{}> | null = null
  public get navigation () {
    invariant(this._navigation !== null, `The member "navigation" cannot be null.`)
    return this._navigation
  }
  public set navigation (navigation: NavigationContainerRef<{}>) {
    invariant(navigation !== null, `The argument "navigation" cannot be null.`)
    this._navigation = navigation
  }

  // => settings
  public get settings () {
    return super.settings
  }
  public set settings (settings: WxSettings) {
    super.settings = settings
  }

  // => booted 
  public get booted () {
    return this.status & PodStatus.Booted
  }

  public views: ProxyView[] = []

  constructor () {
    super()

    this.on('publish', (name: string, data: unknown, ids: unknown[]) => {
      if (ids.length > 0) {
        for (const id of ids) {
          for (const view of this.views) {
            if (view.id === id) {
              view.subscribe(name, data, view.id)
            }
          }
        }
      } else {
        for (const view of this.views) {
          view.subscribe(name, data, view.id)
        }
      }
      
    })
  }

  //// => libs interface
  /**
   * 
   * @param delta 
   */
  navigateBack (delta: number) {
    this.navigation.dispatch(StackActions.pop(delta))
  }

  /**
   * 
   * @param delta 
   */
  navigateTo (options) {
    this.navigation.dispatch(StackActions.push('view', options))
  }

  //// 
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

    view.init()
    
    view.on('publish', (name: string, data: unknown, ids: unknown[]) => {
      app_debug('来自 View -> ProxyApp 逻辑层推送事件 <name: %s, data: %o, ids: %o>', name, data, ids)

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
    const view = ProxyView.boot(path, container)
    invariant(this.proj !== null)

    view.path = path
    view.id = ProxyApp.proxyId++
    view.configs = this.configs
    view.settings = this.settings
    view.fromAssetsBundle({
      root: this.bundle.root,
      assets: this.bundle.assets.filter(asset => {
        if (asset.relative !== '@wx/app.js') {
          return true
        }
      }).map(asset => asset.toJSON())
    })

    this.views.push(view)

    return view
  }
 
  /**
   * 初始化
   * @param {AssetsBundleJSON} assets 
   * @param {WxSettings} settings 
   * @returns {Promise<void>}
   */
  init (assets: AssetsBundleJSON, settings: WxSettings) {
    return this.fromAssetsBundleAndSettings(assets, settings).then(() => super.init({ assets: this.bundle, settings }))
  }

  /**
   * 
   * @param assets 
   * @param settings 
   * @returns 
   */
  fromAssetsBundleAndSettings (assets: AssetsBundleJSON, settings: WxSettings) {
    this.fromAssetsBundleJSON(assets)
    
    return this.mount().then(() => {
      const app = (this.findByFilename('app.json') as WxAsset).data as WxAssetAppJSON
      const configs = {
        appLaunchInfo: {
          scene: settings.scene,
          path: settings.path
        },
        accountInfo: settings.account,
        pages: app.pages,
        env: settings.env,
        entryPagePath: settings.entry,
      }
  
      this.configs = configs
      this.settings = settings
    })
  }

  invokeHandler (name: string, data: unknown, id: number) {
    app_debug('调用 Delegate Libs 能力 <name: %s,data: %o, id: %s>', name, data, id)
    
    for (const capability of this.capabilities) {
      if (capability.has(name)) {
        return capability.invoke(name, data)
      }
    }
  }
}
