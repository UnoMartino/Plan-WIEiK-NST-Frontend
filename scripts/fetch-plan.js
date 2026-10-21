#!/usr/bin/env node
/**
 * Skrypt do cyklicznego pobierania aktualnego planu z DokuWiki PK
 * Uruchamianie: node scripts/fetch-plan.js [ścieżka_docelowa]
 */
import https from 'node:https'
import fs from 'node:fs'
import path from 'node:path'

const TARGET_URL = 'https://plany.wieik.pk.edu.pl/doku.php?id=start:plany:bazan'
const OUT_FILE = process.argv[2] || path.resolve(process.cwd(), 'dist/schedule_data.json')

console.log(`Pobieranie planu z: ${TARGET_URL}`)

https.get(TARGET_URL, (res) => {
  let html = ''
  res.on('data', (chunk) => { html += chunk })
  res.on('end', () => {
    const preMatch = html.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i)
    if (!preMatch) {
      console.error('Błąd: Nie znaleziono znacznika <pre> na stronie!')
      process.exit(1)
    }

    const decoded = preMatch[1]
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .trim()

    try {
      const parsed = JSON.parse(decoded)
      fs.writeFileSync(OUT_FILE, JSON.stringify(parsed, null, 2), 'utf-8')
      console.log(`Sukces! Zapisano ${parsed.length} przedmiotów do ${OUT_FILE}`)
    } catch (e) {
      console.error('Błąd parsowania JSON:', e.message)
      process.exit(1)
    }
  })
}).on('error', (err) => {
  console.error('Błąd połączenia:', err.message)
  process.exit(1)
})
