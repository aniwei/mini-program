import { invariant } from 'ts-invariant'
import * as Wx from '@catalyzed/asset'
import { VNodeFactory, VNodeKind, VRoot, VTag, VText } from './vnode'


export class WxmlTemplateState {
  static create () {
    return new WxmlTemplateState()
  }

  // => template
  public _template: WxmlTemplate | null = null
  public get template () {
    invariant(this._template)
    return this._template
  }
  public set template (template: WxmlTemplate) {
    if (this._template !== template) {
      this._template = template
    }
  }

  public _root: VRoot | null = null
  public get root () {
    invariant(this._root)
    return this._root
  }
  public set root (root: VRoot) {
    this.root = root
  }

  process () {
    const root = VNodeFactory.process(this.template.data as string) as VRoot
    this.optimize(root, null, root)
  }

  optimize (
    root: VRoot, 
    parent: VTag | null, current: VTag | VRoot | VText
  ) {
    switch (current.type) {
      case VNodeKind.Root: {
        // Ignore
        break
      }

      case VNodeKind.Tag: {
        break
      }

      case VNodeKind.Text: {
        break
      }
    }
  }
}

export class WxmlTemplate extends Wx.WxAsset {
  // => owner
  public get owner () {
    return super.owner as unknown as WxmlTemplateOwner
  }

  public set owner (owner: WxmlTemplateOwner) {
    super.owner = owner
  }

  // => path
  public get path () {
    return this.relative
  }

  // => raws
  public get raws () {
    return this.data
  }

   // => state
   public _state: WxmlTemplateState | null = null
   public get state () {
     invariant(this._state)
     return this._state
   }
   public set state (state: WxmlTemplateState) {
     if (this._state !== state) {
       this._state = state
       state.template = this
     } 
   }

}

export class WxmlTemplateTokenizer {
  // TODO
  static create (
    owner: unknown,
    template: WxmlTemplate
  ) {
    return new WxmlTemplateTokenizer(owner, template)
  }

  // => 
  public get path () {
    return this.template.path
  }

  // => state
  public get state () {
    return this.template.state
  }
  
  public template: WxmlTemplate
  public owner: unknown

  constructor (owner: unknown, template: WxmlTemplate) {
    this.owner = owner
    this.template = template
  }
}

// 模板 owner
export interface WxmlTemplateOwner extends Wx.WxAssetsBundleOwner {
  findTemplateByPath: (filename: string) => WxmlTemplate
  process: () => void,
}