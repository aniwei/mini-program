// @ts-nocheck
import debug from 'debug'
import initialize from '@swc/wasm-web'
import sass from 'sass.js'
import { transform }  from '@swc/wasm-web'
import { MessageOwner, WorkPort } from '@catalyze/basic'
import { BuildTask, BuildSource, BuildType, ProxyBuilder } from './proxy'


type ConnectionPayload = {
  type: 'connections' | string,
  port: MessagePort
}


type MessagePayload = {
  parameters: BuildTask[]
}

const worker_debug = debug('compile:worker')

class Builder extends ProxyBuilder {
  constructor () {
    super()

    this.command('message::build', async (message: MessageOwner) => {
      const payload = message.payload as unknown as MessagePayload
      const buildTask = payload.parameters[0]

      switch (buildTask.type) {
        case BuildType.Less:
          throw new Error('Unsupport')
          break

        case BuildType.Sass:
          return message.reply(this.sass(buildTask.source))

        case BuildType.JS: 
          return message.reply(this.js(buildTask.source))
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
        command: 'message::callback',
        payload: result
      }
    })
  }

  js (source: BuildSource) {
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
      return {
        command: 'message::callback',
        payload: result
      }
    })
  }
}


self.addEventListener('message', async (event: MessageEvent<ConnectionPayload>) => {
  const payload = event.data
  if (payload.type === 'connection') {
    await Promise.all([
      Builder.create(new WorkPort(payload.port)),
      // @ts-ignore
      initialize(new URL('/wasm-web_bg.wasm', import.meta.url).toString())
    ])
  }

  self.postMessage({ status: 'connected' })
})
