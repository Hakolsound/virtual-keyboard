import { memo, useCallback, useState } from 'react'
import { emojiCategories } from '../layouts/emoji'
import { useKeyboard } from '../context/KeyboardContext'

function EmojiPanel() {
  const { insert } = useKeyboard()
  const [activeCat, setActiveCat] = useState(0)

  const handleEmoji = useCallback((emoji: string) => {
    insert(emoji)
  }, [insert])

  const category = emojiCategories[activeCat]

  return (
    <div className="flex flex-col" style={{ height: '224px' }}>
      {/* Emoji grid */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="grid grid-cols-8 gap-1">
          {category.emojis.map((emoji, i) => (
            <button
              key={i}
              type="button"
              aria-label={emoji}
              className="flex items-center justify-center rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation select-none"
              style={{
                aspectRatio: '1',
                fontSize: 'var(--vkb-emoji-font, 24px)',
                minHeight: 'var(--vkb-key-h, 48px)',
              }}
              onPointerDown={e => { e.preventDefault(); handleEmoji(emoji) }}
              onContextMenu={e => e.preventDefault()}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex border-t border-gray-200 bg-gray-50">
        {emojiCategories.map((cat, i) => (
          <button
            key={i}
            type="button"
            aria-label={cat.label}
            className={[
              'flex-1 py-2 text-center text-xl transition-colors touch-manipulation select-none',
              activeCat === i ? 'bg-blue-50 border-b-2 border-blue-500' : 'hover:bg-gray-100',
            ].join(' ')}
            onPointerDown={e => { e.preventDefault(); setActiveCat(i) }}
            onContextMenu={e => e.preventDefault()}
          >
            {cat.icon}
          </button>
        ))}
      </div>
    </div>
  )
}

export default memo(EmojiPanel)
