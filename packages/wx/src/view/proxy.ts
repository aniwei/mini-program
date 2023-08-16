import debug from 'debug'
import invariant from 'ts-invariant'
import { NavigationProp } from '@react-navigation/native'
import { AssetsBundleJSON, PodStatus, WorkPort } from '@catalyze/basic'
import { MixinWxAssetsBundle } from '@catalyze/wx-asset'
import { WxContext } from '../context'

const view_debug = debug(`wx:view:delegate`)

export enum WxViewEvents {
  GenerateFuncReady = 'custom_event_GenerateFuncReady',
  PageEvent = 'custom_event_PAGE_EVENT',
}

export type NavigationEventSubscriber = () => void

export class ProxyView extends MixinWxAssetsBundle(WxContext) {
  static boot (root: string, iframe: HTMLIFrameElement) {
    view_debug(`开始启动 Wx View Service`)
    const channel = new MessageChannel()
    const port1 = channel.port1
    const port2 = channel.port2

    const pod = super.create(root, new WorkPort(port1))

    const document = iframe.contentDocument as Document
    const script = document.createElement('script')
    script.type = 'module'
    // @ts-ignore
    script.src = (new URL('./boot', import.meta.url)).toString()
    script.onload = () => {
      invariant(iframe.contentWindow)
      iframe.contentWindow.postMessage({ type: 'connection', port: port2 }, `http://${location.host}/view.html`, [port2])
    }
    document.head.appendChild(script)
    pod.passage = window
    
    return pod
  }

  // => navigation
  protected _navigation: NavigationProp<{}> | null = null
  public get navigation () {
    invariant(this._navigation !== null, `The member "navigation" cannot be null.`)
    return this._navigation
  }
  public set navigation (navigation: NavigationProp<{}>) {
    invariant(navigation !== null, `The argument "navigation" cannot be null.`)

    if (navigation !== this._navigation) {
      this._navigation?.removeListener('blur', this.busy.bind(this))
      this._navigation?.removeListener('focus', this.idle.bind(this))
      this._navigation?.removeListener('beforeRemove', this.onRemove)

      navigation.addListener('blur', this.busy)
      navigation.addListener('focus', this.idle)
      navigation.addListener('beforeRemove', this.onRemove)
  
      this._navigation = navigation
    }

  }

  // => id
  protected _id: number | null = null
  public get id () {
    invariant(this._id !== null)
    return this._id
  }
  public set id (id: number) {
    this._id = id
  }

  // => path
  protected _path: string | null = null
  public get path () {
    invariant(this._path !== null)
    return  this._path
  }
  public set path (path: string) {
    this._path = path
  }

  // => isActive 
  public get isActive () {
    return this.status & PodStatus.On
  }

  // => isInactive
  public get isInactive () {
    return this.status & PodStatus.Off
  }

  constructor () {
    super()

    this.once('connected', () => this.init())
  }

  onRemove = () => {
    this.status = PodStatus.Destroy
  }

  invokeHandler (name: string, data: string, id: number): void {
    view_debug('View 层调用 Native 方法 <name: %s, data: %s, callbackId: %s>', name, data, id) 
  }

  publishHandler (name: string, data: string, viewIds: string): void {
    view_debug('发布消息 <name: %s, data: %s, viewIds: %s>', name, data, viewIds)
    super.publishHandler(name, data, viewIds)
  }

  fromAssetsBundleAndSettings (assets: AssetsBundleJSON) {
    this.fromAssetsBundleJSON(assets)
    return this.mount()
  }

  async init () {    
    return super.init({
      id: this.id,
      path: this.path, 
      configs: this.configs,
      settings: this.settings
    })
  }
}