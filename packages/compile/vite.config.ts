import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    minify: false,
    lib: {
      entry: {
        index: './lib/index.ts',
        'pod/compile': './lib/pod/compile.ts',
        'builder/build': './lib/builder/build.ts'
      },
      formats: ['es', 'cjs']
    },
    sourcemap: true,
    rollupOptions: {
      output: {
        globals: {
          '@catalyzed/basic': '@catalyzed/basic', 
          '@catalyzed/types': '@catalyzed/types', 
          '@catalyzed/asset': '@catalyzed/asset', 
          'path': 'path'
        }
      },
      external: [
        '@catalyzed/basic', 
        '@catalyzed/types', 
        '@catalyzed/asset', 
        '@swc/core',
        'ts-invariant', 
        'crypto',
        'debug',
        'glob',
        'fs-extra',
        'fs', 
        'path', 
        'child_process', 
        'fs/promises',
        'url',
        'sass',
        'less'
      ]
    }
  }
})
