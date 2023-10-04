const path = require('path')
const serve = require('koa-static')

const view = () => {
  return serve(path.resolve(__dirname, `dist`))
}

module.exports = { view }
