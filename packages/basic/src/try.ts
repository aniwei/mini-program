import debug from 'debug'

const try_debug = debug('try')
export type TryCatchHandle<T> = () => T

/**
 * 执行
 * @param {TryCatchHandle<T>} handle
 * @returns {T | void} 
 */
export const tryCatch = <T> (handle: TryCatchHandle<T>): T | void => {
  try {
    const result = handle()
    if (result instanceof Promise) {
      return result.catch(error => try_debug(`Catching a error about %o`, error)) as T
    }

    return result
  } catch (error: any) {
    try_debug(`Catching a error about &o`, error)
  }
}