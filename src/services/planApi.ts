import type { RawScheduleItem } from '../types/schedule'
import { loadCachedSchedule, saveCachedSchedule } from '../utils/storage'

export interface FetchResult {
  data: RawScheduleItem[]
  source: 'live-proxy' | 'cors-proxy' | 'bundled' | 'cache'
  timestamp: number
  error?: string
}

const TARGET_URL = 'https://plany.wieik.pk.edu.pl/doku.php?id=start:plany:bazan'

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .trim()
}

function parseSchedulePayload(rawText: string): RawScheduleItem[] | null {
  const trimmed = rawText.trim()
  if (!trimmed) return null

  // 1. Direct JSON array (e.g. from Vite dev middleware)
  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    } catch {
      // Fall through to HTML parsing
    }
  }

  // 2. HTML page from DokuWiki (e.g. from Nginx /api/live-plan proxy or CORS proxy)
  try {
    const doc = new DOMParser().parseFromString(trimmed, 'text/html')
    const preElements = doc.querySelectorAll('#dokuwiki__content pre, pre')

    for (const pre of Array.from(preElements)) {
      if (pre.textContent) {
        try {
          const parsed = JSON.parse(pre.textContent.trim())
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed
          }
        } catch {
          // Try next <pre> element
        }
      }
    }
  } catch {
    // Fall through to regex extraction
  }

  // 3. Fallback regex extraction for <pre> tag
  const preMatches = trimmed.matchAll(/<pre[^>]*>([\s\S]*?)<\/pre>/gi)
  for (const match of preMatches) {
    try {
      const parsed = JSON.parse(decodeHtmlEntities(match[1]))
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    } catch {
      // Try next match
    }
  }

  return null
}

export async function fetchPlanData(forceRefresh = false): Promise<FetchResult> {
  const cached = loadCachedSchedule()

  // If not forcing refresh and live cache is younger than 1 hour, use cache
  if (
    !forceRefresh &&
    cached &&
    cached.data &&
    cached.data.length > 0 &&
    cached.source !== 'bundled'
  ) {
    const isFresh = Date.now() - cached.timestamp < 1000 * 60 * 60
    if (isFresh) {
      return {
        data: cached.data,
        source: 'cache',
        timestamp: cached.timestamp,
      }
    }
  }

  // 1. Try local/Nginx proxy /api/live-plan
  try {
    const res = await fetch(`/api/live-plan?_=${Date.now()}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    })
    if (res.ok) {
      const text = await res.text()
      const parsed = parseSchedulePayload(text)
      if (parsed) {
        saveCachedSchedule(parsed, 'live-proxy')
        return {
          data: parsed,
          source: 'live-proxy',
          timestamp: Date.now(),
        }
      }
    }
  } catch (err) {
    console.info('Live proxy fetch skipped or failed, trying alternatives...', err)
  }

  // 2. Try CORS proxies from browser to DokuWiki page
  const corsProxies = [
    `https://api.allorigins.win/raw?url=${encodeURIComponent(TARGET_URL)}&_=${Date.now()}`,
    `https://corsproxy.io/?url=${encodeURIComponent(TARGET_URL)}`,
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(TARGET_URL)}`,
  ]

  for (const proxyUrl of corsProxies) {
    try {
      const res = await fetch(proxyUrl, {
        cache: 'no-store',
        signal: AbortSignal.timeout(8000),
      })
      if (res.ok) {
        const htmlText = await res.text()
        const parsed = parseSchedulePayload(htmlText)
        if (parsed) {
          saveCachedSchedule(parsed, 'cors-proxy')
          return {
            data: parsed,
            source: 'cors-proxy',
            timestamp: Date.now(),
          }
        }
      }
    } catch (err) {
      console.info(`CORS proxy fetch failed (${proxyUrl}), trying next...`, err)
    }
  }

  // 3. If we already have cached live data in localStorage, prefer it over an older static bundle
  if (cached && cached.data && cached.data.length > 0 && cached.source !== 'bundled') {
    return {
      data: cached.data,
      source: 'cache',
      timestamp: cached.timestamp,
      error: 'Nie udało się połączyć z serwerem uczelni. Użyto ostatnio zapisanych danych z pamięci podręcznej.',
    }
  }

  // 4. Fallback to bundled local snapshot
  try {
    const res = await fetch('/schedule_data.json', {
      cache: 'no-cache',
      signal: AbortSignal.timeout(5000),
    })
    if (res.ok) {
      const json = await res.json()
      if (Array.isArray(json) && json.length > 0) {
        const fallbackTimestamp = cached?.timestamp || Date.now()
        if (!cached) {
          saveCachedSchedule(json, 'bundled')
        }
        return {
          data: json,
          source: 'bundled',
          timestamp: fallbackTimestamp,
          error: forceRefresh
            ? 'Nie udało się pobrać planu na żywo z serwera uczelni. Wczytano wbudowaną kopię zapasową.'
            : undefined,
        }
      }
    }
  } catch (err) {
    console.error('Failed to load bundled schedule:', err)
  }

  // 5. If all else fails, use whatever is in localStorage
  if (cached && cached.data && cached.data.length > 0) {
    return {
      data: cached.data,
      source: 'cache',
      timestamp: cached.timestamp,
      error: 'Nie udało się pobrać najnowszych danych. Użyto danych z pamięci podręcznej.',
    }
  }

  throw new Error('Nie udało się załadować planu zajęć. Sprawdź połączenie z internetem.')
}
