
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


export function isNative (Constructor: unknown): boolean {
  return typeof Constructor === 'function' && /native code/.test(Constructor.toString())
}