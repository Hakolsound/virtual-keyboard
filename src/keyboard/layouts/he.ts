import type { KeyboardLayout } from './types'

const NUM_SHIFTS = "!@#$%^&*()"

// Standard Israeli QWERTY-mapped Hebrew keyboard layout
export const heLayout: KeyboardLayout = {
  code: 'he',
  label: 'עב',
  direction: 'rtl',

  numberRow: [
    ...'1234567890'.split('').map((c, i) => ({
      type: 'char' as const,
      base: c,
      shift: NUM_SHIFTS[i],
    })),
  ],

  rows: [
    // Row 1: maps to Q W E R T Y U I O P → / ' ק ר א ט ו ן ם פ
    ['/','\'','ק','ר','א','ט','ו','ן','ם','פ'].map(c => ({ type: 'char' as const, base: c })),
    // Row 2: maps to A S D F G H J K L → ש ד ג כ ע י ח ל ך
    ['ש','ד','ג','כ','ע','י','ח','ל','ך'].map(c => ({ type: 'char' as const, base: c })),
    // Row 3: maps to Z X C V B N M → ז ס ב ה נ מ צ
    ['ז','ס','ב','ה','נ','מ','צ'].map(c => ({ type: 'char' as const, base: c })),
  ],

  bottomRow: [
    { type: 'action', action: 'shift',     label: '⇧',    flex: 1.5 },
    { type: 'char',   base: '-',  shift: '_'              },
    { type: 'char',   base: '.',  shift: ':'              },
    { type: 'action', action: 'space',     label: 'רווח', flex: 3   },
    { type: 'action', action: 'clear',     label: 'נקה'             },
    { type: 'action', action: 'backspace', label: '⌫'               },
    { type: 'action', action: 'done',      label: 'סיום', flex: 1.5  },
  ],
}
