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
      server.middlewares.use('/api', async (req, res, next) => {
        try {
          const parsedUrl = new URL(req.originalUrl || req.url, `http://${req.headers.host || 'localhost'}`)
          const apiName = parsedUrl.pathname.split('/').pop()

          if (!apiName) return next()

          // Динамический импорт обработчика
          const handlerPath = `/api/${apiName}.js`
          let apiHandler;
          try {
            const handlerModule = await server.ssrLoadModule(handlerPath)
            apiHandler = handlerModule.default
          } catch (e) {
            console.warn(`[API Mock] Route ${handlerPath} not found, skipping...`);
            return next();
          }

          // Эмулируем req.query и req.body (минимально)
          req.query = Object.fromEntries(parsedUrl.searchParams.entries())

          // Для POST запросов в Vite нужно считать body вручную, если нет плагинов
          if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => body += chunk);
            await new Promise(resolve => req.on('end', resolve));
            try { req.body = JSON.parse(body); } catch (e) { req.body = body; }
          }

          // Эмулируем методы Vercel ServerResponse
          res.status = (code) => { res.statusCode = code; return res; }
          res.json = (data) => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
          }
          res.send = (data) => { res.end(data); }
          res.redirect = (code, url) => {
            if (typeof code === 'string') { url = code; code = 302; }
            res.statusCode = code; res.setHeader('Location', url); res.end();
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
