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
        },
      },
      external: [
        'path'
      ],
    },
  },
  resolve: {
    alias: {
      'path': 'path-browserify'
    }
  }
})
