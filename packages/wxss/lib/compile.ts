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

  /**
   * 
   * @param {WxssTemplate} tpl 
   * @returns 
   */
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

  /**
   * 处理过程
   * @param {postcss.Node} node 
   * @param {WxssTemplateState} state 
   * @param {WxssCompileContext} context 
   */
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

          if (state.current) {
            state.end()
          }
        }
        break
      }

      // => rule
      case 'rule': {
        const rule = node as postcss.Rule
        WxssSelectorTransform.process(rule, state, context)
        state.concat('{')
        for (const n of rule.nodes) {
          this.process(n, state, context)
        }
        state.concat('}')
        break
      }

      // => decl
      case 'decl': {
        const decl = node as postcss.Declaration
        state.concat(decl.prop)
        state.concat(node.raws.between ?? ': ')

        WxssDeclarationTransform.process(decl, state, context)

        if (decl.important) {
          state.concat(' !important')
        } else if (node.raws.important) {
          state.concat(` ${node.raws.important}`)
        }
        
        state.concat(';')
        
        break
      }

      case 'atrule': {
        const atrule = node as postcss.AtRule
        // => import
        if (atrule.name === 'import') {
          const template = state.template.import(atrule) as WxssTemplate
          if (template.data) {
            state.end([2, 1])
          }          
        } else {
          state.concat(`@${atrule.name} ${atrule.params}`)

          if (atrule.nodes.length > 0) {
            const context = {
              kind: WxssCompileContextKind.ArRule,
              name: atrule.name
            }

            state.concat('{')
            
            if (isKeyframes(atrule)) {
              context.name = 'keyframes'
            }

            for (const n of atrule.nodes) {
              this.process(n, state, context)
            }

            // @TODO
            // const line = atrule.source?.start?.line ?? 0
            // const column = atrule.source?.start?.column ?? 0
            // state.concat(` ;wxcs_fileinfo: ${state.template.path} ${line} ${column};`)
          }

          state.concat('}')
        }
        break
      }

      default: {
        
        break
      }
    }
  }
}