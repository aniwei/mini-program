
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

import { WxBundles } from '../src/bundle'

const bundles = WxBundles.create(path.resolve(__dirname, 'vant'), 2)

bundles.on('inited', async () => {
  await bundles.mount()
  bundles.runTask(bundles.xmlsExecArgs, 'XML').then(result => {
    debugger
  })
  bundles.runTask(bundles.cssesExecArgs, 'CSS').then(result => {
    debugger
  })
})

// bundle.runTask([''], 'XML')