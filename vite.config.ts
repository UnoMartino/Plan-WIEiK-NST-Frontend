import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import https from 'node:https'
import fs from 'node:fs'
import path from 'node:path'

const NOTES_FILE = process.env.NOTES_FILE || path.resolve(process.cwd(), 'data/notes.json')

function readNotesFile() {
  try {
    if (!fs.existsSync(NOTES_FILE)) {
      return { bySession: {}, bySubject: {} }
    }
    const raw = fs.readFileSync(NOTES_FILE, 'utf-8')
    const parsed = JSON.parse(raw)
    return {
      bySession:
        parsed && typeof parsed.bySession === 'object' && parsed.bySession
          ? parsed.bySession
          : {},
      bySubject:
        parsed && typeof parsed.bySubject === 'object' && parsed.bySubject
          ? parsed.bySubject
          : {},
    }
  } catch {
    return { bySession: {}, bySubject: {} }
  }
}

function writeNotesFile(notes: unknown) {
  const dir = path.dirname(NOTES_FILE)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  const tmpFile = `${NOTES_FILE}.tmp`
  fs.writeFileSync(tmpFile, JSON.stringify(notes, null, 2), 'utf-8')
  fs.renameSync(tmpFile, NOTES_FILE)
}

function createNotesMiddleware() {
  return (
    req: { method?: string; on: (ev: string, cb: (chunk?: unknown) => void) => void; destroy: () => void },
    res: { statusCode?: number; setHeader: (k: string, v: string) => void; end: (b: string) => void }
  ) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')

    if (req.method === 'GET') {
      res.statusCode = 200
      res.end(JSON.stringify(readNotesFile()))
      return
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      let body = ''
      req.on('data', (chunk) => {
        body += String(chunk || '')
        if (body.length > 100_000) req.destroy()
      })
      req.on('end', () => {
        try {
          const payload = JSON.parse(body || '{}')
          const { scope, key, text } = payload

          if ((scope !== 'session' && scope !== 'subject') || typeof key !== 'string' || !key.trim()) {
            res.statusCode = 400
            res.end(JSON.stringify({ error: 'Nieprawidłowe parametry notatki.' }))
            return
          }

          const cleanKey = key.trim()
          const cleanText = typeof text === 'string' ? text.trim().slice(0, 4000) : ''
          const notes = readNotesFile() as {
            bySession: Record<string, { text: string; updatedAt: number }>
            bySubject: Record<string, { text: string; updatedAt: number }>
          }
          const bucket = scope === 'session' ? 'bySession' : 'bySubject'

          if (cleanText) {
            notes[bucket][cleanKey] = {
              text: cleanText,
              updatedAt: Date.now(),
            }
          } else {
            delete notes[bucket][cleanKey]
          }

          writeNotesFile(notes)
          res.statusCode = 200
          res.end(JSON.stringify(notes))
        } catch (err: unknown) {
          res.statusCode = 400
          const message = err instanceof Error ? err.message : 'Nieznany błąd'
          res.end(JSON.stringify({ error: 'Błąd zapisu notatki: ' + message }))
        }
      })
      return
    }

    res.statusCode = 405
    res.end(JSON.stringify({ error: 'Method Not Allowed' }))
  }
}

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
      server.middlewares.use('/api/notes', createNotesMiddleware())
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/live-plan', createLivePlanMiddleware())
      server.middlewares.use('/api/notes', createNotesMiddleware())
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), planProxyPlugin()],
})

