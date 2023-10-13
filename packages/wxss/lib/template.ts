import postcss from 'postcss'
import path from 'path'
import { invariant } from 'ts-invariant'
import { NotFoundError } from './not-found'
import * as Wx from '@catalyzed/asset'
import { WxssCompile } from '.'
import { isArray } from '@catalyzed/basic'

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

  /**
   * 结束
   * @param {string | number[] | undefined} chunk 
   */
  end (chunk?: string | number[]) {
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

  /**
   * 收集
   * @param {string} chunk 
   */
  concat (chunk: string) {
    this.current += chunk
  }
}

export type WxssTemplateRef = {
  path: string
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
  path: string
}

export enum WxssTemplateModelKind {
  Pixel = 0,
  Suffix = 1,
  MakeUp = 2
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

  // 是否独立打包
  public independent: boolean = false
  // 引用
  public refs: WxssTemplateRef[] = []
  // 被引用
  public refeds: WxssTemplateRefed[] = []

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
            raws: relative,
            start: {
              column: node?.source?.start?.column ?? 0,
              line: node?.source?.start?.line ?? 0,
            },
            end: {
              column: node?.source?.end?.column ?? 0,
              line: node?.source?.end?.line ?? 0,
            }
          },
          path: relative
        })

        template.refeds.push({
          path: this.path
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

  makeup () {
    const chunks = this.state.chunks
    const isString = typeof chunks === 'string'

    if (isString) {
      return ''
    }

    const owner = this.owner as WxssTemplateOwner
    let result: Array<string | number> = []

    for (const chunk of chunks) {
      if (isArray(chunk as object)) {
        const current = chunk as number[]
        const kind = current[0]
        switch (kind) {
          case WxssTemplateModelKind.Pixel: {
            result.push(owner.rpx(current[0], owner.settings.width))
            result.push('px')
            break
          }

          case WxssTemplateModelKind.Suffix: {
            break
          }

          case WxssTemplateModelKind.MakeUp: {
            result.push(this.makeup())
          }
        }
      } else if (typeof chunk === 'string') {
        result.push(chunk)
      }
    }

    return result.join('')
  }

  rewritor (
    suffix: string, 
    options?: {
      allowIllegalSelector?: boolean
    }
  ) {
    suffix = suffix || ''
    const cssText = this.makeup()
  }

  render () {
    
  }
}

//// => WxssTemplateOwner
export interface WxssTemplateOwnerSettings {
  platform: string,
  width: number,
  height: number,
  devicePixelRatio: number
}

export type RecalculationHandle = () => void

export interface WxssStyleSheets {
  [key: string]: Array<string | number[]>
}

export interface WxssTemplateOwner {
  settings: WxssTemplateOwnerSettings,
  findTemplateByPath: (filename: string) => WxssTemplate
  rpx: (value: number, width: number) => number
}

export function MixinWxssTemplate (PodContext: any): WxssTemplateOwner {
  abstract class TemplateOwner extends Wx.MixinWxAssetsBundle(PodContext)  {
    static BASE_DEVICE_WIDTH = 750
    static EPS = 1e-4

    // => settings
    static _SETTINGS: WxssTemplateOwnerSettings | null = null
    static get SETTINGS () {
      if (TemplateOwner._SETTINGS === null) {
        const settings = {
          platform: navigator.userAgent.match('iPhont') ? 'ios' : 'android',
          width: window.screen.width ?? 375,
          height: window.screen.height ?? 375,
          devicePixelRatio: window.devicePixelRatio ?? 2,
        }

        if (/^landscape/.test(window.screen.orientation.type ?? '')) {
          settings.width = settings.height
        }

        TemplateOwner._SETTINGS = settings
      }

      invariant(TemplateOwner._SETTINGS)
      return TemplateOwner._SETTINGS
    }

    // => settings
    public get settings () {
      return TemplateOwner.SETTINGS
    }

    // => templates
    public get templates () {
      return this.findByExt('.wxss')
    }

    // => sheets
    protected _sheets: WxssStyleSheets | null = null
    public get sheets () {
      if (this._sheets === null) {

      }

      return this._sheets
    }

    public recalculations: RecalculationHandle[] = []

    findTemplateByPath (filename: string) {
      return this.findByFilename(filename)
    }

    process () {
      const templates = this.templates as WxssTemplate[]
      for (const template of templates) {
        WxssCompile.compile(template as WxssTemplate)
      }

      const unvisited: WxssTemplate[] = []
      const independent: WxssTemplate[] = []

      for (const template of templates) {
        unvisited.push(template)
        if (template.refeds.length === 0) {
          independent.push(template)
        }
      }

      const dfs = (refs: WxssTemplate[], dep: WxssTemplate) => {
        // 循环引用判断
        if (refs.includes(dep)) {
          throw new ReferenceError(dep.path)
        }
  
        refs.push(dep)
        const index = unvisited.findIndex(tpl => tpl === dep)
        if (index > -1) {
          unvisited.splice(index, 1)
        }

        for (const ref of dep.refs) {
          dfs(refs, this.findTemplateByPath(ref.path) as WxssTemplate)
        }

        refs.pop()
      }

      for (const dep of independent) {
        dfs([], dep)
      }

      while (unvisited.length > 0) {
        dfs([], unvisited[0])
      }

      for (const dep of independent) {
        if (dep.path !== './app.wxss') {
          dep.independent = true
        } else {
          dep.independent = dep.data ? false : true
        }
      }
    }

    /**
     * rpx 转换
     * @param {number} rpx 
     * @param {number} width 
     * @returns {number}
     */
    rpx (
      rpx: number, 
      width: number
    ) {
      if (rpx === 0) {
        return rpx
      }

      const value = Math.floor(
        rpx / TemplateOwner.BASE_DEVICE_WIDTH * width + 
        TemplateOwner.EPS
      )

      if (value === 0) {
        if (
          TemplateOwner.SETTINGS.devicePixelRatio === 1 || 
          TemplateOwner.SETTINGS.platform === 'ios'
        ) {
          return 1
        } else {
          return 0
        }
      }

      return value
    }
  }

  return TemplateOwner as unknown as  WxssTemplateOwner
}
