import { fileURLToPath, URL } from 'node:url'
import crypto from 'node:crypto'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const cssModulesHash = crypto.randomBytes(10).toString('base64').substring(0, 6)

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
    }
})
