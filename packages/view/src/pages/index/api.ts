import { WxApi } from '@catalyze/wx'

export const api = WxApi.create()
api.connect(`ws://${location.hostname}:4001`)
