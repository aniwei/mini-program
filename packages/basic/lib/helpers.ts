// => defineReadOnlyProperty
export const defineReadAndWriteProperty = <T>(target: {
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

// => defineReadOnlyProperty
export const defineReadOnlyProperty = <T>(target: {
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
