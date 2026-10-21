import type { FilterSettings, RawScheduleItem } from '../types/schedule'

const SETTINGS_KEY = 'wieik_pk_plan_settings_v1'
const CACHE_KEY = 'wieik_pk_plan_data_cache_v1'

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
