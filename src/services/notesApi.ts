import type { NoteScope, ScheduleNotes } from '../types/schedule'
import { loadStoredNotes, saveStoredNotes } from '../utils/storage'

function sanitizeNotesPayload(raw: unknown): ScheduleNotes {
  const obj = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  return {
    bySession:
      obj.bySession && typeof obj.bySession === 'object'
        ? (obj.bySession as ScheduleNotes['bySession'])
        : {},
    bySubject:
      obj.bySubject && typeof obj.bySubject === 'object'
        ? (obj.bySubject as ScheduleNotes['bySubject'])
        : {},
  }
}

export async function fetchServerNotes(): Promise<ScheduleNotes> {
  try {
    const res = await fetch('/api/notes', {
      method: 'GET',
      cache: 'no-store',
      signal: AbortSignal.timeout(6000),
    })
    if (res.ok) {
      const json = await res.json()
      const sanitized = sanitizeNotesPayload(json)
      saveStoredNotes(sanitized)
      return sanitized
    }
  } catch (err) {
    console.warn('Nie udało się pobrać notatek z serwera, użyto pamięci podręcznej:', err)
  }
  return loadStoredNotes()
}

export async function updateServerNote(
  scope: NoteScope,
  key: string,
  text: string
): Promise<ScheduleNotes> {
  const res = await fetch('/api/notes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ scope, key, text }),
    signal: AbortSignal.timeout(8000),
  })

  if (!res.ok) {
    let errMsg = 'Nie udało się zapisać notatki na serwerze.'
    try {
      const errJson = await res.json()
      if (errJson?.error) errMsg = errJson.error
    } catch {
      // Ignore JSON parse error
    }
    throw new Error(errMsg)
  }

  const json = await res.json()
  const sanitized = sanitizeNotesPayload(json)
  saveStoredNotes(sanitized)
  return sanitized
}

