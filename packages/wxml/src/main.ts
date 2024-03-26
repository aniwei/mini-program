import * as Token from '../lib/token'
import { VNodeManager } from '../lib/vnode'

const string = `<view wx:else name="1111">123123</view><view wx:else>2</view>`

// const t = new Token.Tokenizer({}, {
//   onAttributeData () {},
//   onAttributeEntity () {},
//   onAttributeEnd () {},
//   onAttributeName () {},
//   onCloseTag () {},
//   onComment () {},
//   onDeclaration () {},
//   onEnd () {},
//   onOpenTagEnd () {},
//   onOpenTagName () {},
//   onProcessingInstruction () {},
//   onSelfClosingTag () {},
//   onText () {},
//   onTextEntity () {},
// })
// t.write(string)

const token = new VNodeManager(string)
token.parse()
debugger
