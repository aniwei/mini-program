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
      external: ['@catalyze/worker', 'path-browserify'],
    },
  },
  resolve: {
    alias: {
      'path': 'path-browserify'
    }
  }
})
