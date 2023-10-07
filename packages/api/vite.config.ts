import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    minify: false,
    lib: {
      entry: './lib/index.ts',
      name: 'index',
      fileName: 'index',
      formats: ['cjs', 'es']
    },
    rollupOptions: {
      external: [
        '@catalyzed/basic', 
        '@catalyzed/types'
      ]
    }
  }
})
