import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import https from 'node:https'

function planProxyPlugin(): Plugin {
  return {
    name: 'pk-plan-proxy',
    configureServer(server) {
      server.middlewares.use('/api/live-plan', (_req, res) => {
        const targetUrl = 'https://plany.wieik.pk.edu.pl/doku.php?id=start:plany:bazan'
        https
          .get(targetUrl, (remoteRes) => {
            let data = ''
            remoteRes.on('data', (chunk) => {
              data += chunk
            })
            remoteRes.on('end', () => {
              const preMatch = data.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i)
              if (preMatch) {
                const decoded = preMatch[1]
                  .replace(/&quot;/g, '"')
                  .replace(/&#039;/g, "'")
                  .replace(/&apos;/g, "'")
                  .replace(/&lt;/g, '<')
                  .replace(/&gt;/g, '>')
                  .replace(/&amp;/g, '&')
                  .trim()
                res.setHeader('Content-Type', 'application/json; charset=utf-8')
                res.setHeader('Access-Control-Allow-Origin', '*')
                res.end(decoded)
              } else {
                res.statusCode = 502
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ error: 'pre tag not found in remote page' }))
              }
            })
          })
          .on('error', (err) => {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: err.message }))
          })
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), planProxyPlugin()],
})

