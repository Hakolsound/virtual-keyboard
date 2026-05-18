import { memo, useCallback, useRef } from 'react'
import type { ActionKey, CharKey, KeyDef } from '../layouts'
import { LANGUAGE_LABELS } from '../layouts'
import { useKeyboard } from '../context/KeyboardContext'
import { useSettings } from '../context/SettingsContext'
import { useLongPress } from '../hooks/useLongPress'

// iOS-style color palette
const KEY_LETTER   = '#FFFFFF'
const KEY_SPECIAL  = '#ADB5BD'
const KEY_DONE     = '#007AFF'
const KEY_DANGER   = '#FF3B30'
const KEY_SHADOW   = '0 1px 0 rgba(0,0,0,0.35)'
const KEY_RADIUS   = '5px'

interface KeyProps {
  keyDef: KeyDef
}

function Key({ keyDef }: KeyProps) {
  const { shift, insert, backspace, done, setShift, setLanguage, activeLanguage } = useKeyboard()
  const { enabledLanguages, openSettings } = useSettings()
  const pressedRef = useRef(false)

  const handleCharPress = useCallback(() => {
    if (keyDef.type !== 'char') return
    const k = keyDef as CharKey
    const char = shift !== 'off' ? (k.shift ?? k.base.toUpperCase()) : k.base
    insert(char)
  }, [keyDef, shift, insert])

  const handleActionPress = useCallback(() => {
    if (keyDef.type !== 'action') return
    const k = keyDef as ActionKey
    switch (k.action) {
      case 'space':     return insert(' ')
      case 'done':      return done()
      case 'backspace': return backspace()
      case 'shift': {
        if (shift === 'off')  return setShift('once')
        if (shift === 'once') return setShift('lock')
        if (shift === 'lock') return setShift('off')
        break
      }
      case 'lang-cycle': {
        const idx  = enabledLanguages.indexOf(activeLanguage)
        const next = enabledLanguages[(idx + 1) % enabledLanguages.length]
        setLanguage(next)
        break
      }
      case 'settings': return openSettings()
    }
  }, [keyDef, shift, insert, done, backspace, setShift, setLanguage, activeLanguage, enabledLanguages, openSettings])

  const longPress = useLongPress({ onPress: backspace })

  const isBackspace = keyDef.type === 'action' && (keyDef as ActionKey).action === 'backspace'
  const isShift     = keyDef.type === 'action' && (keyDef as ActionKey).action === 'shift'
  const isDone      = keyDef.type === 'action' && (keyDef as ActionKey).action === 'done'
  const isLang      = keyDef.type === 'action' && (keyDef as ActionKey).action === 'lang-cycle'
  const isSpace     = keyDef.type === 'action' && (keyDef as ActionKey).action === 'space'
  const isShiftOn   = isShift && shift !== 'off'
  const isShiftLock = isShift && shift === 'lock'

  const flex = keyDef.flex ?? 1

  // Key label — lang key shows the active language name
  let label: string
  if (isLang) {
    label = LANGUAGE_LABELS[activeLanguage]
  } else if (keyDef.type === 'char') {
    const k = keyDef as CharKey
    label = shift !== 'off' ? (k.shift ?? k.base.toUpperCase()) : k.base
  } else {
    label = (keyDef as ActionKey).label
  }

  // iOS-style visual appearance
  let bg      = keyDef.type === 'char' ? KEY_LETTER : KEY_SPECIAL
  let color   = '#1C1C1E'
  let weight  = keyDef.type === 'char' ? '400' : '500'
  let shadow  = KEY_SHADOW

  if (isDone) {
    bg = KEY_DONE; color = '#FFFFFF'; weight = '600'
  } else if (isShiftLock) {
    bg = '#4C8BF5'; color = '#FFFFFF'
  } else if (isShiftOn) {
    bg = '#E8E8ED'; color = '#1C1C1E'
  }

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    e.preventDefault()
    pressedRef.current = true
    if (isBackspace) longPress.onPointerDown(e)
  }, [isBackspace, longPress])

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    if (isBackspace) { longPress.onPointerUp(e); return }
    if (!pressedRef.current) return
    pressedRef.current = false
    if (keyDef.type === 'char') handleCharPress()
    else handleActionPress()
  }, [isBackspace, longPress, keyDef, handleCharPress, handleActionPress])

  const onPointerLeave = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    pressedRef.current = false
    if (isBackspace) longPress.onPointerLeave(e)
  }, [isBackspace, longPress])

  void isSpace // used for visual only (special bg already handles it)

  return (
    <button
      type="button"
      aria-label={label}
      style={{
        flex,
        minWidth:     'var(--vkb-key-min-w, 40px)',
        minHeight:    'var(--vkb-key-h, 48px)',
        fontSize:     'var(--vkb-key-font, 16px)',
        fontWeight:   weight,
        color,
        backgroundColor: bg,
        boxShadow:    shadow,
        borderRadius: KEY_RADIUS,
        border:       'none',
        cursor:       'pointer',
        display:      'flex',
        alignItems:   'center',
        justifyContent: 'center',
        userSelect:   'none',
        WebkitUserSelect: 'none',
        touchAction:  'manipulation',
        transition:   'background-color 80ms, transform 60ms',
        letterSpacing: isSpace ? '0' : undefined,
      }}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerLeave}
      onContextMenu={e => e.preventDefault()}
    >
      {label}
    </button>
  )
}

export default memo(Key)
