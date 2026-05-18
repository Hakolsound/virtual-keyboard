import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { ALL_LANGUAGE_CODES, LANGUAGE_LABELS } from '../layouts'
import type { LanguageCode } from '../layouts'

const STORAGE_KEY = 'vkb_enabled_languages'

const DEFAULT_ENABLED: LanguageCode[] = ['en', 'emoji']

function loadFromStorage(): LanguageCode[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_ENABLED
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_ENABLED
    return parsed.filter((c): c is LanguageCode =>
      ALL_LANGUAGE_CODES.includes(c as LanguageCode)
    )
  } catch {
    return DEFAULT_ENABLED
  }
}

interface SettingsContextValue {
  enabledLanguages:   LanguageCode[]
  isSettingsOpen:     boolean
  toggleLanguage:     (code: LanguageCode) => void
  openSettings:       () => void
  closeSettings:      () => void
  availableLanguages: LanguageCode[]
  getLabel:           (code: LanguageCode) => string
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [enabledLanguages, setEnabledLanguages] = useState<LanguageCode[]>(loadFromStorage)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(enabledLanguages))
  }, [enabledLanguages])

  const toggleLanguage = useCallback((code: LanguageCode) => {
    setEnabledLanguages(prev => {
      if (prev.includes(code)) {
        if (prev.length <= 1) return prev  // keep at least one
        return prev.filter(c => c !== code)
      }
      return [...prev, code]
    })
  }, [])

  const openSettings  = useCallback(() => setIsSettingsOpen(true),  [])
  const closeSettings = useCallback(() => setIsSettingsOpen(false), [])
  const getLabel      = useCallback((code: LanguageCode) => LANGUAGE_LABELS[code], [])

  return (
    <SettingsContext.Provider value={{
      enabledLanguages,
      isSettingsOpen,
      toggleLanguage,
      openSettings,
      closeSettings,
      availableLanguages: ALL_LANGUAGE_CODES,
      getLabel,
    }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider')
  return ctx
}
