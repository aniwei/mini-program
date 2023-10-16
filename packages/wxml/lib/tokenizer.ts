import { EventEmitter } from '@catalyzed/basic'
import { isASCIIAlpha, isEndOfTagSection, isWhitespace } from './is'

export const enum CharCodes {
  Tab = 0x9, // "\t"
  NewLine = 0xa, // "\n"
  FormFeed = 0xc, // "\f"
  CarriageReturn = 0xd, // "\r"
  Space = 0x20, // " "
  ExclamationMark = 0x21, // "!"
  Number = 0x23, // "#"
  Amp = 0x26, // "&"
  SingleQuote = 0x27, // "'"
  DoubleQuote = 0x22, // '"'
  Dash = 0x2d, // "-"
  Slash = 0x2f, // "/"
  Zero = 0x30, // "0"
  Nine = 0x39, // "9"
  Semi = 0x3b, // ""
  Lt = 0x3c, // "<"
  Eq = 0x3d, // "="
  Gt = 0x3e, // ">"
  Questionmark = 0x3f, // "?"
  UpperA = 0x41, // "A"
  LowerA = 0x61, // "a"
  UpperF = 0x46, // "F"
  LowerF = 0x66, // "f"
  UpperZ = 0x5a, // "Z"
  LowerZ = 0x7a, // "z"
  LowerX = 0x78, // "x"
  OpeningSquareBracket = 0x5b, // "["
}

export const Sequences = {
  Cdata: new Uint8Array([0x43, 0x44, 0x41, 0x54, 0x41, 0x5b]), // CDATA[
  CdataEnd: new Uint8Array([0x5d, 0x5d, 0x3e]), // ]]>
  CommentEnd: new Uint8Array([0x2d, 0x2d, 0x3e]), // `-->`
  ScriptEnd: new Uint8Array([0x3c, 0x2f, 0x73, 0x63, 0x72, 0x69, 0x70, 0x74]), // `</script`
  StyleEnd: new Uint8Array([0x3c, 0x2f, 0x73, 0x74, 0x79, 0x6c, 0x65]), // `</style`
  TitleEnd: new Uint8Array([0x3c, 0x2f, 0x74, 0x69, 0x74, 0x6c, 0x65]), // `</title`
}

export const enum QuoteType {
  NoValue = 0,
  Unquoted = 1,
  Single = 2,
  Double = 3,
}

export const enum TokenizerState {
  Text = 1,
  BeforeTagName, // After <
  InTagName,
  InSelfClosingTag,
  BeforeClosingTagName,
  InClosingTagName,
  AfterClosingTagName,

  // Attributes
  BeforeAttributeName,
  InAttributeName,
  AfterAttributeName,
  BeforeAttributeValue,
  InAttributeValueDoubleQuote, // "
  InAttributeValueSingleQuote, // '
  InAttributeValueNoQuote,

  // Declarations
  BeforeDeclaration, // !
  InDeclaration,

  // Processing instructions
  InProcessingInstruction, // ?

  // Comments & CDATA
  BeforeComment,
  InSpecialComment,
  InCommentLike,

  // Special tags
  BeforeSpecialS, // Decide if we deal with `<script` or `<style`
  SpecialStartSequence,
  InSpecialTag,

  InEntity,
}

export interface VNode {
  type: 'root' | 'text',
  children?: VNode[],
  value?: string
}

export interface VText extends VNode {
  type: 'text',
  value: string
}


export class Tokenizer extends EventEmitter<string> {
  // => shouldTokenize
  public get shouldTokenize () {
    return this.buffer.length > this.index && this.running
  }

  protected isXMLMode: boolean = false
  protected state: TokenizerState = TokenizerState.Text
  protected buffer: string = ''

  protected start: number = 0
  protected index: number = 0
  protected running: boolean = true

  onText (code: number) {
    if (code === CharCodes.Lt) {
      if (this.index > this.start) {

      }

      this.state = TokenizerState.BeforeTagName
      this.start = this.index
    } 
  }

  onStartSpecial () {

  }

  onBeforeTagName (code: number) {
    // 匹配 <!
    if (code === CharCodes.ExclamationMark) {
      this.state = TokenizerState.BeforeDeclaration
      this.start = this.index + 1
    // 匹配 <?
    } else if (code === CharCodes.Questionmark) {
      this.state = TokenizerState.InProcessingInstruction
      this.start = this.index + 1
    // 匹配 </ 
    } else if (code === CharCodes.Slash) {
      this.state = TokenizerState.BeforeClosingTagName
    // 匹配 <view 
    } else if (this.isXMLMode ? !isEndOfTagSection(code) : isASCIIAlpha(code)) {
      const lower = code | 0x20
      this.start = this.index
      if (!this.isXMLMode && lower === Sequences.TitleEnd[2]) {
        // this.onStartSpecial(Sequences.TitleEnd, 3)
      } else {
        this.state =
          !this.isXMLMode && lower === Sequences.ScriptEnd[2]
            ? TokenizerState.BeforeSpecialS
            : TokenizerState.InTagName
      }
    } else {
      this.state = TokenizerState.Text
      this.onText(code)
    }
  }

  beginWork () {
    while (this.shouldTokenize) {
      const code = this.buffer.charCodeAt(this.index)
      this.workLoop(code)
    }
  }

  workLoop (code: number) {
    switch (this.state) {
      case TokenizerState.Text: {
        this.onText(code)
        break
      }

      case TokenizerState.SpecialStartSequence: {
        break
      }

      case TokenizerState.InSpecialTag: {
        break
      }

      case TokenizerState.BeforeTagName: {
        this.onBeforeTagName(code)
        break
      }

      // <[view] ....></view>
      case TokenizerState.InTagName: {
        if (isEndOfTagSection(code)) {
          this.emit('opentag', this.start, this.index)
          this.start = -1
          this.state = TokenizerState.BeforeAttributeName
          this.workLoop(code)
        }
        break
      }

      // <view []class=""></view>
      case TokenizerState.BeforeAttributeName: {
        // 匹配 >
        if (code === CharCodes.Gt) {
          this.emit('opentagend', this.index)
          this.state = TokenizerState.Text
          this.start = this.index + 1
        // 匹配 />
        } else if (code === CharCodes.Slash) {
          this.state = TokenizerState.InSelfClosingTag
        } else if (!isWhitespace(code)) {
          this.state = TokenizerState.InAttributeName
          this.start = this.index
        }
        break
      }

      case TokenizerState.InAttributeName: {
        // 匹配属性 =
        if (code === CharCodes.Eq || isEndOfTagSection(code)) {
          this.emit('attributename', this.start, this.index)
          this.start = this.index
          this.state = TokenizerState.AfterAttributeName
          this.workLoop(code)
        }
        break
      }

      case TokenizerState.AfterAttributeName: {
        // 匹配属性 =
        if (code === CharCodes.Eq) {
          this.state = TokenizerState.BeforeAttributeValue
        // 匹配 > 或者 / eg. <view[>] 或者 <view [/]>
        } else if (code === CharCodes.Slash || code === CharCodes.Gt) {
          this.emit('attributeend', QuoteType.NoValue, this.start)
          this.start = -1
          this.state = TokenizerState.BeforeAttributeName
          this.workLoop(code)
        } else if (!isWhitespace(code)) {
          this.emit('attributeend', QuoteType.NoValue, this.start)
          this.state = TokenizerState.InAttributeName
          this.start = this.index
        }
        break
      }

      case TokenizerState.BeforeAttributeValue: {
        if (code === CharCodes.DoubleQuote) {
          this.state = TokenizerState.InAttributeValueDoubleQuote
          this.start = this.index + 1
        } else if (code === CharCodes.SingleQuote) {
          this.state = TokenizerState.InAttributeValueSingleQuote
          this.start = this.index + 1
        } else if (!isWhitespace(code)) {
          this.start = this.index
          this.state = TokenizerState.InAttributeValueNoQuote
          this.workLoop(code)
        }

        break
      }

      case TokenizerState.InAttributeValueNoQuote: {

      }
    }
  }

  parse () {
    this.beginWork()
  }
}