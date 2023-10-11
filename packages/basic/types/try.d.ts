export type TryCatchHandle<T> = () => T;
/**
 * 执行
 * @param {TryCatchHandle<T>} handle
 * @returns {T | void}
 */
export declare const tryCatch: <T>(handle: TryCatchHandle<T>) => void | T;
