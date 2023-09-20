export function isNative (Constructor: unknown): boolean {
  return typeof Constructor === 'function' && /native code/.test(Constructor.toString())
}