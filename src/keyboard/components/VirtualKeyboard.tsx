import { memo, useEffect, useState } from 'react'
import { useKeyboard } from '../context/KeyboardContext'
import { useSettings } from '../context/SettingsContext'
import { LAYOUTS, EMOJI_BOTTOM_ROW } from '../layouts'
import type { LanguageCode } from '../layouts'
import KeyboardHeader from './KeyboardHeader'
import KeyRow from './KeyRow'
import EmojiPanel from './EmojiPanel'
import SettingsModal from './SettingsModal'

const LANGUAGE_NAMES: Record<LanguageCode, string> = {
  en:      'English',
  he:      'עברית',
  es:      'Español',
  'pt-br': 'Português',
  emoji:   'Emoji',
}

function GlobePopover() {
  const { activeLanguage, setLanguage, closeGlobe } = useKeyboard()
  const { enabledLanguages, openSettings } = useSettings()

  // Globe key is ~26% from left (after ⇧ 1.5x and 123 1x out of 11.5 total flex)
  // Position popover so its left edge starts above the globe key
  return (
    <>
      {/* Tap-outside dismiss */}
      <div
        style={{ position: 'fixed', inset: 0, zIndex: 9 }}
        onPointerDown={e => { e.preventDefault(); closeGlobe() }}
      />
      {/* iPhone-style vertical language list — float just above the bottom row */}
      <div style={{
        position: 'absolute',
        bottom: 'calc(var(--vkb-key-h, 48px) + 18px)',
        left: 'clamp(8px, 18%, 140px)',
        zIndex: 10,
        backgroundColor: '#2C2C2E',
        borderRadius: '13px',
        overflow: 'hidden',
        boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
        minWidth: '200px',
        animation: 'vkb-pop-in 180ms cubic-bezier(0.34,1.4,0.64,1) both',
        transformOrigin: 'bottom left',
      }}>
        <style>{`
          @keyframes vkb-pop-in {
            from { opacity: 0; transform: scale(0.82); }
            to   { opacity: 1; transform: scale(1); }
          }
        `}</style>

        {/* Language rows */}
        {enabledLanguages.map((code: LanguageCode, i) => (
          <button
            key={code}
            type="button"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              padding: '12px 16px',
              border: 'none',
              borderBottom: i < enabledLanguages.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: activeLanguage === code ? '600' : '400',
              backgroundColor: activeLanguage === code ? '#007AFF' : 'transparent',
              color: '#FFFFFF',
              touchAction: 'manipulation',
              textAlign: 'left',
            }}
            onPointerDown={e => { e.preventDefault(); setLanguage(code) }}
            onContextMenu={e => e.preventDefault()}
          >
            <span>{LANGUAGE_NAMES[code]}</span>
            {activeLanguage === code && (
              <span style={{ fontSize: '13px', opacity: 0.9 }}>✓</span>
            )}
          </button>
        ))}

        {/* Settings row */}
        <button
          type="button"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            width: '100%',
            padding: '11px 16px',
            border: 'none',
            borderTop: '1px solid rgba(255,255,255,0.12)',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '400',
            backgroundColor: 'transparent',
            color: '#AEAEB2',
            touchAction: 'manipulation',
            textAlign: 'left',
          }}
          onPointerDown={e => { e.preventDefault(); openSettings(); closeGlobe() }}
          onContextMenu={e => e.preventDefault()}
        >
          ⚙ Keyboard Settings
        </button>
      </div>
    </>
  )
}

// Enter: fast-start, slow-settle (ease-out).  Exit: slow-start, fast-end (ease-in).
const ENTER_TRANSITION = 'transform 300ms cubic-bezier(0,0,0.2,1), opacity 300ms cubic-bezier(0,0,0.2,1)'
const EXIT_TRANSITION  = 'transform 220ms cubic-bezier(0.4,0,1,1),  opacity 220ms cubic-bezier(0.4,0,1,1)'

function VirtualKeyboard() {
  const { isOpen, activeLanguage, showNumbers, globeOpen } = useKeyboard()
  const { isSettingsOpen } = useSettings()

  const [visible,  setVisible]  = useState(false)
  // 'in' = animating in, 'shown' = fully visible, 'out' = animating out
  const [phase, setPhase] = useState<'in' | 'shown' | 'out'>('out')

  useEffect(() => {
    if (isOpen) {
      setVisible(true)
      setPhase('in')
      // Two frames: first paints start position, second triggers the transition
      let raf2 = 0
      const raf1 = requestAnimationFrame(() => { raf2 = requestAnimationFrame(() => setPhase('shown')) })
      return () => { cancelAnimationFrame(raf1); cancelAnimationFrame(raf2) }
    } else if (visible) {
      setPhase('out')
      const t = setTimeout(() => setVisible(false), 220)
      return () => clearTimeout(t)
    }
  }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!visible) return null

  const isEmoji = activeLanguage === 'emoji'
  const layout  = isEmoji ? null : LAYOUTS[activeLanguage as keyof typeof LAYOUTS]
  const dir     = layout?.direction ?? 'ltr'

  const shown = phase === 'shown'

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        userSelect: 'none',
        backgroundColor: '#CDD1D6',
        boxShadow: '0 -2px 12px rgba(0,0,0,0.15)',
        position: 'relative',
        transform:  shown ? 'translateY(0)'    : 'translateY(100%)',
        opacity:    shown ? 1                  : 0,
        transition: shown ? ENTER_TRANSITION   : EXIT_TRANSITION,
        '--vkb-key-min-w': 'clamp(28px, 5.5vw, 72px)',
        '--vkb-key-h':     'clamp(42px, 5.5vh, 58px)',
        '--vkb-key-font':  'clamp(14px, 1.8vw, 18px)',
        '--vkb-emoji-font':'clamp(19px, 2.5vw, 32px)',
      } as React.CSSProperties}
    >
      {/* Globe language/emoji popover */}
      {globeOpen && <GlobePopover />}

      <KeyboardHeader />

      {isEmoji ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '6px 3px 10px' }}>
          <EmojiPanel />
          <KeyRow keys={EMOJI_BOTTOM_ROW} direction="ltr" />
        </div>
      ) : layout ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '6px 3px 10px' }}>
          {showNumbers && <KeyRow keys={layout.numberRow} direction={dir} />}
          {layout.rows.map((row, i) => (
            <KeyRow key={i} keys={row} direction={dir} />
          ))}
          <KeyRow keys={layout.bottomRow} direction={dir} />
        </div>
      ) : null}

      {isSettingsOpen && <SettingsModal />}
    </div>
  )
}

export default memo(VirtualKeyboard)
