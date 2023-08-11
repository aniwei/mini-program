const jsEscapeRegex = /\\(u\{([0-9A-Fa-f]+)\}|u([0-9A-Fa-f]{4})|x([0-9A-Fa-f]{2})|([1-7][0-7]{0,2}|[0-7]{2,3})|(['"tbrnfv0\\]))|\\U([0-9A-Fa-f]{8})/g

const usualEscapeSequences = {
  '0': '\0',
  'b': '\b',
  'f': '\f',
  'n': '\n',
  'r': '\r',
  't': '\t',
  'v': '\v',
  '\'': '\'',
  '"': '"',
  '\\': '\\'
};

const fromHex = (str: string) => String.fromCodePoint(parseInt(str, 16))
const fromOct = (str: string) => String.fromCodePoint(parseInt(str, 8))

export const unescape = (string: string) => {
  return string.replace(jsEscapeRegex, (
    _: string, 
    __: string, 
    varHex: string, 
    longHex: string, 
    shortHex: string, 
    octal: string, 
    specialCharacter: '0' | 'b' | 'f' | 'n' | 'r' | 't' | 'v' | '\'' | '"'  | '\\' , 
    python: string
  ) => {
    if (varHex !== undefined) {
      return fromHex(varHex)
    } else if (longHex !== undefined) {
      return fromHex(longHex)
    } else if (shortHex !== undefined) {
      return fromHex(shortHex)
    } else if (octal !== undefined) {
      return fromOct(octal)
    } else if (python !== undefined) {
      return fromHex(python)
    } else {
      return usualEscapeSequences[specialCharacter]
    }
  })
}