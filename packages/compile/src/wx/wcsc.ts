import path from 'path'
import debug from 'debug'
import fs from 'fs-extra'
import { spawnSync } from 'child_process'

const wcsc_debug = debug(`wx:compiler:wcsc`)
const bin = path.resolve(__dirname, '../../bin')

const platform = process.platform

export class WxWCSC {
  static tryChmod (bin: string) {
    return fs.chmod(bin, 0o777)
  }

  protected bin: string
  protected root: string

  constructor (root: string) {
    this.root = root
    this.bin = path.join(
      bin, 
      platform === 'darwin' ? 'mac' : platform === 'win32' ? 'windows' : 'linux',
      'wcsc'
    )
  }

  compile (parameters: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      wcsc_debug('正在编译 WXSS 文件 <parameters: %s>', parameters)

      WxWCSC.tryChmod(this.bin).then(() => {
        const ps = spawnSync(this.bin, parameters, { cwd: this.root })

        if (ps.status !== 0) {
          reject(new Error(`WXSS编译错误 <${ps.stderr.toString()}>`))
        } else {
          resolve(ps.stdout.toString())
        }
      })

    })
  }
}

