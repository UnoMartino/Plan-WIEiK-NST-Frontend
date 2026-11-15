#!/usr/bin/env node
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const NOTES_FILE = process.env.NOTES_FILE || path.resolve(process.cwd(), 'data/notes.json')
const PORT = Number(process.env.NOTES_PORT || 3001)

const EMPTY_NOTES = {
  bySession: {},
  bySubject: {},
}

export function readNotesFromDisk(filePath = NOTES_FILE) {
  try {
    if (!fs.existsSync(filePath)) {
      return { bySession: {}, bySubject: {} }
    }
    const raw = fs.readFileSync(filePath, 'utf-8')
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
  } catch (err) {
    console.error('Failed to read notes file:', err)
    return { bySession: {}, bySubject: {} }
  }
}

export function writeNotesToDisk(notes, filePath = NOTES_FILE) {
  const dir = path.dirname(filePath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  const tmpFile = `${filePath}.tmp`
  fs.writeFileSync(tmpFile, JSON.stringify(notes, null, 2), 'utf-8')
  fs.renameSync(tmpFile, filePath)
}

export function createNotesMiddleware(filePath = NOTES_FILE) {
  return (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')

    if (req.method === 'GET') {
      const notes = readNotesFromDisk(filePath)
      res.statusCode = 200
      res.end(JSON.stringify(notes))
      return
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      let body = ''
      req.on('data', (chunk) => {
        body += chunk
        if (body.length > 100_000) {
          req.destroy()
        }
      })
      req.on('end', () => {
        try {
          const payload = JSON.parse(body || '{}')
          const { scope, key, text } = payload

          if ((scope !== 'session' && scope !== 'subject') || typeof key !== 'string' || !key.trim()) {
            res.statusCode = 400
            res.end(JSON.stringify({ error: 'Nieprawidłowe parametry notatki (scope, key).' }))
            return
          }

          const cleanKey = key.trim()
          const cleanText = typeof text === 'string' ? text.trim().slice(0, 4000) : ''
          const notes = readNotesFromDisk(filePath)
          const bucket = scope === 'session' ? 'bySession' : 'bySubject'

          if (cleanText) {
            notes[bucket][cleanKey] = {
              text: cleanText,
              updatedAt: Date.now(),
            }
          } else {
            delete notes[bucket][cleanKey]
          }

          writeNotesToDisk(notes, filePath)
          res.statusCode = 200
          res.end(JSON.stringify(notes))
        } catch (err) {
          res.statusCode = 400
          res.end(JSON.stringify({ error: 'Błąd zapisu notatki: ' + (err?.message || 'Nieznany błąd') }))
        }
      })
      return
    }

    res.statusCode = 405
    res.end(JSON.stringify({ error: 'Method Not Allowed' }))
  }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) {
  const handler = createNotesMiddleware(NOTES_FILE)
  const server = http.createServer((req, res) => {
    if (req.url && req.url.startsWith('/api/notes')) {
      handler(req, res)
    } else {
      res.statusCode = 404
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      res.end(JSON.stringify(EMPTY_NOTES))
    }
  })

  server.listen(PORT, '127.0.0.1', () => {
    console.log(`Serwer notatek działa na http://127.0.0.1:${PORT} (plik: ${NOTES_FILE})`)
  })
}

