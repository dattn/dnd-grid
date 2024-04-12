import { fileURLToPath, URL } from 'node:url'
import crypto from 'node:crypto'
import { resolve } from 'node:path'
import { readFileSync } from 'node:fs'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'


const cssModulesHash = crypto
    .createHash('sha256')
    .update(readFileSync(resolve('./package.json')))
    .digest('base64')
    .replaceAll(/[^0-9a-z]/ig, '')
    .substring(0, 6)

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    build: {
        lib: {
            entry: resolve('./src/lib.js'),
            name: 'DndGrid',
            fileName: 'dnd-grid',
        },
        rollupOptions: {
            external: ['vue'],
            output: {
                globals: {
                    vue: 'Vue',
                },
            },
        },
    },
})
