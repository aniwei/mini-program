import debug from 'debug'
import { invariant } from 'ts-invariant'
import { 
  AssetsBundleJSON,
  MessageOwner,
  PodStatusKind, 
  WorkPort, 
  defineReadAndWriteProperty, 
  nextTick,
} from '@catalyzed/basic'
import { MixinWxAssetsBundle, WxAsset, WxAssetSetJSON } from '@catalyzed/asset'
import { WxInit } from '../context'
import { WxViewLibs } from './libs'
import { View } from './capability/view'

import '../asset'
import { WxProj } from '@catalyzed/types'
import { Utililty } from './capability/utility'
import { WxCapabilityFactory } from '../capability'
import { ProxyView } from '.'

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

interface WxViewInit extends AssetsBundleJSON {
  proj: WxProj
}

enum ViewPublishEventKind {
  RemoveInputComponent = 'custom_event_removeInputComponent'
}

export class WxView extends MixinWxAssetsBundle<WxViewLibs>(WxViewLibs) {
  static create (...rests: unknown[]) {
    const wx = super.create(...rests)

    wx.register(View as unknown as WxCapabilityFactory<ProxyView>)
    wx.register(Utililty as unknown as WxCapabilityFactory<ProxyView>)

    return wx
  }

  constructor () {
    super()

    this.command('message::init', async (message: MessageOwner) => {
      const payload = message.payload as MessagePayload
      const { id, path, settings, configs, data } = payload.parameters[0] as WxInit

      await this.fromAssetsBundle((data as WxViewInit))

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

      nextTick(() => this.startup())
    })
  }

  handleSubscribe (...rest: unknown[]) {
    // @ts-ignore
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
    
    switch (name) {
      case ViewPublishEventKind.RemoveInputComponent:
        this.invokeHandler('hideKeyboard', data, id)
        break

      default:
        return this.send({
          command: 'message::publish',
          payload: {
            parameters: [name, JSON.parse(data), JSON.parse(id)]
          }
        })
    }

  }

  inject (...rests: unknown[]): void
  inject (name: string, code: string): void {
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
      }, {
        source: (this.findByFilename(`@wx/wxss/app.wxss`) as WxAsset).data as string + '()',
        filename: 'wxss/app.js'
      }, 
      // {
      //   source: (this.findByFilename(`@wx/wxss/./app.wxss`) as WxAsset).data as string + '()',
      //   filename: 'wxss/./app.js'
      // }
    ].concat(sets.reduce((file, set) => {
      const json: WxAssetSetJSON = { 
        ...(set.json ? set.json.data as object : {  }),
        usingComponents: set.usingComponents ?? {}
      }
      file.source += `///// => ${set.relative}\n`
      file.source += `decodeJsonPathName = decodeURI('${set.relative}')\n__wxAppCode__[decodeJsonPathName + '.json'] = ${JSON.stringify(json)}\n`
      file.source += `decodeWxmlPathName = decodeURI('${set.relative}')\n__wxAppCode__[decodeWxmlPathName + '.wxml'] = $gwx(decodeWxmlPathName + '.wxml')\n`

      const wxss = this.findByFilename(`@wx/wxss/${set.relative}.wxss`) ?? null

      if (set.wxss && wxss) {
        file.source += `decodeWxssPathName = decodeURI('${set.relative}')\n__wxAppCode__[decodeWxssPathName + '.wxss'] = ${(wxss as WxAsset)?.source}\n`
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
        if (__wxAppCode__['${this.path}.wxss'] !== undefined && __wxAppCode__['${this.path}.wxss'] !== null) {
          __wxAppCode__['${this.path}.wxss']()
        }

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