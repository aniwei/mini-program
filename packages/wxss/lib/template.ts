abstract class WxssBaseTemplate {
  static BASE_DEVICE_WIDTH = 375
  static EPS = 1e-4

  public isiOS: boolean
  public width: number
  public height: number
  public devicePixelRatio: number

  constructor (
    isiOS: boolean = true,
    width: number = 375,
    height: number = 0,
    devicePixelRatio: number = 2.0,
    orientation: 'landscape' | ''
  ) {
    this.isiOS = isiOS
    this.width = width
    this.height = height
    this.devicePixelRatio = devicePixelRatio

    if (orientation === 'landscape') {
      this.width = height
    } else {

    }
  }

  // rpx
  transform (number: number, width: number) {

    if (number === 0) {
      return 0
    }
    number = (number / WxssBaseTemplate.BASE_DEVICE_WIDTH) * (width || this.width)
    number = Math.floor(number + WxssBaseTemplate.EPS)

    if (number === 0) {
      if (this.devicePixelRatio === 1 || !this.isiOS) {
        return 1
      } else {
        return 0.5
      }
    }

    return number
  }
}

type RecalculatingHandle = () => void

export class WxssTemplate extends WxssBaseTemplate {
  static create (
    isiOS: boolean = true,
    width: number = 375,
    height: number = 0,
    devicePixelRatio: number = 2.0,
    orientation: 'landscape' | ''
  ) {
    
    return new WxssTemplate(
      isiOS,
      width,
      height,
      devicePixelRatio,
      orientation,
    )
  }

  public recalculatingHandles: RecalculatingHandle[] = []
  public styleSheets: object = {}

  makeup (file, options) {
    const isNumber = typeof file === 'number'
    if (isNumber && Ca.hasOwnProperty(file)) return ''
    if (isNumber) {
      Ca[file] = 1
    }

    const ex = isNumber ? _C[file] : file
    let result = ''

    for (var i = ex.length - 1; i >= 0; i--) {
      const content = ex[i]
      if (typeof content === 'object') {
        const op = content[0]
        if (op === 0) {
          result = this.transform(
            content[1], 
            options.deviceWidth
          ) + 'px' + result
        } else if (op === 1) {
          result = options.suffix + result
        } else if (op === 2) {
          result = this.makeup(content[1], options) + result
        }

      } else {
        result = content + result
      }
    }

    return result
  }

  rewritor () {

  }

  render () {
    
  }
}


type WxssTemplateRenderOptions = {
  suffix?: string,
  allowIllegalSelector: boolean
}

type WxssInfo = {
  path: string
}

export class WxssTemplateRender {
  rewritor (
    suffix: string = '', 
    options: WxssTemplateRenderOptions, 
    style: HTMLStyleElement | null = null
  ) {
    options.suffix = suffix
    if (
      options.allowIllegalSelector !== undefined && 
      xcInvalid !== undefined
    ) {
      console.warn(xcInvalid) 
    }

    if (style === null) {
      const head = document.getElementsByTagName('head')[0]
      style = document.createElement('style')
      style.type = 'text/css'
      style.setAttribute('wxss:path', path)
      head.appendChild(style)
    }

    if (style.styleSheet) {
      style.styleSheet.cssText = css
    } else {
      if (style.childNodes.length === 0) {
        style.appendChild(document.createTextNode(css))
      } else {
        style.childNodes[0].nodeValue = css
      }
    }
  }

  render (
    contents: string[], 
    xcInvalid: string, 
    info: WxssInfo
  ) {

  }
}