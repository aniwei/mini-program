import { WxApp, WxAppOptions } from './wx'

export const createWxApplication = async (options: WxAppOptions) => {
  const app = new WxApp({ ...options})
  await app.start()

  return app
}