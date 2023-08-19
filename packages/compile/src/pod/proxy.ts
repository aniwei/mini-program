import path from 'path-browserify'
import { invariant } from 'ts-invariant'
import { ProxyPod, MainPod, PodStatus, tryCatch } from '@catalyze/basic'

export type CompileType = 'XML' | 'CSS'

export abstract class ProxyCompile extends ProxyPod {
  // => root
  protected _root: string | null = null
  public get root () {
    invariant(this._root !== null)
    return this._root
  }
  public set root (root: string) {
    if (this._root !== root) {
      this._root = root
      this.isContextReady()
    }
  }

  isContextReady () {
    if (tryCatch<boolean>(() => {
      return (
        this.root !== null &&
        (this.status & PodStatus.Booted) === PodStatus.Booted
      )
    })) {
      this.status |= PodStatus.Inited
    }
  }
}

export class ProxyCompilePod extends ProxyCompile {
  /**
   * 
   * @param root 
   * @param uri 
   * @returns 
   */
  static boot(root: string, uri: string) {
    const pod = super.boot<ProxyCompilePod>(uri) as ProxyCompilePod
    pod.root = root

    return pod
  }

  constructor () {
    super()

    this.once('booted', () => this.status |= PodStatus.On)
  }

  init () {
    return super.init(this.root)
  }

  /**
   * 
   * @param rests 
   */
  runTask<T>(...rests: unknown[]): Promise<T>
  runTask<T>(parameters: string[], type: CompileType = 'XML'): Promise<T> {
    return this.send({
      command: 'message::compile',
      payload: {
        parameters: [parameters, type]
      }
    }).then(result => result.payload as string) as Promise<T>
  }  
}

export class MainCompilePod extends MainPod<ProxyCompilePod> {
  static create (...rests: unknown[])
  static create (count: number = 5, root: string) {
    const proxies: ProxyCompilePod[] = []
    const uri = path.resolve(__dirname, 'compile')

    for (let i = 0; i < count; i++) {
      const proxy = ProxyCompilePod.boot(root, uri)
      proxies.push(proxy)
    }

    const main = super.create(proxies)
    return main
  }
}