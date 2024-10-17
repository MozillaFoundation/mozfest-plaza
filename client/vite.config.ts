import { fileURLToPath, URL } from 'node:url'
import process from 'node:process'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import yaml from '@modyfi/vite-plugin-yaml'
// import { visualizer } from 'rollup-plugin-visualizer'

import pkg from './package.json'
process.env.VUE_APP_NAME = pkg.name
process.env.VUE_APP_VERSION = pkg.version

// https://vite.dev/config/
export default defineConfig({
  plugins: [yaml(), vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @import '@/scss/common.scss';
        `,
        quietDeps: true,
      },
    },
  },

  // https://vite.dev/config/shared-options.html#define
  define: {
    __APP_NAME__: JSON.stringify(pkg.name),
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
})
