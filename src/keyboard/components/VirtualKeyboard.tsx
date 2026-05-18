import { memo, useEffect, useState } from 'react'
import { useKeyboard } from '../context/KeyboardContext'
import { useSettings } from '../context/SettingsContext'
import { LAYOUTS, LANGUAGE_LABELS } from '../layouts'
import type { LanguageCode } from '../layouts'
import KeyboardHeader from './KeyboardHeader'
import KeyRow from './KeyRow'
import EmojiPanel from './EmojiPanel'
import SettingsModal from './SettingsModal'

function GlobePopover() {
  const { activeLanguage, setLanguage, closeGlobe } = useKeyboard()
  const { enabledLanguages, openSettings } = useSettings()

  return (
    <>
      {/* Tap-outside dismiss overlay */}
      <div
        style={{ position: 'fixed', inset: 0, zIndex: 9 }}
        onPointerDown={e => { e.preventDefault(); closeGlobe() }}
      />
      {/* Compact iPhone-style floating panel anchored above the globe key area */}
      <div style={{
        position: 'absolute',
        bottom: 'calc(100% + 8px)',
        left: '8px',
        zIndex: 10,
        backgroundColor: '#1C1C1E',
        borderRadius: '14px',
        padding: '8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
        minWidth: '180px',
        animation: 'vkb-pop-in 160ms cubic-bezier(0.34,1.56,0.64,1) both',
      }}>
        <style>{`
          @keyframes vkb-pop-in {
            from { opacity: 0; transform: scale(0.85) translateY(8px); }
            to   { opacity: 1; transform: scale(1)    translateY(0);   }
          }
        `}</style>

        {/* Language chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {enabledLanguages.map((code: LanguageCode) => (
            <button
              key={code}
              type="button"
              style={{
                padding: '7px 16px',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: '600',
                backgroundColor: activeLanguage === code ? '#007AFF' : '#3A3A3C',
                color: '#FFFFFF',
                touchAction: 'manipulation',
                minWidth: '52px',
                letterSpacing: '0.3px',
              }}
              onPointerDown={e => { e.preventDefault(); setLanguage(code) }}
              onContextMenu={e => e.preventDefault()}
            >
              {LANGUAGE_LABELS[code]}
            </button>
          ))}
        </div>

        {/* Divider + Settings */}
        <div style={{ borderTop: '1px solid #3A3A3C', paddingTop: '6px' }}>
          <button
            type="button"
            style={{
              width: '100%',
              padding: '7px 12px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
              backgroundColor: 'transparent',
              color: '#8E8E93',
              touchAction: 'manipulation',
              textAlign: 'left',
            }}
            onPointerDown={e => { e.preventDefault(); openSettings(); closeGlobe() }}
            onContextMenu={e => e.preventDefault()}
          >
            ⚙ Settings
          </button>
        </div>
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
        <EmojiPanel />
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
