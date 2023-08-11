// => defineReadOnlyWxProperty
export const defineReadAndWriteWxProperty = <T>(target: {
  hasOwnProperty: (name: string) => boolean
}, name: PropertyKey, defaultValue: T, force: boolean = false) => {
  let value: T = defaultValue

  if (force || !target.hasOwnProperty(name as string)) {
    Reflect.defineProperty(target, name, {
      configurable: true,
      get: () => {
        return value
      },
      set: (v: T) => value = v
    })
  }
}

// => defineReadOnlyWxProperty
export const defineReadOnlyWxProperty = <T>(target: {
  hasOwnProperty: (name: string) => boolean
}, name: PropertyKey, value: T) => {
  if (!target.hasOwnProperty(name as string)) {
    Reflect.defineProperty(target, name, {
      get () {
        return value
      }
    })
  }
}


// => tick
export const tick = (callback: () => void) => {
  Promise.resolve().then(callback)
}

// => UnimplementedError
export class UnimplementedError extends Error {
  public method?: string
  constructor (message?: string, method?: string) {
    super(message)

    this.method = method
  }
}