import { invariant } from 'ts-invariant'
import { isArray, isObject } from './is'

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

// => cloneDeep
export const clone = <T = unknown>(source: T, deep: boolean = false): T => {
  if (typeof source === 'string') {
    return source + '' as T
  } 

  if (typeof source === 'number') {
    return source - 0 as T
  }

  if (source === null) {
    return null as T
  }

  if (isArray(source as object)) {
    const result: unknown[] = []
    for (let i = 0; i < (source as unknown[]).length; i++) {
      result.push(deep 
        ? (source as unknown[])[i] 
        : clone((source as unknown[])[i])
      )
    }
    return result as T
  }

  if (isObject(source as object)) {
    const object = Object.create(null)
    for (const key of Object.keys(object)) {
      if (object.hasOwnProperty(key)) {
        object[key] = deep 
          ? clone((source as any)[key]) 
          : (source as any)[key]
      }
    }

    return object
  }

  return null as T
}