import { memo, useCallback, useRef, useState } from 'react'
import type { ActionKey, CharKey, KeyDef } from '../layouts'
import { LANGUAGE_LABELS } from '../layouts'
import { useKeyboard } from '../context/KeyboardContext'
import { useSettings } from '../context/SettingsContext'

// iOS-style color palette
const KEY_LETTER   = '#FFFFFF'
const KEY_SPECIAL  = '#ADB5BD'
const KEY_DONE     = '#007AFF'
const KEY_SHADOW   = '0 1px 0 rgba(0,0,0,0.35)'
const KEY_RADIUS   = '5px'

interface KeyProps {
  keyDef: KeyDef
}

function Key({ keyDef }: KeyProps) {
  const { shift, insert, backspace, done, setShift, setLanguage, activeLanguage,
          toggleNumbers, showNumbers, toggleGlobe, globeOpen } = useKeyboard()
  const { enabledLanguages, openSettings } = useSettings()
  const [pressed, setPressed] = useState(false)
  const pressedRef     = useRef(false)
  const bsDelayRef     = useRef<ReturnType<typeof setTimeout>  | null>(null)
  const bsRepeatRef    = useRef<ReturnType<typeof setInterval> | null>(null)

  const cancelBsRepeat = useCallback(() => {
    if (bsDelayRef.current  !== null) { clearTimeout(bsDelayRef.current);   bsDelayRef.current  = null }
    if (bsRepeatRef.current !== null) { clearInterval(bsRepeatRef.current); bsRepeatRef.current = null }
  }, [])

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
      case 'toggle-numbers': return toggleNumbers()
      case 'toggle-globe':   return toggleGlobe()
      case 'settings':       return openSettings()
    }
  }, [keyDef, shift, insert, done, backspace, setShift, setLanguage, activeLanguage, enabledLanguages, toggleNumbers, toggleGlobe, openSettings])

  const isBackspace    = keyDef.type === 'action' && (keyDef as ActionKey).action === 'backspace'
  const isShift        = keyDef.type === 'action' && (keyDef as ActionKey).action === 'shift'
  const isDone         = keyDef.type === 'action' && (keyDef as ActionKey).action === 'done'
  const isLang         = keyDef.type === 'action' && (keyDef as ActionKey).action === 'lang-cycle'
  const isSpace        = keyDef.type === 'action' && (keyDef as ActionKey).action === 'space'
  const isToggleNums   = keyDef.type === 'action' && (keyDef as ActionKey).action === 'toggle-numbers'
  const isToggleGlobe  = keyDef.type === 'action' && (keyDef as ActionKey).action === 'toggle-globe'
  const isShiftOn      = isShift && shift !== 'off'
  const isShiftLock    = isShift && shift === 'lock'

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
  } else if (isToggleNums && showNumbers) {
    bg = '#5A6370'; color = '#FFFFFF'
  } else if (isToggleGlobe && globeOpen) {
    bg = '#5A6370'; color = '#FFFFFF'
  }

  // Press feedback: darken slightly
  if (pressed) {
    if (isDone)                    bg = '#005EC3'
    else if (keyDef.type === 'char') bg = '#C8CDD3'
    else                             bg = '#8E959D'
  }

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    e.preventDefault()
    pressedRef.current = true
    setPressed(true)
    if (isBackspace) {
      backspace()
      bsDelayRef.current = setTimeout(() => {
        bsRepeatRef.current = setInterval(backspace, 80)
      }, 400)
    }
  }, [isBackspace, backspace])

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    setPressed(false)
    if (isBackspace) { cancelBsRepeat(); return }
    if (!pressedRef.current) return
    pressedRef.current = false
    if (keyDef.type === 'char') handleCharPress()
    else handleActionPress()
  }, [isBackspace, cancelBsRepeat, keyDef, handleCharPress, handleActionPress])

  const onPointerLeave = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    pressedRef.current = false
    setPressed(false)
    if (isBackspace) cancelBsRepeat()
  }, [isBackspace, cancelBsRepeat])

  const onPointerCancel = useCallback(() => {
    pressedRef.current = false
    setPressed(false)
    cancelBsRepeat()
  }, [cancelBsRepeat])

  void isSpace; void isLang // cosmetic flags, bg handled above

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
      onPointerCancel={onPointerCancel}
      onContextMenu={e => e.preventDefault()}
    >
      {label}
    </button>
  )
}

export default memo(Key)
