import React from 'react'
import {
  Calendar,
  Filter,
  RefreshCw,
  Sun,
  Moon,
  Laptop,
  Download,
  Info,
} from 'lucide-react'
import type { FilterSettings, Session } from '../types/schedule'
import { downloadIcsFile } from '../utils/icsExport'

interface HeaderProps {
  settings: FilterSettings
  onUpdateSettings: (newSettings: Partial<FilterSettings>) => void
  onOpenFilter: () => void
  onOpenSyncInfo: () => void
  onRefreshData: () => void
  isRefreshing: boolean
  activeFilterCount: number
  filteredSessions: Session[]
  cacheInfo: {
    source: string
    timestamp: number
  }
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  onUpdateSettings,
  onOpenFilter,
  onOpenSyncInfo,
  onRefreshData,
  isRefreshing,
  activeFilterCount,
  filteredSessions,
}) => {
  const toggleTheme = () => {
    const nextTheme: Record<string, FilterSettings['theme']> = {
      auto: 'light',
      light: 'dark',
      dark: 'auto',
    }
    onUpdateSettings({ theme: nextTheme[settings.theme] || 'auto' })
  }

  const getThemeIcon = () => {
    if (settings.theme === 'light') return <Sun size={17} />
    if (settings.theme === 'dark') return <Moon size={17} />
    return <Laptop size={17} />
  }

  const getThemeLabel = () => {
    if (settings.theme === 'light') return 'Jasny motyw'
    if (settings.theme === 'dark') return 'Ciemny motyw'
    return 'Motyw urządzenia (Auto)'
  }

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        backgroundColor: 'var(--bg-surface)',
        backdropFilter: 'var(--blur-nav)',
        WebkitBackdropFilter: 'var(--blur-nav)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '12px 20px',
        transition: 'background-color 0.2s ease, border-color 0.2s ease',
      }}
    >
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        {/* Brand & Subtitle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-sm)',
              background: 'linear-gradient(135deg, var(--apple-blue), var(--apple-indigo))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: 'var(--shadow-sm)',
              flexShrink: 0,
            }}
          >
            <Calendar size={22} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1
                style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  letterSpacing: '-0.3px',
                  color: 'var(--text-primary)',
                  margin: 0,
                }}
              >
                Plan Zajęć WIEiK PK
              </h1>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 7px',
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: 'rgba(0, 122, 255, 0.12)',
                  color: 'var(--apple-blue)',
                }}
              >
                2026/2027
              </span>
            </div>
            <p
              style={{
                fontSize: '12px',
                color: 'var(--text-secondary)',
                margin: 0,
              }}
            >
              Wydział Inżynierii Elektrycznej i Komputerowej
            </p>
          </div>
        </div>

        {/* View Mode Switcher (Apple Segmented Control) */}
        <div className="segmented-control" role="tablist" aria-label="Widok kalendarza">
          <button
            type="button"
            role="tab"
            aria-selected={settings.viewMode === 'day'}
            className={`segmented-control-item ${settings.viewMode === 'day' ? 'active' : ''}`}
            onClick={() => onUpdateSettings({ viewMode: 'day' })}
          >
            Dzień
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={settings.viewMode === 'week'}
            className={`segmented-control-item ${settings.viewMode === 'week' ? 'active' : ''}`}
            onClick={() => onUpdateSettings({ viewMode: 'week' })}
          >
            Tydzień (Pt–Nd)
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={settings.viewMode === 'month'}
            className={`segmented-control-item ${settings.viewMode === 'month' ? 'active' : ''}`}
            onClick={() => onUpdateSettings({ viewMode: 'month' })}
          >
            Miesiąc
          </button>
        </div>

        {/* Right Action Icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Filter Button */}
          <button
            type="button"
            className="apple-btn apple-btn-secondary"
            onClick={onOpenFilter}
            style={{
              position: 'relative',
              padding: '7px 14px',
              fontSize: '13px',
              fontWeight: 500,
            }}
            title="Filtruj kierunki, grupy i sale"
          >
            <Filter size={15} />
            <span>Filtry</span>
            {activeFilterCount > 0 && (
              <span
                style={{
                  backgroundColor: 'var(--apple-blue)',
                  color: '#FFFFFF',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: 'var(--radius-pill)',
                }}
              >
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Export to Apple / Google Calendar (.ics) */}
          <button
            type="button"
            className="apple-btn-icon"
            onClick={() => downloadIcsFile(filteredSessions, 'plan_zajec_pk.ics')}
            title="Eksportuj przefiltrowany plan do Apple/Google Calendar (.ics)"
          >
            <Download size={16} />
          </button>

          {/* Sync status info */}
          <button
            type="button"
            className="apple-btn-icon"
            onClick={onOpenSyncInfo}
            title="Informacje o źródle danych i synchronizacji"
          >
            <Info size={16} />
          </button>

          {/* Refresh Data */}
          <button
            type="button"
            className={`apple-btn-icon ${isRefreshing ? 'animate-spin' : ''}`}
            onClick={onRefreshData}
            title="Odśwież dane z plany.wieik.pk.edu.pl"
            disabled={isRefreshing}
          >
            <RefreshCw size={16} />
          </button>

          {/* Theme Selector */}
          <button
            type="button"
            className="apple-btn-icon"
            onClick={toggleTheme}
            title={getThemeLabel()}
          >
            {getThemeIcon()}
          </button>
        </div>
      </div>
    </header>
  )
}
