import { memo, useCallback, useState } from 'react'
import { emojiCategories } from '../layouts/emoji'
import { useKeyboard } from '../context/KeyboardContext'

const KEY_SHADOW = '0 1px 0 rgba(0,0,0,0.35)'
const KEY_RADIUS = '5px'

function EmojiPanel() {
  const { insert } = useKeyboard()
  const [activeCat, setActiveCat] = useState(0)

  const handleEmoji = useCallback((emoji: string) => {
    insert(emoji)
  }, [insert])

  const category = emojiCategories[activeCat]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', padding: '6px 3px 4px', gap: '0' }}>
      {/* Emoji grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(8, 1fr)',
        gap: '5px',
        padding: '0 0 6px',
        maxHeight: 'calc(var(--vkb-key-h, 48px) * 3.5 + 18px)',
        overflowY: 'auto',
      }}>
        {category.emojis.map((emoji, i) => (
          <button
            key={i}
            type="button"
            aria-label={emoji}
            style={{
              display:         'flex',
              alignItems:      'center',
              justifyContent:  'center',
              minHeight:       'var(--vkb-key-h, 48px)',
              aspectRatio:     '1',
              fontSize:        'var(--vkb-emoji-font, 24px)',
              backgroundColor: '#FFFFFF',
              boxShadow:       KEY_SHADOW,
              borderRadius:    KEY_RADIUS,
              border:          'none',
              cursor:          'pointer',
              userSelect:      'none',
              WebkitUserSelect:'none',
              touchAction:     'manipulation',
            }}
            onPointerDown={e => { e.preventDefault(); handleEmoji(emoji) }}
            onContextMenu={e => e.preventDefault()}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Category tab bar */}
      <div style={{
        display:         'flex',
        borderTop:       '1px solid #B0B7C0',
        backgroundColor: '#CDD1D6',
        paddingTop:      '4px',
      }}>
        {emojiCategories.map((cat, i) => (
          <button
            key={i}
            type="button"
            aria-label={cat.label}
            style={{
              flex:            1,
              display:         'flex',
              alignItems:      'center',
              justifyContent:  'center',
              minHeight:       'clamp(32px, 4vh, 44px)',
              fontSize:        'clamp(16px, 2.2vw, 22px)',
              backgroundColor: activeCat === i ? '#FFFFFF' : 'transparent',
              boxShadow:       activeCat === i ? KEY_SHADOW : 'none',
              borderRadius:    activeCat === i ? KEY_RADIUS : '0',
              border:          'none',
              cursor:          'pointer',
              userSelect:      'none',
              WebkitUserSelect:'none',
              touchAction:     'manipulation',
              transition:      'background-color 80ms',
            }}
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
