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
      dir={direction}
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap: '4px',
        justifyContent: 'center',
        alignItems: 'stretch',
      }}
    >
      {keys.map((keyDef, i) => (
        <Key key={i} keyDef={keyDef} />
      ))}
    </div>
  )
}

export default memo(KeyRow)
