import React, { useState, useEffect } from 'react'
import {
  Clock,
  MapPin,
  Coffee,
  Video,
} from 'lucide-react'
import type { Session, WeekendZjazd } from '../types/schedule'
import {
  formatRoomDisplay,
  getCategoryMeta,
  getFacultyShortLabel,
} from '../utils/scheduleParser'
import { formatDayShortWithWeekday, isSameDay, getTodayString, addDays } from '../utils/dateUtils'

interface WeekViewProps {
  weekend: WeekendZjazd | undefined
  sessions: Session[]
  onSelectSession: (session: Session) => void
  selectedDate: string
  onSelectDate: (dateStr: string) => void
}

export const WeekView: React.FC<WeekViewProps> = ({
  weekend,
  sessions,
  onSelectSession,
  selectedDate,
  onSelectDate,
}) => {
  const todayStr = getTodayString()

  // Determine the 3 weekend days (Friday, Saturday, Sunday)
  const selDateObj = new Date(selectedDate + 'T00:00:00')
  const dow = selDateObj.getDay() // 0=Sun, 1=Mon, ..., 5=Fri, 6=Sat
  const fallbackFri = addDays(selectedDate, 5 - dow)
  const fallbackSat = addDays(selectedDate, 6 - dow)
  const fallbackSun = addDays(selectedDate, dow === 0 ? 0 : 7 - dow)

  const fridayDate = weekend?.fridayDate || fallbackFri
  const saturdayDate = weekend?.saturdayDate || fallbackSat
  const sundayDate = weekend?.sundayDate || fallbackSun

  const days = [
    { dateStr: fridayDate, name: 'Piątek', dow: 5 },
    { dateStr: saturdayDate, name: 'Sobota', dow: 6 },
    { dateStr: sundayDate, name: 'Niedziela', dow: 0 },
  ]

  // Mobile selected day tab (defaults to Saturday or the day currently selected)
  const [mobileActiveDay, setMobileActiveDay] = useState<string>(() => {
    if (days.some((d) => d.dateStr === selectedDate)) return selectedDate
    return saturdayDate
  })

  // Synchronize mobileActiveDay when weekend dates change
  useEffect(() => {
    if (!days.some((d) => d.dateStr === mobileActiveDay)) {
      setMobileActiveDay(saturdayDate)
    }
  }, [saturdayDate, fridayDate, sundayDate])

  // Group sessions by date
  const sessionsByDay = days.map((day) => {
    const daySessions = sessions
      .filter((s) => s.startDate === day.dateStr)
      .sort((a, b) => a.startTimestamp - b.startTimestamp)

    const totalMins = daySessions.reduce((acc, s) => acc + s.durationMinutes, 0)
    const hours = Math.floor(totalMins / 60)
    const mins = totalMins % 60

    return {
      ...day,
      sessions: daySessions,
      totalMinutes: totalMins,
      durationLabel: hours > 0 ? `${hours}h ${mins > 0 ? `${mins}m` : ''}` : `${mins}m`,
      isToday: isSameDay(day.dateStr, todayStr),
      isSelected: isSameDay(day.dateStr, selectedDate),
    }
  })

  return (
    <div
      style={{
        maxWidth: '1400px',
        margin: '20px auto 40px auto',
        padding: '0 20px',
      }}
    >
      {/* Mobile Day Selector (Visible only on narrow screens via CSS) */}
      <div className="mobile-week-tabs" style={{ marginBottom: '16px' }}>
        <div className="segmented-control" style={{ width: '100%', display: 'flex' }}>
          {sessionsByDay.map((d) => (
            <button
              key={d.name}
              type="button"
              className={`segmented-control-item ${mobileActiveDay === d.dateStr ? 'active' : ''}`}
              style={{ flex: 1, justifyContent: 'center', padding: '8px 10px' }}
              onClick={() => {
                setMobileActiveDay(d.dateStr)
                onSelectDate(d.dateStr)
              }}
            >
              <span>{d.name}</span>
              <span
                style={{
                  fontSize: '11px',
                  opacity: 0.75,
                  padding: '1px 5px',
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: 'var(--bg-pill)',
                }}
              >
                {d.sessions.length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 3-Column Weekend Layout */}
      <div className="week-grid">
        {sessionsByDay.map((day) => {
          const isHiddenOnMobile = mobileActiveDay !== day.dateStr
          const dayInfo = formatDayShortWithWeekday(day.dateStr)

          return (
            <div
              key={day.name}
              className={`week-day-column ${isHiddenOnMobile ? 'mobile-hidden' : ''}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              {/* Day Header Card */}
              <div
                className="apple-card"
                onClick={() => onSelectDate(day.dateStr)}
                style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: day.isToday ? 'rgba(0, 122, 255, 0.08)' : 'var(--bg-card)',
                  border: day.isToday
                    ? '1.5px solid var(--apple-blue)'
                    : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        fontSize: '16px',
                        fontWeight: 700,
                        color: day.isToday ? 'var(--apple-blue)' : 'var(--text-primary)',
                      }}
                    >
                      {day.name}
                    </span>
                    {day.isToday && (
                      <span
                        className="apple-badge"
                        style={{
                          backgroundColor: 'var(--apple-blue)',
                          color: '#FFFFFF',
                          fontSize: '10px',
                        }}
                      >
                        Dzisiaj
                      </span>
                    )}
                  </div>

                  <span
                    style={{
                      fontSize: '12px',
                      color: 'var(--text-tertiary)',
                      fontWeight: 500,
                    }}
                  >
                    {dayInfo.dayMonth}
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <span>
                    {day.sessions.length > 0 ? (
                      <strong>{day.sessions.length} {day.sessions.length === 1 ? 'zajęcia' : 'zajęć'}</strong>
                    ) : (
                      'Brak zajęć'
                    )}
                  </span>
                  {day.totalMinutes > 0 && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={11} />
                      <span>{day.durationLabel}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Day Sessions List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {day.sessions.length === 0 ? (
                  <div
                    className="apple-card"
                    style={{
                      padding: '30px 16px',
                      textAlign: 'center',
                      color: 'var(--text-tertiary)',
                      backgroundColor: 'var(--bg-card)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <Coffee size={24} style={{ opacity: 0.6 }} />
                    <span style={{ fontSize: '13px' }}>Brak zajęć w {day.name.toLowerCase()}</span>
                  </div>
                ) : (
                  day.sessions.map((session, sIdx) => {
                    const category = getCategoryMeta(session.groupCategory)
                    const room = formatRoomDisplay(session.room)

                    // Check gap between classes
                    let gapMins = 0
                    if (sIdx > 0) {
                      const prev = day.sessions[sIdx - 1]
                      gapMins = Math.round((session.startTimestamp - prev.endTimestamp) / 60000)
                    }

                    return (
                      <React.Fragment key={`${day.name}_${session.id}_${sIdx}`}>
                        {gapMins > 0 && gapMins <= 240 && (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              padding: '2px 0',
                            }}
                          >
                            <div style={{ height: '1px', flex: 1, backgroundColor: 'var(--border-subtle)' }} />
                            <span
                              style={{
                                fontSize: '10px',
                                color: 'var(--text-tertiary)',
                                backgroundColor: 'var(--bg-pill)',
                                padding: '2px 8px',
                                borderRadius: 'var(--radius-pill)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px',
                              }}
                            >
                              <Coffee size={10} />
                              <span>Okienko: {Math.floor(gapMins / 60) > 0 ? `${Math.floor(gapMins / 60)}h ` : ''}{gapMins % 60}m</span>
                            </span>
                            <div style={{ height: '1px', flex: 1, backgroundColor: 'var(--border-subtle)' }} />
                          </div>
                        )}

                        <div
                          className="apple-card apple-card-interactive animate-fade-in"
                          onClick={() => onSelectSession(session)}
                          style={{
                            padding: '12px 14px',
                            cursor: 'pointer',
                            borderRadius: 'var(--radius-md)',
                            borderLeft: `4px solid ${category.color}`,
                            position: 'relative',
                          }}
                        >
                          {/* Time & Group Header */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              marginBottom: '6px',
                              gap: '6px',
                            }}
                          >
                            <span
                              style={{
                                fontSize: '13px',
                                fontWeight: 700,
                                fontFamily: 'var(--font-mono)',
                                color: 'var(--text-primary)',
                              }}
                            >
                              {session.startTime} – {session.endTime}
                            </span>

                            <span
                              className="apple-badge"
                              style={{
                                backgroundColor: category.bgLight,
                                color: category.color,
                                fontSize: '10px',
                                padding: '2px 6px',
                              }}
                            >
                              {session.group}
                            </span>
                          </div>

                          {/* Subject Name */}
                          <h4
                            style={{
                              fontSize: '14px',
                              fontWeight: 600,
                              color: 'var(--text-primary)',
                              lineHeight: 1.3,
                              margin: '0 0 8px 0',
                            }}
                          >
                            {session.subject}
                          </h4>

                          {/* Room Badge */}
                          <div style={{ marginBottom: '6px' }}>
                            <span
                              className="apple-badge"
                              style={{
                                backgroundColor: session.isRemote
                                  ? 'rgba(88, 86, 214, 0.12)'
                                  : 'rgba(52, 199, 89, 0.12)',
                                color: session.isRemote ? 'var(--apple-indigo)' : 'var(--apple-green)',
                                fontSize: '11px',
                                padding: '2px 8px',
                              }}
                            >
                              {session.isRemote ? <Video size={11} /> : <MapPin size={11} />}
                              <span>{room.displayName}</span>
                            </span>
                          </div>

                          {/* Instructor & Faculty */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              fontSize: '11px',
                              color: 'var(--text-secondary)',
                              marginTop: '8px',
                              borderTop: '1px solid var(--border-subtle)',
                              paddingTop: '6px',
                            }}
                          >
                            <span
                              style={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: '170px',
                              }}
                            >
                              {session.instructor}
                            </span>

                            <span
                              style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '10px',
                                color: 'var(--text-tertiary)',
                              }}
                            >
                              {session.faculties[0] ? getFacultyShortLabel(session.faculties[0]) : ''}
                            </span>
                          </div>
                        </div>
                      </React.Fragment>
                    )
                  })
                )}
              </div>
            </div>
          )
        })}
      </div>

      <style>{`
        .week-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        .mobile-week-tabs {
          display: none;
        }
        @media (max-width: 860px) {
          .week-grid {
            grid-template-columns: 1fr;
          }
          .mobile-week-tabs {
            display: block;
          }
          .week-day-column.mobile-hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
