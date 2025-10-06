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
    target: 'esnext'
  },
  publicDir: config.publicDir,
  server: {
    open: '/webapp3/',
    port: config.port,
    cors: true,
    proxy: {
      '/webapp3/branding/manifest.json': {
        target: 'https://localhost:' + config.port,
        secure: false,
        rewrite: (path) =>
          path.replace(/^\/webapp3\/branding\/manifest.json$/, '/manifest.json')
      },
      '/webapp3': {
        target: viteConfig.infinityUrl,
        secure: false,
        rewrite: (path) => path.replace(/^\/webapp3\/(.*)$/, '/webapp3/$1')
      },
      '/api': {
        target: viteConfig.infinityUrl,
        secure: false
      }
    }
  },
  plugins: [mkcert(), react()]
})
