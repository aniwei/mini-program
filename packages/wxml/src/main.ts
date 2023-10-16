import { Tokenizer, QuoteType } from '../lib/tokenizer'


const token = new Tokenizer({}, {
  onAttributeData (start: number, endIndex: number): void { debugger },
  onAttributeEntity (codepoint: number): void { debugger },
  onAttributeEnd (quote: QuoteType, endIndex: number): void { debugger },
  onAttributeName (start: number, endIndex: number): void { debugger },
  onCloseTag (start: number, endIndex: number): void { debugger },
  onComment (start: number, endIndex: number, endOffset: number): void { debugger },
  onDeclaration (start: number, endIndex: number): void { debugger },
  onEnd (): void { debugger },
  onOpenTagEnd (endIndex: number): void { debugger },
  onOpenTagName (start: number, endIndex: number): void { debugger },
  onProcessingInstruction (start: number, endIndex: number): void { debugger },
  onSelfClosingTag (endIndex: number): void { debugger },
  onText (start: number, endIndex: number): void { debugger },
  onTextEntity (codepoint: number, endIndex: number): void { debugger },
})
token.write(
  `<view>1</view><view wx:else>2</view>`
)
debugger
token.end()