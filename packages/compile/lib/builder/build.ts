import debug from 'debug'
import sass from 'sass'
import less from 'less'
import path from 'path'
import { transform } from '@swc/core'
import { MessageOwner, PodStatusKind, WorkPort } from '@catalyzed/basic'
import { BuildTask, BuildSource, BuildTypeKind, ProxyBuilder } from './proxy'

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

    this.command('message::init', () => {
      this.status |= PodStatusKind.Inited
    })

    this.command('message::build', async (message: MessageOwner) => {
      const payload = message.payload as unknown as MessagePayload
      const buildTask = payload.parameters[0]

      builder_debug('编译文件名 「filename: %s」', buildTask.source.name)

      switch (buildTask.type) {
        case BuildTypeKind.Less:
          return message.reply(await this.less(buildTask.source))

        case BuildTypeKind.Sass:
          return message.reply(await this.sass(buildTask.source))

        case BuildTypeKind.JS: 
          return message.reply(await this.js(buildTask.source))
      }
    })
  }
  
  less (source: BuildSource) {
    return new Promise((resolve, reject) => {
      const parsed = path.parse(source.name)
      const dirs = parsed.dir.split(path.sep)
      const paths: string[] = []

      for (const dir of dirs) {
        const prefix = paths[paths.length - 1]
        if (prefix) {
          paths.push(path.resolve(source.root, prefix + path.sep + dir))
        } else {
          paths.push(path.resolve(source.root, dir))
        }
      }


      less.render(source.content, {
        sourceMap: {
          sourceMapFileInline: true
        },
        paths: [source.root, ...paths]
      }, (error: any, output?: Less.RenderOutput) => {
        if (error !== null) {
          reject(error)
        } 
        resolve(output)
      })
      // @ts-ignore
    }).then((result: { css: string, map: string }) => {
      return {
        payload: {
          code: result.css,
          map: result.map
        }
      }
    })
  }

  sass (source: BuildSource) {
    return new Promise((resolve, reject) => {
      sass.render({
        data: source.content,
        omitSourceMapUrl: true,
      }, (error: any, result: unknown) => {
        if (error !== null) {
          reject(error)
        } 
        resolve(result)
      })
      // @ts-ignore
    }).then((result: { css: string, map: string }) => {
      return {
        payload: {
          code: result.css,
          map: result.map
        }
      }
    })
  }

  js (source: BuildSource) {
    
    return transform(source.content, {
      filename: source.name,
      jsc: {
        parser: { syntax: source.ext === '.js' ? 'ecmascript' : 'typescript' },
        target: 'es5',
      },
      module: { type: 'commonjs' },
      sourceMaps: (source.sourceMaps as boolean | 'inline') ?? 'inline',
    }).then((result: { code: string, map?: string }) => {
      const parsed = path.parse(source.name)
      parsed.base = ''
      parsed.ext = '.js'

      const code = `define('${path.format(parsed)}', function (require, module, exports, window, document, frames, self, location, navigator, localStorage, history, Caches, screen, alert, confirm, prompt, fetch, XMLHttpRequest, WebSocket, webkit, WeixinJSCore, Reporter, print, URL, DOMParser, upload, preview, build, showDecryptedInfo, cleanAppCache, syncMessage, checkProxy, showSystemInfo, openVendor, openToolsLog, showRequestInfo, help, showDebugInfoTable, closeDebug, showDebugInfo, __global, loadBabelMod, WeixinJSBridge){\n${result.code}\n})`
      return {
        payload: {
          code,
          map: result.map
        }
      }
    }).catch((error: any) => {
      builder_debug('编译文件错误 「filename: %s, error: %o」', error)
      throw error
    })
  }
}


self.addEventListener('message', async (event: MessageEvent<ConnectionPayload>) => {
  const payload = event.data
  if (payload.type === 'connection') {
    
    Builder.create(new WorkPort(payload.port))
    self.postMessage({ status: 'connected' })
  }
})
