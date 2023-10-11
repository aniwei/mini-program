import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: './lib/main.ts',
      name: 'index',
      fileName: 'index',
      formats: ['es', 'cjs']
    }
  }
})
