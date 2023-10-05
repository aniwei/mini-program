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
          "@at/basic": "@at/basic",
          "@at/worker": "@at/worker",
        },
      },
      external: [
        '@catalyze/api',
        '@catalyze/asset',
        '@catalyze/basic',
        '@catalyze/compile',
        '@catalyze/types',
        '@catalyze/view',
        'chokidar',
        'vite',
        'ws',
        'koa',
        'http',
        'fs',
        'fs/promises',
        'url',
        'path'
      ],
    },
  }
})
