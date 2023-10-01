import { defineConfig } from 'vite'


export default defineConfig({
  build: {
    minify: false,
    lib: {
      entry: {
        node: './lib/node.ts',
        browser:  './lib/browser.ts'
      },
    },
    sourcemap: true,
    rollupOptions: {
      external: [
        'worker_threads',
        'url',
        'vm'
      ]
    }
  }
})
