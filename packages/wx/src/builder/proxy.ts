
import { MainPod, PodStatus, ProxyPod } from '@catalyze/basic'

type BuildPayload = {
  code: string,
  map: string
}

export enum BuildType {
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
  type: BuildType
}

export class ProxyBuilder extends ProxyPod {
  async build (...rests: unknown[]): Promise<string>
  async build (source: BuildSource, type: BuildType): Promise<string> {
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
    this.once('booted', () => this.status |= PodStatus.On)
  }

  runTask <T> (...rests: unknown[]): Promise<T> {
    return this.build(...rests) as Promise<T>
  }

  init (): Promise<void> {
    return super.init()
  }
}

export class MainBuilder extends MainPod<ProxyBuilder> {
  static create (...rests: unknown[])
  static create (count: number = 2) {
    const proxies: ProxyBuilder[] = []
    // @ts-ignore
    const uri = (new URL('./build', import.meta.url)).toString()

    for (let i = 0; i < count; i++) {
      const proxy = ProxyBuilder.boot(uri)
      proxies.push(proxy)
    }

    const main = super.create(proxies)
    return main as MainBuilder
  }
}