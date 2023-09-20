import { WxApi } from '@catalyze/wx'

export const api = WxApi.create()
api.connect(`wss://${location.hostname}:4001`)
