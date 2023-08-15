// @ts-nocheck
import debug from 'debug'
import initialize from '@swc/wasm-web'
import sass from 'sass.js'
import { transform }  from '@swc/wasm-web'
import { MessageOwner, PodStatus, WorkPort } from '@catalyze/basic'
import { BuildTask, BuildSource, BuildType, ProxyBuilder } from './proxy'

const builder_debug = debug('wx:builder')

type ConnectionPayload = {
  type: 'connections' | string,
  port: MessagePort,
  env: {
    DEBUG: string,
    [key: string]: string
  }
}

type MessagePayload = {
  parameters: BuildTask[]
}

class Builder extends ProxyBuilder {
  constructor () {
    super()

    
    this.command('message::init', () => this.status |= PodStatus.Inited)
    this.command('message::build', async (message: MessageOwner) => {
      const payload = message.payload as unknown as MessagePayload
      const buildTask = payload.parameters[0]

      switch (buildTask.type) {
        case BuildType.Less:
          throw new Error('Unsupport')

        case BuildType.Sass:
          return message.reply(await this.sass(buildTask.source))

        case BuildType.JS: 
          return message.reply(await this.js(buildTask.source))
      }
    })
  }

  sass (source: BuildSource) {
    return new Promise((resolve, reject) => {
      sass.render({
        data: source.content
      }, (error: any, result) => {
        if (error !== null) {
          reject(error)
        } 
        resolve(result)
      })
    }).then(result => {
      return {
        payload: result
      }
    })
  }

  js (source: BuildSource) {
    builder_debug('编译文件名 <filename: %s>', source.name)

    

    return transform(source.content, {
      filename: source.name,
      jsc: {
        parser: {
          syntax: 'ecmascript',
        },
        target: 'es5',
      },
      module: {
        type: 'commonjs'
      },
      sourceMaps: source.sourceMaps,
      inlineSourcesContent: true
    }).then(result => {
      const code = `define('${source.name}', function (require, module, exports, window, document, frames, self, location, navigator, localStorage, history, Caches, screen, alert, confirm, prompt, fetch, XMLHttpRequest, WebSocket, webkit, WeixinJSCore, Reporter, print, URL, DOMParser, upload, preview, build, showDecryptedInfo, cleanAppCache, syncMessage, checkProxy, showSystemInfo, openVendor, openToolsLog, showRequestInfo, help, showDebugInfoTable, closeDebug, showDebugInfo, __global, loadBabelMod, WeixinJSBridge){\n${result.code}\n})`
      return {
        payload: {
          code,
          map: result.code
        }
      }
    }).catch((error: any) => {
      builder_debug('编译文件错误 <filename: %s, error: %o>', error)
    })
  }
}


self.addEventListener('message', async (event: MessageEvent<ConnectionPayload>) => {
  const payload = event.data
  if (payload.type === 'connection') {
    
      Builder.create(new WorkPort(payload.port)),
      // @ts-ignore
      initialize(new URL('/wasm-web_bg.wasm', import.meta.url).toString()).then(() => self.postMessage({ status: 'connected' }))
  }

  // debug.enable(payload.env?.DEBUG)
  // debug.enable('*')
})
