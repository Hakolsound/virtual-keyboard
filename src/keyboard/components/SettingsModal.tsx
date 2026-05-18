import { memo, useCallback, useEffect } from 'react'
import { useSettings } from '../context/SettingsContext'
import { useKeyboard } from '../context/KeyboardContext'
import { ALL_LANGUAGE_CODES } from '../layouts'
import type { LanguageCode } from '../layouts'

const LANGUAGE_NAMES: Record<LanguageCode, string> = {
  en:      'English',
  he:      'Hebrew  עברית',
  es:      'Spanish  Español',
  'pt-br': 'Portuguese  Português (BR)',
  emoji:   'Emoji  😀',
}

function SettingsModal() {
  const { isSettingsOpen, closeSettings, enabledLanguages, toggleLanguage, getLabel, availableLanguages } = useSettings()
  const { activeLanguage, setLanguage } = useKeyboard()

  // If the active language gets disabled, switch to first enabled
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
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/40"
      onPointerDown={e => { if (e.target === e.currentTarget) closeSettings() }}
    >
      {/* Modal card */}
      <div
        className="bg-white rounded-2xl shadow-2xl w-80 max-w-[90vw] animate-modal-in overflow-hidden"
        onPointerDown={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">Keyboard Languages</h2>
          <button
            type="button"
            aria-label="Close settings"
            className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 transition-colors touch-manipulation"
            onPointerDown={e => { e.preventDefault(); closeSettings() }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Language list */}
        <div className="px-4 py-2">
          {availableLanguages.map(code => {
            const isEnabled  = enabledLanguages.includes(code)
            const isLastOn   = enabledLanguages.length === 1 && isEnabled
            return (
              <div key={code} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-gray-500 w-8 text-center">{getLabel(code)}</span>
                  <span className="text-sm text-gray-700">{LANGUAGE_NAMES[code]}</span>
                </div>

                {/* Toggle switch */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={isEnabled}
                  aria-label={`Toggle ${LANGUAGE_NAMES[code]}`}
                  disabled={isLastOn}
                  className={[
                    'relative w-11 h-6 rounded-full transition-colors duration-200 touch-manipulation',
                    isEnabled ? 'bg-blue-500' : 'bg-gray-300',
                    isLastOn  ? 'opacity-50 cursor-not-allowed' : '',
                  ].join(' ')}
                  onPointerDown={e => { e.preventDefault(); if (!isLastOn) handleToggle(code) }}
                >
                  <span
                    className={[
                      'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200',
                      isEnabled ? 'translate-x-5' : 'translate-x-0',
                    ].join(' ')}
                  />
                </button>
              </div>
            )
          })}
        </div>

        {/* Footer note */}
        <p className="text-xs text-gray-400 text-center pb-4 px-4">
          At least one language must remain enabled
        </p>
      </div>
    </div>
  )
}

export default memo(SettingsModal)
