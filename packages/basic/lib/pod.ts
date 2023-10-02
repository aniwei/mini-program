import debug from 'debug'
import Worker from '@catalyze/worker'
import { invariant } from 'ts-invariant'
import { EventEmitter } from './events'
import { WorkPort, WorkTransport } from './work'
import { MessageOwner } from './transport'
import { nextTick } from './microtask'

const pod_debug = debug('basic:pod')

export type Passage = Worker & HTMLIFrameElement

// Worker 运行状态
export enum PodStatusKind {
  Created = 1,
  Connected = 2,
  Prepared = 4,
  Booted = 8,
  Inited = 16,
  On = 32,
  Off = 64,
  Active = 128,
  Unactive = 256,
  Destroy = 512,
}

export type PodMessagePayload<T> = {
  parameters: T[]
}

export type PodFactory<T> = { 
  create (...rests: unknown[]): unknown
  create <T> (...rests: unknown[]): T, 
  new (...rests: unknown[]): T 
}
// Worker 运行容器
export abstract class Pod extends WorkTransport {
  /**
   * 
   * @param {unknown[]} rests 
   */
  static create (...rests: unknown[]): unknown
  static create <T extends Pod> (...rests: unknown[]): T
  static create <T extends Pod> (port: WorkPort): T {
    const PodFactory = this as unknown as PodFactory<T>
    const pod = new PodFactory()
    pod.connect(port)

    return pod
  }

  // => status
  public _status = PodStatusKind.Created
  public get status () {
    return this._status
  }
  public set status (status: PodStatusKind) {
    if (this._status !== status) {
      const old = this._status
      this._status = status
      pod_debug('Pod 状态变更 <old: %s -> new: %s>', old, status)
      nextTick(() => this.emit('status', this._status, old))
    }
  }

  constructor (...rests: unknown[])
  constructor () {
    super()

    this.once('inited', () => this.status |= PodStatusKind.On)
    this.on('status', (...parameters: PodStatusKind[]) => {
      const [status, old] = parameters
      const v = status &~ PodStatusKind.Inited
     
      this.send({
        command: 'message::status',
        payload: {
          parameters: [v, old]
        }
      })
    })

    this.on('status', (status: PodStatusKind, old: PodStatusKind) => {
      const v = status &~ old
      switch (v) {
        case PodStatusKind.Created:
          this.emit('created')
          break
        case PodStatusKind.Connected:
          this.emit('connected')
          break
        case PodStatusKind.Prepared:
          this.emit('prepared')
          break
        case PodStatusKind.Inited:
          this.emit('inited')
          break
        case PodStatusKind.Booted:
          this.emit('booted')
          break
        case PodStatusKind.On: 
          this.emit('on')
          break
        case PodStatusKind.Off: 
          this.emit('off')
          break
        case PodStatusKind.Active: 
          this.emit('active')
          break
        case PodStatusKind.Unactive: 
          this.emit('unactive')
          break
      }
    })

    this.command('message::status', (message: MessageOwner) => {
      const payload = message.payload as PodMessagePayload<string>
      const parameters = payload.parameters

      this.status |= parameters[0] as unknown as  PodStatusKind
    })
  }

  idle () {
    if (this.status & PodStatusKind.Inited) {
      const status = this.status &~ PodStatusKind.Off
      this.status = status | PodStatusKind.On
    }
  }

  busy () {
    if (this.status & PodStatusKind.Inited) {
      const status = this.status &~ PodStatusKind.On
      this.status = status | PodStatusKind.Off
    }
  }
}

// Worker 主线程容器代理
export abstract class ProxyPod extends Pod {
  static boot<T extends ProxyPod>(...rests: unknown[]): T
  static boot<T extends ProxyPod>(...rests: unknown[]): T
  static boot<T extends ProxyPod>(uri: string): T {
    const channel = new MessageChannel()
    const port1 = channel.port1
    const port2 = channel.port2

    const pod = super.create<T>(new WorkPort(port1)) as unknown as T

    pod.passage = new Worker(uri, { 
      type: 'module'
    }) as Passage 
    pod.passage.postMessage({ type: 'connection', port: port2 }, [port2])

    return pod as unknown as T
  }

  // => passage
  public _passage: Passage | null = null
  public get passage () {
    invariant(this._passage)
    return this._passage
  }
  public set passage (passage: Passage) {
    if (this._passage !== passage) {
      if (this._passage) {
        this._passage.terminate()
        this._passage.removeEventListener('message', this._onmessage)
      }

      passage.addEventListener('message', this._onmessage) 
      this._passage = passage
    }
  }

  constructor (...rests: unknown[])
  constructor () {
    super()

    this.once('booted', () => this.status |= PodStatusKind.On)
  }

  public _onmessage = (event: MessageEvent<{ status: 'connected' }>) => {
    if (event.data.status === 'connected') {
      this.emit('connected')
    }
  }

  runTask <T> (...rests: unknown[]): Promise<T> {
    throw new Error('')
  }

  init (...rests: unknown[]): Promise<void> {
    return new Promise((resolve) => {
      this.once('connected', () => this.send({
        command: 'message::init',
        payload: {
          parameters: [...rests]
        }
      }).then(() => this.status |= PodStatusKind.Booted))

      this.once('booted', () => resolve())
    })
  }
}

export type PodQueueHandle = () => void
export type MainPodFactory<T> = {
  create (...rests: unknown[]): unknown
  create <P extends ProxyPod, T extends MainPod<P>> (...rests: unknown[]): T,
  create <P extends ProxyPod, T extends MainPod<P>> (proxies: P[]): T,
  new (...rests: unknown[]): T 
}
export abstract class MainPod<P extends ProxyPod> extends EventEmitter<'booted' | 'connected' | string> {
  static create (...rests: unknown[]): unknown
  static create <
    P extends ProxyPod, 
    T extends MainPod<P>,
  > (...rests: unknown[]): T 
  static create <
    P extends ProxyPod, 
    T extends MainPod<P>,
  > (proxies: P[]): T {
    const MainPodFactory = this as unknown as MainPodFactory<T>
    const main = new MainPodFactory()
    main.proxies = proxies
    return main
  }

  // => count
  public get count () {
    return this.proxies.length
  }

  // => proxies
  public _proxies: P[] = []
  public get proxies () {
    return this._proxies
  }
  public set proxies (proxies: P[]) {
    if (this._proxies !== proxies) {
      this._proxies = proxies

      Promise.all(proxies.map(proxy => {
        return new Promise(resolve => proxy.once('connected', () => resolve(proxy)))
      })).then(() => this.emit('connected'))

      Promise.all(proxies.map(proxy => {
        return new Promise(resolve => proxy.status & PodStatusKind.Booted ? resolve(proxy) : proxy.once('booted', () => resolve(proxy)))
      })).then(() => this.emit('booted'))
    }
  }

  public queue: PodQueueHandle[] = []

  findByStatus (status: PodStatusKind = PodStatusKind.On) {
    return this.proxies.find(proxy => proxy.status & status) ?? null
  }

  runTask <R> (...parameters: unknown[]): Promise<R> {    
    return new Promise((resolve, reject) => {
      const proxy = this.findByStatus(PodStatusKind.On) as ProxyPod
      
      if (proxy) {
        invariant(proxy.runTask)
        proxy.busy()
        return proxy.runTask<R>(...parameters).finally(() => {
          proxy.idle()
          const next = this.queue.shift() ?? null
          if (next !== null) {
            next()
          }
        }).then(resolve).catch(reject)
      }
      
      this.queue.push(() => this.runTask<R>(...parameters).then(resolve).catch(reject))
    })
  }

  init (...rests: unknown[]) {
    return Promise.all(this.proxies.map(proxy => proxy.init(...rests)))
  }
}