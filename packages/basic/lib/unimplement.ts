export class UnimplementError extends Error {
  constructor (method: string) {
    super(`Unimplement this method "${method}".`)
  }
}

