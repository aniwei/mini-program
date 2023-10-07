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
      external: [
        '@catalyzed/worker', 
        'path-browserify',
        'path',
        'bytes',
        'debug',
        'ts-invariant'
      ],
    },
  },
})
