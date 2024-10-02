/* eslint-disable @typescript-eslint/restrict-plus-operands */
import { defineConfig } from 'vite'
import mkcert from 'vite-plugin-mkcert'
import react from '@vitejs/plugin-react'

import viteConfig from './vite.json'

const role = process.env.ROLE

let config = viteConfig.interpreter

switch (role) {
  case 'listener': {
    config = viteConfig.listener
    break
  }
  case 'interpreter-bidirectional': {
    config = viteConfig.interpreterBidirectional
    break
  }
  case 'listener-bidirectional': {
    config = viteConfig.listenerBidirectional
    break
  }
}

export default defineConfig({
  base: './',
  build: {
    target: 'esnext',
    rollupOptions: {
      input: ['index.html', 'dialog.html']
    }
  },
  publicDir: config.publicDir,
  server: {
    open: config.brandingPath + '/',
    port: config.port,
    proxy: {
      [config.brandingPath]: {
        target: viteConfig.infinityUrl,
        changeOrigin: true,
        secure: false
      },
      '/api': {
        target: viteConfig.infinityUrl,
        changeOrigin: true,
        secure: false
      }
    }
  },
  plugins: [mkcert(), react()]
})
