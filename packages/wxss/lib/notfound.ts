import type { WxssTemplate } from './compile'

export class NotFoundError extends Error {
  public path: string

  constructor (path: string, template: WxssTemplate) {
    super(`Path "${path}" not found from "${template.path}".`)

    this.path = path
  }
}