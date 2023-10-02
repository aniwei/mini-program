import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    minify: false,
    lib: {
      entry: {
        index: './lib/index.ts',
        'app/boot': './lib/app/boot.ts',
        'builder/build': './lib/builder/build.ts',
        'view/boot': './lib/view/boot.ts',
      }, 
      formats: ['es', 'cjs']
    },
    sourcemap: true,
    rollupOptions: {
      external: [
        '@catalyze/api',
        '@catalyze/basic',
        '@catalyze/asset',
        '@catalyze/types',
        'debug',
        'ts-invariant',
        '@react-navigation/native',
        'browserfs',
        '@swc/wasm-web',
        'sass.js'
      ]
    }
  },
  resolve: {
    extensions: ['.web.tsx', '.web.jsx', '.web.js', '.web.ts', '.tsx', '.ts', '.js', '.jsx'],
    alias: {
      'react-native': 'react-native-web',
    }
  }
})
