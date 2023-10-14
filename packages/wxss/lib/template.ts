import postcss from 'postcss'
import path from 'path'
import { invariant } from 'ts-invariant'
import { isArray } from '@catalyzed/basic'
import { NotFoundError } from './not-found'
import { WxssCompile } from './compile'
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
  public chunks: Array<string | Array<number | string> | WxssTemplateState> = []

  /**
   * 结束
   * @param {string | number[] | undefined} chunk 
   */
  end (chunk?: string | Array<string | number>) {
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

//// => WxssTemplate
// Wxss 模板引用数据结构
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

// Wxss 模板被引用数据结构
export type WxssTemplateRefed = {
  path: string
}

// 填充样式数据类型
export enum WxssTemplateModelKind {
  Pixel = 0, // rpx to px
  Suffix = 1, // class suffix
  Assemble = 2 // artrul
}

///// => WxssTemplate
// 模版资源
export class WxssTemplate extends Wx.WxAsset {
  // => owner
  public get owner (): WxssTemplateOwner {
    return super.owner as unknown as WxssTemplateOwner
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
   * 引用绑定
   * @param {AtRule} node 
   * @returns {void}
   */
  import (node: postcss.AtRule): WxssTemplate | null {
    const matched = /^"(.+)"$|^'(.+)'$/g.exec(node.params.trim())

    if (matched !== null) {
      const relative = path.resolve(this.parsed.dir, matched[1] ?? matched[2] as string)
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
}

//// => WxssTemplateOwnerStyleManager 
// 模板样式 owner
export class WxssTemplateStyleOwner extends Map<string, WxssTemplateAssembler> {
  static BASE_DEVICE_WIDTH = 750
  static EPS = 1e-4

  // => settings
  static _SETTINGS: WxssTemplateOwnerSettings | null = null
  static get SETTINGS () {
    if (WxssTemplateStyleOwner._SETTINGS === null) {
      const settings = {
        platform: navigator.userAgent.match('iPhont') ? 'ios' : 'android',
        width: window.screen.width ?? 375,
        height: window.screen.height ?? 375,
        devicePixelRatio: window.devicePixelRatio ?? 2,
      }

      if (/^landscape/.test(window.screen.orientation.type ?? '')) {
        settings.width = settings.height
      }

      WxssTemplateStyleOwner._SETTINGS = settings
    }

    invariant(WxssTemplateStyleOwner._SETTINGS)
    return WxssTemplateStyleOwner._SETTINGS
  }

  static create (owner: WxssTemplateOwner, suffix: string) {
    return new WxssTemplateStyleOwner(owner, suffix)
  }

  // => settings
  public get settings () {
    return WxssTemplateStyleOwner.SETTINGS
  }

  public suffix: string
  public owner: WxssTemplateOwner
  
  /**
   * 
   * @param {WxssTemplateOwner} owner 
   * @param {string} suffix 
   */
  constructor (owner: WxssTemplateOwner, suffix: string = '') {
    super()

    this.owner = owner
    this.suffix = suffix
  }

  /**
   * 
   * @param {string} path 
   * @returns {WxssTemplate}
   */
  findTemplateByPath (path: string) {
    return this.owner.findTemplateByPath(path)
  }

  /**
   * 
   * @param {WxssTemplate} template 
   * @returns {WxssTemplateAssembler}
   */
  findAssemblerByTemplate (template: WxssTemplate) {
    let assembler: WxssTemplateAssembler | null = this.get(template.path) ?? null
    if (assembler === null) {
      assembler = WxssTemplateAssembler.create(
        this, 
        template,
        this.suffix,
      )

      this.set(template.path, assembler)
    }

    return assembler
  }

  /**
   * 重新计算
   * @param {number} width 
   */
  recalculate (width: number) {
    for (const [,assembler] of this) {
      assembler.recalculate(width)
    }
  }

  /**
   * 渲染样式
   * @param {WxssTemplate} template 
   */
  css (template: WxssTemplate) {
    const assembler = this.findAssemblerByTemplate(template) ?? null
    assembler.write()
  }
}

export type WxssRecalculatorHandle = (width: number) => void

//// => WxssTemplateAssembler
// 样式组装
export class WxssTemplateAssembler {
  static create (
    owner: WxssTemplateStyleOwner, 
    template: WxssTemplate,
    suffix: string = ''
  ) {
    return new WxssTemplateAssembler(
      owner, 
      template, 
      suffix
    )
  }

  // => 
  public get path () {
    return this.template.path
  }

  // => state
  public get state () {
    return this.template.state
  }
  
  // => independent
  public get independent () {
    return this.template.independent
  }

  // => style
  public _style: HTMLStyleElement | null = null
  public get style () {
    if (this._style === null) {
      const style = document.createElement('style')
      style.setAttribute('wxss-path', this.path)
      document.head.appendChild(style)

      this._style = style
    }

    return this._style
  }

  public width: number 
  public template: WxssTemplate
  public owner: WxssTemplateStyleOwner
  public suffix: string = ''
  public refs: string[] = []

  /**
   * 
   * @param {WxssTemplateStyleOwner} owner 
   * @param {WxssTemplate} template 
   */
  constructor (
    owner: WxssTemplateStyleOwner, 
    template: WxssTemplate,
    suffix: string = '',
  ) {
    this.owner = owner
    this.template = template
    this.suffix = suffix
    this.width = owner.settings.width
  }

  /**
   * 组装数据
   * @returns 
   */
  assemble () {
    const chunks = this.state.chunks

    const owner = this.owner as WxssTemplateStyleOwner
    let result: Array<string | number> = []

    for (let i = chunks.length - 1; i >= 0; i--) {
      const chunk = chunks[i]
      if (isArray(chunk as object)) {
        const current = chunk as (number | string)[]
        const kind = current[0] as number
        switch (kind) {
          case WxssTemplateModelKind.Pixel: {
            result.unshift('px')
            result.unshift(this.rpx(current[1] as number, owner.settings.width))
            break
          }

          case WxssTemplateModelKind.Suffix: {
            result.unshift(this.suffix)
            break
          }

          case WxssTemplateModelKind.Assemble: {
            if (!this.refs.includes(current[1] as string)) {
              const template = this.owner.findTemplateByPath(current[1] as string) ?? null
              
              if (template === null) {
                throw new NotFoundError(current[1] as string, template)
              }
              this.refs.push(current[1] as string)
              const assembler = this.owner.findAssemblerByTemplate(template)
              result.unshift(assembler.assemble())
            }
            break
          }
        }
      } else if (typeof chunk === 'string') {
        result.unshift(chunk)
      }
    }

    return result.join('')
  }

  recalculate (width: number) {
    this.width ??= width
    this.rewrite()
  }

  rewrite () {
    this.write()
  }

  write () {
    const css = this.assemble()
    
    if (this.style.childNodes.length === 0) {
      const text = document.createTextNode(css)
      this.style.appendChild(text)
    } else {
      this.style.childNodes[0].nodeValue = css
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
      rpx / WxssTemplateStyleOwner.BASE_DEVICE_WIDTH * width + 
      WxssTemplateStyleOwner.EPS
    )

    if (value === 0) {
      if (
        WxssTemplateStyleOwner.SETTINGS.devicePixelRatio === 1 || 
        WxssTemplateStyleOwner.SETTINGS.platform === 'ios'
      ) {
        return 1
      } else {
        return 0
      }
    }

    return value
  }
}

//// => WxssTemplateOwner
// 模板渲染配置
export interface WxssTemplateOwnerSettings {
  platform: string,
  width: number,
  height: number,
  devicePixelRatio: number
}

// 类结构
export interface MixinWxssTemplateFactory<T> extends Wx.ExtensionsFactory<T> {
  new (...rests: unknown[]): T
  create (...rests: unknown[]) : T
}

// 模板 owner
export interface WxssTemplateOwner extends Wx.WxAssetsBundleOwner {
  findTemplateByPath: (filename: string) => WxssTemplate
  process: () => void,
  css: (filename: string) => void
}

export function MixinWxssTemplate <T> (Extension: MixinWxssTemplateFactory<T>) {
  abstract class TemplateOwner extends Wx.MixinWxAssetsBundle<T>(Extension)  {
    // => templates
    public get templates () {
      return this.findByExt('.wxss')
    }

    public style: WxssTemplateStyleOwner

    /**
     * 构造函数
     * @param {unknown[]} rests 
     */
    constructor (...rests: unknown[]) {
      const suffix = rests.pop() as string
      super(...rests)

      this.style = WxssTemplateStyleOwner.create(
        this as unknown as WxssTemplateOwner, 
        suffix
      )
    }

    /**
     * 根据路径查找模板
     * @param {string} filename 
     * @returns {WxssTemplate | null} 
     */
    findTemplateByPath (filename: string): WxssTemplate {
      return this.findByFilename(filename) as unknown as WxssTemplate
    }

    /**
     * 编译 Wxss 模板
     */
    process () {
      const templates = this.templates as unknown as WxssTemplate[]
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
     * 计算样式
     * @param {string} filename 
     */
    css (filename: string) {
      const template = this.findTemplateByPath(filename) ?? null

      if (template !== null) {
        this.style.css(template as WxssTemplate)
      }
    }
  }

  return TemplateOwner
}
