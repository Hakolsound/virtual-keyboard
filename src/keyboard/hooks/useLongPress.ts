import { useCallback, useRef } from 'react'

interface LongPressOptions {
  onPress:    () => void
  delay?:     number   // ms before repeat starts (default 400)
  interval?:  number   // ms between repeats (default 80)
}

export function useLongPress({ onPress, delay = 400, interval = 80 }: LongPressOptions) {
  const repeatRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const delayRef  = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cancel = useCallback(() => {
    if (delayRef.current  !== null) { clearTimeout(delayRef.current);   delayRef.current  = null }
    if (repeatRef.current !== null) { clearInterval(repeatRef.current); repeatRef.current = null }
  }, [])

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    onPress()
    delayRef.current = setTimeout(() => {
      repeatRef.current = setInterval(onPress, interval)
    }, delay)
  }, [onPress, delay, interval])

  const onPointerUp    = cancel
  const onPointerLeave = cancel

  return { onPointerDown, onPointerUp, onPointerLeave }
}
