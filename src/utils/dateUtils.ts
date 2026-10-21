const POLISH_DAYS_FULL = [
  'Niedziela',
  'Poniedziałek',
  'Wtorek',
  'Środa',
  'Czwartek',
  'Piątek',
  'Sobota',
]

const POLISH_DAYS_SHORT = ['Nd', 'Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb']

const POLISH_MONTHS_GENITIVE = [
  'stycznia',
  'lutego',
  'marca',
  'kwietnia',
  'maja',
  'czerwca',
  'lipca',
  'sierpnia',
  'września',
  'października',
  'listopada',
  'grudnia',
]

const POLISH_MONTHS_NOMINATIVE = [
  'Styczeń',
  'Luty',
  'Marzec',
  'Kwiecień',
  'Maj',
  'Czerwiec',
  'Lipiec',
  'Sierpień',
  'Wrzesień',
  'Październik',
  'Listopad',
  'Grudzień',
]

export function formatDateToYMD(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function parseYMDToDate(dateStr: string): Date {
  const parts = dateStr.split('-').map((p) => parseInt(p, 10))
  // Noon (12:00:00) prevents DST hour shifts from changing the calendar day
  return new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0)
}

export function formatShortDateDM(dateStr: string): string {
  const parts = dateStr.split('-')
  if (parts.length >= 3) {
    const day = parts[2].padStart(2, '0')
    const month = parts[1].padStart(2, '0')
    return `${day}.${month}` // DD.MM
  }
  return dateStr
}

export function formatDayFull(dateStr: string): string {
  const d = parseYMDToDate(dateStr)
  const dayName = POLISH_DAYS_FULL[d.getDay()]
  return `${dayName}, ${dateStr}` // Standard ISO: e.g. "Sobota, 2026-10-24"
}

export function formatDayShortWithWeekday(dateStr: string): {
  weekday: string
  dayMonth: string
  isWeekend: boolean
} {
  const d = parseYMDToDate(dateStr)
  const dow = d.getDay()
  return {
    weekday: POLISH_DAYS_FULL[dow],
    dayMonth: formatShortDateDM(dateStr), // Standard DD.MM: e.g. "24.10"
    isWeekend: dow === 5 || dow === 6 || dow === 0,
  }
}

export function formatWeekendLabel(friDate: string, sunDate: string): string {
  return `${formatShortDateDM(friDate)} – ${formatShortDateDM(sunDate)}` // Standard DD.MM: e.g. "23.10 – 25.10"
}

export function formatMonthYear(year: number, monthZeroIndexed: number): string {
  const m = String(monthZeroIndexed + 1).padStart(2, '0')
  return `${POLISH_MONTHS_NOMINATIVE[monthZeroIndexed]} ${year} (${year}-${m})`
}

export function addDays(dateStr: string, days: number): string {
  const d = parseYMDToDate(dateStr)
  d.setDate(d.getDate() + days)
  return formatDateToYMD(d)
}

export function getTodayString(): string {
  const now = new Date()
  return formatDateToYMD(now)
}

export function isSameDay(d1: string, d2: string): boolean {
  return d1 === d2
}

export function getDaysInMonthGrid(year: number, monthZeroIndexed: number): {
  dateStr: string
  dayNumber: number
  isCurrentMonth: boolean
  isWeekend: boolean
  dayOfWeek: number
}[] {
  const firstDay = new Date(year, monthZeroIndexed, 1, 12, 0, 0)
  const lastDay = new Date(year, monthZeroIndexed + 1, 0, 12, 0, 0)

  // Monday = 0, Sunday = 6 in European calendar
  const startDayOfWeek = (firstDay.getDay() + 6) % 7
  const totalDays = lastDay.getDate()

  const grid: {
    dateStr: string
    dayNumber: number
    isCurrentMonth: boolean
    isWeekend: boolean
    dayOfWeek: number
  }[] = []

  // Preceding days from previous month
  const prevMonthLastDay = new Date(year, monthZeroIndexed, 0, 12, 0, 0).getDate()
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const dayNum = prevMonthLastDay - i
    const d = new Date(year, monthZeroIndexed - 1, dayNum, 12, 0, 0)
    const dow = d.getDay()
    grid.push({
      dateStr: formatDateToYMD(d),
      dayNumber: dayNum,
      isCurrentMonth: false,
      isWeekend: dow === 5 || dow === 6 || dow === 0,
      dayOfWeek: dow,
    })
  }

  // Current month days
  for (let d = 1; d <= totalDays; d++) {
    const curDate = new Date(year, monthZeroIndexed, d, 12, 0, 0)
    const dow = curDate.getDay()
    grid.push({
      dateStr: formatDateToYMD(curDate),
      dayNumber: d,
      isCurrentMonth: true,
      isWeekend: dow === 5 || dow === 6 || dow === 0,
      dayOfWeek: dow,
    })
  }

  // Trailing days from next month to complete the row
  const remainingCells = 7 - (grid.length % 7)
  if (remainingCells < 7) {
    for (let d = 1; d <= remainingCells; d++) {
      const nextDate = new Date(year, monthZeroIndexed + 1, d, 12, 0, 0)
      const dow = nextDate.getDay()
      grid.push({
        dateStr: formatDateToYMD(nextDate),
        dayNumber: d,
        isCurrentMonth: false,
        isWeekend: dow === 5 || dow === 6 || dow === 0,
        dayOfWeek: dow,
      })
    }
  }

  return grid
}

export { POLISH_DAYS_FULL, POLISH_DAYS_SHORT, POLISH_MONTHS_NOMINATIVE, POLISH_MONTHS_GENITIVE }
