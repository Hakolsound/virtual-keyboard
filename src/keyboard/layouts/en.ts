import type { KeyboardLayout } from './types'

const NUM_SHIFTS = "!@#$%^&*()"

export const enLayout: KeyboardLayout = {
  code: 'en',
  label: 'EN',
  direction: 'ltr',

  numberRow: [
    ...'1234567890'.split('').map((c, i) => ({
      type: 'char' as const,
      base: c,
      shift: NUM_SHIFTS[i],
    })),
  ],

  rows: [
    ['q','w','e','r','t','y','u','i','o','p'].map(c => ({ type: 'char' as const, base: c })),
    ['a','s','d','f','g','h','j','k','l']  .map(c => ({ type: 'char' as const, base: c })),
    ['z','x','c','v','b','n','m']           .map(c => ({ type: 'char' as const, base: c })),
  ],

  bottomRow: [
    { type: 'action', action: 'shift',     label: '⇧',    flex: 1.5 },
    { type: 'char',   base: "'",  shift: '"'              },
    { type: 'char',   base: '-',  shift: '_'              },
    { type: 'char',   base: '.',  shift: '>'              },
    { type: 'action', action: 'space',     label: 'Space', flex: 3   },
    { type: 'action', action: 'clear',     label: 'Clear'            },
    { type: 'action', action: 'backspace', label: '⌫'               },
    { type: 'action', action: 'done',      label: 'Done', flex: 1.5  },
  ],
}
