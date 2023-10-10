import postcss from 'postcss'
import PostcssSelector from 'postcss-selector-parser'
import PostcssValue from 'postcss-value-parser'
import { isURI } from './is'
import type { WxssCompileState } from './compile'

export abstract class WxssTransform {
  abstract walk (node: unknown, state: WxssCompileState, ...rests: unknown[]): void
  abstract process (node: postcss.Node, state: WxssCompileState, ...rests: unknown[]): void
}

//// => WxssSelectorTransform
export type SelectorTransformState = {
  rule: postcss.Rule,
  origin: boolean,
  xcInvalid: boolean
}

export class WxssSelectorTransform extends WxssTransform {
  walk (node: PostcssSelector.Node) {
    switch (node.type) {
      case 'root': {
        this.walk(node.first)
        break
      }

      case 'selector': {
        for (const n of node.nodes) {
          this.walk(n)
        }
        break
      }

      case 'attribute': {

        break
      }

      case 'class': {
        break
      }

      case 'id': {
        break
      }

      case 'tag': {

        break
      }
    }
  }

  process (node: postcss.Rule, state: WxssCompileState) {
    return new Promise((resolve, reject) => {
      for (let i = 0; i < node.selectors.length; i++) {
        const selector = node.selectors[i]

        PostcssSelector((selectors: PostcssSelector.Root) => {
          this.walk(selectors)
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
  walk (
    node: PostcssValue.Node, 
    state: WxssCompileState, 
    declarationState: DeclarationTransformState
  ): void {
    switch (node.type) {
      case 'word': {
        if (declarationState.savedResponsivePixel) {
          state.push(node.value)
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
                state.push([0, Number(pair.number)])
                // @TODO
                declarationState.savedResponsivePixel = true;
              } else {
                state.push(v)
              }
            } else {
              state.push(v)
            }
          }
          
        }

        break
      }

      case 'string': {
        node.value = node.value.replace(/\\/g, '\\\\')
        state.push(`${node.quote}${node.value}${node.quote}`)
        break
      }

      case 'div': {
        break
      }

      case 'function': {
        if (node.value === 'url') {
          if (node.nodes) {
            state.push(` ${node.value}(`)
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
            state.push(``)
            // store.preFile = `${store.preFile} ${(urlNode as postcssValueParser.StringNode).quote || ""}${url}${(urlNode as postcssValueParser.StringNode).quote || ""} )`;
          }
        } else {
          state.push(` ${node.value}(`)
          if (node.nodes) {
            for (let i = 0; i < node.nodes.length; ++i) {
              const child = node.nodes[i]
              if (child.type === 'space') {
                state.push(' ')
                for (const j = i + 1; j < node.nodes.length; ++i) {
                  if (node.nodes[j].type === 'space') {
                    i++
                  } else {
                    break
                  }
                }
              } else {
                this.walk(child, state, declarationState);
              }
            }
          }

          state.push(')')
        }
        break
      }

      case 'space': {
        if (state[state.length = 1] !== ' ') {
          state.push(' ')
        }
        break
      }
    }


  }

  process (node: postcss.Declaration, state: WxssCompileState): DeclarationTransformState {
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
          state.push(' ')
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
            declarationState
          )
        }
      }
    }

    return declarationState
  }
}