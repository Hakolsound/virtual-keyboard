import { memo, useCallback, useEffect } from 'react'
import { useSettings } from '../context/SettingsContext'
import { useKeyboard } from '../context/KeyboardContext'
import { ALL_LANGUAGE_CODES } from '../layouts'
import type { LanguageCode } from '../layouts'

const LANGUAGE_NAMES: Record<LanguageCode, string> = {
  en:      'English',
  he:      'Hebrew  עברית',
  es:      'Spanish  Español',
  'pt-br': 'Portuguese  Português',
  emoji:   'Emoji  😀',
}

function SettingsModal() {
  const { isSettingsOpen, closeSettings, enabledLanguages, toggleLanguage, getLabel, availableLanguages } = useSettings()
  const { activeLanguage, setLanguage } = useKeyboard()

  useEffect(() => {
    if (!enabledLanguages.includes(activeLanguage) && enabledLanguages.length > 0) {
      setLanguage(enabledLanguages[0])
    }
  }, [enabledLanguages, activeLanguage, setLanguage])

  const handleToggle = useCallback((code: LanguageCode) => {
    toggleLanguage(code)
  }, [toggleLanguage])

  if (!isSettingsOpen) return null

  return (
    /* Backdrop */
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.45)',
      }}
      onPointerDown={e => { if (e.target === e.currentTarget) closeSettings() }}
    >
      {/* Modal card */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          width: '300px',
          maxWidth: '90%',
          overflow: 'hidden',
          animation: 'vkb-modal-in 200ms cubic-bezier(0.34,1.4,0.64,1) both',
        }}
        onPointerDown={e => e.stopPropagation()}
      >
        <style>{`
          @keyframes vkb-modal-in {
            from { opacity: 0; transform: scale(0.88); }
            to   { opacity: 1; transform: scale(1); }
          }
        `}</style>

        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 18px 14px',
          borderBottom: '1px solid #F0F0F5',
        }}>
          <span style={{ fontSize: '16px', fontWeight: '600', color: '#1C1C1E' }}>
            Keyboard Languages
          </span>
          <button
            type="button"
            aria-label="Close settings"
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: '#E5E5EA',
              color: '#6C6C70',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: '700',
              touchAction: 'manipulation',
            }}
            onPointerDown={e => { e.preventDefault(); closeSettings() }}
          >
            ✕
          </button>
        </div>

        {/* Language list */}
        <div style={{ padding: '4px 0' }}>
          {availableLanguages.map((code, i) => {
            const isEnabled = enabledLanguages.includes(code)
            const isLastOn  = enabledLanguages.length === 1 && isEnabled
            const isLast    = i === availableLanguages.length - 1
            return (
              <div
                key={code}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 18px',
                  borderBottom: isLast ? 'none' : '1px solid #F2F2F7',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#8E8E93',
                    width: '32px',
                    textAlign: 'center',
                  }}>
                    {getLabel(code)}
                  </span>
                  <span style={{ fontSize: '14px', color: '#1C1C1E' }}>
                    {LANGUAGE_NAMES[code]}
                  </span>
                </div>

                {/* iOS toggle switch */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={isEnabled}
                  aria-label={`Toggle ${LANGUAGE_NAMES[code]}`}
                  disabled={isLastOn}
                  style={{
                    position: 'relative',
                    width: '48px',
                    height: '28px',
                    borderRadius: '14px',
                    border: 'none',
                    cursor: isLastOn ? 'not-allowed' : 'pointer',
                    backgroundColor: isEnabled ? '#34C759' : '#E5E5EA',
                    opacity: isLastOn ? 0.45 : 1,
                    transition: 'background-color 200ms',
                    touchAction: 'manipulation',
                    flexShrink: 0,
                  }}
                  onPointerDown={e => { e.preventDefault(); if (!isLastOn) handleToggle(code) }}
                >
                  <span style={{
                    position: 'absolute',
                    top: '2px',
                    left: isEnabled ? '22px' : '2px',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: '#FFFFFF',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.25)',
                    transition: 'left 200ms',
                  }} />
                </button>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div style={{
          padding: '10px 18px 14px',
          borderTop: '1px solid #F0F0F5',
        }}>
          <p style={{ fontSize: '12px', color: '#AEAEB2', textAlign: 'center', margin: 0 }}>
            At least one language must remain enabled
          </p>
        </div>
      </div>
    </div>
  )
}

export default memo(SettingsModal)
