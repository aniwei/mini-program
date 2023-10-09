import postcss from 'postcss'
import type { Root } from 'postcss'

class WxssTemplate {
  public path: string
  public content: string
  public xcInvalid: string
}

export class WxssCompile {
  static parse (template: WxssTemplate, index: number) {
    const compiler = new WxssCompile()
    return compiler.parse(template, index)
  }

  parse (template: WxssTemplate, index: number) {
    return new Promise((resolve, reject) => {
      let root: Root
      try {
        root = postcss.parse(template.content)
        this.process(root)
      } catch (error: any) {
        reject(new Error())
      }
    })
  }

  process (root: Root) {

  }
}