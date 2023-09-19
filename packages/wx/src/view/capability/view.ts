// @ts-nocheck
import invariant from 'ts-invariant'
import { EventEmitter } from '@catalyze/basic'
import { ProxyView } from '../proxy'
import { WxCapability } from '../../capability'



export interface PlaceholderStyle {
  fontSize: number,
  fontWeight: string,
  color: string
}

export interface ShowKeyboardFields {
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
  data: ShowKeyboardFields,
  placeholderStyle: PlaceholderStyle,
  placeholderStyleDark: PlaceholderStyle,
  keyboardAppearance: string,
  confirmHold: boolean,
  confirmType: string,
  adjustPosition: boolean,
  showCoverView: boolean,
  defaultValue: number,
  viewId: number,
  cursor: number
}

interface TextFieldElement extends HTMLElement {
  value: string | null,
  placeholder?: string | null
}

abstract class TextField<T extends TextFieldElement> extends EventEmitter<'input'> {
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
  protected _data: ShowKeyboardFields | null = null
  public get data () {
    invariant(this._data)
    return this._data
  }
  public set data (data: ShowKeyboardFields) {
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
    this.proxy.send({
      command: 'message::publish',
      payload: {
        parameters: [
          'custom_event_vdSync',
          {
            data: []
          }
        ]
      }
    })
  }

  private handleBlur = () => {
    // this.remove()
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

class InputField extends TextField<HTMLInputElement> {
  createElement(): HTMLInputElement {
    return document.createElement('input')
  }
}

class TextAreaField extends TextField<HTMLTextAreaElement> {
  createElement(): HTMLTextAreaElement {
    return  document.createElement('textarea')
  }
}

export class View extends WxCapability<ProxyView> {
  static kSymbol = Symbol.for('view')
  static create (proxy: ProxyView): Promise<View> {
    return new Promise((resolve) => resolve(new View(proxy)))
  }

  public input: InputField
  public textarea: TextAreaField

  constructor (proxy: ProxyView) {
    super(proxy)


    const input = new InputField(proxy)
    const textarea = new TextAreaField(proxy)

    this.input = input
    this.textarea = textarea

    this.on('insertTextArea', this.insertTextArea, 'sync')
    this.on('showKeyboard', this.showKeyboard, 'sync')
    this.on('hideKeyboard', this.hideKeyboard, 'sync')
  }

  hideKeyboard = () => {
    this.input.remove()
    this.input.blur()
  }

  showKeyboard = (payload: ShowKeyboardPayload, id) => {
    this.input.placeholder = payload.placeholder
    this.input.value = payload.defaultValue
    this.input.textAlign = payload.style.textAlign
    this.input.width = payload.style.width
    this.input.height = payload.style.height
    this.input.fontSize = payload.style.fontSize
    this.input.top = payload.style.top
    this.input.left = payload.style.left
    this.input.data = JSON.parse(payload.data)

    this.input.append()
    this.input.focus()

    const event = new CustomEvent('onKeyboardShow', {
      detail: {
        inputId: this.input.id
      }
    })
    
    debugger
    document.dispatchEvent(event)



    return {
      errMsg: 'showKeyboard:ok',
      inputId: this.input.id
    }
  }

  insertTextArea = (payload: TextViewPayload, id) => {
    this.input.placeholder = payload.placeholder
    this.input.value = payload.defaultValue
    this.input.textAlign = payload.style.textAlign
    this.input.width = payload.style.width
    this.input.height = payload.style.height
    this.input.fontSize = payload.style.fontSize
    this.input.fontFamily = payload.style.fontFamily
    this.input.color = payload.style.color
    this.input.top = payload.style.top
    this.input.left = payload.style.left
    this.input.data = JSON.parse(payload.data)

    this.input.id = payload.inputId

    return {
      errMsg: 'insertTextArea:ok'
    }
  }
}

