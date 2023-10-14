import inject from '@rollup/plugin-inject'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: './lib/index.ts',
      name: 'index',
      fileName: 'index',
      formats: ['cjs', 'es']
    },
    rollupOptions: {
      external: [
        '@catalyzed/asset',
        '@catalyzed/basic',
        'postcss',
        'path-browserify',
        'postcss-selector-parser',
        'postcss-value-parser',
        'process'
      ]
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
