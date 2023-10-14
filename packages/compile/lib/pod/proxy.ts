import path from 'path'
import { invariant } from 'ts-invariant'
import { ProxyPod, MainPod, PodStatusKind, tryCatch } from '@catalyzed/basic'

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
        (this.status & PodStatusKind.Booted) === PodStatusKind.Booted
      )
    })) {
      this.status |= PodStatusKind.Inited
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

    this.once('booted', () => this.status |= PodStatusKind.On)
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

export interface MainCompilePodOwner {
  runTask<R>(...parameters: unknown[]): Promise<R>
}

export class MainCompilePod extends MainPod<ProxyCompilePod> {
  static create (...rests: unknown[]): MainCompilePodOwner
  static create (count: number = 2, root: string): MainCompilePodOwner {
    const proxies: ProxyCompilePod[] = []
    const uri = path.resolve(__dirname, 'pod/compile.cjs')

    for (let i = 0; i < count; i++) {
      const proxy = ProxyCompilePod.boot(root, uri)
      proxies.push(proxy)
    }

    const main = super.create(proxies)
    return main as MainCompilePodOwner
  }
}