import { CharCodes } from './tokenizer'

export function isWhitespace(c: number): boolean {
  return (
    c === CharCodes.Space ||
    c === CharCodes.NewLine ||
    c === CharCodes.Tab ||
    c === CharCodes.FormFeed ||
    c === CharCodes.CarriageReturn
  )
}

export function isEndOfTagSection (code: number): boolean {
  return code === CharCodes.Slash || code === CharCodes.Gt || isWhitespace(code)
}

export function isASCIIAlpha (code: number): boolean {
  return (
    (code >= CharCodes.LowerA && code <= CharCodes.LowerZ) ||
    (code >= CharCodes.UpperA && code <= CharCodes.UpperZ)
  )
}