import type { RawScheduleItem } from '../types/schedule'
import { loadCachedSchedule, saveCachedSchedule } from '../utils/storage'

export interface FetchResult {
  data: RawScheduleItem[]
  source: 'live-proxy' | 'cors-proxy' | 'bundled' | 'cache'
  timestamp: number
  error?: string
}

export async function fetchPlanData(forceRefresh = false): Promise<FetchResult> {
  const cached = loadCachedSchedule()

  // If not forcing refresh and cache is younger than 1 hour, use cache
  if (!forceRefresh && cached && cached.data && cached.data.length > 0) {
    const isFresh = Date.now() - cached.timestamp < 1000 * 60 * 60
    if (isFresh) {
      return {
        data: cached.data,
        source: 'cache',
        timestamp: cached.timestamp,
      }
    }
  }

  // 1. Try local dev proxy /api/live-plan
  try {
    const res = await fetch('/api/live-plan', { signal: AbortSignal.timeout(6000) })
    if (res.ok) {
      const json = await res.json()
      if (Array.isArray(json) && json.length > 0) {
        saveCachedSchedule(json, 'live-proxy')
        return {
          data: json,
          source: 'live-proxy',
          timestamp: Date.now(),
        }
      }
    }
  } catch (err) {
    console.info('Live proxy fetch skipped or failed, trying alternatives...', err)
  }

  // 2. Try CORS proxy from browser to DokuWiki page and extract #dokuwiki__content > div > div > pre
  try {
    const targetUrl = 'https://plany.wieik.pk.edu.pl/doku.php?id=start:plany:bazan'
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`
    const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(8000) })
    if (res.ok) {
      const htmlText = await res.text()
      const doc = new DOMParser().parseFromString(htmlText, 'text/html')
      const pre = doc.querySelector('#dokuwiki__content > div > div > pre')
      if (pre && pre.textContent) {
        const json = JSON.parse(pre.textContent)
        if (Array.isArray(json) && json.length > 0) {
          saveCachedSchedule(json, 'cors-proxy')
          return {
            data: json,
            source: 'cors-proxy',
            timestamp: Date.now(),
          }
        }
      }
    }
  } catch (err) {
    console.info('CORS proxy fetch failed, falling back to local snapshot...', err)
  }

  // 3. Fallback to bundled local snapshot
  try {
    const res = await fetch('/schedule_data.json', { signal: AbortSignal.timeout(5000) })
    if (res.ok) {
      const json = await res.json()
      if (Array.isArray(json) && json.length > 0) {
        saveCachedSchedule(json, 'bundled')
        return {
          data: json,
          source: 'bundled',
          timestamp: Date.now(),
        }
      }
    }
  } catch (err) {
    console.error('Failed to load bundled schedule:', err)
  }

  // 4. If all else fails, use whatever is in localStorage
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
