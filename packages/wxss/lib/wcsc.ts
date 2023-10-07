import postcss from 'postcss'
import { wxss } from './wxss'
//// => Wcsc
export interface WcscOptions {

}

export class Wcsc {
  constructor (options: WcscOptions) {

  }

  compile (): Promise<string> {
    return new Promise((resolve, reject) => {

    })
  }
}


//// => WxssProcess
export class WxssProcess {
  process (content: string) {
    postcss([wxss]).process(content).then(result => {

    })
  }
}

export default {}