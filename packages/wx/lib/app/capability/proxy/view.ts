// TODO remove in the future?
import { ProxyApp } from '../..'
import { WxCapability } from '../../../capability'

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
  },
  value: string
  zIndex: number
}

export class View extends WxCapability<ProxyApp> {
  static kSymbol = Symbol.for('view')
  static create (proxy: ProxyApp): Promise<View> {
    return new Promise((resolve) => resolve(new View(proxy)))
  }

  constructor (proxy: ProxyApp) {
    super(proxy)

    this
      .on('insertTextArea', this.insertTextArea)
  }

  insertTextArea = (payload: TextInputPayload, id: string) => {
    this.proxy.emit('inserttextarea', payload, id)
  }
}

