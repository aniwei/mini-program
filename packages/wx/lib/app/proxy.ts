import debug from 'debug'
import { invariant } from 'ts-invariant'
import { AssetsBundleJSON, PodStatusKind } from '@catalyzed/basic'
import { NavigationContainerRef, StackActions } from '@react-navigation/native'
import { 
  MixinWxAssetsBundle, 
  WxAsset,  
} from '@catalyzed/asset'
import { WxAppLibs } from './libs'
import { WxSettings } from '../context'
import { ProxyView, WxViewEventKind, WxViewInvocationKind } from '../view'
import { Controller } from './capability/proxy/controller'
import { UI } from './capability/proxy/ui'
import { View } from './capability/proxy/view'
import { Request } from './capability/proxy/request'
import { getModuleURL } from '../basic/module'

import '../asset'
import type { WxAppJSON, WxProj } from '@catalyzed/types'

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

export interface ProxyAppInit extends AssetsBundleJSON {
  proj: WxProj
}

/**
 * View 创建及持有类
 */
export abstract class ProxyApp extends MixinWxAssetsBundle(WxAppLibs) {
  static proxyId: number = 1
  static boot (...rests: unknown[]): ProxyApp {
    /* @__PURE__ */
    const wx = super.boot((new URL('./app/boot.js', getModuleURL())).toString(), ...rests)
    wx.register(Controller)
    wx.register(Request)
    wx.register(UI)
    wx.register(View)

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
    return this.status & PodStatusKind.Booted
  }

  public views: ProxyView[] = []

  /**
   * 初始化
   * @param {AssetsBundleJSON} assets 
   * @param {WxSettings} settings 
   * @returns {Promise<void>}
   */
  init (data: ProxyAppInit, settings: WxSettings) {
    return this.fromAssetsBundleAndSettings(data, settings).then(() => {
      return super.init({ 
        data: {
          ...this.bundle.toJSON(),
          proj: data.proj
        }, 
        settings 
      })
    })
  }

  /**
   * 
   * @param assets 
   * @param settings 
   * @returns 
   */
  fromAssetsBundleAndSettings (data: ProxyAppInit, settings: WxSettings) {
    this.fromAssetsBundleJSON({
      root: data.root,
      assets: data.assets
    })
    
    return this.mount().then(() => {
      const app = (this.findByFilename('app.json') as WxAsset).data as WxAppJSON
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
  navigateTo (options?: object) {
    this.navigation.dispatch(StackActions.push('view', options))
  }

  //// => 
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

    view.fromAssetsBundle({
      root: this.bundle.root,
      assets: this.bundle.assets.filter(asset => {
        if (asset.relative !== '@wx/app.js') {
          return true
        }
      }).map(asset => asset.toJSON())
    }).then(() => view.init())

    
    view.handleInvoke = (name: string, data: unknown, id: string) => {
      app_debug('来自「 View > ProxyApp 」逻辑层「invoke」事件「name: %s, data: %o, id: %o」', name, data, id)
      switch (name) {
        case WxViewInvocationKind.InsertTextArea: {
          this.handleInvoke(name, data, id)
          break
        }
      }
    }
    view.handlePublish = (name: string, data: unknown, ids: unknown[]) => {
      app_debug('来自「 View > ProxyApp 」逻辑层「publish」事件「name: %s, data: %o, ids: %o>」', name, data, ids)
      switch (name) {
        case WxViewEventKind.GenerateFuncReady: {
          this.subscribe('onAppRoute', {
            ...options,
            webviewId: view.id,
          }, view.id)
          break
        }
  
        case WxViewEventKind.PageEvent: {
          this.subscribe('onAppRouteDone', {
            ...options,
            webviewId: view.id,
          }, view.id)
          break
        }
      }
  
      this.subscribe(name, data, view.id)
    }

    view.once('destroy', () => {
      const index = this.views.findIndex((v: ProxyView) => v === view)
      if (index > -1) {
        this.views.splice(index, 1)
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

  //// 
  // from app worker publish
  handlePublish (name: string, data: unknown, ids: unknown[]) {
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
  }

  // from app worker invoke
  handleInvoke (name: string, data: unknown, id: string) {
    app_debug('调用 Delegate Libs 能力 <name: %s,data: %o, id: %s>', name, data, id)
    
    for (const capability of this.capabilities) {
      if (capability.has(name)) {
        return capability.invoke(name, data, id)
      }
    }
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
   

    this.views.push(view)

    return view
  }
 
}
