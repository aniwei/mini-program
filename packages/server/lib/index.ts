import { WxApp } from './wx'
import type { WxProj } from '@catalyze/types'

export interface WxApplicationOptions {
  port: number,
  proj: WxProj
}

export const createWxApplication = (options: WxApplicationOptions) => {
  return new WxApp(options)
}