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
        '@catalyze/basic',
        '@catalyze/types',
        '@catalyze/view',
        'debug',
        'wx',
        'http',
        'fs',
        'fs/promises',
        'url',
        'path'
      ]
    }
  }
})
