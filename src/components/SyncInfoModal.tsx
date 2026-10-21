import React from 'react'
import {
  X,
  Database,
  ExternalLink,
  Code2,
  HardDrive,
  RefreshCw,
  Clock,
  Sparkles,
} from 'lucide-react'

interface SyncInfoModalProps {
  isOpen: boolean
  onClose: () => void
  onForceRefresh: () => void
  isRefreshing: boolean
  totalItems: number
  totalSessions: number
  cacheInfo: {
    source: string
    timestamp: number
  }
}

export const SyncInfoModal: React.FC<SyncInfoModalProps> = ({
  isOpen,
  onClose,
  onForceRefresh,
  isRefreshing,
  totalItems,
  totalSessions,
  cacheInfo,
}) => {
  if (!isOpen) return null

  const formattedDate = cacheInfo.timestamp
    ? new Date(cacheInfo.timestamp).toLocaleString('pl-PL', {
        dateStyle: 'medium',
        timeStyle: 'medium',
      })
    : 'Nieznana'

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 110,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: 'var(--bg-modal-overlay)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
      onClick={onClose}
    >
      <div
        className="apple-card animate-scale-up"
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-lg)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(52, 199, 89, 0.12)',
                color: 'var(--apple-green)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Database size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, margin: 0 }}>
                Baza Danych i Synchronizacja
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                Informacje o źródle planu i pamięci podręcznej
              </p>
            </div>
          </div>

          <button type="button" className="apple-btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {/* Source Link */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-pill)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Źródło danych (Uczelnia)
            </div>
            <a
              href="https://plany.wieik.pk.edu.pl/doku.php?id=start:plany:bazan"
              target="_blank"
              rel="noreferrer"
              style={{
                fontSize: '13px',
                color: 'var(--apple-blue)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                wordBreak: 'break-all',
                textDecoration: 'none',
              }}
            >
              <span>https://plany.wieik.pk.edu.pl/doku.php?id=start:plany:bazan</span>
              <ExternalLink size={13} />
            </a>
          </div>

          {/* Selector Info */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-pill)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Selektor CSS
            </div>
            <div
              style={{
                fontSize: '12px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Code2 size={14} color="var(--apple-purple)" />
              <span>#dokuwiki__content &gt; div &gt; div &gt; pre</span>
            </div>
          </div>

          {/* Statistics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-pill)',
              }}
            >
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Przedmioty w bazie</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--apple-blue)' }}>
                {totalItems}
              </div>
            </div>

            <div
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-pill)',
              }}
            >
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Wszystkie terminy zajęć</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--apple-green)' }}>
                {totalSessions}
              </div>
            </div>
          </div>

          {/* Cache Status */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <HardDrive size={22} color="var(--apple-orange)" />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Pamięć podręczna przeglądarki (LocalStorage)
              </div>
              <div
                style={{
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginTop: '2px',
                }}
              >
                <Clock size={12} />
                <span>Ostatnia synchronizacja: {formattedDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 20px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--apple-green)' }}>
            <Sparkles size={14} />
            <span>Działa w trybie offline</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              className="apple-btn apple-btn-primary"
              onClick={onForceRefresh}
              disabled={isRefreshing}
              style={{ fontSize: '13px' }}
            >
              <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
              <span>{isRefreshing ? 'Pobieranie...' : 'Wymuś synchronizację'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
