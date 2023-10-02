import debug from 'debug'
import { invariant } from 'ts-invariant'
import { defineReadAndWriteProperty, nextTick } from '@catalyze/basic'
import { 
  Asset, 
  AssetProcess, 
  AssetsBundleJSON, 
  MessageOwner, 
  PodStatusKind, 
  WorkPort 
} from '@catalyze/basic'
import { 
  MixinWxAssetsBundle, 
  WxAsset, 
  WxAssetSetJSON, 
  WxAssetsBundle 
} from '@catalyze/asset'
import { WxAppLibs } from './libs'
import { WxInit, WxSettings } from '../context'
import { FS } from './capability/fs'
import { Network } from './capability/network'
import { System } from './capability/system'
import { Storage } from './capability/storage'
import { User } from './capability/user'
import { Controller } from './capability/controller'
import { Request } from './capability/request'
import { UI } from './capability/ui'
import { WxCapabilityFactory } from '../capability'
import { BuildTypeKind, MainBuilder } from '../builder'
import { ProxyApp } from './proxy'

import type { WxAppJSON } from '@catalyze/types'

import '../asset'

type ConnectionPayload = {
  type: string,
  port: MessagePort
}

type MessagePayload = {
  parameters: string[]
}

type InjectFile  = {
  filename: string,
  source: string
}

const worker_debug = debug('wx:app:worker')

// 
export class WxApp extends MixinWxAssetsBundle(WxAppLibs) {
  static create (...rests: unknown[]) {
    const wx = super.create(...rests)

    wx.register(FS as unknown as WxCapabilityFactory<ProxyApp>, {})
    wx.register(Network)
    wx.register(System)
    wx.register(Storage)
    wx.register(User)
    wx.register(Controller)
    wx.register(Request)
    wx.register(UI)

    return wx
  }

  constructor () {
    super()

    this.command('message::init', async (message: MessageOwner) => {
      const payload = message.payload as unknown as MessagePayload
      const { settings, assets } = payload.parameters[0] as unknown as WxInit

      await this.fromAssetsBundleAndSettings(assets, settings)
    })

    this.once('inited', () => {
      defineReadAndWriteProperty(globalThis, 'window', globalThis)
      defineReadAndWriteProperty(globalThis, '__wxConfig', this.configs)
      defineReadAndWriteProperty(globalThis, 'WeixinJSCore', this)
      defineReadAndWriteProperty<string>(globalThis, 'decodePathName', '')
      defineReadAndWriteProperty<string>(globalThis, '__wxRoute', '')
      defineReadAndWriteProperty<boolean>(globalThis, '__wxRouteBegin', false)
      defineReadAndWriteProperty<string>(globalThis, '__wxAppCurrentFile__', '')
      defineReadAndWriteProperty<object>(globalThis, '__wxAppData', {})
      defineReadAndWriteProperty<object>(globalThis, '__wxAppCode__', {})
      
      nextTick(() => this.startup())
    })
  }

  inject (name: string, code: string) {
    if (code !== null) {
      this.eval(code, `wx://app/${name}`)
    }
  }

  // 启动逻辑层，注入代码
  async startup () {
    const sets = this.pages.concat(this.components)
    const files: InjectFile[] = [
      {
        source: (this.findByFilename(`@wx/wxml.js`) as WxAsset).data as string,
        filename: 'wxml.js'
      }, {
        source: (this.findByFilename(`@wx/app.js`) as WxAsset).data as string,
        filename: 'app.js'
      },
    ].concat(this.findByExt('.js').filter(asset => {
      return !asset.relative.startsWith('@wx')
    }).map(asset => {
      return {
        filename: `resource/${asset.relative}`,
        source: asset.data as string
      }    
    }), sets.reduce((file, set) => {
      const json: WxAssetSetJSON = { 
        ...(set.json ? set.json.data as object : {  }),
        usingComponents: set.usingComponents ?? {}
      }
      
      file.source += `///// => ${set.relative}\n`
      file.source += `decodePathName = decodeURI('${set.relative}')\n`
      file.source += `__wxAppCode__[decodePathName + '.json'] = ${JSON.stringify(json)}\n`
      file.source += `__wxAppCode__[decodePathName + '.wxml'] = $gwx(decodePathName + '.wxml')\n`;
      file.source += `__wxRoute = decodePathName\n`
      file.source += `__wxRouteBegin = true\n`
      file.source += `__wxAppCurrentFile__ = decodePathName + '.js'\n`
      file.source += `require(__wxAppCurrentFile__)\n\n`
      
      return file
    }, {
      filename: 'boot.js',
      source: `
        __wxAppCurrentFile__ = 'app.js';
        require(__wxAppCurrentFile__)
      `
    }))

    for (const file of files) {
      this.inject(file.filename, file.source)
    }
    
    this.status |= PodStatusKind.On
  }

  // 初始化
  fromAssetsBundleAndSettings (assets: AssetsBundleJSON, settings: WxSettings) {
    this.fromAssetsBundleJSON(assets)
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

  handleSubscribe (...rest: unknown[]) {
    worker_debug('处理来自 View 层消息  「name: %s, data: %o, parameters: %o」', rest[0], rest[1], rest[2])
    // @ts-ignore
    globalThis.WeixinJSBridge.subscribeHandler(...rest)
  }

  invokeHandler (name: string, data: string, id: string) {
    worker_debug('App 层调用 「Native」 方法 「name: %s, data: %s, callbackId: %s」', name, data, id)     
    for (const capability of this.capabilities) {
      if (capability.has(name)) {
        return capability.invoke(name, JSON.parse(data), id)
      }
    }
  }

  publishHandler (name: string, data: string, id: string): void {
    worker_debug('发布消息 「name: %s, data: %s, viewIds: %s」', name, data, id)
    return this.send({
      command: 'message::publish',
      payload: {
        parameters: [name, JSON.parse(data), JSON.parse(id)]
      }
    })
  }
}

// 监听 Connection 请求
self.addEventListener('message', async (event: MessageEvent<ConnectionPayload>) => {
  const payload = event.data

  if (payload.type === 'connection') {
    worker_debug('开始链接 Worker')
    WxApp.create(new WorkPort(payload.port), '/') as unknown as WxApp
    
    const processor = AssetJS.create()
    const builder = MainBuilder.create(2)
    processor.builder = builder

    WxAssetsBundle.processor.register(processor)
    builder.init().then(() => self.postMessage({ status: 'connected' }))
  }
})

debug.enable('*')

// JS 文件处理器
// @ts-ignore
class AssetJS extends AssetProcess {
  static create <T extends AssetJS> (): T {
    return super.create('.js', [
      '@wx/view.js',
      '@wx/wxss.js',
      '@wx/wxml.js',
      '@wx/app.js'
    ])
  }

  // => builder
  // JS compile
  public _builder: MainBuilder | null = null
  public get builder () {
    invariant(this._builder)
    return this._builder
  }
  public set builder (builder: MainBuilder) {
    if (this._builder !== builder) {
      this._builder = builder
    }
  }

  /**
   * 
   * @param {Asset} asset 
   * @returns {Promise<void>}
   */
  decode (asset: Asset): Promise<void> {
    return Promise.resolve().then(() => {
      invariant(asset.source !== null && asset.source !== undefined)
      return this.builder.runTask({
        name: asset.relative,
        content: asset.source,
        sourceMaps: true
      }, BuildTypeKind.JS).then((result) => {
        asset.data = result
      })
    })
  }
}

// Sass 文件处理器
class AssetSass extends AssetProcess {
  static create <T extends AssetSass> (): T {
    return super.create('.scss')
  }
}

// Less 文件处理器
class AssetLess extends AssetProcess {
  static create <T extends AssetLess> (): T {
    return super.create('.less')
  }
}

WxAssetsBundle.processor.register(AssetJS.create())
WxAssetsBundle.processor.register(AssetSass.create())
WxAssetsBundle.processor.register(AssetLess.create())