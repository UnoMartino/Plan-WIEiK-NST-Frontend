import type { FilterSettings, RawScheduleItem, ScheduleNotes, Session, NoteItem } from '../types/schedule'

const SETTINGS_KEY = 'wieik_pk_plan_settings_v1'
const CACHE_KEY = 'wieik_pk_plan_data_cache_v1'
const NOTES_KEY = 'wieik_pk_plan_notes_v1'

export const DEFAULT_SETTINGS: FilterSettings = {
  selectedFaculties: ['nIwIKs3'], // default to a popular faculty or empty
  selectedSemesters: [], // empty = all semesters
  selectedGroups: [],
  selectedTypes: ['lecture', 'lab', 'project', 'exercise', 'seminar', 'language', 'other'],
  roomMode: 'all',
  searchQuery: '',
  theme: 'auto',
  viewMode: 'week',
  selectedDate: '2026-10-24', // defaults to an active weekend in the semester
}

export function loadStoredSettings(): FilterSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return DEFAULT_SETTINGS
    const parsed = JSON.parse(raw)
    const sanitizedGroups = Array.isArray(parsed.selectedGroups)
      ? Array.from(
          new Set(
            parsed.selectedGroups
              .flatMap((g: any) => (typeof g === 'string' ? g.split(',') : []))
              .map((g: string) => g.trim())
              .filter(Boolean)
          )
        )
      : []

    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      selectedGroups: sanitizedGroups,
    }
  } catch (e) {
    console.warn('Failed to load settings from localStorage:', e)
    return DEFAULT_SETTINGS
  }
}

export function saveStoredSettings(settings: FilterSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch (e) {
    console.warn('Failed to save settings to localStorage:', e)
  }
}

export interface CachedSchedulePayload {
  timestamp: number
  data: RawScheduleItem[]
  source: 'live-proxy' | 'bundled' | 'cors-proxy'
}

export function loadCachedSchedule(): CachedSchedulePayload | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as CachedSchedulePayload
  } catch (e) {
    console.warn('Failed to read schedule cache:', e)
    return null
  }
}

export function saveCachedSchedule(data: RawScheduleItem[], source: CachedSchedulePayload['source']): void {
  try {
    const payload: CachedSchedulePayload = {
      timestamp: Date.now(),
      data,
      source,
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(payload))
  } catch (e) {
    console.warn('Failed to save schedule cache to localStorage:', e)
  }
}

export const EMPTY_NOTES: ScheduleNotes = {
  bySession: {},
  bySubject: {},
}

export function loadStoredNotes(): ScheduleNotes {
  try {
    const raw = localStorage.getItem(NOTES_KEY)
    if (!raw) return EMPTY_NOTES
    const parsed = JSON.parse(raw)
    return {
      bySession: parsed && typeof parsed.bySession === 'object' && parsed.bySession ? parsed.bySession : {},
      bySubject: parsed && typeof parsed.bySubject === 'object' && parsed.bySubject ? parsed.bySubject : {},
    }
  } catch (e) {
    console.warn('Failed to load notes from localStorage:', e)
    return EMPTY_NOTES
  }
}

export function saveStoredNotes(notes: ScheduleNotes): void {
  try {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes))
  } catch (e) {
    console.warn('Failed to save notes to localStorage:', e)
  }
}

export function getNotesForSession(
  session: Session,
  notes: ScheduleNotes
): { sessionNote?: NoteItem; subjectNote?: NoteItem } {
  const sessionNote = notes.bySession[session.id]
  const subjectKey = session.subject.trim()
  const subjectNote = notes.bySubject[subjectKey]
  return {
    sessionNote: sessionNote?.text?.trim() ? sessionNote : undefined,
    subjectNote: subjectNote?.text?.trim() ? subjectNote : undefined,
  }
}
