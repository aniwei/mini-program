import { ProxyView } from '../proxy'
import { WxCapability } from '../../capability'
import invariant from 'ts-invariant'

export interface TextInputPlaceholderStyle {
  fontSize: number,
  fontWeight: string,
  color: string
}

export interface TextInputPayload {
  adjustKeyboardTo: string,
  adjustPosition: boolean,
  autoSize: boolean,
  confirm: boolean,
  confirmHold: boolean
  confirmType: string,
  data: string
  // "{\"bindinput\":\"onInput\",\"bindkeyboardheightchange\":\"onKeyboardHeightChange\",\"target\":{\"id\":\"\",\"dataset\":{},\"offsetTop\":14,\"offsetLeft\":115},\"setKeyboardValue\":true,\"securityType\":\"textarea\",\"currentTarget\":{\"id\":\"\",\"dataset\":{},\"offsetTop\":14,\"offsetLeft\":115},\"nodeId\":\"ed6f3176\"}"
  disableContainerInset: boolean
  disabled: boolean,
  fixed: boolean,
  hidden: boolean,
  inputId: number,
  keyboardAppearance: string,
  maxLength: number,
  parentId: number,
  placeholder: string,
  placeholderStyle: TextInputPlaceholderStyle,
  placeholderStyleDark: TextInputPlaceholderStyle,
  showCoverView: boolean,
  style: {
    width: number,
    left: number,
    minHeight: number,
    maxHeight: number,
    top: number,
    height: number,
    fontSize: number,
    fontWeight: string,
    textAlign: string
  },
  value: string
  zIndex: number
}

export class View extends WxCapability<ProxyView> {
  static kSymbol = Symbol.for('view')
  static create (proxy: ProxyView): Promise<View> {
    return new Promise((resolve) => resolve(new View(proxy)))
  }

  // => input
  protected _input: HTMLInputElement | null = null
  public get input () {
    invariant(this._input !== null)
    return this._input
  }
  public set input (input: HTMLInputElement) {
    if (this._input !== input) {
      this._input = input
    }
  }

  // => textare
  protected _textarea: HTMLTextAreaElement | null = null
  public get textarea () {
    invariant(this._textarea !== null)
    return this._textarea
  }
  public set textarea (textarea: HTMLTextAreaElement) {
    if (this._textarea !== textarea) {
      this._textarea = textarea
    }
  }

  constructor (proxy: ProxyView) {
    super(proxy)


    const input = document.createElement('input') as HTMLInputElement
    const textarea = document.createElement('textare') as HTMLTextAreaElement

    input.addEventListener('input', this.onChange)
    input.style.border = 'none'
    input.style.outline = 'none'
    input.style.background = 'tranparent'
    input.style.position = 'absolute'


    this.input = input 
    this.textarea = textarea

    this.on('insertTextArea', this.insertTextArea)
  }

  onChange = (event) => {
    console.log(event)
  }

  insertTextArea = (payload: TextInputPayload, id) => {
    console.log(payload)
    this.input.placeholder = payload.placeholder
    this.input.value = payload.value
    this.input.style.textAlign = payload.style.textAlign
    this.input.style.width = payload.style.width + 'px'
    this.input.style.height = payload.style.height + 'px'
    this.input.style.fontSize = payload.style.fontSize + 'px'
    this.input.style.top = payload.style.top + 'px'
    this.input.style.left = payload.style.left + 'px'

    document.body.appendChild(this.input)

    this.input.focus()
  }
}

