
import path from 'path'
// import compiler from 'miniprogram-compiler'
// import { WxCompiler } from '../src/compile'

// const result = compiler.wxssToJs(path.resolve(__dirname, 'vant'))
// debugger

// const compiler = new WxCompiler(path.resolve(__dirname, 'app'), 2)
// compiler.start().then(() => {
//   compiler.compileAndReadFiles().then((results) => {
//     debugger
//   })
// })

import { WxAssetsBundle } from '../src/asset'

const bundle = WxAssetsBundle.create(path.resolve(__dirname, 'vant'), 2)

bundle.init().then(async () => {
  await bundle.mount()
  bundle.runTask(bundle.xmlsExecArgs, 'XML').then(result => {
    debugger
  })
  bundle.runTask(bundle.cssesExecArgs, 'CSS').then(result => {
    debugger
  })
})

// bundle.runTask([''], 'XML')