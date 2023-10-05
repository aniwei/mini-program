import { invariant } from 'ts-invariant'
import { EventEmitter } from '@catalyzed/basic'
import { ProxyView } from '../../proxy'

export interface PlaceholderStyle {
  fontSize: number,
  fontWeight: string,
  color: string
}

export interface ShowKeyboardInputFields {
  bindinput: string,
  bindkeyboardheightchange: string, 
  target: {
    id: string,
    dataset: {
      [key: string]: string
    },
    offsetTop: number,
    offsetLeft: number
  },
  setKeyboardValue: boolean, 
  securityType: 'textarea', 
  currentTarget: {
    id: string,
    dataset: {
      [key: string]: string
    },
    offsetTop: number,
    offsetLeft: number,
  },
  nodeId: string
}

export interface ShowKeyboardPayload {
  type: string,
  maxLength: number,
  style: {
    width: number,
    height: number,
    left: number,
    top: number,
    fontFamily: string,
    fontSize: number,
    fontWeight: string,
    color: string,
    backgroundColor: string,
    marginBottom: number,
    textAlign: string
  },
  data: string,
  placeholderStyle: PlaceholderStyle,
  placeholderStyleDark: PlaceholderStyle,
  keyboardAppearance: string,
  confirmHold: boolean,
  confirmType: string,
  adjustPosition: boolean,
  showCoverView: boolean,
  defaultValue: string,
  viewId: number,
  cursor: number,
  inputId: number
}

interface TextViewElement extends HTMLElement {
  value: string,
  placeholder?: string | null,
  selectionStart: number | null,
  selectionEnd: number | null,
  selectionDirection: string | null
}

const getCaretPosition = <T extends TextViewElement>(input: T) => {
  let caretPosition = input.value?.length ?? 0
  
  if (input.selectionStart || input.selectionStart === 0) {
    caretPosition = input.selectionDirection === 'backward' 
      ? input.selectionStart as number
      : input.selectionEnd as number
  }

  return caretPosition;
}

export abstract class TextView<T extends TextViewElement> extends EventEmitter<'input'> {
  // => element
  protected _element: T | null = null
  public get element () {
    invariant(this._element !== null)
    return this._element
  }
  public set element (element: T) {
    if (element !== this._element) {
      if (this._element) {
        this._element.removeEventListener('input', this.handleInput)
        this._element.removeEventListener('blur', this.handleBlur)
      }

      this._element = element
      if (this._element !== null) {
        this._element.addEventListener('input', this.handleInput)
        this._element.addEventListener('blur', this.handleBlur)
      }
    }
  }

  // => width
  public get width () {
    const width = parseInt(this.element.style.width)
    return isNaN(width) ? 0 : width
  }
  public set width (width: number) {
    this.element.style.width = width + 'px'
  }

  // => height
  public get height () {
    const height = parseInt(this.element.style.height)
    return isNaN(height) ? 0 : height
  }
  public set height (height: number) {
    this.element.style.height = height + 'px'
  }

  // => top
  public get top () {
    const top = parseInt(this.element.style.top)
    return isNaN(top) ? 0 : top
  }
  public set top (top: number) {
    this.element.style.top = top + 'px'
  }

  // => left
  public get left () {
    const left = parseInt(this.element.style.left)
    return isNaN(left) ? 0 : left
  }
  public set left (left: number) {
    this.element.style.left = left + 'px'
  }

  // => fontSize
  public get fontSize () {
    const fontSize = parseInt(this.element.style.fontSize)
    return isNaN(fontSize) ? 0 : fontSize
  }
  public set fontSize (fontSize: number) {
    this.element.style.fontSize = fontSize + 'px'
  }

  // => fontFamily
  public get fontFamily () {
    return this.element.style.fontFamily
  }
  public set fontFamily (fontFamily: string) {
    this.element.style.fontFamily = fontFamily
  }

  // => color 
  public get color () {
    return this.element.style.color
  }
  public set color (color: string) {
    this.element.style.color = color
  }

  // => textAlign
  public get textAlign () {
    return this.element.style.textAlign
  }
  public set textAlign (textAlign: string) {    
    this.element.style.textAlign = textAlign
  }

  // => placeholder
  public get placeholder () {
    return this.element.placeholder ?? null
  }
  public set placeholder (placeholder: string | null) {
    this.element.placeholder = placeholder
  }

  // => value
  public get value () {
    return this.element.value
  }
  public set value (value: string) {
    this.element.value = value
  }

  // => data
  protected _data: ShowKeyboardInputFields | null = null
  public get data () {
    invariant(this._data)
    return this._data
  }
  public set data (data: ShowKeyboardInputFields) {
    if (this._data !== data){
      this._data = data
    }
  }

  // => id
  protected _id: number | null = null
  public get id () {
    invariant(this._id)
    return this._id
  }
  public set id (id: number) {
    if (this._id !== id){
      this._id = id
    }
  }
  
  protected proxy: ProxyView 

  constructor (proxy: ProxyView) {
    super()

    this.proxy = proxy
    this.element = this.createElement()

    this.element.style.position = 'absolute'
    this.element.style.border = 'none'
    this.element.style.outline = 'none'
    this.element.style.margin = '0'
    this.element.style.padding = '0'
  }

  abstract createElement (): T

  private handleInput = (event: Event) => {
    const target = event.target as HTMLInputElement

    this.dispatch<{
      value: string,
      cursor: number
    }>('onKeyboardConfirm', {
      value: target.value,
      cursor: getCaretPosition<HTMLInputElement>(target)
    })

    // this.dispatch<{
    //   value: string,
    //   cursor: number
    // }>('setKeyboardValue', {
    //   value: target.value,
    //   cursor: getCaretPosition<HTMLInputElement>(target)
    // })
  }

  private handleBlur = (event: Event) => {
    const target = event.target as HTMLInputElement

    const value = target.value
    this.value = ''

    this.dispatch<{
      value: string,
      cursor: number
    }>('onKeyboardComplete', {
      value,
      cursor: getCaretPosition<HTMLInputElement>(target)
    })
  }

  dispatch <T extends object> (
    type: 'setKeyboardValue' | 'onKeyboardConfirm' | 'onKeyboardComplete' | 'onKeyboardShow', 
    detail?: T
  ) {
    
    // @ts-ignore
    exparser.triggerEvent(document, type, {
      ...detail,
      inputId: this.id,
    })
  }

  append () {
    document.body.appendChild(this.element)
  }

  remove () {
    document.body.removeChild(this.element)
  }

  focus () {
    this.element.focus()
  }
}

export class InputView extends TextView<HTMLInputElement> {
  createElement(): HTMLInputElement {
    return document.createElement('input')
  }
}

export class TextAreaView extends TextView<HTMLTextAreaElement> {
  createElement(): HTMLTextAreaElement {
    return  document.createElement('textarea')
  }
}