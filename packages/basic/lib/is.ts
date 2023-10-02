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
  return typeof globalThis.Blob !== undefined
}

export const typeOf = (object: object, type: string) => {
  return Object.prototype.toString.call(object) === `[object ${type}]`
}

export const isBlob = (blob: Blob) => {
  return typeOf(blob, 'Blob')
}

export function isNative (Constructor: unknown): boolean {
  return typeof Constructor === 'function' && /native code/.test(Constructor.toString())
}