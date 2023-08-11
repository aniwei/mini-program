import react from '@vitejs/plugin-react-swc'
import path from 'path'
import inject from '@rollup/plugin-inject'
import { defineConfig } from 'vite'
import { viteCommonjs, esbuildCommonjs } from '@originjs/vite-plugin-commonjs'

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    global: 'globalThis',
    '__DEV__': true,
    'process.env': {},
  },
  server: {
    headers: {
      
    },
    proxy: {
      "/@wx": {
        target: "http://localhost:4001",
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  optimizeDeps: {
    include: ['@react-navigation/native', 'react-native-reanimated', '@react-navigation/drawer'],
    esbuildOptions: {
      mainFields: ['module', 'main', 'react-native'],
      resolveExtensions: ['.web.ts', '.web.js', '.js', '.ts', '.jsx'],
      loader: { '.js': 'jsx' },
      plugins: [esbuildCommonjs([
        '@react-navigation/elements',
        'react-native-reanimated'
      ])],
    },
  },
  resolve: {
    extensions: ['.web.tsx', '.web.jsx', '.web.js', '.web.ts', '.tsx', '.ts', '.js', '.jsx'],
    alias: {
      'react-native': 'react-native-web',
      '@libs': path.resolve(__dirname, `src/pages/index/libs`),
      '@hooks': path.resolve(__dirname, `src/pages/index/hooks`),
      '@stores': path.resolve(__dirname, `src/pages/index/stores`),
      '@layouts': path.resolve(__dirname, `src/pages/index/layouts`),
      '@components': path.resolve(__dirname, `src/pages/index/components`)
    },
  },
  plugins: [
    inject({
      process: 'process/browser'
    }), 
    viteCommonjs({
      exclude: ['src', '@catalyze/*']
    }), 
    react()
  ],
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      input: {
        index: path.resolve(__dirname, './index.html'),
        view: path.resolve(__dirname, './view.html')
      }
    }
  },
})
