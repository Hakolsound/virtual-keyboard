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
  const [swipeLabel, setSwipeLabel] = useState<string | null>(null)
  const pressedRef        = useRef(false)
  const bsDelayRef        = useRef<ReturnType<typeof setTimeout>  | null>(null)
  const bsRepeatRef       = useRef<ReturnType<typeof setInterval> | null>(null)
  const swipeStartXRef    = useRef<number | null>(null)
  const swipeDeltaRef     = useRef(0)
  const spaceHoldRef      = useRef<ReturnType<typeof setTimeout> | null>(null)
  const spaceFiredRef     = useRef(false)  // true when 3s hold triggered settings
  const swipeLabelTimer   = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  const clearSwipeLabel = useCallback(() => {
    if (swipeLabelTimer.current !== null) { clearTimeout(swipeLabelTimer.current); swipeLabelTimer.current = null }
    setSwipeLabel(null)
  }, [])

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
    if (isSpace) {
      // Capture pointer so move/up fire even when finger slides off the button
      e.currentTarget.setPointerCapture(e.pointerId)
      swipeStartXRef.current = e.clientX
      swipeDeltaRef.current  = 0
      spaceFiredRef.current  = false
      if (swipeLabelTimer.current !== null) clearTimeout(swipeLabelTimer.current)
      setSwipeLabel(LANGUAGE_LABELS[activeLanguage])
      // 3-second easter-egg hold → open settings
      spaceHoldRef.current = setTimeout(() => {
        spaceFiredRef.current = true
        openSettings()
      }, 3000)
    }
  }, [isBackspace, isSpace, backspace, openSettings, activeLanguage])

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    if (isSpace && swipeStartXRef.current !== null) {
      const delta = e.clientX - swipeStartXRef.current
      swipeDeltaRef.current = delta
      // Preview the target language once past threshold
      if (Math.abs(delta) > 20) {
        const idx = enabledLanguages.indexOf(activeLanguage)
        const previewIdx = delta > 0
          ? (idx + 1) % enabledLanguages.length
          : (idx - 1 + enabledLanguages.length) % enabledLanguages.length
        setSwipeLabel(LANGUAGE_LABELS[enabledLanguages[previewIdx]])
      } else {
        setSwipeLabel(LANGUAGE_LABELS[activeLanguage])
      }
    }
  }, [isSpace, enabledLanguages, activeLanguage])

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    setPressed(false)
    if (isSpace && spaceHoldRef.current !== null) {
      clearTimeout(spaceHoldRef.current)
      spaceHoldRef.current = null
    }
    if (isBackspace) { cancelBsRepeat(); return }
    if (!pressedRef.current) return
    pressedRef.current = false

    // If 3s hold fired settings, suppress the space insert
    if (isSpace && spaceFiredRef.current) {
      spaceFiredRef.current = false
      swipeStartXRef.current = null
      swipeDeltaRef.current  = 0
      return
    }

    // Space bar swipe → cycle language
    if (isSpace && Math.abs(swipeDeltaRef.current) > 35) {
      const idx = enabledLanguages.indexOf(activeLanguage)
      const next = swipeDeltaRef.current > 0
        ? enabledLanguages[(idx + 1) % enabledLanguages.length]
        : enabledLanguages[(idx - 1 + enabledLanguages.length) % enabledLanguages.length]
      setLanguage(next)
      swipeStartXRef.current = null
      swipeDeltaRef.current  = 0
      // Show the new language label briefly as confirmation
      setSwipeLabel(LANGUAGE_LABELS[next])
      if (swipeLabelTimer.current !== null) clearTimeout(swipeLabelTimer.current)
      swipeLabelTimer.current = setTimeout(() => { setSwipeLabel(null); swipeLabelTimer.current = null }, 1500)
      return
    }
    swipeStartXRef.current = null
    swipeDeltaRef.current  = 0
    if (isSpace) clearSwipeLabel()

    if (keyDef.type === 'char') handleCharPress()
    else handleActionPress()
  }, [isBackspace, isSpace, cancelBsRepeat, enabledLanguages, activeLanguage, setLanguage, keyDef, handleCharPress, handleActionPress])

  const cancelSpaceHold = useCallback(() => {
    if (spaceHoldRef.current !== null) { clearTimeout(spaceHoldRef.current); spaceHoldRef.current = null }
  }, [])

  const onPointerLeave = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    // With pointer capture active on the space bar, this only fires after release —
    // so it's safe to reset swipe state here.
    pressedRef.current = false
    setPressed(false)
    swipeStartXRef.current = null
    swipeDeltaRef.current  = 0
    cancelSpaceHold()
    if (isBackspace) cancelBsRepeat()
  }, [isBackspace, cancelBsRepeat, cancelSpaceHold])

  const onPointerCancel = useCallback(() => {
    pressedRef.current = false
    setPressed(false)
    swipeStartXRef.current = null
    swipeDeltaRef.current  = 0
    cancelSpaceHold()
    cancelBsRepeat()
    clearSwipeLabel()
  }, [cancelBsRepeat, cancelSpaceHold, clearSwipeLabel])

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
        touchAction:  isSpace ? 'none' : 'manipulation',
        transition:   'background-color 80ms, transform 60ms',
        letterSpacing: isSpace ? '0' : undefined,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerLeave}
      onPointerCancel={onPointerCancel}
      onContextMenu={e => e.preventDefault()}
    >
      {isToggleGlobe ? (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M2 12h20"/>
          <path d="M12 2a15.3 15.3 0 0 1 0 20M12 2a15.3 15.3 0 0 0 0 20"/>
        </svg>
      ) : isShift ? (
        /* Shift: filled up-arrow when off, stroked when on */
        <svg width="22" height="22" viewBox="0 0 24 24" fill={isShiftOn ? 'none' : 'currentColor'} stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round">
          <path d="M4 14 L12 4 L20 14 H15 V20 H9 V14 Z"/>
        </svg>
      ) : isSpace && swipeLabel ? (
        <span style={{ fontSize: 'calc(var(--vkb-key-font, 16px) * 0.85)', opacity: 0.75, pointerEvents: 'none' }}>
          {swipeLabel}
        </span>
      ) : label}
    </button>
  )
}

export default memo(Key)
