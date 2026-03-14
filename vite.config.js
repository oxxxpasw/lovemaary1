import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { URL } from 'url'
import path from 'path'

// Простой плагин для эмуляции Vercel Serverless Functions локально
function vercelApiMock() {
  return {
    name: 'vercel-api-mock',
    config(config, env) {
      const mode = env.mode || process.env.NODE_ENV || 'development';
      const envVars = loadEnv(mode, process.cwd(), '');
      Object.assign(process.env, envVars);
    },
    configureServer(server) {
      server.middlewares.use('/api/get-avatar', async (req, res, next) => {
        try {
          // Динамический импорт обработчика, чтобы всегда видеть свежий код
          const handlerModule = await server.ssrLoadModule('/api/get-avatar.js')
          const apiHandler = handlerModule.default

          const parsedUrl = new URL(req.originalUrl || req.url, `http://${req.headers.host || 'localhost'}`)

          // Эмулируем req.query
          req.query = Object.fromEntries(parsedUrl.searchParams.entries())

          // Эмулируем методы Vercel ServerResponse
          res.status = (code) => {
            res.statusCode = code
            return res
          }
          res.json = (data) => {
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(data))
          }
          res.send = (data) => {
            res.end(data)
          }
          res.redirect = (code, url) => {
            if (typeof code === 'string') {
              url = code;
              code = 302;
            }
            res.statusCode = code
            res.setHeader('Location', url)
            res.end()
          }

          await apiHandler(req, res)
        } catch (error) {
          console.error('API Error:', error)
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: error.message }))
        }
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), vercelApiMock()],
  server: {
    host: true, // Exposes the server on the local network
    port: 5173
  }
})
