
import debug from 'debug'
import { PodStatusKind, defineReadOnlyProperty } from '@catalyzed/basic'
import { WxCapability, WxCapabilityFactory } from '../capability'

import { WxContext } from '../context'
import { ProxyView } from './proxy'
import { View } from './capability/view'

const libs_debug = debug(`wx:libs`)

export interface WxViewLibs {
  view: View
}

export abstract class WxViewLibs extends WxContext {
  public capabilities: WxCapability<ProxyView>[] = []
  public deps: number = 0

  register (WxCapability: WxCapabilityFactory<ProxyView>, ...options: unknown[]) {
    this.deps++

    WxCapability.create(this as unknown as  ProxyView, ...options).then(capability => {
      defineReadOnlyProperty(this, WxCapability.kSymbol as PropertyKey, capability)
      
      this.capabilities.push(capability as unknown as WxCapability<ProxyView>)
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
    libs_debug('View 调用 Libs 能力 「name: %s,data: %o, id: %s」', name, data, id)
    
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