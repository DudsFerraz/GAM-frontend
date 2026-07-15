import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import { defineConfig, loadEnv } from 'vite'

const DEFAULT_API_PROXY_TARGET = 'http://localhost:8080'

export default defineConfig(({ mode }) => {
  const { API_PROXY_TARGET = DEFAULT_API_PROXY_TARGET } = loadEnv(
    mode,
    process.cwd(),
    'API_PROXY_',
  )

  return {
    plugins: [react(), tailwindcss(), tanstackRouter()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: API_PROXY_TARGET,
          changeOrigin: true,
          rewrite: (requestPath) => requestPath.replace(/^\/api(?=\/|$)/, '') || '/',
        },
      },
    },
  }
})
