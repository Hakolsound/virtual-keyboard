import { memo, useEffect, useRef, useState } from 'react'
import { useKeyboard } from '../context/KeyboardContext'
import { useSettings } from '../context/SettingsContext'
import { LAYOUTS } from '../layouts'
import KeyboardHeader from './KeyboardHeader'
import KeyRow from './KeyRow'
import EmojiPanel from './EmojiPanel'
import SettingsModal from './SettingsModal'

function VirtualKeyboard() {
  const { isOpen, activeLanguage } = useKeyboard()
  const { isSettingsOpen } = useSettings()

  const [visible, setVisible] = useState(false)
  const [exiting, setExiting] = useState(false)

  // ── show / hide with slide animation ──────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setExiting(false)
      setVisible(true)
    } else if (visible) {
      setExiting(true)
      const t = setTimeout(() => {
        setVisible(false)
        setExiting(false)
      }, 160)
      return () => clearTimeout(t)
    }
  }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!visible) return null

  const isEmoji  = activeLanguage === 'emoji'
  const layout   = isEmoji ? null : LAYOUTS[activeLanguage as keyof typeof LAYOUTS]
  const dir      = layout?.direction ?? 'ltr'

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        userSelect: 'none',
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e5e7eb',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.10)',
        opacity: exiting ? 0 : 1,
        transition: 'opacity 160ms ease',
        '--vkb-key-min-w': 'clamp(2rem, 5.5vw, 5.25rem)',
        '--vkb-key-h':     'clamp(2.75rem, 5.5vh, 4.5rem)',
        '--vkb-key-font':  'clamp(0.85rem, 1.8vw, 1.1rem)',
        '--vkb-emoji-font':'clamp(1.2rem, 2.5vw, 2rem)',
      } as React.CSSProperties}
    >
      <KeyboardHeader />

      {isEmoji ? (
        <EmojiPanel />
      ) : layout ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '4px 4px 8px' }}>
          <KeyRow keys={layout.numberRow} direction={dir} />
          {layout.rows.map((row, i) => (
            <KeyRow key={i} keys={row} direction={dir} />
          ))}
          <KeyRow keys={layout.bottomRow} direction={dir} />
        </div>
      ) : null}

      {/* Settings modal — overlays the keyboard */}
      {isSettingsOpen && <SettingsModal />}
    </div>
  )
}

export default memo(VirtualKeyboard)
