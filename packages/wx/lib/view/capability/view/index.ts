
import { nextTick } from '@catalyze/basic'
import { ProxyView } from '../../proxy'
import { WxCapability } from '../../../capability'
import { InputView, ShowKeyboardPayload, TextAreaView } from './text-view'



export class View extends WxCapability<ProxyView> {
  static kSymbol = Symbol.for('view')
  static create (proxy: ProxyView): Promise<View> {
    return new Promise((resolve) => resolve(new View(proxy)))
  }

  public input: InputView
  public textarea: TextAreaView

  constructor (proxy: ProxyView) {
    super(proxy)


    const input = new InputView(proxy)
    const textarea = new TextAreaView(proxy)

    this.input = input
    this.textarea = textarea

    this.on('insertTextArea', this.insertTextArea, 'sync')
    this.on('showKeyboard', this.showKeyboard, 'sync')
    this.on('hideKeyboard', this.hideKeyboard, 'sync')
  }

  hideKeyboard = () => {
    this.input.remove()
  }

  showKeyboard = (payload: ShowKeyboardPayload) => {
    // this.input.placeholder = payload.placeholder
    this.input.value = payload.defaultValue
    this.input.textAlign = payload.style.textAlign
    this.input.width = payload.style.width
    this.input.height = payload.style.height
    this.input.fontSize = payload.style.fontSize
    this.input.fontFamily = payload.style.fontFamily
    this.input.top = payload.style.top
    this.input.left = payload.style.left

    try {
      this.input.data = JSON.parse(payload.data)
    } catch (error: any) {
      // @ts-ignore
      this.input.data = {}
    }

    this.input.append()
    this.input.focus()


    nextTick(() => this.input.dispatch('onKeyboardShow'))

    return {
      errMsg: 'showKeyboard:ok',
      inputId: this.input.id
    }
  }

  insertTextArea = (payload: ShowKeyboardPayload) => {
    // this.input.placeholder = payload.placeholder
    this.input.value = payload.defaultValue
    this.input.textAlign = payload.style.textAlign
    this.input.width = payload.style.width
    this.input.height = payload.style.height
    this.input.fontSize = payload.style.fontSize
    this.input.fontFamily = payload.style.fontFamily
    this.input.color = payload.style.color
    this.input.top = payload.style.top
    this.input.left = payload.style.left

    try {
      this.input.data = JSON.parse(payload.data)
    } catch (error: any) {
      // @ts-ignore
      this.input.data = {}
    }

    this.input.id = payload.inputId

    return {
      errMsg: 'insertTextArea:ok'
    }
  }
}

