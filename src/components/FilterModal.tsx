import React, { useMemo, useState } from 'react'
import {
  X,
  Search,
  Check,
  RotateCcw,
  GraduationCap,
  Users,
  Layers,
  MapPin,
  CheckCheck,
} from 'lucide-react'
import type { FilterSettings, GroupCategory, Session } from '../types/schedule'
import {
  FACULTY_METADATA,
  getCategoryMeta,
  resolveFacultyMeta,
  extractSemesterFromCode,
} from '../utils/scheduleParser'

interface FilterModalProps {
  isOpen: boolean
  onClose: () => void
  settings: FilterSettings
  onUpdateSettings: (newSettings: Partial<FilterSettings>) => void
  allSessions: Session[]
}

export const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  allSessions,
}) => {
  const [facultySearch, setFacultySearch] = useState('')

  // Collect all unique faculty codes from dataset
  const availableFaculties = useMemo(() => {
    const set = new Set<string>()
    allSessions.forEach((s) => s.faculties.forEach((f) => set.add(f)))
    return Array.from(set).sort()
  }, [allSessions])

  // Collect all available groups for currently selected faculties (or all if none selected)
  const availableGroups = useMemo(() => {
    const set = new Set<string>()
    allSessions.forEach((s) => {
      const matchFaculty =
        settings.selectedFaculties.length === 0 ||
        s.faculties.some((f) => settings.selectedFaculties.includes(f))

      const matchSemester =
        !settings.selectedSemesters ||
        settings.selectedSemesters.length === 0 ||
        (s.semester !== undefined && settings.selectedSemesters.includes(s.semester))

      if (matchFaculty && matchSemester) {
        if (s.groups && s.groups.length > 0) {
          s.groups.forEach((g) => {
            const clean = g.trim()
            if (clean) set.add(clean)
          })
        } else if (s.group) {
          s.group.split(',').forEach((g) => {
            const clean = g.trim()
            if (clean) set.add(clean)
          })
        }
      }
    })
    return Array.from(set).sort((a, b) => {
      if (a === 'W') return -1
      if (b === 'W') return 1
      return a.localeCompare(b, undefined, { numeric: true })
    })
  }, [allSessions, settings.selectedFaculties, settings.selectedSemesters])

  if (!isOpen) return null

  // Faculty toggling
  const handleToggleFaculty = (code: string) => {
    const isSelected = settings.selectedFaculties.includes(code)
    let next: string[]
    if (isSelected) {
      next = settings.selectedFaculties.filter((f) => f !== code)
    } else {
      next = [...settings.selectedFaculties, code]
    }
    onUpdateSettings({ selectedFaculties: next })
  }

  const handleSelectOnlyFaculty = (code: string) => {
    onUpdateSettings({ selectedFaculties: [code], selectedGroups: [] })
  }

  // Semester toggling (1-8)
  const handleToggleSemester = (sem: number) => {
    const current = settings.selectedSemesters || []
    let next: number[]
    if (current.includes(sem)) {
      next = current.filter((s) => s !== sem)
    } else {
      next = [...current, sem]
    }
    onUpdateSettings({ selectedSemesters: next })
  }

  const handleSelectSemesterPreset = (type: 'all' | 'odd' | 'even') => {
    if (type === 'all') {
      onUpdateSettings({ selectedSemesters: [] })
    } else if (type === 'odd') {
      onUpdateSettings({ selectedSemesters: [1, 3, 5, 7] })
    } else if (type === 'even') {
      onUpdateSettings({ selectedSemesters: [2, 4, 6, 8] })
    }
  }

  const handleToggleGroup = (group: string) => {
    const isSelected = settings.selectedGroups.includes(group)
    let next: string[]
    if (isSelected) {
      next = settings.selectedGroups.filter((g) => g !== group)
    } else {
      next = [...settings.selectedGroups, group]
    }
    onUpdateSettings({ selectedGroups: next })
  }

  const handleToggleType = (type: GroupCategory) => {
    const isSelected = settings.selectedTypes.includes(type)
    let next: GroupCategory[]
    if (isSelected) {
      next = settings.selectedTypes.filter((t) => t !== type)
    } else {
      next = [...settings.selectedTypes, type]
    }
    onUpdateSettings({ selectedTypes: next })
  }

  const handleResetFilters = () => {
    onUpdateSettings({
      selectedFaculties: [],
      selectedSemesters: [],
      selectedGroups: [],
      selectedTypes: ['lecture', 'lab', 'project', 'exercise', 'seminar', 'language', 'other'],
      roomMode: 'all',
      searchQuery: '',
    })
  }

  // Filtered faculties by search text and selected semesters
  const filteredFacultiesList = availableFaculties.filter((fCode) => {
    const meta = resolveFacultyMeta(fCode)
    const label = meta.name.toLowerCase()
    const matchesSearch =
      label.includes(facultySearch.toLowerCase()) || fCode.toLowerCase().includes(facultySearch.toLowerCase())
    if (!matchesSearch) return false

    if (settings.selectedSemesters && settings.selectedSemesters.length > 0) {
      const sem = extractSemesterFromCode(fCode)
      if (sem && !settings.selectedSemesters.includes(sem)) return false
    }

    return true
  })

  const allTypes: GroupCategory[] = [
    'lecture',
    'lab',
    'project',
    'exercise',
    'seminar',
    'language',
    'other',
  ]

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: 'var(--bg-modal-overlay)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
    >
      <div
        className="apple-card animate-scale-up"
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-lg)',
        }}
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
                backgroundColor: 'rgba(0, 122, 255, 0.12)',
                color: 'var(--apple-blue)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Users size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: 700, margin: 0 }}>Filtry planu zajęć</h2>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                Zapisywane automatycznie w pamięci podręcznej
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              className="apple-btn apple-btn-secondary"
              onClick={handleResetFilters}
              style={{ padding: '6px 12px', fontSize: '12px' }}
              title="Resetuj wszystkie filtry do domyślnych"
            >
              <RotateCcw size={13} />
              <span>Resetuj</span>
            </button>

            <button
              type="button"
              className="apple-btn-icon"
              onClick={onClose}
              title="Zamknij"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}
        >
          {/* 1. Global Text Search */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                marginBottom: '8px',
                color: 'var(--text-primary)',
              }}
            >
              Szukaj w planie
            </label>
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Search
                size={16}
                color="var(--text-tertiary)"
                style={{ position: 'absolute', left: '12px' }}
              />
              <input
                type="text"
                value={settings.searchQuery}
                onChange={(e) => onUpdateSettings({ searchQuery: e.target.value })}
                placeholder="Nazwa przedmiotu, nazwisko prowadzącego, sala..."
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 38px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-pill)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                }}
              />
              {settings.searchQuery && (
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ searchQuery: '' })}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    color: 'var(--text-tertiary)',
                  }}
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>

          {/* 2. Semestr studiów (Wsparcie dla semestrów 1 do 8) */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '8px',
              }}
            >
              <label
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Layers size={16} color="var(--apple-indigo)" />
                <span>
                  Semestr studiów ({settings.selectedSemesters && settings.selectedSemesters.length > 0
                    ? `Semestry: ${settings.selectedSemesters.sort().join(', ')}`
                    : 'Wszystkie semestry 1–8'})
                </span>
              </label>

              {settings.selectedSemesters && settings.selectedSemesters.length > 0 && (
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ selectedSemesters: [] })}
                  style={{ fontSize: '12px', color: 'var(--apple-blue)', fontWeight: 500 }}
                >
                  Wszystkie semestry
                </button>
              )}
            </div>

            {/* Quick Presets for Semesters */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px',
                marginBottom: '10px',
              }}
            >
              <button
                type="button"
                className="apple-btn"
                onClick={() => handleSelectSemesterPreset('all')}
                style={{
                  padding: '4px 10px',
                  fontSize: '11px',
                  backgroundColor:
                    !settings.selectedSemesters || settings.selectedSemesters.length === 0
                      ? 'var(--apple-indigo)'
                      : 'var(--bg-pill)',
                  color:
                    !settings.selectedSemesters || settings.selectedSemesters.length === 0
                      ? '#FFFFFF'
                      : 'var(--text-primary)',
                }}
              >
                Wszystkie semestry
              </button>

              <button
                type="button"
                className="apple-btn"
                onClick={() => handleSelectSemesterPreset('odd')}
                style={{
                  padding: '4px 10px',
                  fontSize: '11px',
                  backgroundColor: 'var(--bg-pill)',
                  color: 'var(--text-primary)',
                }}
                title="Semestry nieparzyste (zimowe: 1, 3, 5, 7)"
              >
                ❄️ Zimowe (1, 3, 5, 7)
              </button>

              <button
                type="button"
                className="apple-btn"
                onClick={() => handleSelectSemesterPreset('even')}
                style={{
                  padding: '4px 10px',
                  fontSize: '11px',
                  backgroundColor: 'var(--bg-pill)',
                  color: 'var(--text-primary)',
                }}
                title="Semestry parzyste (letnie: 2, 4, 6, 8)"
              >
                ☀️ Letnie (2, 4, 6, 8)
              </button>
            </div>

            {/* Semester Number Buttons 1 to 8 */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(8, 1fr)',
                gap: '6px',
              }}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((semNum) => {
                const isSelected =
                  settings.selectedSemesters && settings.selectedSemesters.includes(semNum)
                const isOdd = semNum % 2 !== 0

                return (
                  <button
                    key={semNum}
                    type="button"
                    onClick={() => handleToggleSemester(semNum)}
                    style={{
                      padding: '8px 4px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '13px',
                      fontWeight: 700,
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isSelected ? 'var(--apple-indigo)' : 'var(--bg-pill)',
                      color: isSelected ? '#FFFFFF' : 'var(--text-primary)',
                      border: `1px solid ${isSelected ? 'transparent' : 'var(--border-subtle)'}`,
                      cursor: 'pointer',
                    }}
                    title={`Semestr ${semNum} (${isOdd ? 'zimowy' : 'letni'})`}
                  >
                    <span>{semNum}</span>
                    <span
                      style={{
                        fontSize: '9px',
                        fontWeight: 500,
                        opacity: 0.75,
                        textTransform: 'uppercase',
                      }}
                    >
                      {isOdd ? 'zim.' : 'let.'}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 3. Kierunek studiów (Faculty) */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '8px',
              }}
            >
              <label
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <GraduationCap size={16} color="var(--apple-blue)" />
                <span>Kierunek studiów i semestr ({settings.selectedFaculties.length > 0 ? settings.selectedFaculties.length : 'Wszystkie'})</span>
              </label>

              {settings.selectedFaculties.length > 0 && (
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ selectedFaculties: [] })}
                  style={{ fontSize: '12px', color: 'var(--apple-blue)', fontWeight: 500 }}
                >
                  Pokaż wszystkie kierunki
                </button>
              )}
            </div>

            {/* Quick search inside faculty list */}
            <input
              type="text"
              value={facultySearch}
              onChange={(e) => setFacultySearch(e.target.value)}
              placeholder="Filtruj listę kierunków..."
              style={{
                width: '100%',
                padding: '7px 12px',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-pill)',
                color: 'var(--text-primary)',
                fontSize: '12px',
                marginBottom: '10px',
              }}
            />

            <div
              style={{
                maxHeight: '180px',
                overflowY: 'auto',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              {filteredFacultiesList.map((fCode) => {
                const meta = FACULTY_METADATA[fCode]
                const isSelected = settings.selectedFaculties.includes(fCode)
                return (
                  <div
                    key={fCode}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '7px 10px',
                      borderRadius: 'var(--radius-xs)',
                      backgroundColor: isSelected ? 'rgba(0, 122, 255, 0.12)' : 'transparent',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleToggleFaculty(fCode)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '4px',
                          border: `1.5px solid ${isSelected ? 'var(--apple-blue)' : 'var(--border-strong)'}`,
                          backgroundColor: isSelected ? 'var(--apple-blue)' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#FFFFFF',
                        }}
                      >
                        {isSelected && <Check size={12} strokeWidth={3} />}
                      </div>
                      <div>
                        <span
                          style={{
                            fontSize: '13px',
                            fontWeight: isSelected ? 600 : 400,
                            color: isSelected ? 'var(--apple-blue)' : 'var(--text-primary)',
                          }}
                        >
                          {meta ? meta.name : fCode}
                        </span>
                        <span
                          style={{
                            fontSize: '11px',
                            marginLeft: '6px',
                            color: 'var(--text-tertiary)',
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          [{fCode}]
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSelectOnlyFaculty(fCode)
                      }}
                      style={{
                        fontSize: '11px',
                        color: 'var(--text-secondary)',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-pill)',
                        backgroundColor: 'var(--bg-pill)',
                      }}
                      title="Wybierz tylko ten jeden kierunek"
                    >
                      Tylko ten
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 3. Grupy zajęciowe (Groups filter) */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '8px',
              }}
            >
              <label
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Users size={16} color="var(--apple-green)" />
                <span>Grupy zajęciowe ({settings.selectedGroups.length > 0 ? settings.selectedGroups.length : 'Wszystkie'})</span>
              </label>

              {settings.selectedGroups.length > 0 && (
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ selectedGroups: [] })}
                  style={{ fontSize: '12px', color: 'var(--apple-blue)', fontWeight: 500 }}
                >
                  Pokaż wszystkie grupy
                </button>
              )}
            </div>

            {/* Quick Presets */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px',
                marginBottom: '10px',
              }}
            >
              <button
                type="button"
                className="apple-btn"
                onClick={() => onUpdateSettings({ selectedGroups: [] })}
                style={{
                  padding: '4px 10px',
                  fontSize: '11px',
                  backgroundColor: settings.selectedGroups.length === 0 ? 'var(--apple-blue)' : 'var(--bg-pill)',
                  color: settings.selectedGroups.length === 0 ? '#FFFFFF' : 'var(--text-primary)',
                }}
              >
                <CheckCheck size={12} />
                Wszystkie grupy
              </button>

              <button
                type="button"
                className="apple-btn"
                onClick={() => onUpdateSettings({ selectedGroups: ['W'] })}
                style={{
                  padding: '4px 10px',
                  fontSize: '11px',
                  backgroundColor: 'var(--bg-pill)',
                  color: 'var(--text-primary)',
                }}
              >
                Tylko wykłady (W)
              </button>
            </div>

            {/* Group Pills Multi-select */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px',
                maxHeight: '140px',
                overflowY: 'auto',
                padding: '4px 0',
              }}
            >
              {availableGroups.map((grp) => {
                const isSelected = settings.selectedGroups.includes(grp)
                const isLecture = grp === 'W'
                return (
                  <button
                    key={grp}
                    type="button"
                    onClick={() => handleToggleGroup(grp)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 'var(--radius-pill)',
                      fontSize: '12px',
                      fontWeight: isSelected ? 600 : 500,
                      backgroundColor: isSelected
                        ? isLecture
                          ? 'var(--apple-blue)'
                          : 'var(--apple-green)'
                        : 'var(--bg-pill)',
                      color: isSelected ? '#FFFFFF' : 'var(--text-primary)',
                      border: `1px solid ${isSelected ? 'transparent' : 'var(--border-subtle)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {isSelected && <Check size={12} strokeWidth={3} />}
                    <span>{grp}</span>
                    {isLecture && <span style={{ opacity: 0.8, fontSize: '10px' }}>(Wykład)</span>}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 4. Typ zajęć (Class Category) */}
          <div>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: 600,
                marginBottom: '8px',
                color: 'var(--text-primary)',
              }}
            >
              <Layers size={16} color="var(--apple-purple)" />
              <span>Typ zajęć</span>
            </label>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {allTypes.map((type) => {
                const meta = getCategoryMeta(type)
                const isSelected = settings.selectedTypes.includes(type)
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleToggleType(type)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '12px',
                      fontWeight: isSelected ? 600 : 500,
                      backgroundColor: isSelected ? meta.color : 'var(--bg-pill)',
                      color: isSelected ? '#FFFFFF' : 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: isSelected ? '#FFFFFF' : meta.color,
                      }}
                    />
                    <span>{meta.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 5. Miejsce / Tryb sali (Campus vs MS Teams) */}
          <div>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: 600,
                marginBottom: '8px',
                color: 'var(--text-primary)',
              }}
            >
              <MapPin size={16} color="var(--apple-orange)" />
              <span>Miejsce odbywania zajęć</span>
            </label>

            <div className="segmented-control" style={{ width: '100%', display: 'flex' }}>
              <button
                type="button"
                className={`segmented-control-item ${settings.roomMode === 'all' ? 'active' : ''}`}
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => onUpdateSettings({ roomMode: 'all' })}
              >
                Wszystkie
              </button>
              <button
                type="button"
                className={`segmented-control-item ${settings.roomMode === 'campus' ? 'active' : ''}`}
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => onUpdateSettings({ roomMode: 'campus' })}
              >
                🏛️ Kampus (Stacjonarne)
              </button>
              <button
                type="button"
                className={`segmented-control-item ${settings.roomMode === 'remote' ? 'active' : ''}`}
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => onUpdateSettings({ roomMode: 'remote' })}
              >
                💻 MS Teams (Zdalne)
              </button>
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
          <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
            Zmiany zapisane w pamięci
          </div>

          <button
            type="button"
            className="apple-btn apple-btn-primary"
            onClick={onClose}
            style={{ padding: '8px 24px', fontSize: '14px', fontWeight: 600 }}
          >
            Zastosuj filtry
          </button>
        </div>
      </div>
    </div>
  )
}
