
import { MainPod, PodStatusKind, ProxyPod } from '@catalyze/basic'
import { getModuleURL } from '../basic/module'

type BuildPayload = {
  code: string,
  map: string
}

export enum BuildTypeKind {
  Less,
  Sass,
  JS,
  TS
}

export type BuildSource = {
  name: string,
  content: string,
  sourceMaps: boolean
}

export type BuildTask = {
  source: BuildSource,
  type: BuildTypeKind
}

export class ProxyBuilder extends ProxyPod {
  async build (...rests: unknown[]): Promise<string>
  async build (source: BuildSource, type: BuildTypeKind): Promise<string> {
    return this.send({
      command: 'message::build',
      payload: {
        parameters: [{ source, type }]
      }
    }).then((result) => { 
      const payload = result.payload as BuildPayload
      return Promise.resolve(payload.code)
    }) as Promise<string>
  }

  constructor () {
    super()
    this.once('booted', () => this.status |= PodStatusKind.On)
  }

  runTask <T> (...rests: unknown[]): Promise<T> {
    return this.build(...rests) as Promise<T>
  }

  init (): Promise<void> {
    return super.init()
  }
}

export class MainBuilder extends MainPod<ProxyBuilder> {
  static create (...rests: unknown[]): MainBuilder
  static create (count: number = 2): MainBuilder {
    const proxies: ProxyBuilder[] = []
    const uri = (new URL('./builder/build.js', getModuleURL())).toString()

    for (let i = 0; i < count; i++) {
      const proxy = ProxyBuilder.boot(uri) as ProxyBuilder
      proxies.push(proxy)
    }

    const main = super.create(proxies)
    return main as MainBuilder
  }
}