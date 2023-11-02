import { invariant } from 'ts-invariant'
import { TokenizedDetail, Tokenizer } from './tokenizer'

export enum TokenObjectKind {
  Node,
  Text
}

export interface TokenObjectAttr {
  0: string,
  1: string | null
}

export interface TokenObject<T extends TokenObjectKind> {
  type: T,
  attributes: TokenObjectAttr[],
  name: string | null,
  value: string | null,
  children: TokenObject<TokenObjectKind>[] | null
}

export interface Node extends TokenObject<TokenObjectKind.Node> {
  children: TokenObject<TokenObjectKind>[]
}

export interface Text extends TokenObject<TokenObjectKind.Text> { }

export const createTokenObject = <T extends TokenObjectKind> (
  type: T, 
  name: string | null = null
):  TokenObject<T> => {
  const vnode: TokenObject<T> = {
    type,
    name,
    value: null,
    attributes: [],
    children: null
  }

  return vnode
}

export const createTokenObjectAttr = () => {

}

export const createVNodeAttribute = (key: string, value: string | null = null) => {
  return [key, value]
}

export class VNodes extends Array<TokenObject<TokenObjectKind>> {
  // => root
  public get root () {
    return this[0]
  }

  // => current
  public get current () {
    return this[this.length - 1]
  }

  constructor () {
    super()

    this.push(createTokenObject(TokenObjectKind.Node, 'root'))
  }
}

export class VNodeFactory {
  static process (content: string) {
    const factory = new VNodeFactory()
    return factory.process(content)
  }

  // => root
  public get root () {
    return this.vns.root
  }

  // => current
  public get current () {
    return this.vns.current
  }

  public vns: VNodes = new VNodes()

  process (content: string) {
    const tokenizer = new Tokenizer(content)
    const vns = new VNodes()

    tokenizer.pipe(() => {
      
    })

    tokenizer.on('text', (detail: TokenizedDetail) => {
      const value = detail.value.trim()
      if (value !== '') {
        const current = vns.current
        const text = createVNode(VNodeKind.Text, null)
        text.value = value
        current.children?.push(text)
      }
    })

    tokenizer.on('opentag', (detail: TokenizedDetail) => {
      const current = vns.current as VTag
      const vnode = createVNode(VNodeKind.Tag, detail.value)
  
      current.children.push(vnode)
      vns.push(vnode) 
    })

    tokenizer.on('closetag', (detail: TokenizedDetail) => {
      const current = vns.current as VTag
  
      if (current.name !== detail.value) {
        throw new Error(``)
      }
  
      vns.pop()
    })

    tokenizer.on('attributename', (detail: TokenizedDetail) => {
      const current = vns.current as VTag
      const attribute = createVNodeAttribute(detail.value)
      current.attributes.push(attribute)
    })

    tokenizer.on('attributedata', (detail: TokenizedDetail) => {
      const current = vns.current as VTag
      const attribute = current.attributes[current.attributes.length - 1] as VNodeAttr ?? null
  
      if (attribute === null) {
        throw new Error(``)
      }
  
      attribute[1] = detail.value
    })

    tokenizer.removeAllListeners()

    return vns.root
  }
}