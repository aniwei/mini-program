import { ProxyApp } from '../app'

export type * from './proxy/controller'
export type * from './proxy/request'
export type * from './proxy/ui'
export type * from './proxy/view'

export type CapabilityHandle = (...rest: any[]) => unknown | Promise<unknown>
export type CapabilityType = 'async' | 'sync'

export interface Capability {
  key: string,
  type: CapabilityType,
  handle: CapabilityHandle
}

export abstract class WxCapability extends Map<string, Capability> {  
  public proxy: ProxyApp

  constructor (proxy: ProxyApp, ...rest: unknown[])
  constructor (proxy: ProxyApp) {
    super()

    this.proxy = proxy
  }

  invoke (key: string, ...rest: unknown[]) {
    const capability = this.get(key) ?? null
    if (capability !== null) {
      if (capability.type === 'async') {
        return Promise.resolve(capability.handle(...rest))
      } else {
        return capability.handle(...rest)
      }
    }

    throw new Error(`Cannot find capability "${key}"`)
  }

  on (key: string, handle: CapabilityHandle, type: CapabilityType = 'async') {
    this.set(key, {
      key,
      type,
      handle
    })

    return this
  }
}

export interface WxCapabilityCreate {
  kSymbol: Symbol,
  create: (proxy: ProxyApp, ...rests: unknown[]) => Promise<WxCapability>, 
  new (proxy: ProxyApp, ...rests: unknown[]): WxCapability,
}

