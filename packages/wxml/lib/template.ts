import { invariant } from 'ts-invariant'
import * as Wx from '@catalyzed/asset'

import { Tokenizer } from './tokenizer'


export class WxmlTemplateState {
  static create () {
    return new WxmlTemplateState()
  }

  // => running
  public get running () {
    return this.tokenizer?.running ?? false
  }

  // => tokenizer
  protected _tokenizer: Tokenizer | null = null
  public get tokenizer () {
    invariant(this._tokenizer)
    return this._tokenizer
  }
  public set tokenizer (tokenizer: Tokenizer) {
    if (this._tokenizer === null) {
      const tokenizer = new Tokenizer(this.template.data as string)

      tokenizer.on('opentag', (start: number, end: number) => {
        
      })

      tokenizer.on('attributeend', () => {

      })

      this._tokenizer = tokenizer
    }
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

  public current: VNode | null = null
  public root: VRoot

  constructor () {
    this.root = new VRoot('root')
    this.current = this.root
  }

  parse () {
    this.tokenizer
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