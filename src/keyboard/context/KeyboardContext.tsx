import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
} from 'react'
import type { LanguageCode, ShiftState } from '../layouts'
import { dispatchToTarget } from '../../dispatcher'

type TextTarget = HTMLInputElement | HTMLTextAreaElement

interface KeyboardState {
  isOpen:         boolean
  value:          string
  cursorPos:      number
  shift:          ShiftState
  activeLanguage: LanguageCode
  showNumbers:    boolean
  globeOpen:      boolean
}

type KeyboardAction =
  | { type: 'OPEN';           value: string; cursorPos: number }
  | { type: 'CLOSE' }
  | { type: 'SET_VALUE';      value: string; cursorPos: number }
  | { type: 'SET_SHIFT';      shift: ShiftState }
  | { type: 'SET_LANGUAGE';   code: LanguageCode }
  | { type: 'TOGGLE_NUMBERS' }
  | { type: 'TOGGLE_GLOBE' }
  | { type: 'CLOSE_GLOBE' }

function reducer(state: KeyboardState, action: KeyboardAction): KeyboardState {
  switch (action.type) {
    case 'OPEN': {
      const autoShift = action.value === '' ? 'once' : state.shift
      return { ...state, isOpen: true, value: action.value, cursorPos: action.cursorPos, globeOpen: false, shift: autoShift as ShiftState }
    }
    case 'CLOSE':
      return { ...state, isOpen: false, globeOpen: false }
    case 'SET_VALUE':
      return { ...state, value: action.value, cursorPos: action.cursorPos }
    case 'SET_SHIFT':
      return { ...state, shift: action.shift }
    case 'SET_LANGUAGE':
      return { ...state, activeLanguage: action.code, globeOpen: false }
    case 'TOGGLE_NUMBERS':
      return { ...state, showNumbers: !state.showNumbers }
    case 'TOGGLE_GLOBE':
      return { ...state, globeOpen: !state.globeOpen }
    case 'CLOSE_GLOBE':
      return { ...state, globeOpen: false }
    default:
      return state
  }
}

interface KeyboardContextValue {
  isOpen:         boolean
  value:          string
  cursorPos:      number
  shift:          ShiftState
  activeLanguage: LanguageCode
  activeTarget:   TextTarget | null
  showNumbers:    boolean
  globeOpen:      boolean
  insert:         (char: string) => void
  backspace:      () => void
  clear:          () => void
  done:           () => void
  setShift:       (s: ShiftState) => void
  setLanguage:    (code: LanguageCode) => void
  toggleNumbers:  () => void
  toggleGlobe:    () => void
  closeGlobe:     () => void
}

const KeyboardContext = createContext<KeyboardContextValue | null>(null)

function isTextInput(el: EventTarget | null): el is TextTarget {
  if (!(el instanceof HTMLElement)) return false
  if (el instanceof HTMLTextAreaElement) return true
  if (el instanceof HTMLInputElement) {
    const type = el.type.toLowerCase()
    return ['text','search','email','url','tel','password',''].includes(type)
  }
  return false
}

export function KeyboardProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    isOpen:         false,
    value:          '',
    cursorPos:      0,
    shift:          'off',
    activeLanguage: 'en',
    showNumbers:    false,
    globeOpen:      false,
  })

  const targetRef      = useRef<TextTarget | null>(null)
  const pendingClose   = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Snapshot of state for use inside stable callbacks
  const stateRef       = useRef(state)
  stateRef.current = state

  // ── focus detection ────────────────────────────────────────────────────────
  useEffect(() => {
    const shadowHost = document.getElementById('vkb-shadow-host')

    const onFocusIn = (e: FocusEvent) => {
      if (!isTextInput(e.target)) return
      if (pendingClose.current !== null) {
        clearTimeout(pendingClose.current)
        pendingClose.current = null
      }
      const target = e.target
      targetRef.current = target
      const value     = target.value
      const cursorPos = target.selectionStart ?? value.length
      dispatch({ type: 'OPEN', value, cursorPos })
    }

    // Close only on deliberate tap outside — not on focusout.
    // focusout is too noisy (autofill popups, payment pickers, browser chrome).
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node
      // Tapping an input: focusin will handle switching
      if (isTextInput(target)) return
      // Tapping inside the keyboard shadow host: ignore
      if (shadowHost && (shadowHost === target || shadowHost.contains(target))) return
      // Tapping outside everything: close
      if (pendingClose.current !== null) clearTimeout(pendingClose.current)
      pendingClose.current = setTimeout(() => {
        dispatch({ type: 'CLOSE' })
        targetRef.current = null
        pendingClose.current = null
      }, 80)
    }

    document.addEventListener('focusin',     onFocusIn,     true)
    document.addEventListener('pointerdown',  onPointerDown, true)
    return () => {
      document.removeEventListener('focusin',     onFocusIn,     true)
      document.removeEventListener('pointerdown',  onPointerDown, true)
    }
  }, [])

  // ── helpers ────────────────────────────────────────────────────────────────
  const commitValue = useCallback((newValue: string, newCursor: number) => {
    dispatch({ type: 'SET_VALUE', value: newValue, cursorPos: newCursor })
    let target = targetRef.current
    // React SPAs sometimes unmount+remount the input on state change (e.g. controlled
    // inputs that re-render when focused). If our stored ref is detached, fall back
    // to whatever the DOM currently considers focused.
    if (target && !target.isConnected) {
      const active = document.activeElement
      if (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement) {
        targetRef.current = active
        target = active
      } else {
        target = null
      }
    }
    if (target) {
      dispatchToTarget(target, newValue, newCursor)
    }
  }, [])

  const applyShiftReset = useCallback(() => {
    if (stateRef.current.shift === 'once') {
      dispatch({ type: 'SET_SHIFT', shift: 'off' })
    }
  }, [])

  // ── actions ────────────────────────────────────────────────────────────────
  const insert = useCallback((char: string) => {
    const { value, cursorPos, shift } = stateRef.current
    const resolved = shift !== 'off' ? char.toUpperCase() : char
    const next = value.slice(0, cursorPos) + resolved + value.slice(cursorPos)
    commitValue(next, cursorPos + resolved.length)
    applyShiftReset()
    // Auto-capitalize the word after a space
    if (char === ' ') dispatch({ type: 'SET_SHIFT', shift: 'once' })
  }, [commitValue, applyShiftReset])

  const backspace = useCallback(() => {
    const { value, cursorPos } = stateRef.current
    if (cursorPos === 0) return
    // Use Intl.Segmenter to remove a full grapheme cluster (handles emoji surrogate
    // pairs and ZWJ sequences like 👨‍👩‍👧 that span many code units).
    const before = value.slice(0, cursorPos)
    let removeLen = 1
    if (typeof Intl !== 'undefined' && (Intl as any).Segmenter) {
      const segs = [...new (Intl as any).Segmenter().segment(before)]
      removeLen = segs[segs.length - 1]?.segment.length ?? 1
    } else {
      // Fallback: code-point spread handles basic surrogate pairs
      const pts = [...before]
      removeLen = pts[pts.length - 1]?.length ?? 1
    }
    const next = value.slice(0, cursorPos - removeLen) + value.slice(cursorPos)
    commitValue(next, cursorPos - removeLen)
    if (next === '') dispatch({ type: 'SET_SHIFT', shift: 'once' })
  }, [commitValue])

  const clear = useCallback(() => {
    commitValue('', 0)
  }, [commitValue])

  const done = useCallback(() => {
    const target = targetRef.current
    if (target) {
      target.blur()
    }
    dispatch({ type: 'CLOSE' })
    targetRef.current = null
  }, [])

  const setShift = useCallback((s: ShiftState) => {
    dispatch({ type: 'SET_SHIFT', shift: s })
  }, [])

  const setLanguage = useCallback((code: LanguageCode) => {
    dispatch({ type: 'SET_LANGUAGE', code })
  }, [])

  const toggleNumbers = useCallback(() => {
    dispatch({ type: 'TOGGLE_NUMBERS' })
  }, [])

  const toggleGlobe = useCallback(() => {
    dispatch({ type: 'TOGGLE_GLOBE' })
  }, [])

  const closeGlobe = useCallback(() => {
    dispatch({ type: 'CLOSE_GLOBE' })
  }, [])

  return (
    <KeyboardContext.Provider value={{
      isOpen:         state.isOpen,
      value:          state.value,
      cursorPos:      state.cursorPos,
      shift:          state.shift,
      activeLanguage: state.activeLanguage,
      activeTarget:   targetRef.current,
      showNumbers:    state.showNumbers,
      globeOpen:      state.globeOpen,
      insert,
      backspace,
      clear,
      done,
      setShift,
      setLanguage,
      toggleNumbers,
      toggleGlobe,
      closeGlobe,
    }}>
      {children}
    </KeyboardContext.Provider>
  )
}

export function useKeyboard(): KeyboardContextValue {
  const ctx = useContext(KeyboardContext)
  if (!ctx) throw new Error('useKeyboard must be used inside KeyboardProvider')
  return ctx
}
