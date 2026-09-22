import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CONFIG_FILE = path.resolve(__dirname, 'src/data/config.json')

/**
 * 后台 `/admin` 在 dev 模式下保存配置时，会 POST 到这里。
 * 写入 config.json 后通知 Vite 全量刷新，所有打开的页面都会看到新数据。
 * 生产构建无影响（接口不存在，前台直接用打包进 dist 的 config.json）。
 */
function devConfigApiPlugin() {
  return {
    name: 'dev-config-api',
    configureServer(server: any) {
      console.log('[dev-config-api] plugin loaded, CONFIG_FILE =', CONFIG_FILE)
      server.middlewares.use(async (req: any, res: any, next: any) => {
        const url = req.url || ''
        try { fs.appendFileSync(path.resolve(__dirname, 'cb-debug.log'), `[${new Date().toISOString()}] ${req.method} ${url}\n`) } catch {}
        if (!url.startsWith('/api/config')) return next()

        if (req.method === 'GET' && (url === '/api/config' || url.startsWith('/api/config?'))) {
          try {
            const raw = fs.readFileSync(CONFIG_FILE, 'utf8')
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.setHeader('Cache-Control', 'no-store')
            res.end(raw)
          } catch (e: any) {
            res.statusCode = 500
            res.end(JSON.stringify({ ok: false, error: e.message }))
          }
          return
        }

        if (req.method === 'POST' && (url === '/api/config' || url.startsWith('/api/config?'))) {
          const chunks: Buffer[] = []
          for await (const c of req) chunks.push(c as Buffer)
          const body = Buffer.concat(chunks).toString('utf8')
          try {
            const parsed = JSON.parse(body)
            fs.writeFileSync(CONFIG_FILE, JSON.stringify(parsed, null, 2) + '\n', 'utf8')
            server.ws.send({ type: 'full-reload' })
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ ok: true }))
          } catch (e: any) {
            res.statusCode = 400
            res.end(JSON.stringify({ ok: false, error: e.message }))
          }
          return
        }

        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), devConfigApiPlugin()],
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    chunkSizeWarningLimit: 1500,
  },
  server: {
    port: 5173,
    host: true,
  },
})