import React, { useEffect, useMemo, useState } from 'react'
import type { FilterSettings, RawScheduleItem, Session } from './types/schedule'
import {
  buildWeekendZjazdy,
  parseScheduleData,
  getNearestWeekend,
} from './utils/scheduleParser'
import { loadStoredSettings, saveStoredSettings } from './utils/storage'
import { fetchPlanData } from './services/planApi'
import { Header } from './components/Header'
import { NavigationToolbar } from './components/NavigationToolbar'
import { DayView } from './components/DayView'
import { WeekView } from './components/WeekView'
import { MonthView } from './components/MonthView'
import { FilterModal } from './components/FilterModal'
import { SessionDetailModal } from './components/SessionDetailModal'
import { SyncInfoModal } from './components/SyncInfoModal'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export const App: React.FC = () => {
  // Load persistent settings from LocalStorage
  const [settings, setSettings] = useState<FilterSettings>(() => loadStoredSettings())
  const [rawItems, setRawItems] = useState<RawScheduleItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [cacheInfo, setCacheInfo] = useState<{ source: string; timestamp: number }>({
    source: 'bundled',
    timestamp: Date.now(),
  })

  // Modals state
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false)
  const [isSyncInfoOpen, setIsSyncInfoOpen] = useState<boolean>(false)
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)

  // Sync settings with localStorage on change
  const handleUpdateSettings = (newSettings: Partial<FilterSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings }
      saveStoredSettings(updated)
      return updated
    })
  }

  // Manage Device Theme (Auto / Light / Dark)
  useEffect(() => {
    const root = document.documentElement

    const applyTheme = () => {
      let isDark = false
      if (settings.theme === 'auto') {
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        root.setAttribute('data-theme', isDark ? 'dark' : 'light')
      } else {
        isDark = settings.theme === 'dark'
        root.setAttribute('data-theme', settings.theme)
      }

      // Update theme-color meta tag so iOS Safari and Chrome tint the status bar / Dynamic Island area
      const headerColor = isDark ? '#1C1C1E' : '#FFFFFF'
      const metaTags = document.querySelectorAll('meta[name="theme-color"]')
      if (metaTags.length > 0) {
        metaTags.forEach((tag) => tag.setAttribute('content', headerColor))
      } else {
        const meta = document.createElement('meta')
        meta.name = 'theme-color'
        meta.content = headerColor
        document.head.appendChild(meta)
      }
    }

    applyTheme()

    if (settings.theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const listener = () => applyTheme()
      mediaQuery.addEventListener('change', listener)
      return () => mediaQuery.removeEventListener('change', listener)
    }
  }, [settings.theme])

  // Initial load
  const loadSchedule = async (forceRefresh = false) => {
    try {
      if (forceRefresh) setIsRefreshing(true)
      else setIsLoading(true)
      setError(null)

      const result = await fetchPlanData(forceRefresh)
      setRawItems(result.data)
      setCacheInfo({
        source: result.source,
        timestamp: result.timestamp,
      })

      if (result.error) {
        console.warn(result.error)
      }
    } catch (err: any) {
      console.error('Error fetching plan data:', err)
      setError(err?.message || 'Błąd ładowania danych planu')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    loadSchedule(false)
  }, [])

  // Parse raw items to flat sessions
  const allSessions = useMemo(() => {
    return parseScheduleData(rawItems)
  }, [rawItems])

  // Extract all 16 weekend zjazdy
  const zjazdy = useMemo(() => {
    return buildWeekendZjazdy(allSessions)
  }, [allSessions])

  // Filtered sessions
  const filteredSessions = useMemo(() => {
    return allSessions.filter((s) => {
      // 1. Faculty filter
      if (settings.selectedFaculties.length > 0) {
        const matchesFaculty = s.faculties.some((f) => settings.selectedFaculties.includes(f))
        if (!matchesFaculty) return false
      }

      // 2. Group filter
      if (settings.selectedGroups.length > 0) {
        const sessionGroups =
          s.groups && s.groups.length > 0
            ? s.groups
            : s.group
            ? s.group.split(',').map((g) => g.trim()).filter(Boolean)
            : []
        const matchesGroup = sessionGroups.some((g) => settings.selectedGroups.includes(g))
        if (!matchesGroup) return false
      }

      // 3. Class Type filter
      if (settings.selectedTypes.length > 0) {
        if (!settings.selectedTypes.includes(s.groupCategory)) return false
      }

      // 4. Room location mode
      if (settings.roomMode === 'campus' && s.isRemote) return false
      if (settings.roomMode === 'remote' && !s.isRemote) return false

      // 5. Search query
      if (settings.searchQuery.trim()) {
        const q = settings.searchQuery.toLowerCase()
        const matchSubject = s.subject.toLowerCase().includes(q)
        const matchTeacher = s.instructor.toLowerCase().includes(q)
        const matchRoom = s.room.toLowerCase().includes(q)
        const matchTitle = s.rawTitle.toLowerCase().includes(q)
        if (!matchSubject && !matchTeacher && !matchRoom && !matchTitle) return false
      }

      return true
    })
  }, [allSessions, settings])

  // Find current weekend zjazd based on selected date
  const currentWeekend = useMemo(() => {
    if (!zjazdy.length) return undefined
    return getNearestWeekend(settings.selectedDate, zjazdy)
  }, [zjazdy, settings.selectedDate])

  // Nearest upcoming zjazd
  const nearestZjazd = useMemo(() => {
    if (!zjazdy.length) return undefined
    const sel = settings.selectedDate
    const upcoming = zjazdy.find((z) => z.sundayDate >= sel)
    return upcoming || zjazdy[0]
  }, [zjazdy, settings.selectedDate])

  // Filter count badge
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (settings.selectedFaculties.length > 0) count++
    if (settings.selectedGroups.length > 0) count++
    if (settings.selectedTypes.length < 7) count++
    if (settings.roomMode !== 'all') count++
    if (settings.searchQuery.trim()) count++
    return count
  }, [settings])

  // Period sessions for toolbar summary
  const periodSessions = useMemo(() => {
    if (settings.viewMode === 'day') {
      return filteredSessions.filter((s) => s.startDate === settings.selectedDate)
    }
    if (settings.viewMode === 'week') {
      if (currentWeekend) {
        return filteredSessions.filter((s) => currentWeekend.dates.includes(s.startDate))
      }
      return filteredSessions.filter((s) => s.startDate === settings.selectedDate)
    }
    // Month
    const selDate = new Date(settings.selectedDate + 'T00:00:00')
    const selYear = selDate.getFullYear()
    const selMonth = selDate.getMonth()
    return filteredSessions.filter((s) => {
      const d = new Date(s.startDate + 'T00:00:00')
      return d.getFullYear() === selYear && d.getMonth() === selMonth
    })
  }, [filteredSessions, settings.viewMode, settings.selectedDate, currentWeekend])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Apple Navigation Header */}
      <Header
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onOpenFilter={() => setIsFilterOpen(true)}
        onOpenSyncInfo={() => setIsSyncInfoOpen(true)}
        onRefreshData={() => loadSchedule(true)}
        isRefreshing={isRefreshing}
        activeFilterCount={activeFilterCount}
        filteredSessions={filteredSessions}
        cacheInfo={cacheInfo}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1, paddingBottom: '40px' }}>
        {/* Navigation Toolbar (Wstecz, Dzisiaj, Dalej, Date & Zjazd jump) */}
        <NavigationToolbar
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          zjazdy={zjazdy}
          currentWeekend={currentWeekend}
          periodSessions={periodSessions}
        />



        {/* Loading Spinner */}
        {isLoading ? (
          <div
            style={{
              padding: '80px 20px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <div
              className="animate-spin"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: '3px solid var(--border-subtle)',
                borderTopColor: 'var(--apple-blue)',
              }}
            />
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Ładowanie planu zajęć WIEiK PK...
            </div>
          </div>
        ) : error && rawItems.length === 0 ? (
          /* Error State */
          <div
            className="apple-card"
            style={{
              maxWidth: '600px',
              margin: '40px auto',
              padding: '32px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '14px',
            }}
          >
            <AlertTriangle size={36} color="var(--apple-red)" />
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Nie udało się załadować planu</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{error}</p>
            <button
              type="button"
              className="apple-btn apple-btn-primary"
              onClick={() => loadSchedule(true)}
            >
              <RefreshCw size={15} />
              <span>Spróbuj ponownie</span>
            </button>
          </div>
        ) : (
          /* Active Calendar View */
          <>
            {settings.viewMode === 'day' && (
              <DayView
                selectedDate={settings.selectedDate}
                sessions={filteredSessions.filter((s) => s.startDate === settings.selectedDate)}
                onSelectSession={(s) => setSelectedSession(s)}
                onJumpToNearestZjazd={() => {
                  if (nearestZjazd) {
                    handleUpdateSettings({ selectedDate: nearestZjazd.saturdayDate })
                  }
                }}
                nearestZjazd={nearestZjazd}
              />
            )}

            {settings.viewMode === 'week' && (
              <WeekView
                weekend={currentWeekend}
                sessions={filteredSessions}
                onSelectSession={(s) => setSelectedSession(s)}
                selectedDate={settings.selectedDate}
                onSelectDate={(dStr) => handleUpdateSettings({ selectedDate: dStr })}
              />
            )}

            {settings.viewMode === 'month' && (
              <MonthView
                selectedDate={settings.selectedDate}
                onSelectDate={(dStr) => handleUpdateSettings({ selectedDate: dStr })}
                sessions={filteredSessions}
                zjazdy={zjazdy}
                onSelectSession={(s) => setSelectedSession(s)}
                onSwitchToDayView={() => handleUpdateSettings({ viewMode: 'day' })}
              />
            )}
          </>
        )}
      </main>

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        allSessions={allSessions}
      />

      {/* Session Details Modal */}
      <SessionDetailModal
        session={selectedSession}
        onClose={() => setSelectedSession(null)}
      />

      {/* Database & Sync Status Modal */}
      <SyncInfoModal
        isOpen={isSyncInfoOpen}
        onClose={() => setIsSyncInfoOpen(false)}
        onForceRefresh={() => loadSchedule(true)}
        isRefreshing={isRefreshing}
        totalItems={rawItems.length}
        totalSessions={allSessions.length}
        cacheInfo={cacheInfo}
      />
    </div>
  )
}

export default App
