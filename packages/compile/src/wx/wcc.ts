import fs from 'fs-extra'
import path from 'path'
import debug from 'debug'
import { spawnSync } from 'child_process'
import { isDarwin, isArm64, isWindow, isLinux } from '@catalyze/basic'

const wcc_debug = debug(`wx:compiler:wcc`)
const bin = path.resolve(__dirname, '../../bin')


export class WxWCC {
  static tryChmod (bin: string) {
    return fs.chmod(bin, 0o777)
  }

  protected bin: string
  protected root: string

  constructor (root: string) {
    this.root = root

    this.bin = path.join(
      bin, 
      isDarwin() 
        ? 'mac' 
        : isLinux() ? 'linux' : 'win32',
      isDarwin() 
        ? isArm64() ? 'arm64' : 'x64'
        : '',
      'wcc' 
    )
  }

  compile (parameters: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      wcc_debug('正在编译 WXML 文件 「parameters: %o」', parameters)

      WxWCC.tryChmod(this.bin).then(() => {
        const ps = spawnSync(this.bin, parameters, { 
          cwd: this.root,
          maxBuffer: 1024 * 1024,
        })

        if (ps.status !== 0) {
          reject(new Error(`WXML编译错误 「${ps.stderr.toString()}」`))
        } else {
          resolve(ps.stdout.toString())
        }
      })

    })
  }
}

