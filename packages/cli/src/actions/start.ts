import fs from 'fs-extra'
import debug from 'debug'
import path from 'path'
import { createWxApplication } from '@catalyze/server'

const env = process.env
const start_debug = debug(`wx:cli:start`)

export const start = async (port: number) => {
  const proj = process.cwd()
  port ??= Number(env.PORT) ?? 4001

  start_debug(`执行命令 「action: start」`)
  start_debug(`执行路径 「dir: ${proj} 」`)
  start_debug(`执行参数 「port: ${port}」`)

  const filename = path.resolve(proj, 'project.config.json')

  if (await fs.exists(filename)) {
    start_debug(`读取小程序配置文件 「config: ${filename}」`)
    const buffer = await fs.readFile(filename)
    const config = JSON.parse(buffer.toString())

    start_debug(`启动小程序 「appid: ${config.appid}」`)

    await createWxApplication({
      port,
      proj,
      program: {
        appid: config.appid
      },
    })
  } else {
    start_debug(`执行错误，当前路径 「dir ${proj}」 不存在小程序项目`)
  }
}