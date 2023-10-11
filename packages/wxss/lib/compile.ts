import postcss from 'postcss'
import { 
  DeclarationTransformState, 
  WxssDeclarationTransform, 
  WxssSelectorTransform 
} from './transform'
import { isKeyframes } from './is'
import { WxssTemplate, WxssTemplateState } from './template'

//// => WxssCompile
export enum WxssCompileContextKind {
  Root = 'root',
  ArRule = 'arrule'
}

export interface WxssCompileContext {
  kind: WxssCompileContextKind,
  name: string
}

export class WxssCompile {
  /**
   * wxss 文件编译
   * @param {WxssTemplate} tpl 
   * @returns {Promise<void>}
   */
  static compile (tpl: WxssTemplate) {
    const wxss = new WxssCompile()
    return wxss.compile(tpl)
  }

  compile (tpl: WxssTemplate) {
    return new Promise((resolve, reject) => {
      try {
        
        const root = postcss.parse(tpl.raws as string) as postcss.Root
        this.process(root, tpl.state, {
          kind: WxssCompileContextKind.Root,
          name: 'root'
        })
      } catch (error: any) {
        reject(error)
      }
    })
  }

  process (
    node: postcss.Node, 
    state: WxssTemplateState, 
    context: WxssCompileContext
  ) {
    
    switch (node.type) {
      // => root
      case 'root': {
        const root = node as postcss.Root
        if (root.nodes && root.nodes.length) {
          for (const childNode of root.nodes) {
            this.process(childNode, state, context)
          }
        }
        break
      }

      // => rule
      case 'rule': {
        const rule = node as postcss.Rule
        const transform = new WxssSelectorTransform()
        transform.process(rule, state, context)
        for (const n of rule.nodes) {
          this.process(n, state, context)
        }
        break
      }

      // => decl
      case 'decl': {
        const decl = node as postcss.Declaration
        state.add(decl.prop)
        state.add(node.raws.between ?? ': ')

        const transform = () => {
          const transformer = new WxssDeclarationTransform()
          const result: DeclarationTransformState = transformer.process(decl, state, context)

          if (decl.important) {
            state.add(' !important')
          } else if (node.raws.important) {
            state.add(` ${node.raws.important}`)
          }

          if (result.declaratedResponsivePixel) {
            state.add(`wxcs_style_${decl.prop}`)
            state.add(': ')
            result.savedResponsivePixel = true
            transform()
          }
        }

        transform()
        break
      }

      case 'atrule': {
        const atrule = node as postcss.AtRule
        if (atrule.name === 'import') {
          const index = state.template.import(atrule)
          if (state.hasContent) {
            state.add(state.clone())
          }
          
          // state.add([2, index])
          // state.
          state.clear()
        } else {
          state.add(`@${atrule.name} ${atrule.params}`)

          if (atrule.nodes.length > 0) {
            const context = {
              kind: WxssCompileContextKind.ArRule,
              name: atrule.name
            }
            state.add('{')
            state
            
            if (isKeyframes(atrule)) {
              context.name = 'keyframes'
            }

            for (const n of atrule.nodes) {
              this.process(n, state, context)
            }

            const line = atrule.source?.start?.line ?? 0
            const column = atrule.source?.start?.column ?? 0

            state.add(` ;wxcs_fileinfo: ${state.template.path} ${line} ${column};`)
          }

          state.add('\n')
        }
        break
      }

      default: {
        
        break
      }
    }
  }
}