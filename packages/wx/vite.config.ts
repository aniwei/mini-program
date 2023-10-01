import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: './lib/index.ts',
      name: 'index',
      fileName: 'index'
    },
    sourcemap: true,
    rollupOptions: {
      external: [
        '@catalyze/api',
        '@catalyze/basic',
        '@catalyze/asset',
        '@catalyze/types',
        'debug',
        'ts-invariant',
        '@react-navigation/native',
        'browserfs',
        '@swc/wasm-web',
        'sass.js'
      ]
    }
  }
})
