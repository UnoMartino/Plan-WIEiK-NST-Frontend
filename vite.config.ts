import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import https from 'node:https'

function createLivePlanMiddleware() {
  return (_req: unknown, res: { statusCode?: number; setHeader: (k: string, v: string) => void; end: (b: string) => void }) => {
    const targetUrl = 'https://plany.wieik.pk.edu.pl/doku.php?id=start:plany:bazan'
    https
      .get(targetUrl, { rejectUnauthorized: false }, (remoteRes) => {
        let data = ''
        remoteRes.on('data', (chunk) => {
          data += chunk
        })
        remoteRes.on('end', () => {
          const matches = data.matchAll(/<pre[^>]*>([\s\S]*?)<\/pre>/gi)
          for (const match of matches) {
            const decoded = match[1]
              .replace(/&quot;/g, '"')
              .replace(/&#039;/g, "'")
              .replace(/&apos;/g, "'")
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&amp;/g, '&')
              .trim()
            try {
              const parsed = JSON.parse(decoded)
              if (Array.isArray(parsed) && parsed.length > 0) {
                res.setHeader('Content-Type', 'application/json; charset=utf-8')
                res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
                res.setHeader('Access-Control-Allow-Origin', '*')
                res.end(JSON.stringify(parsed))
                return
              }
            } catch {
              // Try next <pre> block if any
            }
          }
          res.statusCode = 502
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Valid schedule JSON in pre tag not found in remote page' }))
        })
      })
      .on('error', (err) => {
        res.statusCode = 500
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: err.message }))
      })
  }
}

function planProxyPlugin(): Plugin {
  return {
    name: 'pk-plan-proxy',
    configureServer(server) {
      server.middlewares.use('/api/live-plan', createLivePlanMiddleware())
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/live-plan', createLivePlanMiddleware())
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), planProxyPlugin()],
})

