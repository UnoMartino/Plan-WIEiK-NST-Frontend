import React from 'react'
import {
  Clock,
  MapPin,
  User,
  Coffee,
  Calendar,
  ChevronRight,
  AlertCircle,
  Video,
} from 'lucide-react'
import type { Session, WeekendZjazd } from '../types/schedule'
import {
  formatRoomDisplay,
  getCategoryMeta,
  getFacultyShortLabel,
} from '../utils/scheduleParser'
import { formatDayFull } from '../utils/dateUtils'

interface DayViewProps {
  selectedDate: string
  sessions: Session[]
  onSelectSession: (session: Session) => void
  onJumpToNearestZjazd: () => void
  nearestZjazd?: WeekendZjazd
}

export const DayView: React.FC<DayViewProps> = ({
  selectedDate,
  sessions,
  onSelectSession,
  onJumpToNearestZjazd,
  nearestZjazd,
}) => {
  // Sort sessions by start time
  const sortedSessions = [...sessions].sort((a, b) => a.startTimestamp - b.startTimestamp)

  // Detect time collisions between classes
  const hasCollision = (idx: number) => {
    const curr = sortedSessions[idx]
    for (let i = 0; i < sortedSessions.length; i++) {
      if (i === idx) continue
      const other = sortedSessions[i]
      if (curr.startTimestamp < other.endTimestamp && curr.endTimestamp > other.startTimestamp) {
        return true
      }
    }
    return false
  }

  // Calculate day totals
  const totalMinutes = sortedSessions.reduce((acc, s) => acc + s.durationMinutes, 0)
  const totalHours = Math.floor(totalMinutes / 60)
  const remainingMinutes = totalMinutes % 60

  return (
    <div
      style={{
        maxWidth: '1000px',
        margin: '20px auto 40px auto',
        padding: '0 20px',
      }}
    >
      {/* Day Overview Header Card */}
      <div
        className="apple-card"
        style={{
          padding: '18px 24px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <div style={{ fontSize: '13px', color: 'var(--apple-blue)', fontWeight: 600 }}>
            Harmonogram dnia
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '2px 0 0 0' }}>
            {formatDayFull(selectedDate)}
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            className="apple-badge"
            style={{
              backgroundColor: sortedSessions.length > 0 ? 'rgba(0, 122, 255, 0.12)' : 'var(--bg-pill)',
              color: sortedSessions.length > 0 ? 'var(--apple-blue)' : 'var(--text-tertiary)',
              padding: '6px 12px',
              fontSize: '12px',
            }}
          >
            {sortedSessions.length} {sortedSessions.length === 1 ? 'zajęcia' : 'zajęć'}
          </span>

          {totalMinutes > 0 && (
            <span
              className="apple-badge"
              style={{
                backgroundColor: 'rgba(52, 199, 89, 0.12)',
                color: 'var(--apple-green)',
                padding: '6px 12px',
                fontSize: '12px',
              }}
            >
              <Clock size={12} />
              <span>
                Łącznie: {totalHours > 0 ? `${totalHours}h ` : ''}
                {remainingMinutes > 0 ? `${remainingMinutes}m` : ''}
              </span>
            </span>
          )}
        </div>
      </div>

      {/* Empty State */}
      {sortedSessions.length === 0 ? (
        <div
          className="apple-card animate-fade-in"
          style={{
            padding: '50px 30px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: 'var(--bg-pill)',
              color: 'var(--text-tertiary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Coffee size={32} />
          </div>

          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Brak zajęć w tym dniu
            </h3>
            <p
              style={{
                fontSize: '14px',
                color: 'var(--text-secondary)',
                maxWidth: '460px',
                marginTop: '4px',
                lineHeight: 1.4,
              }}
            >
              Nie zaplanowano żadnych zajęć spełniających wybrane kryteria filtrów lub jest to dzień wolny.
            </p>
          </div>

          {nearestZjazd && (
            <button
              type="button"
              className="apple-btn apple-btn-primary"
              onClick={onJumpToNearestZjazd}
              style={{ marginTop: '8px' }}
            >
              <Calendar size={15} />
              <span>Przejdź do najbliższego zjazdu ({nearestZjazd.label})</span>
              <ChevronRight size={15} />
            </button>
          )}
        </div>
      ) : (
        /* Timeline List of Sessions */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {sortedSessions.map((session, idx) => {
            const category = getCategoryMeta(session.groupCategory)
            const room = formatRoomDisplay(session.room)
            const collision = hasCollision(idx)

            // Calculate break time since previous class if any
            let breakMinutes = 0
            if (idx > 0) {
              const prev = sortedSessions[idx - 1]
              breakMinutes = Math.round((session.startTimestamp - prev.endTimestamp) / 60000)
            }

            return (
              <React.Fragment key={session.id}>
                {/* Break / Gap Pill between classes */}
                {breakMinutes > 0 && breakMinutes <= 240 && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '4px 0',
                    }}
                  >
                    <div style={{ height: '1px', flex: 1, backgroundColor: 'var(--border-subtle)' }} />
                    <span
                      style={{
                        fontSize: '11px',
                        color: 'var(--text-tertiary)',
                        backgroundColor: 'var(--bg-pill)',
                        padding: '3px 10px',
                        borderRadius: 'var(--radius-pill)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Coffee size={11} />
                      <span>Okienko: {Math.floor(breakMinutes / 60) > 0 ? `${Math.floor(breakMinutes / 60)}h ` : ''}{breakMinutes % 60}m</span>
                    </span>
                    <div style={{ height: '1px', flex: 1, backgroundColor: 'var(--border-subtle)' }} />
                  </div>
                )}

                {/* Session Card */}
                <div
                  className="apple-card apple-card-interactive animate-fade-in"
                  onClick={() => onSelectSession(session)}
                  style={{
                    padding: '16px 20px',
                    cursor: 'pointer',
                    position: 'relative',
                    borderLeft: `4px solid ${category.color}`,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: '12px',
                      flexWrap: 'wrap',
                    }}
                  >
                    {/* Time & Category Pill */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <div
                        style={{
                          fontSize: '15px',
                          fontWeight: 700,
                          color: 'var(--text-primary)',
                          fontFamily: 'var(--font-mono)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <Clock size={15} color="var(--apple-blue)" />
                        <span>{session.startTime} – {session.endTime}</span>
                      </div>

                      <span
                        style={{
                          fontSize: '11px',
                          color: 'var(--text-tertiary)',
                          backgroundColor: 'var(--bg-pill)',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-pill)',
                        }}
                      >
                        {session.duration}
                      </span>

                      <span
                        className="apple-badge"
                        style={{
                          backgroundColor: category.bgLight,
                          color: category.color,
                        }}
                      >
                        {category.label} • Grupa {session.group}
                      </span>

                      {collision && (
                        <span
                          className="apple-badge"
                          style={{
                            backgroundColor: 'rgba(255, 59, 48, 0.12)',
                            color: 'var(--apple-red)',
                          }}
                          title="Kolizja terminowa z innymi zajęciami!"
                        >
                          <AlertCircle size={11} />
                          <span>Kolizja terminowa</span>
                        </span>
                      )}
                    </div>

                    {/* Room Badge */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        className="apple-badge"
                        style={{
                          backgroundColor: session.isRemote
                            ? 'rgba(88, 86, 214, 0.12)'
                            : 'rgba(52, 199, 89, 0.12)',
                          color: session.isRemote ? 'var(--apple-indigo)' : 'var(--apple-green)',
                          fontSize: '12px',
                          padding: '4px 10px',
                        }}
                      >
                        {session.isRemote ? <Video size={13} /> : <MapPin size={13} />}
                        <span>{room.displayName}</span>
                      </span>
                    </div>
                  </div>

                  {/* Subject Name */}
                  <div style={{ marginTop: '10px' }}>
                    <h3
                      style={{
                        fontSize: '17px',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        lineHeight: 1.3,
                        margin: 0,
                      }}
                    >
                      {session.subject}
                    </h3>
                  </div>

                  {/* Instructor & Faculty Footer */}
                  <div
                    style={{
                      marginTop: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '8px',
                      fontSize: '13px',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <User size={14} color="var(--apple-orange)" />
                      <span>{session.instructor}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {session.faculties.map((fCode) => (
                        <span
                          key={fCode}
                          style={{
                            fontSize: '11px',
                            padding: '2px 7px',
                            borderRadius: 'var(--radius-xs)',
                            backgroundColor: 'var(--bg-pill)',
                            color: 'var(--text-secondary)',
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          {getFacultyShortLabel(fCode)}
                        </span>
                      ))}
                      <ChevronRight size={16} color="var(--text-tertiary)" />
                    </div>
                  </div>
                </div>
              </React.Fragment>
            )
          })}
        </div>
      )}
    </div>
  )
}
