import postcss from 'postcss'
import path from 'path'
import { invariant } from 'ts-invariant'
import { clone } from '@catalyzed/basic'
import { DeclarationTransformState, WxssDeclarationTransform, WxssSelectorTransform } from './transform'
import { isKeyframes } from './is'
import { NotFoundError } from './notfound'

export class WxssCompileState extends Array<string | number[] | WxssCompileState> {
  static create () {
    return new WxssCompileState()
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

  public xcInvalid: string | null = null

  clone () {
    const state = WxssCompileState.create()
    state.xcInvalid = this.xcInvalid

    for (const data of this) {
      state.push(clone(data, true))
    }

    return state
  }
}

export class WxssTemplateOwner {
  public templates: WxssTemplate[]

  findTemplateByPath (path: string) {
    return this.templates.find(tpl => {
      return tpl.path === path
    }) ?? null
  }
}

export class WxssTemplateRef {
  public path: string
  public index: number
  public import: {}
}

export class WxssTemplateRefed {
  public path: string
}

export class WxssTemplate {
  public path: string
  public raw: string
  public state: WxssCompileState
  public refs: WxssTemplateRef[]
  public refeds: WxssTemplateRefed[]
  public owner: WxssTemplateOwner

  import (node: postcss.Node, p: string) {
    p = p.trim()

    const matched = /^"(.+)"$|^'(.+)'$/g.exec(p)
    if (matched !== null) {
      return matched[1]
    }

    const relative = path.relative(this.path, p)
    const template = this.owner.findTemplateByPath(relative) ?? null

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
        // @TODO
        index: 0,
        path: relative
      })

      // @TODO
      template.refeds.push({
        index: 0
        path: p
      })
    } else if (template === null) {
      throw new NotFoundError(relative, this)
    }
  }
}

export enum WxssCompileContextKind {
  Root = 'root',
  ArRule = 'arrule'
}

export interface WxssCompileContext {
  kind: WxssCompileContextKind,
  name: string
}

export class WxssCompile {
  static compile (tpl: WxssTemplate) {
    const wxss = new WxssCompile()
    return wxss.compile(tpl)
  }

  compile (tpl: WxssTemplate) {
    return new Promise((resolve, reject) => {
      try {
        const state = new WxssCompileState()
        const root = postcss.parse(tpl.raw) as postcss.Root
        this.process(root, state, {
          kind: WxssCompileContextKind.Root,
          name: 'root'
        })

        tpl.state = state
      } catch (error: any) {
        reject(error)
      }
    })
  }

  process (
    node: postcss.Node, 
    state: WxssCompileState, 
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
        transform.process(rule, state)
        for (const n of rule.nodes) {
          this.process(n, state, context)
        }
        break
      }

      // => decl
      case 'decl': {
        const decl = node as postcss.Declaration
        state.push(decl.prop)
        state.push(node.raws.between ?? ': ')

        const transform = () => {
          const transformer = new WxssDeclarationTransform()
          const result: DeclarationTransformState = transformer.process(decl, state)

          if (decl.important) {
            state.push(' !important')
          } else if (node.raws.important) {
            state.push(` ${node.raws.important}`)
          }

          if (result.declaratedResponsivePixel) {
            state.push(`wxcs_style_${decl.prop}`)
            state.push(': ')
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
          const rawChildPath = util.handleImportPath(atrule.params, store.wcscjs)
          const realChildPath = util.getNormalizePath(store.template.path, rawChildPath)
          const childIdx = util.getArrIdx(store.wcscjs.templates, "path", realChildPath)

          if (childIdx === -1) {
            store.wcscjs.wcscError = {
              code: -1,
              message: `ERR: path \`${realChildPath}\` not found from \`${store.template.path}\`.`,
            };
            return;
          } else if (childIdx !== -1 && store.wcscjs.templates[childIdx].content) {
            
            store.template.children.push({
              import: {
                end: {
                  column: node.source && node.source.end && node.source.end.column || 0,
                  line: node.source && node.source.end && node.source.end.line || 0,
                },
                raws: rawChildPath,
                start: {
                  column: node.source && node.source.start && node.source.start.column || 0,
                  line: node.source && node.source.start && node.source.start.line || 0,
                },
              },
              index: childIdx,
              path: realChildPath,
            });
            store.wcscjs.templates[childIdx].parents.push({
              index: store.templateIdx,
              path: store.template.path,
            });
            if (store.preFile) {
              store.file.push(store.preFile);
            }
            store.file.push([2, childIdx]); // 先把import节点的下标放进去，后面需要修正为comm中的下标
            store.preFile = ``;
    
          }
        } else {
          state.push(`@${atrule.name} ${atrule.params}`)

          if (atrule.nodes.length > 0) {
            const context = {
              kind: WxssCompileContextKind.ArRule,
              name: atrule.name
            }
            state.push('{')
            state
            
            if (isKeyframes(atrule)) {
              context.name = 'keyframes'
            }

            for (const n of atrule.nodes) {
              this.process(n, state, context)
            }

            state.push(` ;wxcs_fileinfo: ${state.template.path} ${atrule.source?.start?.line ?? 0} ${atrule.source?.start?.column ?? 0};`)
          }

          state.push('\n')
        }
        break
      }

      default: {
        
        break
      }
    }
  }
}