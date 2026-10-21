import React, { useState } from 'react'
import {
  X,
  Clock,
  MapPin,
  User,
  GraduationCap,
  Download,
  Copy,
  Check,
  Video,
} from 'lucide-react'
import type { Session } from '../types/schedule'
import {
  formatRoomDisplay,
  getCategoryMeta,
  getFacultyLabel,
} from '../utils/scheduleParser'
import { formatDayFull } from '../utils/dateUtils'
import { downloadIcsFile } from '../utils/icsExport'

interface SessionDetailModalProps {
  session: Session | null
  onClose: () => void
}

export const SessionDetailModal: React.FC<SessionDetailModalProps> = ({ session, onClose }) => {
  const [copied, setCopied] = useState(false)

  if (!session) return null

  const categoryMeta = getCategoryMeta(session.groupCategory)
  const roomInfo = formatRoomDisplay(session.room)

  const handleCopy = () => {
    const text = [
      `Przedmiot: ${session.subject}`,
      `Typ i grupa: ${categoryMeta.label} (${session.group})`,
      `Termin: ${formatDayFull(session.startDate)} ${session.startTime} - ${session.endTime} (${session.duration})`,
      `Prowadzący: ${session.instructor}`,
      `Miejsce: ${roomInfo.displayName} ${roomInfo.subText ? `(${roomInfo.subText})` : ''}`,
      `Kierunek: ${session.faculties.map(getFacultyLabel).join(', ')}`,
    ].join('\n')

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

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
          maxWidth: '540px',
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-lg)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div
          style={{
            padding: '18px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span
                className="apple-badge"
                style={{
                  backgroundColor: categoryMeta.bgLight,
                  color: categoryMeta.color,
                }}
              >
                {categoryMeta.label} • Grupa {session.group}
              </span>

              {session.isRemote ? (
                <span
                  className="apple-badge"
                  style={{
                    backgroundColor: 'rgba(88, 86, 214, 0.12)',
                    color: 'var(--apple-indigo)',
                  }}
                >
                  <Video size={11} /> Zdalnie (Teams)
                </span>
              ) : (
                <span
                  className="apple-badge"
                  style={{
                    backgroundColor: 'rgba(52, 199, 89, 0.12)',
                    color: 'var(--apple-green)',
                  }}
                >
                  <MapPin size={11} /> Kampus PK
                </span>
              )}
            </div>

            <h3
              style={{
                fontSize: '18px',
                fontWeight: 700,
                color: 'var(--text-primary)',
                lineHeight: 1.3,
                margin: 0,
              }}
            >
              {session.subject}
            </h3>
          </div>

          <button
            type="button"
            className="apple-btn-icon"
            onClick={onClose}
            title="Zamknij"
          >
            <X size={18} />
          </button>
        </div>

        {/* Details Body */}
        <div
          style={{
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {/* Time & Date */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(0, 122, 255, 0.12)',
                color: 'var(--apple-blue)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Clock size={18} />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {session.startTime} – {session.endTime} ({session.duration})
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                {formatDayFull(session.startDate)}
              </div>
            </div>
          </div>

          {/* Instructor */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(255, 149, 0, 0.12)',
                color: 'var(--apple-orange)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <User size={18} />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {session.instructor}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Prowadzący zajęcia
              </div>
            </div>
          </div>

          {/* Room Location */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: session.isRemote
                  ? 'rgba(88, 86, 214, 0.12)'
                  : 'rgba(52, 199, 89, 0.12)',
                color: session.isRemote ? 'var(--apple-indigo)' : 'var(--apple-green)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {session.isRemote ? <Video size={18} /> : <MapPin size={18} />}
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {roomInfo.displayName}
              </div>
              {roomInfo.subText && (
                <div
                  style={{
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                    fontFamily: session.isRemote ? 'var(--font-mono)' : 'inherit',
                    wordBreak: 'break-all',
                  }}
                >
                  {roomInfo.subText}
                </div>
              )}
            </div>
          </div>

          {/* Faculty / Studies */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(175, 82, 222, 0.12)',
                color: 'var(--apple-purple)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <GraduationCap size={18} />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {session.faculties.map((f) => getFacultyLabel(f)).join(', ')}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Kierunek i specjalność
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '14px 18px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {/* Primary Action Button - Full Width */}
          <button
            type="button"
            className="apple-btn apple-btn-primary"
            onClick={() => downloadIcsFile([session], `${session.subject}_${session.startDate}.ics`)}
            style={{
              width: '100%',
              padding: '10px 16px',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <Download size={15} />
            <span>Dodaj do Kalendarza (.ics)</span>
          </button>

          {/* Secondary Actions Row - Equal 50/50 Width */}
          <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
            <button
              type="button"
              className="apple-btn apple-btn-secondary"
              onClick={handleCopy}
              style={{
                flex: 1,
                padding: '8px 12px',
                fontSize: '13px',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              {copied ? <Check size={14} color="var(--apple-green)" /> : <Copy size={14} />}
              <span>{copied ? 'Skopiowano!' : 'Kopiuj'}</span>
            </button>

            <button
              type="button"
              className="apple-btn apple-btn-secondary"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '8px 12px',
                fontSize: '13px',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              Zamknij
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
