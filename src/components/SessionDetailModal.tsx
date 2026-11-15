import React, { useId, useState } from 'react'
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
  StickyNote,
  Trash2,
  BookOpen,
  CalendarDays,
} from 'lucide-react'
import type { NoteScope, ScheduleNotes, Session } from '../types/schedule'
import {
  formatRoomDisplay,
  getCategoryMeta,
  getSubjectColor,
  getFacultyLabel,
} from '../utils/scheduleParser'
import { formatDayFull } from '../utils/dateUtils'
import { downloadIcsFile } from '../utils/icsExport'
import { getNotesForSession } from '../utils/storage'

interface SessionDetailModalProps {
  session: Session | null
  onClose: () => void
  notes: ScheduleNotes
  onUpdateNote: (scope: NoteScope, session: Session, text: string) => Promise<void>
}

export const SessionDetailModal: React.FC<SessionDetailModalProps> = ({
  session,
  onClose,
  notes,
  onUpdateNote,
}) => {
  const [copied, setCopied] = useState(false)
  const formHeadingId = useId()
  const radioSessionId = useId()
  const radioSubjectId = useId()
  const textareaId = useId()
  const helperId = useId()

  const existingNotes = session ? getNotesForSession(session, notes) : {}

  const [scope, setScope] = useState<NoteScope>(() => {
    if (existingNotes.sessionNote) return 'session'
    if (existingNotes.subjectNote) return 'subject'
    return 'session'
  })

  const [drafts, setDrafts] = useState<{ session: string; subject: string }>(() => ({
    session: existingNotes.sessionNote?.text || '',
    subject: existingNotes.subjectNote?.text || '',
  }))

  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [statusMessage, setStatusMessage] = useState<string>('')
  const [isError, setIsError] = useState<boolean>(false)

  if (!session) return null

  const categoryMeta = getCategoryMeta(session.groupCategory)
  const subjectColor = getSubjectColor(session.subject)
  const roomInfo = formatRoomDisplay(session.room)
  const { sessionNote, subjectNote } = getNotesForSession(session, notes)

  const currentDraft = drafts[scope]
  const savedNoteForScope = scope === 'session' ? sessionNote : subjectNote
  const otherScope: NoteScope = scope === 'session' ? 'subject' : 'session'
  const otherSavedNote = scope === 'session' ? subjectNote : sessionNote

  const handleSaveNote = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isSaving) return
    setIsSaving(true)
    setIsError(false)
    try {
      await onUpdateNote(scope, session, currentDraft)
      const trimmed = currentDraft.trim()
      setStatusMessage(
        trimmed
          ? scope === 'session'
            ? 'Zapisano na serwerze (ten termin)'
            : 'Zapisano na serwerze (cały przedmiot)'
          : 'Usunięto notatkę z serwera'
      )
      setTimeout(() => setStatusMessage(''), 2500)
    } catch (err: unknown) {
      setIsError(true)
      setStatusMessage(err instanceof Error ? err.message : 'Błąd zapisu na serwerze')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteNote = async () => {
    if (isSaving) return
    setIsSaving(true)
    setIsError(false)
    try {
      await onUpdateNote(scope, session, '')
      setDrafts((prev) => ({ ...prev, [scope]: '' }))
      setStatusMessage('Usunięto notatkę z serwera')
      setTimeout(() => setStatusMessage(''), 2500)
    } catch (err: unknown) {
      setIsError(true)
      setStatusMessage(err instanceof Error ? err.message : 'Błąd usuwania notatki')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCopy = () => {
    const lines = [
      `Przedmiot: ${session.subject}`,
      `Typ i grupa: ${categoryMeta.label} (${session.group})`,
      `Termin: ${formatDayFull(session.startDate)} ${session.startTime} - ${session.endTime} (${session.duration})`,
      `Prowadzący: ${session.instructor}`,
      `Miejsce: ${roomInfo.displayName} ${roomInfo.subText ? `(${roomInfo.subText})` : ''}`,
      `Kierunek: ${session.faculties.map(getFacultyLabel).join(', ')}`,
    ]
    if (sessionNote) {
      lines.push(`Notatka (ten termin): ${sessionNote.text}`)
    }
    if (subjectNote) {
      lines.push(`Notatka (przedmiot): ${subjectNote.text}`)
    }

    navigator.clipboard.writeText(lines.join('\n')).then(() => {
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
          maxHeight: '90vh',
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
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
                  backgroundColor: subjectColor.bgLight,
                  color: subjectColor.color,
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

        {/* Scrollable Details & Notes Body */}
        <div
          style={{
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            overflowY: 'auto',
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

          {/* Notes Section */}
          <form
            onSubmit={handleSaveNote}
            aria-labelledby={formHeadingId}
            style={{
              marginTop: '4px',
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-pill)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <StickyNote size={16} color="var(--apple-orange)" />
                <span
                  id={formHeadingId}
                  style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}
                >
                  Współdzielone notatki
                </span>
              </div>

              {savedNoteForScope && (
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                  Zapisano:{' '}
                  {new Date(savedNoteForScope.updatedAt).toLocaleString('pl-PL', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </span>
              )}
            </div>

            {/* Scope Choice: Specific Class Entry vs Whole Subject */}
            <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
              <legend
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  marginBottom: '6px',
                }}
              >
                Przypisz notatkę do:
              </legend>

              <div
                className="segmented-control"
                style={{ width: '100%', display: 'flex' }}
              >
                <input
                  type="radio"
                  id={radioSessionId}
                  name="noteScope"
                  value="session"
                  checked={scope === 'session'}
                  onChange={() => setScope('session')}
                  className="visually-hidden segmented-control-radio"
                />
                <label
                  htmlFor={radioSessionId}
                  className={`segmented-control-item ${scope === 'session' ? 'active' : ''}`}
                  style={{ flex: 1, justifyContent: 'center', cursor: 'pointer', fontSize: '12px' }}
                >
                  <CalendarDays size={13} />
                  <span>Tylko ten termin</span>
                  {sessionNote && (
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--apple-orange)',
                      }}
                      title="Posiada zapisaną notatkę"
                    />
                  )}
                </label>

                <input
                  type="radio"
                  id={radioSubjectId}
                  name="noteScope"
                  value="subject"
                  checked={scope === 'subject'}
                  onChange={() => setScope('subject')}
                  className="visually-hidden segmented-control-radio"
                />
                <label
                  htmlFor={radioSubjectId}
                  className={`segmented-control-item ${scope === 'subject' ? 'active' : ''}`}
                  style={{ flex: 1, justifyContent: 'center', cursor: 'pointer', fontSize: '12px' }}
                >
                  <BookOpen size={13} />
                  <span>Cały przedmiot</span>
                  {subjectNote && (
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--apple-blue)',
                      }}
                      title="Posiada zapisaną notatkę"
                    />
                  )}
                </label>
              </div>
            </fieldset>

            {/* Textarea with visible label */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label
                htmlFor={textareaId}
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                }}
              >
                {scope === 'session'
                  ? `Treść notatki dla zajęć w dniu ${session.startDate} (${session.startTime}):`
                  : `Treść notatki dla wszystkich zajęć z przedmiotu „${session.subject}”:`}
              </label>
              <textarea
                id={textareaId}
                name="noteText"
                className="note-textarea"
                aria-describedby={helperId}
                value={currentDraft}
                onChange={(e) =>
                  setDrafts((prev) => ({
                    ...prev,
                    [scope]: e.target.value,
                  }))
                }
                placeholder={
                  scope === 'session'
                    ? 'Np. Kolokwium zaliczeniowe, przynieść sprawozdanie...'
                    : 'Np. Warunki zaliczenia, link do materiałów, konsultacje...'
                }
              />
              <span
                id={helperId}
                style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}
              >
                {scope === 'session'
                  ? 'Zapisywana na serwerze i widoczna dla wszystkich przy tym konkretnym terminie.'
                  : 'Zapisywana na serwerze i widoczna dla wszystkich przy każdym terminie tego przedmiotu.'}
              </span>
            </div>

            {/* Save / Delete Note Controls & Status */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                flexWrap: 'wrap',
              }}
            >
              <div
                role="status"
                aria-live="polite"
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: isError ? 'var(--apple-red)' : 'var(--apple-green)',
                  minHeight: '18px',
                }}
              >
                {statusMessage}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
                {(savedNoteForScope || currentDraft.trim()) && (
                  <button
                    type="button"
                    className="apple-btn apple-btn-secondary"
                    onClick={handleDeleteNote}
                    disabled={isSaving}
                    style={{
                      padding: '6px 10px',
                      fontSize: '12px',
                      color: 'var(--apple-red)',
                      gap: '5px',
                      opacity: isSaving ? 0.6 : 1,
                    }}
                    title="Usuń tę notatkę z serwera"
                  >
                    <Trash2 size={13} />
                    <span>Usuń</span>
                  </button>
                )}

                <button
                  type="submit"
                  className="apple-btn apple-btn-primary"
                  disabled={isSaving}
                  style={{
                    padding: '6px 14px',
                    fontSize: '12px',
                    fontWeight: 600,
                    opacity: isSaving ? 0.6 : 1,
                  }}
                >
                  {isSaving ? 'Zapisywanie...' : 'Zapisz notatkę'}
                </button>
              </div>
            </div>

            {/* Preview of note from the other scope if present */}
            {otherSavedNote && (
              <div
                style={{
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-xs)',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '3px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: otherScope === 'subject' ? 'var(--apple-blue)' : 'var(--apple-orange)',
                  }}
                >
                  <span>
                    {otherScope === 'subject'
                      ? 'Notatka dla całego przedmiotu:'
                      : 'Notatka dla tego terminu:'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setScope(otherScope)}
                    style={{
                      fontSize: '11px',
                      color: 'var(--apple-blue)',
                      fontWeight: 600,
                    }}
                  >
                    Edytuj
                  </button>
                </div>
                <div
                  style={{
                    color: 'var(--text-secondary)',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {otherSavedNote.text}
                </div>
              </div>
            )}
          </form>
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
            onClick={() =>
              downloadIcsFile([session], `${session.subject}_${session.startDate}.ics`, notes)
            }
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
