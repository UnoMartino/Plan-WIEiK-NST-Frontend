import React from 'react'
import {
  Calendar,
  Filter,
  RefreshCw,
  Sun,
  Moon,
  Download,
  Info,
} from 'lucide-react'
import type { FilterSettings, Session } from '../types/schedule'
import { downloadIcsFile } from '../utils/icsExport'

const AutoSunIcon: React.FC<{ size?: number }> = ({ size = 17 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
  >
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    <circle cx="12" cy="12" r="6" strokeWidth="1.8" />
    <text
      x="12"
      y="15.2"
      textAnchor="middle"
      fontSize="9.5"
      fontWeight="800"
      fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif"
      fill="currentColor"
      stroke="none"
    >
      A
    </text>
  </svg>
)

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
    return <AutoSunIcon size={17} />
  }

  const getThemeLabel = () => {
    if (settings.theme === 'light') return 'Jasny motyw'
    if (settings.theme === 'dark') return 'Ciemny motyw'
    return 'Motyw urządzenia (Auto: A w słońcu)'
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
        padding: '10px 16px',
        transition: 'background-color 0.2s ease, border-color 0.2s ease',
      }}
    >
      <div className="header-container">
        {/* Top row: Brand & Action Icons */}
        <div className="header-top-row">
          {/* Brand & Subtitle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
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
              <Calendar size={20} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h1
                  style={{
                    fontSize: '17px',
                    fontWeight: 700,
                    letterSpacing: '-0.3px',
                    color: 'var(--text-primary)',
                    margin: 0,
                  }}
                >
                  Plan WIEiK PK
                </h1>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 600,
                    padding: '1px 6px',
                    borderRadius: 'var(--radius-pill)',
                    backgroundColor: 'rgba(0, 122, 255, 0.12)',
                    color: 'var(--apple-blue)',
                  }}
                >
                  2026/27
                </span>
              </div>
              <p
                style={{
                  fontSize: '11px',
                  color: 'var(--text-secondary)',
                  margin: 0,
                  whiteSpace: 'nowrap',
                }}
              >
                Inżynieria Elektryczna i Komputerowa
              </p>
            </div>
          </div>

          {/* Right Action Icons (in top row on mobile) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* Filter Button */}
            <button
              type="button"
              className="apple-btn apple-btn-secondary"
              onClick={onOpenFilter}
              style={{
                position: 'relative',
                padding: '6px 12px',
                fontSize: '13px',
                fontWeight: 500,
              }}
              title="Filtruj kierunki, grupy i sale"
            >
              <Filter size={14} />
              <span>Filtry</span>
              {activeFilterCount > 0 && (
                <span
                  style={{
                    backgroundColor: 'var(--apple-blue)',
                    color: '#FFFFFF',
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '1px 5px',
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
              <Download size={15} />
            </button>

            {/* Sync status info */}
            <button
              type="button"
              className="apple-btn-icon hide-on-mobile"
              onClick={onOpenSyncInfo}
              title="Informacje o źródle danych i synchronizacji"
            >
              <Info size={15} />
            </button>

            {/* Refresh Data */}
            <button
              type="button"
              className={`apple-btn-icon ${isRefreshing ? 'animate-spin' : ''}`}
              onClick={onRefreshData}
              title="Odśwież dane z plany.wieik.pk.edu.pl"
              disabled={isRefreshing}
            >
              <RefreshCw size={15} />
            </button>

            {/* Theme Selector (Auto: A w słońcu) */}
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

        {/* View Mode Switcher (Apple Segmented Control) */}
        <div className="segmented-control header-segmented" role="tablist" aria-label="Widok kalendarza">
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
      </div>

      <style>{`
        .header-container {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        .header-top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        @media (max-width: 820px) {
          .header-container {
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
          }
          .header-top-row {
            width: 100%;
          }
          .header-segmented {
            width: 100% !important;
            display: flex !important;
          }
          .header-segmented .segmented-control-item {
            flex: 1;
            justify-content: center;
            padding: 7px 4px;
            font-size: 13px;
          }
        }
      `}</style>
    </header>
  )
}
