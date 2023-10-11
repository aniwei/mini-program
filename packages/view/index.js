const { createServer } = require('vite')

const createVite = (port) => {
  return createServer({
    root: __dirname,
    server: { port },
  })
}

module.exports = {
  createVite
} 