import postcss from 'postcss'
import PostcssSelector from 'postcss-selector-parser'
import PostcssValue from 'postcss-value-parser'
import { isURI } from './is'
import type { WxssTemplateState } from './template'
import { WxssCompileContextKind, type WxssCompileContext } from './compile'

export abstract class WxssTransform {
  abstract walk (node: unknown, state: WxssTemplateState, ...rests: unknown[]): void
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
        state.add(`[${node.attribute ?? ''}${node.operator ?? ''}${node.raws.value ?? ''}]`)
        break
      }

      case 'class': {
        const prev = node.prev() ?? null
        if (
          (node === node.parent?.first) || 
          (
            prev?.type === 'combinator' && 
            prev?.value === ' '
          ) || 
          (prev?.type === 'tag')
        ) {
           // @TODO
          state.add('.')
          state.add([1])
          state.add(node.value)
          
          selectorState.origin = true
        } else {
          state.add(`.${node.value}`)
        }
        break
      }

      case 'id': {
        state.add(`#${node.value}`)
        if (!selectorState.xcInvalid) {
          const line = selectorState.rule?.source?.start?.line ?? 0
          let column = selectorState.rule?.source?.start?.column ?? 0
          column = selectorState.rule.selector.indexOf(node.value || '') - 1 + column
          state.xcInvalid = `Some selectors are not allowed in component wxss, including tag name selectors, ID selectors, and attribute selectors.(${state.template.path}:${line}:${column})`
        }
        break
      }

      case 'tag': {
        if (node.parent?.parent?.type === 'pseudo') {
          state.add(node.value)
        } else {
          if (
            context.kind !== WxssCompileContextKind.ArRule || 
            (
              context.kind === WxssCompileContextKind.ArRule && 
              context.name === 'media'
            )
          ) {
            if (node.value.toLowerCase() === 'page') {
              state.add('body')
              selectorState.origin = true
            } else {
              if (/^wx\-/g.test(node.value)) {
                state.add(`wx-${node.value}`)
                selectorState.origin = true
              } else {
                state.add(node.value)
              }
            }
          } else {
            state.add(node.value)
          }
        }
        break
      }

      case 'pseudo': {
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
    return new Promise((resolve, reject) => {
      for (let i = 0; i < node.selectors.length; i++) {
        const selector = node.selectors[i]

        PostcssSelector((selectors: PostcssSelector.Root) => {
          // @ts-ignore
          this.walk(selectors, state, {}, context)
        }).process(selector)
      }
    })
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
          state.add(node.value)
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
                state.add([0, Number(pair.number)])
                // @TODO
                declarationState.savedResponsivePixel = true
              } else {
                state.add(v)
              }
            } else {
              state.add(v)
            }
          }
          
        }

        break
      }

      case 'string': {
        node.value = node.value.replace(/\\/g, '\\\\')
        state.add(`${node.quote}${node.value}${node.quote}`)
        break
      }

      case 'div': {
        state.add(node.value)
        break
      }

      case 'function': {
        if (node.value === 'url') {
          if (node.nodes) {
            state.add(` ${node.value}(`)
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

              value = `${url}-do-not-use-local-path-${path}&${line}&${column}`
            }

            // @TODO
            state.add(``)
            // store.preFile = `${store.preFile} ${(urlNode as postcssValueParser.StringNode).quote || ""}${url}${(urlNode as postcssValueParser.StringNode).quote || ""} )`;
          }
        } else {
          state.add(` ${node.value}(`)
          if (node.nodes) {
            for (let i = 0; i < node.nodes.length; ++i) {
              const child = node.nodes[i]
              if (child.type === 'space') {
                state.add(' ')
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

          state.add(')')
        }
        break
      }

      case 'space': {
        if (state[state.size - 1] !== ' ') {
          state.add(' ')
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
          state.add(' ')
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