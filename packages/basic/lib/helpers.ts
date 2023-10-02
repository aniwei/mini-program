import { invariant } from 'ts-invariant'

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

// => paddingLeft
export const paddingLeft = (value: number | string, length: number, symbol: string = '0') => {
  const string = String(value)
  invariant(length > 0)
  return Array(length - string.length).fill(symbol).join('') + value
}
