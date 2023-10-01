import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: './lib/cli.ts',
      name: 'cli',
      fileName: 'cli',
      formats: ['cjs', 'es']
    },
    sourcemap: true,
    rollupOptions: {
      external: [
        '@catalyze/server',
        '@catalyze/types',
        '@catalyze/view',
        'fs',
        'fs/promises',
        'url',
        'http',
        'path'
      ]
    }
  }
})
