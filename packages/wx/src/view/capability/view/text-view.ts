import invariant from 'ts-invariant'
import { EventEmitter } from '@catalyze/basic'
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
  protected _width: number = 0
  public get width () {
    return this._width
  }
  public set width (width: number) {
    if (this._width !== width){
      this._width = width
      this.element.style.width = this._width + 'px'
    }
  }

  // => height
  protected _height: number = 0
  public get height () {
    return this._height
  }
  public set height (height: number) {
    if (this._height !== height){
      this._height = height
      this.element.style.height = this._height + 'px'
    }
  }

  // => top
  protected _top: number = 0
  public get top () {
    return this._top
  }
  public set top (top: number) {
    if (this._top !== top){
      this._top = top
      this.element.style.top = this._top + 'px'
    }
  }

  // => left
  protected _left: number = 0
  public get left () {
    return this._left
  }
  public set left (left: number) {
    if (this._left !== left){
      this._left = left
      this.element.style.left = this._left + 'px'
    }
  }

  // => fontSize
  protected _fontSize: number = 0
  public get fontSize () {
    return this._fontSize
  }
  public set fontSize (fontSize: number) {
    if (this._fontSize !== fontSize){
      this._fontSize = fontSize
      this.element.style.fontSize = this._fontSize + 'px'
    }
  }

  // => fontFamily
  protected _fontFamily: string = ''
  public get fontFamily () {
    return this._fontFamily
  }
  public set fontFamily (fontFamily: string) {
    if (this._fontFamily !== fontFamily){
      this._fontFamily = fontFamily
      this.element.style.fontFamily = this._fontFamily
    }
  }

  // => color 
  protected _color: string = ''
  public get color () {
    return this._color
  }
  public set color (color: string) {
    if (this._color !== color){
      this._color = color
      this.element.style.color = this._color
    }
  }

  // => textAlign
  protected _textAlign: string = 'left'
  public get textAlign () {
    return this._textAlign
  }
  public set textAlign (textAlign: string) {
    if (this._textAlign !== textAlign){
      this._textAlign = textAlign
      this.element.style.textAlign = this._textAlign
    }
  }

  // => placeholder
  protected _placeholder: string = ''
  public get placeholder () {
    return this._placeholder
  }
  public set placeholder (placeholder: string) {
    if (this._placeholder !== placeholder){
      this._placeholder = placeholder
      this.element.placeholder = this._placeholder
    }
  }

  // => value
  protected _value: string = ''
  public get value () {
    return this._value
  }
  public set value (value: string) {
    if (this._value !== value){
      this._value = value
      this.element.value = this._value
    }
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

    this.dispatch<{
      value: string,
      cursor: number
    }>('onKeyboardComplete', {
      value: target.value,
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