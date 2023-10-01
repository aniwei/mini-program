import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    minify: false,
    lib: {
      entry: './lib/index.ts',
      name: 'index',
      fileName: 'index',
      formats: ['es', 'cjs']
    },
    sourcemap: true,
    rollupOptions: {
      output: {
        globals: {
          '@catalyze/basic': '@catalyze/basic', 
          '@catalyze/types': '@catalyze/types', 
          '@catalyze/asset': '@catalyze/asset', 
          'path': 'path'
        }
      },
      external: [
        '@catalyze/basic', 
        '@catalyze/types', 
        '@catalyze/asset', 
        'ts-invariant', 
        'glob',
        'fs-extra',
        'fs', 
        'path', 
        'child_process', 
        'fs/promises',
        'url'
      ]
    }
  }
})
