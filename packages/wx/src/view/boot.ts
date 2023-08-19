import debug from 'debug'
import invariant from 'ts-invariant'
import { 
  MessageOwner,
  PodStatus, 
  WorkPort, 
  defineReadAndWriteProperty, 
  tick 
} from '@catalyze/basic'
import { WxAsset } from '@catalyze/wx-asset'
import { ProxyView } from './proxy'
import { WxInit } from '../context'

import '../asset'

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

export class WxView extends ProxyView {
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

      defineReadAndWriteProperty(globalThis, 'decodeJsonPathName', '')
      defineReadAndWriteProperty(globalThis, 'decodeWxmlPathName', '')
      defineReadAndWriteProperty(globalThis, 'decodeWxssPathName', '')

      tick(() => this.startup())
    })

    this.on('subscribe', (...rest: unknown[]) => {
      view_debug('处理来自 App 层消息 <name: %s, data: %o, ids: %o>', rest[0], rest[1], rest[2])
      globalThis.WeixinJSBridge.subscribeHandler(rest[0], rest[1])
    })
  }

  invokeHandler (name: string, data: string, id: number): void {
    view_debug('View 层调用 Native 方法 <name: %s, data: %s, callbackId: %s>', name, data, id) 
  }

  publishHandler (name: string, data: string, viewIds: string): void {
    view_debug('发布消息 <name: %s, data: %s, viewIds: %s>', name, data, viewIds)
    super.publishHandler(name, data, viewIds)
  }

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
        source: (this.findByFilename(`@wx/wxss.js`) as WxAsset).data as string,
        filename: 'wxss.js'
      }
    ].concat(sets.reduce((file, set) => {
      file.source += `
        decodeJsonPathName = decodeURI('${set.relative}')
        __wxAppCode__[decodeJsonPathName + '.json'] = ${JSON.stringify(set.json ? set.json.data : {})}
        decodeWxmlPathName = decodeURI('${set.relative}')
        __wxAppCode__[decodeWxmlPathName + '.wxml'] = $gwx(decodeWxmlPathName + '.wxml')
        decodeWxssPathName = decodeURI('${set.relative}')
        __wxAppCode__[decodeWxssPathName + '.wxss'] = function () {}
      `
      return file
    }, {
      filename: 'code.js',
      source: ``
    }), {
      source: (this.findByFilename(`@wx/view.js`) as WxAsset).data as string,
      filename: 'view.js'
    }, {
      source: `
        var generateFunc = $gwx('${this.path}.wxml');
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
    
    this.status |= PodStatus.On
  }
}

window.addEventListener('message', async (event: MessageEvent<ConnectionPayload>) => {
  const payload = event.data

  if (payload.type === 'connection') {
    WxView.create(new WorkPort(payload.port), '/') as unknown as WxView
  }
  window.parent.postMessage({ status: 'connected' })
})