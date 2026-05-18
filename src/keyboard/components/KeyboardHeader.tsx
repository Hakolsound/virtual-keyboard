import { memo, useCallback } from 'react'
import { useKeyboard } from '../context/KeyboardContext'
import { useSettings } from '../context/SettingsContext'
import type { LanguageCode } from '../layouts'

function KeyboardHeader() {
  const { activeLanguage, setLanguage } = useKeyboard()
  const { enabledLanguages, getLabel, openSettings } = useSettings()

  const handleLangTap = useCallback((code: LanguageCode) => {
    setLanguage(code)
  }, [setLanguage])

  return (
    <div className="flex items-center justify-between px-2 py-1.5 bg-gray-50 border-b border-gray-200">
      {/* Language chips */}
      <div className="flex gap-1.5 flex-wrap">
        {enabledLanguages.map(code => (
          <button
            key={code}
            type="button"
            aria-label={`Switch to ${getLabel(code)}`}
            className={[
              'px-3 py-1 rounded-full text-sm font-medium transition-colors',
              'touch-manipulation select-none border',
              activeLanguage === code
                ? 'bg-blue-500 text-white border-blue-400'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100',
            ].join(' ')}
            onPointerDown={e => { e.preventDefault(); handleLangTap(code) }}
            onContextMenu={e => e.preventDefault()}
          >
            {getLabel(code)}
          </button>
        ))}
      </div>

      {/* Settings gear */}
      <button
        type="button"
        aria-label="Keyboard settings"
        className="p-2 rounded-full text-gray-500 hover:bg-gray-200 transition-colors touch-manipulation select-none"
        onPointerDown={e => { e.preventDefault(); openSettings() }}
        onContextMenu={e => e.preventDefault()}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>
    </div>
  )
}

export default memo(KeyboardHeader)
