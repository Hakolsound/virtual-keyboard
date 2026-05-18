import { memo } from 'react'
import type { KeyDef } from '../layouts'
import Key from './Key'

interface KeyRowProps {
  keys:      KeyDef[]
  direction: 'ltr' | 'rtl'
}

function KeyRow({ keys, direction }: KeyRowProps) {
  return (
    <div
      className="flex gap-[var(--vkb-gap,0.25rem)] justify-center"
      dir={direction}
    >
      {keys.map((keyDef, i) => (
        <Key key={i} keyDef={keyDef} />
      ))}
    </div>
  )
}

export default memo(KeyRow)
