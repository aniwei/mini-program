// @ts-nocheck
import invariant from 'ts-invariant'
import { EventEmitter } from '@catalyze/basic'
import { ProxyView } from '../proxy'
import { WxCapability } from '../../capability'
import { InputField, TextAreaField } from './input'



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

    this.input.dispatch('onKeyboardShow')

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

