import { memo, useCallback, useEffect, useState } from 'react'
import { useSettings } from '../context/SettingsContext'
import { useKeyboard } from '../context/KeyboardContext'
import type { LanguageCode } from '../layouts'

const SETTINGS_PIN = '3924'

const LANGUAGE_NAMES: Record<LanguageCode, string> = {
  en:      'English',
  he:      'Hebrew עברית',
  es:      'Spanish Español',
  'pt-br': 'Portuguese Português',
  emoji:   'Emoji 😀',
}

const BASE: React.CSSProperties = {
  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif',
}

function PinScreen({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const [digits, setDigits] = useState('')
  const [shake,  setShake]  = useState(false)

  const press = useCallback((d: string) => {
    setDigits(prev => {
      if (prev.length >= 4) return prev
      const next = prev + d
      if (next.length === 4) {
        if (next === SETTINGS_PIN) {
          setTimeout(onSuccess, 120)
        } else {
          setShake(true)
          // Shake then auto-dismiss on wrong PIN
          setTimeout(onCancel, 600)
        }
      }
      return next
    })
  }, [onSuccess, onCancel])

  const del = useCallback(() => setDigits(p => p.slice(0, -1)), [])

  return (
    <div style={{ ...BASE, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '18px 16px 14px' }}>
      <span style={{ fontSize: '14px', fontWeight: '600', color: '#1C1C1E' }}>Enter PIN</span>

      {/* Dots */}
      <div style={{
        display: 'flex', gap: '14px',
        animation: shake ? 'vkb-shake 0.5s' : 'none',
      }}>
        <style>{`
          @keyframes vkb-shake {
            0%,100%{transform:translateX(0)}
            20%{transform:translateX(-6px)}
            40%{transform:translateX(6px)}
            60%{transform:translateX(-4px)}
            80%{transform:translateX(4px)}
          }
        `}</style>
        {[0,1,2,3].map(i => (
          <div key={i} style={{
            width: '12px', height: '12px', borderRadius: '50%',
            backgroundColor: i < digits.length ? '#1C1C1E' : 'transparent',
            border: '1.5px solid #1C1C1E',
            transition: 'background-color 100ms',
          }} />
        ))}
      </div>

      {/* Number pad */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', width: '100%' }}>
        {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((d, i) => (
          <button
            key={i}
            type="button"
            disabled={d === ''}
            style={{
              height: '44px',
              borderRadius: '10px',
              border: 'none',
              fontSize: '18px',
              fontWeight: '500',
              fontFamily: BASE.fontFamily,
              backgroundColor: d === '' ? 'transparent' : '#F2F2F7',
              color: '#1C1C1E',
              cursor: d === '' ? 'default' : 'pointer',
              touchAction: 'manipulation',
              visibility: d === '' ? 'hidden' : 'visible',
            }}
            onPointerDown={e => { e.preventDefault(); if (d === '⌫') del(); else if (d) press(d) }}
          >
            {d}
          </button>
        ))}
      </div>

      <button
        type="button"
        style={{ fontSize: '13px', color: '#8E8E93', background: 'none', border: 'none', cursor: 'pointer', fontFamily: BASE.fontFamily, touchAction: 'manipulation' }}
        onPointerDown={e => { e.preventDefault(); onCancel() }}
      >
        Cancel
      </button>
    </div>
  )
}

function SettingsModal() {
  const { isSettingsOpen, closeSettings, enabledLanguages, toggleLanguage, getLabel, availableLanguages } = useSettings()
  const { activeLanguage, setLanguage } = useKeyboard()
  const [unlocked, setUnlocked] = useState(false)

  useEffect(() => {
    if (!isSettingsOpen) setUnlocked(false)
  }, [isSettingsOpen])

  useEffect(() => {
    if (!enabledLanguages.includes(activeLanguage) && enabledLanguages.length > 0) {
      setLanguage(enabledLanguages[0])
    }
  }, [enabledLanguages, activeLanguage, setLanguage])

  const handleToggle = useCallback((code: LanguageCode) => toggleLanguage(code), [toggleLanguage])

  if (!isSettingsOpen) return null

  return (
    <div
      style={{
        position: 'absolute', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.4)',
      }}
      onPointerDown={e => { if (e.target === e.currentTarget) closeSettings() }}
    >
      <div
        style={{
          ...BASE,
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 16px 48px rgba(0,0,0,0.28)',
          width: unlocked ? '280px' : '240px',
          maxWidth: '92%',
          overflow: 'hidden',
          animation: 'vkb-modal-in 200ms cubic-bezier(0.34,1.4,0.64,1) both',
        }}
        onPointerDown={e => e.stopPropagation()}
      >
        <style>{`@keyframes vkb-modal-in{from{opacity:0;transform:scale(0.88)}to{opacity:1;transform:scale(1)}}`}</style>

        {!unlocked ? (
          <PinScreen onSuccess={() => setUnlocked(true)} onCancel={closeSettings} />
        ) : (
          <>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 15px 11px', borderBottom: '1px solid #F0F0F5' }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#1C1C1E' }}>Keyboard Languages</span>
              <button type="button"
                style={{ width: '24px', height: '24px', borderRadius: '50%', border: 'none', backgroundColor: '#E5E5EA', color: '#6C6C70', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', touchAction: 'manipulation', fontFamily: BASE.fontFamily }}
                onPointerDown={e => { e.preventDefault(); closeSettings() }}
              >✕</button>
            </div>

            {/* Language list */}
            <div style={{ padding: '2px 0' }}>
              {availableLanguages.map((code, i) => {
                const isEnabled = enabledLanguages.includes(code)
                const isLastOn  = enabledLanguages.length === 1 && isEnabled
                return (
                  <div key={code} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 15px', borderBottom: i < availableLanguages.length - 1 ? '1px solid #F2F2F7' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#8E8E93', width: '26px', textAlign: 'center' }}>{getLabel(code)}</span>
                      <span style={{ fontSize: '13px', color: '#1C1C1E' }}>{LANGUAGE_NAMES[code]}</span>
                    </div>
                    {/* iOS toggle */}
                    <button type="button" role="switch" aria-checked={isEnabled}
                      disabled={isLastOn}
                      style={{ position: 'relative', width: '44px', height: '26px', borderRadius: '13px', border: 'none', cursor: isLastOn ? 'not-allowed' : 'pointer', backgroundColor: isEnabled ? '#34C759' : '#E5E5EA', opacity: isLastOn ? 0.45 : 1, transition: 'background-color 200ms', touchAction: 'manipulation', flexShrink: 0 }}
                      onPointerDown={e => { e.preventDefault(); if (!isLastOn) handleToggle(code) }}
                    >
                      <span style={{ position: 'absolute', top: '2px', left: isEnabled ? '20px' : '2px', width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#FFFFFF', boxShadow: '0 1px 4px rgba(0,0,0,0.22)', transition: 'left 200ms' }} />
                    </button>
                  </div>
                )
              })}
            </div>

            {/* Footer */}
            <p style={{ fontSize: '11px', color: '#AEAEB2', textAlign: 'center', padding: '8px 15px 12px', margin: 0, borderTop: '1px solid #F0F0F5' }}>
              At least one language must remain enabled
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default memo(SettingsModal)
