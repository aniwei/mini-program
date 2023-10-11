import postcss from 'postcss'
import path from 'path'
import { invariant } from 'ts-invariant'
import { clone } from '@catalyzed/basic'
import { NotFoundError } from './not-found'
import * as Wx from '@catalyzed/asset'

//// => WxssTemplateState
// Wxss 文件编译状态
export class WxssTemplateState {
  static create () {
    return new WxssTemplateState()
  }

  // => template
  public _template: WxssTemplate | null = null
  public get template () {
    invariant(this._template)
    return this._template
  }
  public set template (template: WxssTemplate) {
    if (this._template !== template) {
      this._template = template
    }
  }

  // => size
  public get size () {
    return this.chunks.length
  }

  // => hasContent
  public get hasContent () {
    return this.chunks.length > 0
  }

  public xcInvalid: string | null = null
  public chunks: Array<string | number[] | WxssTemplateState> = []

  add (chunk: string | number[] | WxssTemplateState) {
    this.chunks.push(chunk)
  }

  clear () {
    this.chunks = []
    this.xcInvalid = null
  }

  clone () {
    const state = WxssTemplateState.create()
    state.xcInvalid = this.xcInvalid

    for (const data of this.chunks) {
      state.add(clone(data, true))
    }

    return state
  }
}

export type WxssTemplateRef = {
  path: string
  index: number
  import: {
    start: {
      column: number,
      line: number
    }
    end: {
      column: number,
      line: number
    },
    raws: string,
  }
}

export type WxssTemplateRefed = {
  path: string,
  index: number
}

export class WxssTemplate extends Wx.WxAsset {
  // => owner
  public get owner (): WxssTemplateOwner {
    return super.owner as WxssTemplateOwner
  }
  public set owner (owner: WxssTemplateOwner) {
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

  public refs: WxssTemplateRef[] = []
  public state: WxssTemplateState = WxssTemplateState.create()

  
  /**
   * 加载
   * @param {AtRule} node 
   * @returns {void}
   */
  import (node: postcss.AtRule) {
    const p = node.params.trim()

    const matched = /^"(.+)"$|^'(.+)'$/g.exec(p)
    if (matched !== null) {
      return matched[1]
    }

    const relative = path.relative(this.relative, p)
    const template = this.owner?.findTemplateByPath(relative) ?? null

    if (template !== null) {
      this.refs.push({
        import: {
          end: {
            column: node?.source?.end?.column ?? 0,
            line: node?.source?.end?.line ?? 0,
          },
          raws: relative,
          start: {
            column: node?.source?.start?.column ?? 0,
            line: node?.source?.start?.line ?? 0,
          },
        },
        index: 0,
        path: relative
      })

    } else if (template === null) {
      throw new NotFoundError(relative, this)
    }
  }
}

export interface WxssTemplateOwner {
  findTemplateByPath: (filename: string) => WxssTemplate
}

export function MixinWxssTemplate (PodContext: any): WxssTemplateOwner {
  abstract class TemplateOwner extends Wx.MixinWxAssetsBundle(PodContext)  {
    findTemplateByPath (filename: string) {
      return this.findByFilename(filename)
    }
  }

  return TemplateOwner as unknown as  WxssTemplateOwner
}
