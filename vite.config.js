import { fileURLToPath, URL } from 'node:url'
import crypto from 'node:crypto'
import { resolve } from 'node:path'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const cssModulesHash = crypto.randomBytes(20).toString('base64').replaceAll(/[^0-9a-z]/ig, '').substring(0, 6)

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue({
            reactivityTransform: true
        })
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    css: {
        modules: {
            generateScopedName (name) {
                return `dnd-grid-${cssModulesHash}__${name}`
            }
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
