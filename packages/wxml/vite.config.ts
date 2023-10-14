import inject from '@rollup/plugin-inject'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: './lib/index.ts',
      name: 'index',
      fileName: 'index'
    }
  },
  resolve: {
    alias: {
      'path': 'path-browserify'
    }
  },
  plugins: [
    inject({
      process: 'process/browser'
    })
  ],
})
