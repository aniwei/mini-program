
import debug from 'debug'
import { PodStatusKind, defineReadOnlyProperty } from '@catalyze/basic'
import { WxCapability, WxCapabilityFactory } from '../capability'

import { WxContext } from '../context'
import { ProxyApp } from './proxy'
import { Controller } from './capability/controller'
import { FS } from './capability/fs'
import { Network } from './capability/network'
import { System } from './capability/system'
import { User } from './capability/user'
import { UI } from './capability/ui'

const libs_debug = debug(`wx:libs`)

export interface WxAppLibs {
  controller: Controller
  fs: FS,
  network: Network,
  storage: Storage,
  system: System,
  user: User,
  request: Request
  ui: UI
}

export abstract class WxAppLibs extends WxContext {
  public capabilities: WxCapability<ProxyApp>[] = []
  public deps: number = 0

  register (WxCapability: WxCapabilityFactory<ProxyApp>, ...options: unknown[]) {
    this.deps++

    WxCapability.create(this as unknown as  ProxyApp, ...options).then(capability => {
      defineReadOnlyProperty(this, WxCapability.kSymbol as PropertyKey, capability)

      this.capabilities.push(capability as unknown as WxCapability<ProxyApp>)
      this.deps--

      if (this.deps === 0) {
        this.status |= PodStatusKind.Prepared
      }
    })
  }

  invokeCallbackHandler (id: number, data: unknown) {
    libs_debug(`执行回调，返回结果 <payload: %o>`, { data, id })
    // @ts-ignore
    globalThis.WeixinJSBridge.invokeCallbackHandler(id, data || '{}')
  }

  invokeHandler (name: string, data: unknown, id: number) {
    libs_debug('调用 Libs 能力 <name: %s,data: %o, id: %s>', name, data, id)
    
    for (const capability of this.capabilities) {
      if (capability.has(name)) {
        const result = capability.invoke(name, data ? JSON.parse(data as string) : data)
        result instanceof Promise 
          ? result.then(data => this.invokeCallbackHandler(id, data))
          : this.invokeCallbackHandler(id, result)
        break
      }
    }
  }
}