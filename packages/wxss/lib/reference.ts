export class ReferenceError extends Error {
  public path: string

  constructor (path: string) {
    super(`Exist circular references (${path}).`)
    this.path = path
  }
}