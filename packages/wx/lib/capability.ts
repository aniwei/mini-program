
export type CapabilityHandle = (...rest: any[]) => unknown | Promise<unknown>
export type CapabilityType = 'async' | 'sync'

export interface Capability {
  key: string,
  type: CapabilityType,
  handle: CapabilityHandle
}

export abstract class WxCapability<T> extends Map<string, Capability> {  
  public proxy: T

  constructor (proxy: T, ...rest: unknown[])
  constructor (proxy: T) {
    super()

    this.proxy = proxy
  }

  invoke (key: string, ...rest: unknown[]) {
    const capability = this.get(key) ?? null
    if (capability !== null) {
      if (capability.type === 'async') {
        return Promise.resolve(capability.handle(...rest) ?? {})
      } else {
        return capability.handle(...rest) ?? {}
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

export interface WxCapabilityFactory<T> {
  kSymbol: Symbol,
  create: (proxy: T, ...rests: unknown[]) => Promise<T>, 
  new (proxy: T, ...rests: unknown[]): T,
}

