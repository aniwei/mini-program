import debug from 'debug'
import invariant from 'ts-invariant'
import { ProxyPod, MessageOwner, tryCatch, PodStatusKind, AssetsBundleJSON, UnimplementError, Subscribable } from '@catalyze/basic'



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
  invokeHandler (...rests: unknown[])
  invokeHandler (name: string, data: string, id: string) {
    throw new UnimplementError('invokeHandler')
  }

  handleInvoke (...rests: unknown[])
  handleInvoke (name: string, data: string, id: string) {
    throw new UnimplementError('handleInvoke')
  } 

  publishHandler (...rests: unknown[])
  publishHandler (name: string, data: string, ids: string) {
    throw new UnimplementError('publishHandler')
  }

  handlePublish (...rests: unknown[])
  handlePublish (name: string, data: string, ids: string) {
    throw new UnimplementError('handlePublish')
  } 

  subscribeHandler (...rests: unknown[])
  subscribeHandler (name: string, data: string, ids: string) {
    throw new UnimplementError('subscribeHandler')
  }

  handleSubscribe (...rests: unknown[])
  handleSubscribe (name: string, data: string, ids: string) {
    throw new UnimplementError('handleSubscribe')
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
  assets: AssetsBundleJSON,
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

    this.command('message::publish', async (message: MessageOwner) => {
      const payload = message.payload as unknown as  MessagePayload
      message.reply({
        command: 'message::callback',
        payload: await this.handlePublish(...payload.parameters)
      })
    })

    this.command('message::subscribe', async (message: MessageOwner) => {
      const payload = message.payload as unknown as  MessagePayload

      message.reply({
        command: 'message::callback',
        payload: await this.handleSubscribe(...payload.parameters)
      })
    })

    this.command('message::invoke', async (message: MessageOwner) => {
      const payload = message.payload as unknown as  MessagePayload
      message.reply({
        command: 'message::callback',
        payload: await this.handleInvoke(...payload.parameters)
      })
    })
  }

  isWxContextReady () {
    if (!(this.status & PodStatusKind.Inited)) {
      if (tryCatch<boolean>(() => {
        return (
          this.configs !== null &&
          this.settings !== null
        )
      })){
        this.status |= PodStatusKind.Inited
      }
    }
  }

  subscribe (name: string, data: unknown, ids: number): void {
    context_debug('订阅消息 <name: %s, data: %o, parameters: %o>', name, data, ids)
    this.send({
      command: 'message::subscribe',
      payload: {
        parameters: [name, data, ids]
      }
    })
  }
}
