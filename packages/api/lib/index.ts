import WxApiJSON from './api.json'
import pkg from '../package.json'

WxApiJSON.version = pkg.version

export { WxApiJSON }
export * from './transport'
export * from './wx'