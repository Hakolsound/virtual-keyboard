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
    <div style={{
      position: 'absolute',
      bottom: '100%',
      left: 0,
      right: 0,
      backgroundColor: '#1C1C1E',
      borderRadius: '12px 12px 0 0',
      padding: '12px 16px 8px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      zIndex: 10,
    }}>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
      }}>
        {enabledLanguages.map((code: LanguageCode) => (
          <button
            key={code}
            type="button"
            style={{
              padding: '8px 20px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '500',
              backgroundColor: activeLanguage === code ? '#007AFF' : '#3A3A3C',
              color: '#FFFFFF',
              touchAction: 'manipulation',
              minWidth: '60px',
            }}
            onPointerDown={e => {
              e.preventDefault()
              setLanguage(code)
            }}
            onContextMenu={e => e.preventDefault()}
          >
            {LANGUAGE_LABELS[code]}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          type="button"
          style={{
            padding: '6px 14px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '13px',
            backgroundColor: '#3A3A3C',
            color: '#8E8E93',
            touchAction: 'manipulation',
          }}
          onPointerDown={e => { e.preventDefault(); openSettings() }}
          onContextMenu={e => e.preventDefault()}
        >
          ⚙ Settings
        </button>
        <button
          type="button"
          style={{
            padding: '6px 14px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '13px',
            backgroundColor: '#3A3A3C',
            color: '#8E8E93',
            touchAction: 'manipulation',
          }}
          onPointerDown={e => { e.preventDefault(); closeGlobe() }}
          onContextMenu={e => e.preventDefault()}
        >
          ✕ Close
        </button>
      </div>
    </div>
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
      // one frame later: start slide-in
      const raf = requestAnimationFrame(() => setPhase('shown'))
      return () => cancelAnimationFrame(raf)
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
