export class Unimplement extends Error {
  constructor (method: string) {
    super(`Unimplement this method "${method}"`)
  }
}

