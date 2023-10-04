import debug from 'debug'
import minimist from 'minimist'
import { start } from './actions/start'
import { upgrade } from './actions/upgrade'
import { clear } from './actions/clear'

const cli_debug = debug(`wx:cli`)
const argv = minimist(process.argv.slice(2))

cli_debug(`执行命令 「action: ${argv._[0]}」`)

switch (argv._[0]) {
  case 'clear':
    clear()
    break

  case 'start':
    start(argv.port)
    break

  case 'upgrade':
    upgrade()
    break
}