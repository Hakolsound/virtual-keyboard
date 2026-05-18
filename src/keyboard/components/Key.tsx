import { memo, useCallback, useRef } from 'react'
import type { ActionKey, CharKey, KeyDef } from '../layouts'
import { useKeyboard } from '../context/KeyboardContext'
import { useSettings } from '../context/SettingsContext'
import { useLongPress } from '../hooks/useLongPress'

interface KeyProps {
  keyDef: KeyDef
}

function Key({ keyDef }: KeyProps) {
  const { shift, insert, backspace, clear, done, setShift, setLanguage, activeLanguage } = useKeyboard()
  const { enabledLanguages } = useSettings()
  const pressedRef = useRef(false)

  // ── character key ──────────────────────────────────────────────────────────
  const handleCharPress = useCallback(() => {
    if (keyDef.type !== 'char') return
    const k = keyDef as CharKey
    const char = shift !== 'off'
      ? (k.shift ?? k.base.toUpperCase())
      : k.base
    insert(char)
  }, [keyDef, shift, insert])

  // ── action key ─────────────────────────────────────────────────────────────
  const handleActionPress = useCallback(() => {
    if (keyDef.type !== 'action') return
    const k = keyDef as ActionKey
    switch (k.action) {
      case 'space':     return insert(' ')
      case 'clear':     return clear()
      case 'done':      return done()
      case 'backspace': return backspace()
      case 'shift': {
        if (shift === 'off')  return setShift('once')
        if (shift === 'once') return setShift('lock')
        if (shift === 'lock') return setShift('off')
        break
      }
    }
  }, [keyDef, shift, insert, clear, done, backspace, setShift])

  // ── long press for backspace ───────────────────────────────────────────────
  const longPress = useLongPress({ onPress: backspace })

  // ── lang cycle on header (not used here — handled in KeyboardHeader) ──────
  const isBackspace  = keyDef.type === 'action' && (keyDef as ActionKey).action === 'backspace'
  const isShift      = keyDef.type === 'action' && (keyDef as ActionKey).action === 'shift'
  const isDone       = keyDef.type === 'action' && (keyDef as ActionKey).action === 'done'
  const isClear      = keyDef.type === 'action' && (keyDef as ActionKey).action === 'clear'
  const isSpace      = keyDef.type === 'action' && (keyDef as ActionKey).action === 'space'
  const isShiftOn    = isShift && shift !== 'off'
  const isShiftLock  = isShift && shift === 'lock'

  const flex = keyDef.flex ?? 1

  // ── key label ──────────────────────────────────────────────────────────────
  let label: string
  if (keyDef.type === 'char') {
    const k = keyDef as CharKey
    label = shift !== 'off' ? (k.shift ?? k.base.toUpperCase()) : k.base
  } else {
    label = (keyDef as ActionKey).label
  }

  // ── pointer handlers ───────────────────────────────────────────────────────
  const onPointerDown = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    e.preventDefault()   // critical: keeps focus on the real input
    pressedRef.current = true
    if (isBackspace) {
      longPress.onPointerDown(e)
    }
  }, [isBackspace, longPress])

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    if (isBackspace) {
      longPress.onPointerUp(e)
      return
    }
    if (!pressedRef.current) return
    pressedRef.current = false
    if (keyDef.type === 'char') handleCharPress()
    else handleActionPress()
  }, [isBackspace, longPress, keyDef, handleCharPress, handleActionPress])

  const onPointerLeave = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    pressedRef.current = false
    if (isBackspace) longPress.onPointerLeave(e)
  }, [isBackspace, longPress])

  // ── class composition ─────────────────────────────────────────────────────
  const base = [
    'flex items-center justify-center rounded-lg select-none',
    'text-sm font-medium transition-all duration-75',
    'touch-manipulation border',
    'active:scale-90 active:bg-gray-100',
  ].join(' ')

  let variant: string
  if (isDone) {
    variant = 'bg-blue-500 hover:bg-blue-600 text-white border-blue-400 shadow-md text-base font-semibold'
  } else if (isShiftLock) {
    variant = 'bg-blue-500 text-white border-blue-400'
  } else if (isShiftOn) {
    variant = 'bg-blue-100 text-blue-700 border-blue-300'
  } else if (isClear) {
    variant = 'bg-red-50 hover:bg-red-100 text-red-600 border-red-200'
  } else if (isBackspace || isSpace) {
    variant = 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200'
  } else if (keyDef.type === 'action') {
    variant = 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200'
  } else {
    variant = 'bg-white hover:bg-gray-50 text-gray-800 border-gray-200 shadow-sm'
  }

  // Cycle to next enabled language (for lang-switch — unused here, kept for completeness)
  void activeLanguage
  void enabledLanguages
  void setLanguage

  return (
    <button
      type="button"
      aria-label={label}
      className={`${base} ${variant}`}
      style={{
        flex,
        minWidth:  'var(--vkb-key-min-w, 40px)',
        minHeight: 'var(--vkb-key-h, 48px)',
        fontSize:  'var(--vkb-key-font, 16px)',
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
