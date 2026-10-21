import type {
  FacultyMeta,
  GroupCategory,
  RawScheduleItem,
  Session,
  WeekendZjazd,
} from '../types/schedule'
import { formatDateToYMD, formatShortDateDM } from './dateUtils'

// Comprehensive metadata for all semesters 1 to 8
export const FACULTY_METADATA: Record<string, FacultyMeta> = {
  // Informatyka w Inżynierii Komputerowej (I stopień, semestry 1-8)
  nIwIKs1: { code: 'nIwIKs1', name: 'Informatyka w Inżynierii Komputerowej, Sem. 1', shortName: 'IwIK Sem. 1', degree: 'I', semester: 1 },
  nIwIKs2: { code: 'nIwIKs2', name: 'Informatyka w Inżynierii Komputerowej, Sem. 2', shortName: 'IwIK Sem. 2', degree: 'I', semester: 2 },
  nIwIKs3: { code: 'nIwIKs3', name: 'Informatyka w Inżynierii Komputerowej, Sem. 3', shortName: 'IwIK Sem. 3', degree: 'I', semester: 3 },
  nIwIKs4: { code: 'nIwIKs4', name: 'Informatyka w Inżynierii Komputerowej, Sem. 4', shortName: 'IwIK Sem. 4', degree: 'I', semester: 4 },
  nIwIKs5: { code: 'nIwIKs5', name: 'Informatyka w Inżynierii Komputerowej, Sem. 5', shortName: 'IwIK Sem. 5', degree: 'I', semester: 5 },
  nIwIKs6: { code: 'nIwIKs6', name: 'Informatyka w Inżynierii Komputerowej, Sem. 6', shortName: 'IwIK Sem. 6', degree: 'I', semester: 6 },
  nIwIKs7: { code: 'nIwIKs7', name: 'Informatyka w Inżynierii Komputerowej, Sem. 7', shortName: 'IwIK Sem. 7', degree: 'I', semester: 7 },
  nIwIKs8: { code: 'nIwIKs8', name: 'Informatyka w Inżynierii Komputerowej, Sem. 8', shortName: 'IwIK Sem. 8', degree: 'I', semester: 8 },

  // Elektrotechnika i Automatyka (I stopień, semestry 1-8)
  nEiAs1: { code: 'nEiAs1', name: 'Elektrotechnika i Automatyka, Sem. 1', shortName: 'EiA Sem. 1', degree: 'I', semester: 1 },
  nEiAs2: { code: 'nEiAs2', name: 'Elektrotechnika i Automatyka, Sem. 2', shortName: 'EiA Sem. 2', degree: 'I', semester: 2 },
  nEiAs3: { code: 'nEiAs3', name: 'Elektrotechnika i Automatyka, Sem. 3', shortName: 'EiA Sem. 3', degree: 'I', semester: 3 },
  nEiAs4: { code: 'nEiAs4', name: 'Elektrotechnika i Automatyka, Sem. 4', shortName: 'EiA Sem. 4', degree: 'I', semester: 4 },
  nEiAs5: { code: 'nEiAs5', name: 'Elektrotechnika i Automatyka, Sem. 5', shortName: 'EiA Sem. 5', degree: 'I', semester: 5 },
  nEiAs6: { code: 'nEiAs6', name: 'Elektrotechnika i Automatyka, Sem. 6', shortName: 'EiA Sem. 6', degree: 'I', semester: 6 },
  nEiAs7: { code: 'nEiAs7', name: 'Elektrotechnika i Automatyka, Sem. 7', shortName: 'EiA Sem. 7', degree: 'I', semester: 7 },
  nEiAs8: { code: 'nEiAs8', name: 'Elektrotechnika i Automatyka, Sem. 8', shortName: 'EiA Sem. 8', degree: 'I', semester: 8 },

  // Specjalności EiA
  nEiAs7A: { code: 'nEiAs7A', name: 'Elektrotechnika i Automatyka (Automatyka), Sem. 7', shortName: 'EiA Sem. 7 (Aut)', degree: 'I', semester: 7, specialization: 'Automatyka' },
  nEiAs8A: { code: 'nEiAs8A', name: 'Elektrotechnika i Automatyka (Automatyka), Sem. 8', shortName: 'EiA Sem. 8 (Aut)', degree: 'I', semester: 8, specialization: 'Automatyka' },
  nEiAs7I: { code: 'nEiAs7I', name: 'Elektrotechnika i Automatyka (Infotronika), Sem. 7', shortName: 'EiA Sem. 7 (Info)', degree: 'I', semester: 7, specialization: 'Infotronika' },
  nEiAs8I: { code: 'nEiAs8I', name: 'Elektrotechnika i Automatyka (Infotronika), Sem. 8', shortName: 'EiA Sem. 8 (Info)', degree: 'I', semester: 8, specialization: 'Infotronika' },

  // Elektrotechnika i Automatyka (II stopień mgr, semestry 1-4)
  n2sEiAs1: { code: 'n2sEiAs1', name: 'Elektrotechnika i Automatyka mgr, Sem. 1', shortName: 'EiA II st. Sem. 1', degree: 'II', semester: 1 },
  n2sEiAs2: { code: 'n2sEiAs2', name: 'Elektrotechnika i Automatyka mgr, Sem. 2', shortName: 'EiA II st. Sem. 2', degree: 'II', semester: 2 },
  n2sEiAs3: { code: 'n2sEiAs3', name: 'Elektrotechnika i Automatyka mgr, Sem. 3', shortName: 'EiA II st. Sem. 3', degree: 'II', semester: 3 },
  n2sEiAs4: { code: 'n2sEiAs4', name: 'Elektrotechnika i Automatyka mgr, Sem. 4', shortName: 'EiA II st. Sem. 4', degree: 'II', semester: 4 },

  n2sEiAs1EE: { code: 'n2sEiAs1EE', name: 'Elektrotechnika i Automatyka mgr (Elektroenergetyka), Sem. 1', shortName: 'EiA II st. EE Sem. 1', degree: 'II', semester: 1, specialization: 'Elektroenergetyka' },
  n2sEiAs2EE: { code: 'n2sEiAs2EE', name: 'Elektrotechnika i Automatyka mgr (Elektroenergetyka), Sem. 2', shortName: 'EiA II st. EE Sem. 2', degree: 'II', semester: 2, specialization: 'Elektroenergetyka' },
  n2sEiAs3EE: { code: 'n2sEiAs3EE', name: 'Elektrotechnika i Automatyka mgr (Elektroenergetyka), Sem. 3', shortName: 'EiA II st. EE Sem. 3', degree: 'II', semester: 3, specialization: 'Elektroenergetyka' },
  n2sEiAs4EE: { code: 'n2sEiAs4EE', name: 'Elektrotechnika i Automatyka mgr (Elektroenergetyka), Sem. 4', shortName: 'EiA II st. EE Sem. 4', degree: 'II', semester: 4, specialization: 'Elektroenergetyka' },

  n2sEiAs1_SMiDUE: { code: 'n2sEiAs1_SMiDUE', name: 'Elektrotechnika i Automatyka mgr (SMiDUE), Sem. 1', shortName: 'EiA II st. SM Sem. 1', degree: 'II', semester: 1, specialization: 'SMiDUE' },
  n2sEiAs2_SMiDUE: { code: 'n2sEiAs2_SMiDUE', name: 'Elektrotechnika i Automatyka mgr (SMiDUE), Sem. 2', shortName: 'EiA II st. SM Sem. 2', degree: 'II', semester: 2, specialization: 'SMiDUE' },
  n2sEiAs3_SMiDUE: { code: 'n2sEiAs3_SMiDUE', name: 'Elektrotechnika i Automatyka mgr (SMiDUE), Sem. 3', shortName: 'EiA II st. SM Sem. 3', degree: 'II', semester: 3, specialization: 'SMiDUE' },
  n2sEiAs4_SMiDUE: { code: 'n2sEiAs4_SMiDUE', name: 'Elektrotechnika i Automatyka mgr (SMiDUE), Sem. 4', shortName: 'EiA II st. SM Sem. 4', degree: 'II', semester: 4, specialization: 'SMiDUE' },

  // Infotronika (II stopień mgr, semestry 1-4)
  n2sIts1: { code: 'n2sIts1', name: 'Infotronika mgr, Sem. 1', shortName: 'Infotronika II st. Sem. 1', degree: 'II', semester: 1 },
  n2sIts2: { code: 'n2sIts2', name: 'Infotronika mgr, Sem. 2', shortName: 'Infotronika II st. Sem. 2', degree: 'II', semester: 2 },
  n2sIts3: { code: 'n2sIts3', name: 'Infotronika mgr, Sem. 3', shortName: 'Infotronika II st. Sem. 3', degree: 'II', semester: 3 },
  n2sIts4: { code: 'n2sIts4', name: 'Infotronika mgr, Sem. 4', shortName: 'Infotronika II st. Sem. 4', degree: 'II', semester: 4 },

  // Studia podyplomowe
  pPWSI: { code: 'pPWSI', name: 'Praktyczne Wykorzystanie AI (Studia podyplomowe)', shortName: 'Podypl. AI (PWSI)', degree: 'podyplomowe' },
  pCITS: { code: 'pCITS', name: 'Cyberbezpieczeństwo i Technologie Sieciowe (Podyplomowe)', shortName: 'Podypl. Cyber (CITS)', degree: 'podyplomowe' },
  pBIKIKSP: { code: 'pBIKIKSP', name: 'Bezpieczeństwo Infrastruktury Krytycznej (Podyplomowe)', shortName: 'Podypl. BIK (BIKIKSP)', degree: 'podyplomowe' },
  pWRdETS: { code: 'pWRdETS', name: 'Wodór i Rozwiązania dla E-transportu Szynowego (Podyplomowe)', shortName: 'Podypl. Wodór (WRdETS)', degree: 'podyplomowe' },
}

export function extractSemesterFromCode(code: string): number | null {
  const match = code.match(/s([1-8])/i)
  if (match) {
    return parseInt(match[1], 10)
  }
  return null
}

export function resolveFacultyMeta(code: string): FacultyMeta {
  if (FACULTY_METADATA[code]) {
    return FACULTY_METADATA[code]
  }

  const semester = extractSemesterFromCode(code)
  const isSecondDegree = code.startsWith('n2s')
  const isPostgraduate = code.startsWith('p')

  let fieldName = 'Kierunek'
  if (code.includes('IwIK')) fieldName = 'Informatyka w Inżynierii Komputerowej'
  else if (code.includes('EiA')) fieldName = 'Elektrotechnika i Automatyka'
  else if (code.includes('It')) fieldName = 'Infotronika'
  else if (isPostgraduate) fieldName = 'Studia podyplomowe'

  const degree = isPostgraduate ? 'podyplomowe' : isSecondDegree ? 'II' : 'I'
  const semText = semester ? `, Sem. ${semester}` : ''
  const degText = isPostgraduate ? ' (Podyplomowe)' : isSecondDegree ? ' (II st. mgr)' : ' (I st.)'

  return {
    code,
    name: `${fieldName}${semText}${degText}`,
    shortName: `${fieldName.split(' ')[0]} ${semText}`.trim(),
    degree,
    semester: semester || undefined,
  }
}

export function getFacultyLabel(code: string): string {
  const meta = resolveFacultyMeta(code)
  return `${meta.name} (${code})`
}

export function getFacultyShortLabel(code: string): string {
  const meta = resolveFacultyMeta(code)
  return meta.shortName
}

export function getGroupCategory(group: string): GroupCategory {
  const clean = group.trim()
  if (clean.startsWith('Lek')) return 'language'
  if (clean.startsWith('Lk') || clean.startsWith('L')) return 'lab'
  if (clean.startsWith('W')) return 'lecture'
  if (clean.startsWith('P')) return 'project'
  if (clean.startsWith('Ć') || clean.startsWith('C')) return 'exercise'
  if (clean.startsWith('S')) return 'seminar'
  return 'other'
}

export function getCategoryMeta(category: GroupCategory): {
  label: string
  color: string
  bgLight: string
  bgDark: string
} {
  switch (category) {
    case 'lecture':
      return {
        label: 'Wykład',
        color: '#007AFF',
        bgLight: 'rgba(0, 122, 255, 0.12)',
        bgDark: 'rgba(10, 132, 255, 0.22)',
      }
    case 'lab':
      return {
        label: 'Laboratorium',
        color: '#34C759',
        bgLight: 'rgba(52, 199, 89, 0.12)',
        bgDark: 'rgba(48, 209, 88, 0.22)',
      }
    case 'project':
      return {
        label: 'Projekt',
        color: '#AF52DE',
        bgLight: 'rgba(175, 82, 222, 0.12)',
        bgDark: 'rgba(191, 90, 242, 0.22)',
      }
    case 'exercise':
      return {
        label: 'Ćwiczenia',
        color: '#FF9500',
        bgLight: 'rgba(255, 149, 0, 0.12)',
        bgDark: 'rgba(255, 159, 10, 0.22)',
      }
    case 'seminar':
      return {
        label: 'Seminarium',
        color: '#5856D6',
        bgLight: 'rgba(88, 86, 214, 0.12)',
        bgDark: 'rgba(94, 92, 230, 0.22)',
      }
    case 'language':
      return {
        label: 'Lektorat',
        color: '#30B0C7',
        bgLight: 'rgba(48, 176, 199, 0.12)',
        bgDark: 'rgba(64, 200, 224, 0.22)',
      }
    default:
      return {
        label: 'Inne',
        color: '#FF2D55',
        bgLight: 'rgba(255, 45, 85, 0.12)',
        bgDark: 'rgba(255, 55, 95, 0.22)',
      }
  }
}

export function isRemoteRoom(room: string): boolean {
  if (!room) return false
  const r = room.toLowerCase()
  return (
    r.includes('teams') ||
    r.includes('zoom') ||
    r.includes('26-27') ||
    r.includes('wieik_') ||
    r.includes('ns_') ||
    r.includes('online') ||
    r.includes('zdalnie')
  )
}

export function formatRoomDisplay(room: string): {
  displayName: string
  subText?: string
  isRemote: boolean
} {
  if (!room || room.trim() === '') {
    return { displayName: 'Brak sali', isRemote: false }
  }

  const trimmed = room.trim()
  if (isRemoteRoom(trimmed)) {
    if (trimmed.toLowerCase().includes('zoom')) {
      return {
        displayName: 'Zoom (Zdalnie)',
        subText: trimmed,
        isRemote: true,
      }
    }
    return {
      displayName: 'MS Teams (Zdalnie)',
      subText: trimmed,
      isRemote: true,
    }
  }

  // Physical campus room
  let cleanName = trimmed
  if (!cleanName.toLowerCase().startsWith('sala')) {
    cleanName = `Sala ${cleanName}`
  }
  return {
    displayName: cleanName,
    subText: 'Kampus PK',
    isRemote: false,
  }
}

export function parseDurationToMinutes(durationStr: string): number {
  if (!durationStr) return 90
  const parts = durationStr.split(':')
  if (parts.length >= 2) {
    const hours = parseInt(parts[0], 10) || 0
    const mins = parseInt(parts[1], 10) || 0
    return hours * 60 + mins
  }
  return 90
}

export function formatMinutesToDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h > 0 && m > 0) return `${h}h ${m}m`
  if (h > 0) return `${h}h`
  return `${m}m`
}

export function parseScheduleData(rawItems: RawScheduleItem[]): Session[] {
  const sessions: Session[] = []

  rawItems.forEach((item, itemIdx) => {
    const faculties = (item.faculty || '')
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean)

    const baseSubject = item.eventType || item.title || 'Zajęcia'

    item.terminy?.forEach((t, termIdx) => {
      const startDate = t.startDate
      const dayOfWeek = new Date(startDate + 'T12:00:00').getDay()
      const startTime = t.startTime || (t.start ? t.start.substring(11, 16) : '08:00')
      const endTime = t.end ? t.end.substring(11, 16) : ''

      const startTimestamp = new Date(t.start || `${startDate}T${startTime}:00`).getTime()
      const endTimestamp = t.end
        ? new Date(t.end).getTime()
        : startTimestamp + parseDurationToMinutes(t.duration) * 60000

      const rawGroup = t.group || 'W'
      const groups = rawGroup
        .split(',')
        .map((g) => g.trim())
        .filter(Boolean)
      const groupCategory = getGroupCategory(groups[0] || rawGroup)
      const instructor = t.instructor || item.instructor || 'Brak danych'
      const room = t.room || ''
      const isRemote = isRemoteRoom(room)

      let detectedSemester: number | undefined
      for (const fac of faculties) {
        const sem = extractSemesterFromCode(fac)
        if (sem) {
          detectedSemester = sem
          break
        }
      }

      sessions.push({
        id: `${item.id || itemIdx}_${termIdx}`,
        parentItemId: item.id || String(itemIdx),
        subject: baseSubject,
        rawTitle: item.title,
        faculties,
        semester: detectedSemester,
        instructor,
        room,
        isRemote,
        group: rawGroup,
        groups: groups.length > 0 ? groups : ['W'],
        groupCategory,
        startDate,
        startTime,
        endTime,
        startTimestamp,
        endTimestamp,
        duration: t.duration,
        durationMinutes: parseDurationToMinutes(t.duration),
        dayOfWeek,
      })
    })
  })

  // Sort chronologically
  sessions.sort((a, b) => a.startTimestamp - b.startTimestamp)
  return sessions
}

export function buildWeekendZjazdy(sessions: Session[]): WeekendZjazd[] {
  const dateSet = new Set<string>()
  sessions.forEach((s) => dateSet.add(s.startDate))
  const sortedDates = Array.from(dateSet).sort()

  if (sortedDates.length === 0) return []

  // Group dates that are close together into weekends
  const clusters: string[][] = []
  let currentCluster: string[] = []

  sortedDates.forEach((dStr) => {
    if (currentCluster.length === 0) {
      currentCluster.push(dStr)
    } else {
      const last = new Date(currentCluster[currentCluster.length - 1] + 'T00:00:00')
      const curr = new Date(dStr + 'T00:00:00')
      const diffDays = Math.round((curr.getTime() - last.getTime()) / (1000 * 3600 * 24))

      if (diffDays <= 2) {
        currentCluster.push(dStr)
      } else {
        clusters.push(currentCluster)
        currentCluster = [dStr]
      }
    }
  })
  if (currentCluster.length > 0) {
    clusters.push(currentCluster)
  }

  return clusters.map((clusterDates, index) => {
    // Determine the Friday, Saturday, Sunday of this weekend
    // Find the Sunday or Saturday of the cluster
    const firstDate = new Date(clusterDates[0] + 'T00:00:00')
    const dayOfW = firstDate.getDay() // 0=Sun, 5=Fri, 6=Sat

    let fridayDate = ''
    let saturdayDate = ''
    let sundayDate = ''

    clusterDates.forEach((d) => {
      const dObj = new Date(d + 'T00:00:00')
      const dow = dObj.getDay()
      if (dow === 5) fridayDate = d
      if (dow === 6) saturdayDate = d
      if (dow === 0) sundayDate = d
    })

    // If some dates are not in the cluster, extrapolate standard Friday/Saturday/Sunday
    if (!fridayDate) {
      const fri = new Date(firstDate)
      if (dayOfW === 6) fri.setDate(firstDate.getDate() - 1)
      else if (dayOfW === 0) fri.setDate(firstDate.getDate() - 2)
      fridayDate = formatDateToYMD(fri)
    }
    if (!saturdayDate) {
      const sat = new Date(firstDate)
      if (dayOfW === 5) sat.setDate(firstDate.getDate() + 1)
      else if (dayOfW === 0) sat.setDate(firstDate.getDate() - 1)
      saturdayDate = formatDateToYMD(sat)
    }
    if (!sundayDate) {
      const sun = new Date(firstDate)
      if (dayOfW === 5) sun.setDate(firstDate.getDate() + 2)
      else if (dayOfW === 6) sun.setDate(firstDate.getDate() + 1)
      sundayDate = formatDateToYMD(sun)
    }

    const sessionCount = sessions.filter((s) => clusterDates.includes(s.startDate)).length

    const firstDM = formatShortDateDM(clusterDates[0])
    const lastDM = formatShortDateDM(clusterDates[clusterDates.length - 1])
    const labelDates = clusterDates.length > 1 ? `${firstDM} – ${lastDM}` : firstDM

    return {
      number: index + 1,
      label: `Zjazd ${index + 1} (${labelDates})`,
      dates: clusterDates,
      fridayDate,
      saturdayDate,
      sundayDate,
      sessionCount,
    }
  })
}

export function getNearestWeekend(
  dateStr: string,
  zjazdy: WeekendZjazd[]
): WeekendZjazd | undefined {
  if (!zjazdy || zjazdy.length === 0) return undefined

  // 1. Exact match in zjazd dates
  const exact = zjazdy.find((z) => z.dates.includes(dateStr))
  if (exact) return exact

  // 2. If date falls between Friday and Sunday of a zjazd
  const targetTime = new Date(dateStr + 'T00:00:00').getTime()
  for (const z of zjazdy) {
    const friTime = new Date(z.fridayDate + 'T00:00:00').getTime()
    const sunTime = new Date(z.sundayDate + 'T00:00:00').getTime()
    if (targetTime >= friTime && targetTime <= sunTime) {
      return z
    }
  }

  // 3. Closest upcoming weekend (where sundayDate >= dateStr)
  const upcoming = zjazdy.find((z) => z.sundayDate >= dateStr)
  if (upcoming) return upcoming

  // 4. Otherwise find by minimal absolute distance to Saturday
  let closest = zjazdy[0]
  let minDiff = Infinity
  for (const z of zjazdy) {
    const satTime = new Date(z.saturdayDate + 'T00:00:00').getTime()
    const diff = Math.abs(targetTime - satTime)
    if (diff < minDiff) {
      minDiff = diff
      closest = z
    }
  }
  return closest
}

