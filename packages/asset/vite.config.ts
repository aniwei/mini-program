import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: './lib/index.ts',
      name: 'index',
      fileName: 'index'
    },
    rollupOptions: {
      external: ['@catalyze/basic', 'debug', 'ts-invariant', 'path-browserify']
    }
  }
})
