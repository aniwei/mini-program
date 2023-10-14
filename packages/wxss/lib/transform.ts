import postcss from 'postcss'
import PostcssSelector from 'postcss-selector-parser'
import PostcssValue from 'postcss-value-parser'
import { isURI } from './is'
import { WxssCompileContextKind } from './compile'
import type { WxssCompileContext } from './compile'
import type { WxssTemplateState } from './template'

export abstract class WxssTransform {
  static process (...rests: unknown[]) {
    const Factory = this as unknown as { new (...rests: unknown[]): WxssTransform }
    const transform = new Factory(...rests)
    transform.process(...rests)
    return process
  }

  constructor (...rests: unknown[]) { }

  abstract walk (node: unknown, state: WxssTemplateState, ...rests: unknown[]): void
  
  abstract process (...rests: unknown[]): void
  abstract process (node: postcss.Node, state: WxssTemplateState, ...rests: unknown[]): void
}

//// => WxssSelectorTransform
export type SelectorTransformState = {
  rule: postcss.Rule,
  origin: boolean,
  xcInvalid: string | null
}


export class WxssSelectorTransform extends WxssTransform {
  /**
   * 
   * @param {PostcssSelector.Node} node 
   * @param {WxssTemplateState} state 
   * @param {SelectorTransformState} selectorState 
   * @param {WxssCompileContext} context 
   */
  walk (
    node: PostcssSelector.Node, 
    state: WxssTemplateState, 
    selectorState: SelectorTransformState,
    context: WxssCompileContext
  ) {
    switch (node.type) {
      case 'root': {
        this.walk(node.first, state, selectorState, context)
        break
      }

      case 'selector': {
        for (const n of node.nodes) {
          this.walk(n, state, selectorState, context)
        }
        break
      }

      case 'attribute': {
        state.concat(`[${node.attribute ?? ''}${node.operator ?? ''}${node.raws.value ?? ''}]`)
        break
      }

      case 'class': {
        const prev = node.prev() ?? null
        if (
          (node === node.parent?.first) || 
          prev?.type === 'combinator' && prev?.value === ' ' || 
          prev?.type === 'tag'
        ) {
          state.concat('.')
          state.end([1])
          state.concat(node.value)          
        } else {
          state.concat(`.${node.value}`)
        }
        break
      }

      case 'id': {
        state.concat(`#${node.value}`)
        if (!selectorState.xcInvalid) {
          const line = selectorState.rule?.source?.start?.line ?? 0
          let column = selectorState.rule?.source?.start?.column ?? 0
          column = selectorState.rule.selector.indexOf(node.value || '') - 1 + column
          console.warn(`Some selectors are not allowed in component wxss, including tag name selectors, ID selectors, and attribute selectors.(${state.template.path}: ${line},${column})`)
        }
        break
      }

      case 'tag': {
        if (node.parent?.parent?.type === 'pseudo') {
          state.concat(node.value)
        } else {
          if (
            context.kind !== WxssCompileContextKind.ArRule || 
            context.kind === WxssCompileContextKind.ArRule && context.name === 'media'
          ) {
            if (node.value.toLowerCase() === 'page') {
              state.concat('body')
            } else {
              if (!/^wx\-/g.test(node.value)) {
                state.concat(`wx-${node.value}`)
              } else {
                state.concat(node.value)
              }
            }
          } else {
            state.concat(node.value)
          }
        }
        break
      }

      case 'pseudo': {
        state.concat(node.value)
        
        if (node.first || node.last || node.nodes.length > 0) {
          state.concat('(')
        }

        for (const n of node.nodes) {
          WxssSelectorTransform.process(n, state, selectorState)
        }

        if (node.first || node.last || node.nodes.length > 0) {
          state.concat(')')
        }
        break
      }

      case 'universal': {
        state.concat(node.value)
        break
      }

      case 'combinator': {
        state.concat(node.value)
        break
      }
    }
  }

  /**
   * 
   * @param {postcss.Rule} node 
   * @param {WxssTemplateState} state 
   * @param {WxssCompileContext} context 
   * @returns {Promise}
   */
  process (
    node: postcss.Rule, 
    state: WxssTemplateState, 
    context: WxssCompileContext
  ) {
    for (let i = 0; i < node.selectors.length; i++) {
      const selector = node.selectors[i]

      PostcssSelector((selectors: PostcssSelector.Root) => {
        this.walk(selectors, state, {
          rule: node,
          origin: false,
          xcInvalid: null
        }, context)
      }).processSync(selector)

      if (i < node.selectors.length - 1) {
        state.concat(', ')
      }
    }
  }
}


//// => WxssDeclarationTransform
export type DeclarationTransformState = {
  declaration: postcss.Declaration,
  declaratedResponsivePixel: boolean,
  savedResponsivePixel: boolean
}

export class WxssDeclarationTransform extends WxssTransform {
  /**
   * 
   * @param {PostcssValue.Node} node 
   * @param {WxssTemplateState} state 
   * @param {DeclarationTransformState} declarationState 
   * @param {WxssCompileContext} context 
   */
  walk (
    node: PostcssValue.Node, 
    state: WxssTemplateState, 
    declarationState: DeclarationTransformState,
    context: WxssCompileContext
  ): void {
    switch (node.type) {
      case 'word': {
        if (declarationState.savedResponsivePixel) {
          state.concat(node.value)
        } else {
          const values = node.value.split('-')
          for (let i = 0; i < values.length; i++) {
            let v = values[i]
            if (values.length > 1 && i > 0) {
              v = `-${v}`
            }
            const pair = PostcssValue.unit(v) as PostcssValue.Dimension ?? null
            if (pair !== null) {
              const unit = pair.unit
              if (unit === 'rpx') {
                state.end([0, Number(pair.number)])
                declarationState.savedResponsivePixel = true
              } else {
                state.concat(v)
              }
            } else {
              state.concat(v)
            }
          }
          
        }

        break
      }

      case 'string': {
        node.value = node.value.replace(/\\/g, '\\\\')
        state.concat(`${node.quote}${node.value}${node.quote}`)
        break
      }

      case 'div': {
        state.concat(node.value)
        break
      }

      case 'function': {
        if (node.value === 'url') {
          if (node.nodes.length > 0) {
            state.concat(` ${node.value}(`)
            const url = node.nodes[0] as PostcssValue.Node
            let value = url.value

            if (!isURI(value) && !declarationState.savedResponsivePixel) {
              const between = declarationState.declaration.raws.between
              const path = state.template.path
              let line: number = 0
              let column: number = 0

              if (
                declarationState.declaration.source && 
                declarationState.declaration.source.start
              ) {
                line = declarationState.declaration.source.start.line
                column = declarationState.declaration.source.start.column
              }

              column = column + declarationState.declaration.prop.length

              if (between) {
                for (let i = 0; i < between.length; ++i) {
                  if (between[i] !== ' ') {
                    column += i + 1
                    break
                  }
                }
              }

              console.warn(`Do not use local path (${path}: ${line}, ${column}).`)
            }

            const quote = (url as PostcssValue.StringNode).quote
            state.concat(` ${quote}${value}${quote}`)
          }
        } else {
          state.concat(` ${node.value}(`)
          if (node.nodes.length > 0) {
            for (let i = 0; i < node.nodes.length; ++i) {
              const child = node.nodes[i]

              if (child.type === 'space') {
                state.concat(' ')
                for (const j = i + 1; j < node.nodes.length; ++i) {
                  if (node.nodes[j].type === 'space') {
                    i++
                  } else {
                    break
                  }
                }
              } else {
                this.walk(child, state, declarationState, context)
              }
            }
          }

          state.concat(')')
        }
        break
      }

      case 'space': {
        if (!state.current.endsWith(' ')) {
          state.concat(' ')
        }
        break
      }
    }
  }

  /**
   * 
   * @param {postcss.Declaration} node 
   * @param {WxssTemplateState} state 
   * @returns {void}
   */
  process (
    node: postcss.Declaration, 
    state: WxssTemplateState,
    context: WxssCompileContext
  ): DeclarationTransformState {
    const root: PostcssValue.ParsedValue = PostcssValue(node.value)
    const declarationState: DeclarationTransformState = {
      declaratedResponsivePixel: false,
      savedResponsivePixel: false,
      declaration: node
    }

    if (root.nodes) {
      for (let i = 0; i < root.nodes.length; ++i) {
        const child = root.nodes[i]

        if (child.type === 'space') {
          state.concat(' ')
          for (const j = i + 1; j < root.nodes.length; ++i) {
            if (root.nodes[j].type === 'space') {
              i++
            } else {
              break
            }
          }
        } else {
          this.walk(
            child, 
            state, 
            declarationState,
            context
          )
        }
      }
    }

    return declarationState
  }
}