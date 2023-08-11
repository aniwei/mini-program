import debug from 'debug'
import invariant from 'ts-invariant'
import { ProxyPod, MessageOwner, tryCatch, PodStatus } from '@catalyze/basic'
import { WxBundlesJSON } from '@catalyze/bundle'

/*
  status 状态变化路径
  created -> connected -> inited -> started -> destroy
*/
const context_debug = debug('wx:context')
const runScript: (code: string) => any = globalThis.eval

export interface MessagePayloadParameters extends Iterable<unknown> {
  0: string,
  1: unknown,
  2: number | unknown
}

export interface MessagePayload {
  parameters: MessagePayloadParameters
}

export type WxJSEvents = 'init' | 'connected' | 'pluginloaded' | 'inited' | 'started' | 'publish' | 'subscribe' | 'callback' | 'invoke' | 'created' | 'destroy' | 'remove' | 'active' | 'inactive' | 'status' | 'blur' | 'focus'

export abstract class WxJS extends ProxyPod {
  invokeHandler (...rests: unknown[]): void
  invokeHandler (name: string, data: string, id: number): void {}

  publishHandler (name: string, data: string, ids: string) {
    this.send({
      command: 'message::publish',
      payload: {
        parameters: [name, JSON.parse(data), JSON.parse(ids)]
      }
    })
  }

  eval (code: string, sourceURL?: string) {
    runScript(code + (sourceURL ? `\n//# sourceURL=${sourceURL}` : ''))
  }
}

export interface WxConfigs { }

export interface WxSettings {
  size: {
    width: number,
    height: number,
  },
  scene: number,
  path: string,
  entry: string,
  account: object,
  env: {
    USER_DATA_PATH: string
  }
}

export interface WxInit {
  id?: string | number,
  path?: string,
  bundles: WxBundlesJSON,
  settings: WxSettings,
  configs: WxConfigs,
}

export abstract class WxContext extends WxJS {  
  // => config
  protected _configs: WxConfigs | null = null
  public get configs () {
    invariant(this._configs !== null, `The member "config" cannot be null.`)
    return this._configs
  }
  public set configs (configs: WxConfigs) {
    invariant(configs !== null, `The argument "config" cannot be null.`)
    this._configs = configs
    this.isWxContextReady()
  }

  // => config
  protected _settings: WxSettings | null = null
  public get settings () {
    invariant(this._settings !== null, `The member "settings" cannot be null.`)
    return this._settings
  }
  public set settings (settings: WxSettings) {
    invariant(settings !== null, `The argument "settings" cannot be null.`)
    this._settings = settings
    this.isWxContextReady()
  }
  
  constructor () {
    super()

    this.command('message::init', (message: MessageOwner) => {
      const payload = message.payload as unknown as  MessagePayload
      this.emit('init', ...payload.parameters)
    })

    this.command('message::start', (message: MessageOwner) => {
      const payload = message.payload as unknown as  MessagePayload
      this.emit('start', ...payload.parameters)
    })

    this.command('message::publish', (message: MessageOwner) => {
      const payload = message.payload as unknown as  MessagePayload
      this.emit('publish', ...payload.parameters)
    })

    this.command('message::subscribe', (message: MessageOwner) => {
      const payload = message.payload as unknown as  MessagePayload
      this.emit('subscribe', ...payload.parameters)
    })

    this.command('message::invoke', (message: MessageOwner) => {
      const payload = message.payload as unknown as  MessagePayload
      message.reply({
        command: 'message::callback',
        payload: this.invokeHandler(...payload.parameters)
      })
    })
  }

  isWxContextReady () {
    if (!(this.status & PodStatus.Inited)) {
      if (tryCatch<boolean>(() => {
        return (
          this.configs !== null &&
          this.settings !== null
        )
      })){
        this.status |= PodStatus.Inited
      }
    }
  }

  subscribe (name: string, data: unknown, ids: number): void {
    context_debug('发布订阅消息 <name: %s, data: %o, parameters: %o>', name, data, ids)
    this.send({
      command: 'message::subscribe',
      payload: {
        parameters: [name, data, ids]
      }
    })
  }
}
