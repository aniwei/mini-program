import postcss from 'postcss'
import path from 'path'
import { invariant } from 'ts-invariant'
import { clone, isArray } from '@catalyzed/basic'
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

  public current: string = ''
  public xcInvalid: string | null = null
  public chunks: Array<string | number[] | WxssTemplateState> = []

  push (chunk?: string | number[]) {
    debugger
    if (chunk) {
      if (this.current) {
        this.chunks.push(this.current)
      }
      this.chunks.push(chunk)
    } else {
      if (this.current) {
        this.chunks.push(this.current)
      }
    }

    this.current = ''
  }

  concat (chunk: string) {
    this.current += chunk
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

  // => state
  public _state: WxssTemplateState | null = null
  public get state () {
    invariant(this._state)
    return this._state
  }
  public set state (state: WxssTemplateState) {
    if (this._state !== state) {
      this._state = state
      state.template = this
    } 
  }

  public refs: WxssTemplateRef[] = []

  constructor (...rests: unknown[]) {
    super(...rests)
    this.state = WxssTemplateState.create()
  }
  
  /**
   * 加载
   * @param {AtRule} node 
   * @returns {void}
   */
  import (node: postcss.AtRule): WxssTemplate | null {
    const matched = /^"(.+)"$|^'(.+)'$/g.exec(node.params.trim())

    if (matched !== null) {
      const relative = path.resolve(this.parsed.dir, matched[1] as string)
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
  
        return template
      } else if (template === null) {
        throw new NotFoundError(relative, this)
      }
    } else {
      throw new NotFoundError(node.params.trim(), this)
    }

    return null
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
