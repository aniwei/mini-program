import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: './lib/cli.ts',
      name: 'cli',
      fileName: 'cli'
    },
    sourcemap: true,
    rollupOptions: {
      external: []
    }
  }
})
