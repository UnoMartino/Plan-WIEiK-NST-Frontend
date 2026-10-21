import React, { useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Bookmark,
  Clock,
  Sparkles,
} from 'lucide-react'
import type { FilterSettings, WeekendZjazd, Session } from '../types/schedule'
import {
  formatDayFull,
  formatWeekendLabel,
  formatMonthYear,
  addDays,
  getTodayString,
} from '../utils/dateUtils'
import { getNearestWeekend } from '../utils/scheduleParser'

interface NavigationToolbarProps {
  settings: FilterSettings
  onUpdateSettings: (newSettings: Partial<FilterSettings>) => void
  zjazdy: WeekendZjazd[]
  currentWeekend: WeekendZjazd | undefined
  periodSessions: Session[]
}

export const NavigationToolbar: React.FC<NavigationToolbarProps> = ({
  settings,
  onUpdateSettings,
  zjazdy,
  currentWeekend,
  periodSessions,
}) => {
  const [showZjazdPicker, setShowZjazdPicker] = useState(false)
  const currentDate = new Date(settings.selectedDate + 'T00:00:00')

  const handlePrev = () => {
    if (settings.viewMode === 'day') {
      onUpdateSettings({ selectedDate: addDays(settings.selectedDate, -1) })
    } else if (settings.viewMode === 'week') {
      const curZjazd = currentWeekend || getNearestWeekend(settings.selectedDate, zjazdy)
      if (curZjazd) {
        const curIdx = zjazdy.findIndex((z) => z.number === curZjazd.number)
        if (curIdx > 0) {
          onUpdateSettings({ selectedDate: zjazdy[curIdx - 1].saturdayDate })
          return
        }
      }
      onUpdateSettings({ selectedDate: addDays(settings.selectedDate, -7) })
    } else if (settings.viewMode === 'month') {
      const prevDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1, 12, 0, 0)
      const ty = prevDate.getFullYear()
      const tm = prevDate.getMonth()
      const zjazdInMonth = zjazdy.find((z) => {
        const d = new Date(z.saturdayDate + 'T12:00:00')
        return d.getFullYear() === ty && d.getMonth() === tm
      })
      const pad = (n: number) => String(n).padStart(2, '0')
      onUpdateSettings({
        selectedDate: zjazdInMonth ? zjazdInMonth.saturdayDate : `${ty}-${pad(tm + 1)}-01`,
      })
    }
  }

  const handleNext = () => {
    if (settings.viewMode === 'day') {
      onUpdateSettings({ selectedDate: addDays(settings.selectedDate, 1) })
    } else if (settings.viewMode === 'week') {
      const curZjazd = currentWeekend || getNearestWeekend(settings.selectedDate, zjazdy)
      if (curZjazd) {
        const curIdx = zjazdy.findIndex((z) => z.number === curZjazd.number)
        if (curIdx >= 0 && curIdx < zjazdy.length - 1) {
          onUpdateSettings({ selectedDate: zjazdy[curIdx + 1].saturdayDate })
          return
        }
      }
      onUpdateSettings({ selectedDate: addDays(settings.selectedDate, 7) })
    } else if (settings.viewMode === 'month') {
      const nextDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1, 12, 0, 0)
      const ty = nextDate.getFullYear()
      const tm = nextDate.getMonth()
      const zjazdInMonth = zjazdy.find((z) => {
        const d = new Date(z.saturdayDate + 'T12:00:00')
        return d.getFullYear() === ty && d.getMonth() === tm
      })
      const pad = (n: number) => String(n).padStart(2, '0')
      onUpdateSettings({
        selectedDate: zjazdInMonth ? zjazdInMonth.saturdayDate : `${ty}-${pad(tm + 1)}-01`,
      })
    }
  }

  const handleToday = () => {
    const todayStr = getTodayString()
    const nearest = getNearestWeekend(todayStr, zjazdy)
    if (nearest) {
      onUpdateSettings({ selectedDate: nearest.saturdayDate })
    } else {
      onUpdateSettings({ selectedDate: todayStr })
    }
  }

  const handleSelectZjazd = (zjazd: WeekendZjazd) => {
    onUpdateSettings({ selectedDate: zjazd.saturdayDate })
    setShowZjazdPicker(false)
  }

  // Calculate total duration in this period
  const totalMinutes = periodSessions.reduce((acc, s) => acc + s.durationMinutes, 0)
  const totalHours = Math.floor(totalMinutes / 60)
  const remainingMins = totalMinutes % 60

  // Display label based on view mode
  let periodLabel = ''
  if (settings.viewMode === 'day') {
    periodLabel = formatDayFull(settings.selectedDate)
  } else if (settings.viewMode === 'week') {
    if (currentWeekend) {
      periodLabel = `Zjazd ${currentWeekend.number} • ${formatWeekendLabel(
        currentWeekend.fridayDate,
        currentWeekend.sundayDate
      )}`
    } else {
      const fri = addDays(settings.selectedDate, -1)
      const sun = addDays(settings.selectedDate, 1)
      periodLabel = `Weekend ${formatWeekendLabel(fri, sun)}`
    }
  } else {
    periodLabel = formatMonthYear(currentDate.getFullYear(), currentDate.getMonth())
  }

  return (
    <div
      style={{
        maxWidth: '1400px',
        margin: '16px auto 0 auto',
        padding: '0 20px',
      }}
    >
      <div
        className="apple-card"
        style={{
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        {/* Navigation Buttons: Wstecz, Dzisiaj, Dalej */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              display: 'inline-flex',
              backgroundColor: 'var(--bg-pill)',
              borderRadius: 'var(--radius-sm)',
              padding: '2px',
            }}
          >
            <button
              type="button"
              className="apple-btn"
              onClick={handlePrev}
              style={{ padding: '6px 12px', fontSize: '13px' }}
              title="Poprzedni"
            >
              <ChevronLeft size={16} />
              <span className="hide-on-mobile">Wstecz</span>
            </button>

            <button
              type="button"
              className="apple-btn"
              onClick={handleToday}
              style={{
                padding: '6px 12px',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--apple-blue)',
              }}
              title="Przejdź do dzisiaj"
            >
              Dzisiaj
            </button>

            <button
              type="button"
              className="apple-btn"
              onClick={handleNext}
              style={{ padding: '6px 12px', fontSize: '13px' }}
              title="Dalej"
            >
              <span className="hide-on-mobile">Dalej</span>
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Quick Zjazd Jump Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              className="apple-btn apple-btn-secondary"
              onClick={() => setShowZjazdPicker(!showZjazdPicker)}
              style={{
                padding: '6px 12px',
                fontSize: '13px',
                fontWeight: 500,
              }}
              title="Wybierz zjazd weekendowy"
            >
              <Bookmark size={14} color="var(--apple-purple)" />
              <span>{currentWeekend ? `Zjazd ${currentWeekend.number}` : 'Wybierz zjazd'}</span>
            </button>

            {showZjazdPicker && (
              <>
                <div
                  style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 90,
                  }}
                  onClick={() => setShowZjazdPicker(false)}
                />
                <div
                  className="apple-card animate-scale-up"
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: '6px',
                    width: '280px',
                    maxHeight: '340px',
                    overflowY: 'auto',
                    zIndex: 100,
                    padding: '8px',
                    boxShadow: 'var(--shadow-lg)',
                  }}
                >
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: 'var(--text-secondary)',
                      padding: '4px 8px 8px 8px',
                      borderBottom: '1px solid var(--border-subtle)',
                    }}
                  >
                    Harmonogram zjazdów (Semestr Zimowy)
                  </div>
                  {zjazdy.map((z) => {
                    const isSelected = currentWeekend?.number === z.number
                    return (
                      <button
                        key={z.number}
                        type="button"
                        onClick={() => handleSelectZjazd(z)}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '8px 10px',
                          borderRadius: 'var(--radius-xs)',
                          fontSize: '13px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          backgroundColor: isSelected ? 'var(--bg-pill)' : 'transparent',
                          color: isSelected ? 'var(--apple-blue)' : 'var(--text-primary)',
                          fontWeight: isSelected ? 600 : 400,
                          margin: '2px 0',
                        }}
                      >
                        <div>
                          <div>Zjazd {z.number}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                            {formatWeekendLabel(z.fridayDate, z.sundayDate)}
                          </div>
                        </div>
                        {isSelected && <Sparkles size={14} color="var(--apple-blue)" />}
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Center/Right: Current Period Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CalendarDays size={18} color="var(--apple-blue)" />
            <span
              style={{
                fontSize: '15px',
                fontWeight: 600,
                color: 'var(--text-primary)',
              }}
            >
              {periodLabel}
            </span>
          </div>

          {/* Quick period summary pill */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: 'var(--text-secondary)',
              backgroundColor: 'var(--bg-pill)',
              padding: '3px 10px',
              borderRadius: 'var(--radius-pill)',
            }}
          >
            <span>
              <strong>{periodSessions.length}</strong> {periodSessions.length === 1 ? 'zajęcia' : 'zajęć'}
            </span>
            {totalMinutes > 0 && (
              <>
                <span>•</span>
                <Clock size={12} />
                <span>
                  {totalHours > 0 ? `${totalHours}h ` : ''}
                  {remainingMins > 0 ? `${remainingMins}m` : ''}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
