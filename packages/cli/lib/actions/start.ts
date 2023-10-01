import debug from 'debug'
import { createWxApplication } from '@catalyze/server'
import { getWxProj } from '../basic/proj'

const env = process.env
const start_debug = debug('wx:cli:start')

export const start = async (port: number) => {
  port ??= Number(env.PORT) ?? 4001

  start_debug(`执行命令 「action: start」`)
  start_debug(`执行路径 「dir: ${process.cwd()} 」`)
  start_debug(`执行参数 「port: ${port}」`)

  const proj = await getWxProj()

  if (proj.root === null) {
    console.error(`执行错误，当前路径 「${proj}」 不存在小程序项目`)
    process.exit(0)
  } else {
    await createWxApplication({
      port,
      proj,
    })
  }
}
