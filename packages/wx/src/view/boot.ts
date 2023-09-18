import debug from 'debug'
import invariant from 'ts-invariant'
import { 
  AssetsBundleJSON,
  MessageOwner,
  PodStatusKind, 
  WorkPort, 
  defineReadAndWriteProperty, 
  tick 
} from '@catalyze/basic'
import { MixinWxAssetsBundle, WxAsset, WxAssetSetJSON } from '@catalyze/wx-asset'
import { WxInit } from '../context'
import { WxViewLibs } from './libs'

import '../asset'
import { View } from './capability/view'

const view_debug = debug('wx:view:iframe')

type ConnectionPayload = {
  type: string,
  port: MessagePort
}

type MessagePayload = {
  parameters: unknown[]
}

type InjectFile  = {
  filename: string,
  source: string
}

export class WxView extends MixinWxAssetsBundle(WxViewLibs) {
  static create (...rests: unknown[]) {
    const wx = super.create(...rests)

    wx.register(View)

    return wx
  }

  constructor () {
    super()

    this.command('message::init', async (message: MessageOwner) => {
      const payload = message.payload as MessagePayload
      const { id, path, settings, configs, assets } = payload.parameters[0] as WxInit

      await this.fromAssetsBundle(assets)

      this.id = id as number
      this.path = path as string
      this.configs = configs
      this.settings = settings
    })

    this.once('inited', async () => {
      invariant(this.settings !== null)
      
      defineReadAndWriteProperty(globalThis, 'WeixinJSCore', this)
      defineReadAndWriteProperty(globalThis, '__wxConfig', this.configs)
      defineReadAndWriteProperty(globalThis, '__proxy_window__', {
        screen: {
          width: this.settings.size.width,
          height: this.settings.size.height,
        },
        devicePixelRatio: this.settings.devicePixelRatio
      })
      defineReadAndWriteProperty(globalThis, '__webviewId__', this.id)
      defineReadAndWriteProperty(globalThis, '__wxAppCode__', {})

      defineReadAndWriteProperty(globalThis, '__inject__', (rests: unknown[]) => this.inject(...rests))

      defineReadAndWriteProperty(globalThis, 'decodeJsonPathName', '')
      defineReadAndWriteProperty(globalThis, 'decodeWxmlPathName', '')
      defineReadAndWriteProperty(globalThis, 'decodeWxssPathName', '')

      tick(() => this.startup())
    })
  }

  handleSubscribe (...rest: unknown[]) {
    globalThis.WeixinJSBridge.subscribeHandler(rest[0], rest[1])
  }

  invokeHandler (name: string, data: string, id: string) {
    view_debug('View 层调用 「Native」 方法 「name: %s, data: %s, callbackId: %s」', name, data, id)     
    for (const capability of this.capabilities) {
      if (capability.has(name)) {
        return capability.invoke(name, JSON.parse(data), id)
      }
    }
  }

  publishHandler (name: string, data: string, id: string): void {
    view_debug('发布消息 「name: %s, data: %s, viewIds: %s」', name, data, id)
    return this.send({
      command: 'message::publish',
      payload: {
        parameters: [name, JSON.parse(data), JSON.parse(id)]
      }
    })
  }

  inject (...rests: unknown[])
  inject (name: string, code: string) {
    if (code !== null) {
      this.eval(code, `wx://view/${name}`)
    }
  }

  startup () {
    const sets = this.pages.concat(this.components)
    const files: InjectFile[] = [
      {
        source: (this.findByFilename(`@wx/wxml.js`) as WxAsset).data as string,
        filename: 'wxml.js'
      }, {
        source: (this.findByFilename(`@wx/wxss/comm.wxss`) as WxAsset).data as string,
        filename: 'wxss/comm.js'
      }
    ].concat(sets.reduce((file, set) => {
      const json: WxAssetSetJSON = { 
        ...(set.json ? set.json.data as object : {  }),
        usingComponents: set.usingComponents ?? {}
      }
      
      file.source += `///// => ${set.relative}\n`
      file.source += `decodeJsonPathName = decodeURI('${set.relative}')\n__wxAppCode__[decodeJsonPathName + '.json'] = ${JSON.stringify(json)}\n`
      file.source += `decodeWxmlPathName = decodeURI('${set.relative}')\n__wxAppCode__[decodeWxmlPathName + '.wxml'] = $gwx(decodeWxmlPathName + '.wxml')\n`
      if (set.wxss) {
        file.source += `decodeWxssPathName = decodeURI('${set.relative}')\n__wxAppCode__[decodeWxssPathName + '.wxss'] = ${(this.findByFilename(`@wx/wxss/${set.relative}.wxss`) as WxAsset)?.source}\n`
      }

      return file
    }, {
      filename: 'codes.js',
      source: ''
    }), {
      source: (this.findByFilename(`@wx/view.js`) as WxAsset).data as string,
      filename: 'view.js'
    }, {
      source: `
        const generateFunc = $gwx('${this.path}.wxml');
        if (generateFunc) {
          document.dispatchEvent(new CustomEvent('generateFuncReady', { 
            detail: { generateFunc: generateFunc }
          }));
        } else { 
          document.body.innerText = 'Page "${this.path}" Not Found.';throw new Error('Page "${this.path}" Not Found.')
        }`,
      filename: 'boot.js'
    }, )

    for (const file of files) {
      this.inject(file.filename, file.source)
    }
    
    this.status |= PodStatusKind.On
  }

  fromAssetsBundle (assets: AssetsBundleJSON) {
    this.fromAssetsBundleJSON(assets)
    return this.mount()
  }
}

window.addEventListener('message', async (event: MessageEvent<ConnectionPayload>) => {
  const payload = event.data

  if (payload.type === 'connection') {
    WxView.create(new WorkPort(payload.port), '/') as unknown as WxView
  }
  window.parent.postMessage({ status: 'connected' })
})