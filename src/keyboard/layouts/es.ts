import type { KeyboardLayout } from './types'

const NUM_SHIFTS = "!@#$%^&*()"

export const esLayout: KeyboardLayout = {
  code: 'es',
  label: 'ES',
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
    ['a','s','d','f','g','h','j','k','l','ñ'].map(c => ({ type: 'char' as const, base: c })),
    // Shift layer for row 3 provides accented vowels common in Spanish
    [
      { type: 'char', base: 'z' },
      { type: 'char', base: 'x' },
      { type: 'char', base: 'c' },
      { type: 'char', base: 'v' },
      { type: 'char', base: 'b' },
      { type: 'char', base: 'n' },
      { type: 'char', base: 'm' },
      { type: 'char', base: 'á', shift: 'Á' },
      { type: 'char', base: 'é', shift: 'É' },
      { type: 'char', base: 'í', shift: 'Í' },
      { type: 'char', base: 'ó', shift: 'Ó' },
      { type: 'char', base: 'ú', shift: 'Ú' },
    ],
  ],

  bottomRow: [
    { type: 'action', action: 'shift',          label: '⇧',      flex: 1.5 },
    { type: 'action', action: 'toggle-numbers', label: '123'               },
    { type: 'action', action: 'toggle-globe',   label: '🌐'                },
    { type: 'action', action: 'space',          label: 'espacio', flex: 5  },
    { type: 'action', action: 'done',           label: 'Listo',   flex: 2  },
    { type: 'action', action: 'backspace',      label: '⌫'                 },
  ],
}
