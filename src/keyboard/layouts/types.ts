export type LanguageCode = 'en' | 'he' | 'es' | 'pt-br' | 'emoji'

export type ShiftState = 'off' | 'once' | 'lock'

export type KeyAction =
  | 'backspace'
  | 'space'
  | 'done'
  | 'clear'
  | 'shift'
  | 'lang-cycle'
  | 'settings'
  | 'toggle-numbers'
  | 'toggle-globe'

export interface CharKey {
  type: 'char'
  base: string
  shift?: string    // defaults to base.toUpperCase() if omitted
  flex?: number
}

export interface ActionKey {
  type: 'action'
  action: KeyAction
  label: string
  icon?: string
  flex?: number
}

export type KeyDef = CharKey | ActionKey

export interface KeyboardLayout {
  code: LanguageCode
  label: string
  direction: 'ltr' | 'rtl'
  numberRow: KeyDef[]
  rows: KeyDef[][]
  bottomRow: KeyDef[]
}
