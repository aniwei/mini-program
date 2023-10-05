import { WxApi } from '@catalyzed/wx'

export const api = WxApi.create()
api.connect(`ws://${location.host}/api`)
