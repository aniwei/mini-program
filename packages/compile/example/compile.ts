
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

import { WxAssetsCompile } from '../src/compile'

const bundle = WxAssetsCompile.create(2, path.resolve(__dirname, 'vant'))

bundle.init().then(async () => {
  bundle.mount().then(() => {
    bundle.search().then(() => {
      return bundle.compile()
    })
  })
})

// bundle.runTask([''], 'XML')