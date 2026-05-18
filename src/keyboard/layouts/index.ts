export type { LanguageCode, ShiftState, KeyAction, KeyDef, CharKey, ActionKey, KeyboardLayout } from './types'
export { enLayout }   from './en'
export { heLayout }   from './he'
export { esLayout }   from './es'
export { ptBrLayout } from './pt-br'
export { emojiCategories } from './emoji'
export type { EmojiCategory } from './emoji'

import { enLayout }   from './en'
import { heLayout }   from './he'
import { esLayout }   from './es'
import { ptBrLayout } from './pt-br'
import type { LanguageCode, KeyboardLayout } from './types'

export const LAYOUTS: Record<Exclude<LanguageCode, 'emoji'>, KeyboardLayout> = {
  en:    enLayout,
  he:    heLayout,
  es:    esLayout,
  'pt-br': ptBrLayout,
}

export const ALL_LANGUAGE_CODES: LanguageCode[] = ['en', 'he', 'es', 'pt-br', 'emoji']

export const LANGUAGE_LABELS: Record<LanguageCode, string> = {
  en:      'EN',
  he:      'עב',
  es:      'ES',
  'pt-br': 'PT',
  emoji:   '😀',
}
