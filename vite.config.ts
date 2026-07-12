/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/hanzi-writer-data/*.json',
          dest: 'data/chars',
          rename: { stripBase: true },
        },
      ],
    }),
  ],
  base: '/hanzi-lens/',
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
