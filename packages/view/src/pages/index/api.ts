import { WxApi } from '@catalyze/wx'

export const api = WxApi.create()
api.connect('ws://localhost:4001')
