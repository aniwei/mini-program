import postcss from 'postcss'
import PostcssSelector from 'postcss-selector-parser'
import PostcssValue, { ParsedValue } from 'postcss-value-parser'
import { Node, Root, Declaration, Rule, Result } from 'postcss'

//// => WxssTransformer
export class WxssTransformer {
  static create () {
    return new WxssTransformer()
  }
   /**
   * 
   * @param selectors 
   */
   selector (selectors: PostcssSelector.Root) {
    selectors.walkClasses((selector: PostcssSelector.Node) => {
      selector.replaceWith(PostcssSelector.className({
        value: `\x25\x25HERESUFFIX\x25\x25${selector.value}`
      }))
    })
  
    selectors.walkTags((tag: PostcssSelector.Node) => {
      tag.value = 'wx-' + tag.value
    })
  }

  /**
   * 
   * @param node 
   */
  word (node: PostcssValue.Node) {
    const pair = PostcssValue.unit(node.value)
    if (pair) {
      const num = Number(pair.number)
      const unit = pair.unit.toLowerCase()
      if (unit === 'rpx') {
        node.value = `\x25\x25?${num + unit}?\x25\x25`
      }
    }
  }

  /**
   * 
   * @param value 
   * @returns 
   */
  value (value: string): string {
    const parsed: ParsedValue = PostcssValue(value)
    parsed.walk((node) => {
      switch (node.type) {
        case 'word':
          this.word(node)
          break

        case 'function':
          if (node.value !== 'url') {
            PostcssValue.walk(node.nodes, (node: PostcssValue.Node) => {
              if (node.type === 'word') {
                this.word(node)
              }
            })
          }
      }
    })

    return parsed.toString()
  }
}


//// => WxssProcess

export class WxssProcess {
  static PLUGIN = () => WxssProcess.transform

  static transform (root: Root) {
    const wxss = new WxssProcess()
    wxss.transform(root)
  }

  static process (content: string) {    
    return Promise.resolve(postcss([WxssProcess.PLUGIN()]).process(content)).then(result => {

    })
  }

  transform (root: Root) {
    const transformer = WxssTransformer.create()

    root.walk((node: Node) => {
      switch (node.type) {
        case 'rule': {

          const rule = node as Rule
          if (rule.parent?.first !== node) {
            rule.raws.before = '\n'
          }

          rule.raws.after = ' '
          const selectors = rule.selectors as string[]
          rule.selectors = selectors.map((selector) => PostcssSelector(transformer.selector).processSync(selector))
          break
        }
        case 'decl': {
          const declaration = node as Declaration 
          declaration.raws.before = ' '
          declaration.raws.between = ': '
          declaration.value = transformer.value(declaration.value)
          break
        }

        case 'comment':
          node.remove()
          break

        case 'atrule': 
          break
      }
    })
  }
}

