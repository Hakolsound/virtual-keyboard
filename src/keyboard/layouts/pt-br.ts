import type { KeyboardLayout } from './types'

const NUM_SHIFTS = "!@#$%^&*()"

export const ptBrLayout: KeyboardLayout = {
  code: 'pt-br',
  label: 'PT',
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
    ['a','s','d','f','g','h','j','k','l'].map(c => ({ type: 'char' as const, base: c })),
    [
      { type: 'char', base: 'z' },
      { type: 'char', base: 'x' },
      { type: 'char', base: 'c' },
      { type: 'char', base: 'v' },
      { type: 'char', base: 'b' },
      { type: 'char', base: 'n' },
      { type: 'char', base: 'm' },
      // Common BR accented chars on shift layer
      { type: 'char', base: 'ã', shift: 'Ã' },
      { type: 'char', base: 'â', shift: 'Â' },
      { type: 'char', base: 'ê', shift: 'Ê' },
      { type: 'char', base: 'ç', shift: 'Ç' },
      { type: 'char', base: 'õ', shift: 'Õ' },
    ],
  ],

  bottomRow: [
    { type: 'action', action: 'shift',     label: '⇧',     flex: 1.5 },
    { type: 'char',   base: "'",  shift: '"'               },
    { type: 'char',   base: '-',  shift: '_'               },
    { type: 'char',   base: '.',  shift: '>'               },
    { type: 'action', action: 'space',      label: 'espaço', flex: 3  },
    { type: 'action', action: 'lang-cycle', label: '🌐'               },
    { type: 'action', action: 'backspace',  label: '⌫'                },
    { type: 'action', action: 'done',       label: 'Pronto', flex: 1.5 },
  ],
}
