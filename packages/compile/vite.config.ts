import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    minify: false,
    lib: {
      entry: {
        index: './lib/index.ts',
        'pod/compile': './lib/pod/compile.ts'
      },
      formats: ['es', 'cjs']
    },
    sourcemap: true,
    rollupOptions: {
      output: {
        globals: {
          '@catalyze/basic': '@catalyze/basic', 
          '@catalyze/types': '@catalyze/types', 
          '@catalyze/asset': '@catalyze/asset', 
          'path': 'path'
        }
      },
      external: [
        '@catalyze/basic', 
        '@catalyze/types', 
        '@catalyze/asset', 
        'ts-invariant', 
        'crypto',
        'debug',
        'glob',
        'fs-extra',
        'fs', 
        'path', 
        'child_process', 
        'fs/promises',
        'url'
      ]
    }
  }
})
