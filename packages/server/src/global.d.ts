import * as Koa from 'koa'

declare module 'koa' {
  interface Application {
    program: WxApp
  }
}