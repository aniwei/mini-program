import { TokenizedDetail, Tokenizer } from './tokenizer'

export enum VNodeKind {
  Root,
  Tag,
  Text
}

export interface VNodeAttr {
  key: string,
  value?: string
}

export interface VNode<T extends VNodeKind> {
  type: T,
  attributes: VNodeAttr[],
  name: string | null,
  value: string | null,
  children: VNode<VNodeKind>[] | null
}

export interface VTag extends VNode<VNodeKind.Tag> {
  children: VNode<VNodeKind>[]
}

export interface VRoot extends VNode<VNodeKind.Root> {
  children: VNode<VNodeKind>[]
}

export const createVNode = <T extends VNodeKind> (type: T, name: string, isContainer: boolean = true):  VNode<T> => {
  const vnode: VNode<T> = {
    type,
    name: null,
    value: null,
    attributes: [],
    children: null
  }

  if (isContainer) {
    (vnode as VRoot).children = []
  }

  return vnode
}

export const createVNodeAttribute = (key: string, value?: string) => {
  return {
    key,
    value
  }
}

export class VNodeManager extends Tokenizer {
  // => root
  public get root () {
    return this.vnodes[0]
  }

  // => current
  public get current () {
    return this.vnodes[this.vnodes.length - 1]
  }

  public vnodes: VNode<VNodeKind>[] = []

  constructor (content: string) {
    super(content)

    const root = createVNode(VNodeKind.Root, 'root')
    this.vnodes.push(root)

    this.on('opentag', this.handleOpenTag)
    this.on('closetag', this.handleCloseTag)
    this.on('attributename', this.handleAttributeName)
    this.on('attributedata', this.handleAttributeData)
  }

  handleOpenTag = (detail: TokenizedDetail) => {
    const current = this.current as VTag
    const vnode = createVNode(VNodeKind.Tag, detail.value)

    current.children.push(vnode)
    this.vnodes.push(vnode) 
  }

  handleCloseTag = (detail: TokenizedDetail) => {
    const current = this.current as VTag

    if (current.name !== detail.value) {
      throw new Error(``)
    }

	  this.vnodes.pop()
  }

  handleAttributeName = (detail: TokenizedDetail) => {
    const current = this.current as VTag
    const attribute = createVNodeAttribute(detail.value)

    current.attributes.push(attribute)
  }

  handleAttributeData = (detail: TokenizedDetail) => {
    const current = this.current as VTag
    const attribute = current.attributes[current.attributes.length - 1] as VNodeAttr ?? null

    if (attribute === null) {
      throw new Error(``)
    }

    attribute.value = detail.value
  }
}