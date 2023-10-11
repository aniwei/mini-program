export const isTypeOf = (object: object, type: string) => {
  return Object.prototype.toString.call(object) === `[object ${type}]`
}

export const isDarwin = () => {
  return process.platform === 'darwin'
}

export const isLinux = () => {
  return process.platform === 'linux'
}

export const isWindow = () => {
  return process.platform === 'win32'
}

export const isArm64 = () => {
  return process.arch === 'arm64'
}

export const isSupportBlob = () => {
  return typeof globalThis.Blob !== 'undefined'
}

export const isBlob = (blob: Blob) => {
  return isTypeOf(blob, 'Blob')
}

export const isRegExp = (r: RegExp) => {
  return isTypeOf(r, 'RegExp')
}

export const isSupportSharedArrayBuffer = () => {
  return typeof globalThis.SharedArrayBuffer !== 'undefined'
}

export const isNative = (Constructor: unknown): boolean => {
  return typeof Constructor === 'function' && /native code/.test(Constructor.toString())
}

export const isArray = (object: object) => {
  return isTypeOf(object, 'Array')
}

export const isObject = (object: object) => {
  return isTypeOf(object, 'Object')
} 
