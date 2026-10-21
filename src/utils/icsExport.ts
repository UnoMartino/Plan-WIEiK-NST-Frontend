import type { Session } from '../types/schedule'

function formatIcsDate(timestamp: number): string {
  const d = new Date(timestamp)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`
}

function escapeIcsText(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
}

export function generateIcsForSessions(sessions: Session[], calendarName = 'Plan Zajęć WIEiK PK'): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//WIEiK PK//Plan Zajec Apple Design//PL',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcsText(calendarName)}`,
    'X-WR-TIMEZONE:Europe/Warsaw',
  ]

  sessions.forEach((s) => {
    const startStr = formatIcsDate(s.startTimestamp)
    const endStr = formatIcsDate(s.endTimestamp)
    const summary = `${s.subject} (${s.group})`
    const description = `Prowadzący: ${s.instructor}\\nKierunek: ${s.faculties.join(', ')}\\nTyp: ${s.groupCategory}\\nCzas: ${s.startTime} - ${s.endTime}`
    const location = s.isRemote ? `MS Teams (Zdalnie: ${s.room})` : `Sala ${s.room}, PK`

    lines.push('BEGIN:VEVENT')
    lines.push(`UID:${s.id}@plany.wieik.pk.edu.pl`)
    lines.push(`DTSTAMP:${formatIcsDate(Date.now())}`)
    lines.push(`DTSTART:${startStr}`)
    lines.push(`DTEND:${endStr}`)
    lines.push(`SUMMARY:${escapeIcsText(summary)}`)
    lines.push(`DESCRIPTION:${description}`)
    lines.push(`LOCATION:${escapeIcsText(location)}`)
    lines.push('STATUS:CONFIRMED')
    lines.push('END:VEVENT')
  })

  lines.push('END:VCALENDAR')
  return lines.join('\r\n')
}

export function downloadIcsFile(sessions: Session[], filename = 'plan_zajec_pk.ics'): void {
  const icsData = generateIcsForSessions(sessions)
  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
