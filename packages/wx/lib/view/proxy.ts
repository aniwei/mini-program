import debug from 'debug'
import { invariant } from 'ts-invariant'
import { NavigationProp } from '@react-navigation/native'
import { AssetsBundleJSON, PodStatusKind, WorkPort } from '@catalyzed/basic'
import { MixinWxAssetsBundle, WxAssetSet } from '@catalyzed/asset'
import { WxViewLibs } from './libs'
import { getModuleURL } from '../basic/module'

const view_debug = debug(`wx:view:proxy`)

export enum WxViewEventKind {
  GenerateFuncReady = 'custom_event_GenerateFuncReady',
  PageEvent = 'custom_event_PAGE_EVENT',
}

export enum WxViewInvocationKind {
  InsertTextArea = 'insertTextArea'
}

export type NavigationEventSubscriber = () => void

export class ProxyView extends MixinWxAssetsBundle(WxViewLibs) {
  /**
   * 启动 View 渲染层
   * @param {string} root 
   * @param {HTMLIFrameElement} iframe 
   * @returns {ProxView}
   */
  static boot (root: string, iframe: HTMLIFrameElement) {
    view_debug(`开始启动 Wx View Service`)
    const channel = new MessageChannel()
    const port1 = channel.port1
    const port2 = channel.port2

    const pod = super.create(new WorkPort(port1), root)

    const document = iframe.contentDocument as Document
    const script = document.createElement('script')
    script.type = 'module'
    /* @__PURE__ */
    script.src = (new URL('./view/boot.js', getModuleURL())).toString()
    script.onload = () => {
      invariant(iframe.contentWindow)
      iframe.contentWindow.postMessage({ type: 'connection', port: port2 }, `http://${location.host}/view.html`, [port2])
    }
    document.head.appendChild(script)
    pod.passage = window
    
    return pod as ProxyView
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
      this._navigation?.removeListener('blur', this.unactive)
      this._navigation?.removeListener('focus', this.active)
      this._navigation?.removeListener('beforeRemove', this.onRemove)

      navigation.addListener('blur', this.unactive)
      navigation.addListener('focus', this.active)
      navigation.addListener('beforeRemove', this.remove)

      if (this.set) {
        navigation.setOptions({
          title: this.set.window?.navigationBarTitleText ?? 'weixin',
          headerStyle: {
            
          }
        })
      }
  
      this._navigation = navigation
    }
  }

  // => set
  protected _set: WxAssetSet | null = null
  public get set () {
    if (this._set === null) {
      const set = this.findSetByFilename(this.path)
      this._set = set
    }

    return this._set
  }
  public set set (set: WxAssetSet | null) {
    if (this._set !== set) {
      this._set = set
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
    return this.status & PodStatusKind.Active
  }

  // => isInactive
  public get isInactive () {
    return this.status & PodStatusKind.Unactive
  }

  constructor () {
    super()

    this.once('connected', () => this.init())
    this.once('on',() => this.status |= PodStatusKind.Unactive)
  }

  active = () => {
    if (this.status & PodStatusKind.Unactive) {
      const status = this.status &~ PodStatusKind.Unactive
      this.status = status | PodStatusKind.Active
    }
  }

  unactive = () => {
    if (this.status & PodStatusKind.Inited) {
      const status = this.status &~ PodStatusKind.Active
      this.status = status | PodStatusKind.Unactive
    }
  }

  remove = () => {
    this.status = PodStatusKind.Destroy
  }

  fromAssetsBundle (assets: AssetsBundleJSON) {
    this.fromAssetsBundleJSON(assets)
    return this.mount()
  }

  async init () {    
    return super.init({
      id: this.id,
      path: this.path, 
      data: {
        ...super.toJSON()
      },
      configs: this.configs,
      settings: this.settings
    })
  }
}