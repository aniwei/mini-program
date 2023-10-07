import inject from '@rollup/plugin-inject'
import { viteCommonjs, esbuildCommonjs } from '@originjs/vite-plugin-commonjs'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: './lib/index.ts',
      name: 'index',
      fileName: 'index'
    }
  },
  plugins: [
    inject({
      process: 'process/browser'
    }), 
    viteCommonjs({
      exclude: ['lib']
    }), 
  ]
})
