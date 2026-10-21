import React, { useMemo } from 'react'
import {
  MapPin,
  Calendar,
  ChevronRight,
  Video,
} from 'lucide-react'
import type { Session, WeekendZjazd } from '../types/schedule'
import {
  getDaysInMonthGrid,
  isSameDay,
  getTodayString,
  formatDayFull,
} from '../utils/dateUtils'
import {
  formatRoomDisplay,
  getCategoryMeta,
  getSubjectColor,
} from '../utils/scheduleParser'

interface MonthViewProps {
  selectedDate: string
  onSelectDate: (dateStr: string) => void
  sessions: Session[]
  zjazdy: WeekendZjazd[]
  onSelectSession: (session: Session) => void
  onSwitchToDayView: () => void
}

const WEEKDAY_NAMES = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd']

export const MonthView: React.FC<MonthViewProps> = ({
  selectedDate,
  onSelectDate,
  sessions,
  zjazdy,
  onSelectSession,
  onSwitchToDayView,
}) => {
  const todayStr = getTodayString()
  const currentDate = new Date(selectedDate + 'T00:00:00')
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Generate calendar grid
  const monthGrid = useMemo(() => {
    return getDaysInMonthGrid(year, month)
  }, [year, month])

  // Group all filtered sessions by date
  const sessionsByDate = useMemo(() => {
    const map = new Map<string, Session[]>()
    sessions.forEach((s) => {
      const list = map.get(s.startDate) || []
      list.push(s)
      map.set(s.startDate, list)
    })
    return map
  }, [sessions])

  // Map zjazdy to dates for quick lookup
  const zjazdByDate = useMemo(() => {
    const map = new Map<string, WeekendZjazd>()
    zjazdy.forEach((z) => {
      z.dates.forEach((d) => map.set(d, z))
    })
    return map
  }, [zjazdy])

  // Active day's sessions
  const activeDaySessions = useMemo(() => {
    const list = sessionsByDate.get(selectedDate) || []
    return [...list].sort((a, b) => a.startTimestamp - b.startTimestamp)
  }, [selectedDate, sessionsByDate])

  return (
    <div
      className="month-view-container"
      style={{
        maxWidth: '1200px',
        margin: '16px auto 40px auto',
        padding: '0 16px',
      }}
    >
      {/* Month Calendar Grid Card */}
      <div
        className="apple-card month-card"
        style={{
          padding: '14px',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
        }}
      >
        {/* Weekday Header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            textAlign: 'center',
            paddingBottom: '8px',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          {WEEKDAY_NAMES.map((name, i) => {
            const isWeekendCol = i >= 4 // Pt, Sb, Nd
            return (
              <div
                key={name}
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: isWeekendCol ? 'var(--apple-blue)' : 'var(--text-tertiary)',
                  padding: '2px 0',
                }}
              >
                {name}
              </div>
            )
          })}
        </div>

        {/* Days Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '3px',
            paddingTop: '6px',
          }}
        >
          {monthGrid.map((cell) => {
            const daySessions = sessionsByDate.get(cell.dateStr) || []
            const isToday = isSameDay(cell.dateStr, todayStr)
            const isSelected = isSameDay(cell.dateStr, selectedDate)
            const zjazd = zjazdByDate.get(cell.dateStr)
            const hasClasses = daySessions.length > 0

            return (
              <div
                key={cell.dateStr}
                onClick={() => onSelectDate(cell.dateStr)}
                className="month-calendar-cell"
                style={{
                  minHeight: '76px',
                  padding: '5px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isSelected
                    ? 'rgba(0, 122, 255, 0.12)'
                    : cell.isWeekend
                    ? 'var(--bg-card-secondary)'
                    : 'transparent',
                  border: isSelected
                    ? '1.5px solid var(--apple-blue)'
                    : isToday
                    ? '1.5px solid var(--border-strong)'
                    : '1px solid transparent',
                  cursor: 'pointer',
                  opacity: cell.isCurrentMonth ? 1 : 0.35,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'background-color 0.12s ease, transform 0.12s ease',
                  position: 'relative',
                }}
              >
                {/* Date Number and Zjazd pill */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span
                    className="month-day-number"
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: isToday || isSelected ? 700 : 500,
                      backgroundColor: isToday ? 'var(--apple-blue)' : 'transparent',
                      color: isToday ? '#FFFFFF' : 'var(--text-primary)',
                      flexShrink: 0,
                    }}
                  >
                    {cell.dayNumber}
                  </span>

                  {zjazd && cell.isCurrentMonth && (
                    <span
                      className="month-zjazd-tag"
                      style={{
                        fontSize: '9px',
                        fontWeight: 700,
                        backgroundColor: 'rgba(175, 82, 222, 0.16)',
                        color: 'var(--apple-purple)',
                        padding: '1px 4px',
                        borderRadius: 'var(--radius-pill)',
                        flexShrink: 0,
                      }}
                      title={zjazd.label}
                    >
                      T{zjazd.number}
                    </span>
                  )}
                </div>

                {/* Day content: dots & count */}
                {hasClasses && cell.isCurrentMonth && (
                  <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: 'var(--apple-blue)',
                        lineHeight: 1,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <span>{daySessions.length}</span>
                      <span className="month-session-count-text"> {daySessions.length === 1 ? 'zajęcia' : 'zajęć'}</span>
                    </div>

                    {/* Colored dots per subject */}
                    <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap' }}>
                      {daySessions.slice(0, 4).map((s) => {
                        const sColor = getSubjectColor(s.subject)
                        return (
                          <span
                            key={s.id}
                            style={{
                              width: '5px',
                              height: '5px',
                              borderRadius: '50%',
                              backgroundColor: sColor.color,
                              flexShrink: 0,
                            }}
                          />
                        )
                      })}
                      {daySessions.length > 4 && (
                        <span style={{ fontSize: '8px', color: 'var(--text-tertiary)', lineHeight: 1 }}>
                          +{daySessions.length - 4}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Selected Day Preview Drawer */}
      <div
        className="apple-card animate-fade-in"
        style={{
          marginTop: '20px',
          padding: '20px',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div>
            <div style={{ fontSize: '12px', color: 'var(--apple-blue)', fontWeight: 600 }}>
              Wybrany dzień
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
              {formatDayFull(selectedDate)}
            </h3>
          </div>

          <button
            type="button"
            className="apple-btn apple-btn-primary"
            onClick={onSwitchToDayView}
            style={{ fontSize: '13px' }}
          >
            <Calendar size={14} />
            <span>Otwórz w widoku dnia</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {activeDaySessions.length === 0 ? (
          <div
            style={{
              padding: '24px',
              textAlign: 'center',
              color: 'var(--text-tertiary)',
              fontSize: '13px',
            }}
          >
            Brak zajęć w tym dniu dla wybranych filtrów.
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '12px',
            }}
          >
            {activeDaySessions.map((s) => {
              const meta = getCategoryMeta(s.groupCategory)
              const subjectColor = getSubjectColor(s.subject)
              const room = formatRoomDisplay(s.room)

              return (
                <div
                  key={s.id}
                  className="apple-card apple-card-interactive"
                  onClick={() => onSelectSession(s)}
                  style={{
                    padding: '12px 14px',
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-sm)',
                    borderLeft: `3px solid ${subjectColor.color}`,
                    backgroundColor: 'var(--bg-card-secondary)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '4px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {s.startTime} – {s.endTime}
                    </span>

                    <span
                      className="apple-badge"
                      style={{
                        backgroundColor: subjectColor.bgLight,
                        color: subjectColor.color,
                        fontSize: '10px',
                      }}
                    >
                      {meta.label} ({s.group})
                    </span>
                  </div>

                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      lineHeight: 1.3,
                      marginBottom: '6px',
                    }}
                  >
                    {s.subject}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '11px',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {s.isRemote ? <Video size={11} /> : <MapPin size={11} />}
                      <span>{room.displayName}</span>
                    </span>

                    <span>{s.instructor}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
