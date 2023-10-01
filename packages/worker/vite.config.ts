import { defineConfig } from 'vite'


export default defineConfig({
  build: {
    lib: {
      entry: {
        node: './lib/node.ts',
        browser:  './lib/browser.ts'
      },
    },
    sourcemap: true,
  }
})
