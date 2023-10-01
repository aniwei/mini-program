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
        '@catalyze/asset', 
        'ts-invariant', 
        'debug', 
        'fs', 
        'path', 
        'fs-extra', 
        'child_process', 
        'fs/promises',
        'url'
      ]
    }
  }
})
