export interface RawTermin {
  start: string
  end: string
  startDate: string
  startTime: string
  group: string
  instructor: string
  room: string
  duration: string
}

export interface RawScheduleItem {
  id: string
  title: string
  eventType: string
  instructor: string
  faculty: string
  terminy: RawTermin[]
}

export type GroupCategory =
  | 'lecture'   // Wykład (W)
  | 'lab'       // Laboratorium (L, Lk)
  | 'project'   // Projekt (P)
  | 'exercise'  // Ćwiczenia (Ć, C)
  | 'seminar'   // Seminarium (S)
  | 'language'  // Lektorat (Lek)
  | 'other'     // Inne (K, ai, itp.)

export interface Session {
  id: string
  parentItemId: string
  subject: string
  rawTitle: string
  faculties: string[]
  semester?: number // Semester 1 to 8
  instructor: string
  room: string
  isRemote: boolean
  group: string
  groups: string[] // Normalized individual groups (e.g. ['L1', 'L2', 'L3'])
  groupCategory: GroupCategory
  startDate: string // YYYY-MM-DD
  startTime: string // HH:mm
  endTime: string // HH:mm
  startTimestamp: number
  endTimestamp: number
  duration: string
  durationMinutes: number
  dayOfWeek: number // 0 = Sun, 1 = Mon, ..., 5 = Fri, 6 = Sat
}

export interface WeekendZjazd {
  number: number
  label: string
  dates: string[] // list of dates YYYY-MM-DD
  fridayDate: string
  saturdayDate: string
  sundayDate: string
  sessionCount: number
}

export interface FilterSettings {
  selectedFaculties: string[]
  selectedSemesters: number[] // Semesters 1 to 8
  selectedGroups: string[]
  selectedTypes: GroupCategory[]
  roomMode: 'all' | 'campus' | 'remote'
  searchQuery: string
  theme: 'auto' | 'light' | 'dark'
  viewMode: 'day' | 'week' | 'month'
  selectedDate: string
}

export interface FacultyMeta {
  code: string
  name: string
  shortName: string
  degree: 'I' | 'II' | 'podyplomowe'
  semester?: number
  specialization?: string
}
