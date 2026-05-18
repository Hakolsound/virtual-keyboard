import { memo, useCallback, useRef, useState } from 'react'
import { emojiCategories } from '../layouts/emoji'
import { useKeyboard } from '../context/KeyboardContext'
import { useSettings } from '../context/SettingsContext'

const KEY_SHADOW = '0 1px 0 rgba(0,0,0,0.35)'
const KEY_RADIUS = '5px'
const GRID_ROWS  = 3   // visible emoji rows per page

function EmojiPanel() {
  const { insert, backspace, setLanguage } = useKeyboard()
  const { enabledLanguages } = useSettings()
  const [activeCat, setActiveCat]   = useState(0)
  const [search,    setSearch]      = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const catBarRef = useRef<HTMLDivElement>(null)

  // Return to the first non-emoji language
  const prevLang = enabledLanguages.find(l => l !== 'emoji') ?? 'en'

  // Simple keyword search: filter by category label
  const searchResults = search.trim()
    ? emojiCategories.flatMap(c =>
        c.label.toLowerCase().includes(search.toLowerCase()) ? c.emojis : []
      )
    : null

  const goToCategory = useCallback((i: number) => {
    setSearch('')
    setActiveCat(i)
    const el = scrollRef.current
    if (el) el.scrollTo({ left: i * el.offsetWidth, behavior: 'smooth' })
    // Scroll cat bar to keep active icon visible
    const bar = catBarRef.current
    if (bar) {
      const btn = bar.children[i + 1] as HTMLElement  // +1 for ABC
      btn?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  }, [])

  const onCatScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const idx = Math.round(el.scrollLeft / el.offsetWidth)
    if (idx !== activeCat) setActiveCat(idx)
  }, [activeCat])

  const emojiBtn = (emoji: string, key: number) => (
    <button
      key={key}
      type="button"
      aria-label={emoji}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: 'var(--vkb-key-h, 48px)',
        aspectRatio: '1',
        fontSize: 'var(--vkb-emoji-font, 24px)',
        backgroundColor: '#FFFFFF',
        boxShadow: KEY_SHADOW,
        borderRadius: KEY_RADIUS,
        border: 'none',
        cursor: 'pointer',
        touchAction: 'manipulation',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
      onPointerDown={e => { e.preventDefault(); insert(emoji) }}
      onContextMenu={e => e.preventDefault()}
    >
      {emoji}
    </button>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', padding: '4px 3px 0' }}>

      {/* Search bar */}
      <div style={{ padding: '0 2px 4px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          backgroundColor: '#B8BEC5',
          borderRadius: '10px',
          padding: '6px 10px',
        }}>
          <span style={{ fontSize: '13px', color: '#6C737A' }}>🔍</span>
          <span style={{ fontSize: '13px', color: '#6C737A', fontStyle: search ? 'normal' : 'italic' }}>
            {search || 'Describe an emoji'}
          </span>
        </div>
      </div>

      {/* Emoji area */}
      {searchResults ? (
        /* Search results */
        <div style={{
          height: `calc(var(--vkb-key-h, 48px) * ${GRID_ROWS} + ${(GRID_ROWS - 1) * 5}px)`,
          overflowY: 'auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(8, 1fr)',
          gap: '5px',
          padding: '2px 0',
        }}>
          {searchResults.length > 0
            ? searchResults.map((e, i) => emojiBtn(e, i))
            : <div style={{ gridColumn: 'span 8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8E8E93', fontSize: '13px' }}>No results</div>
          }
        </div>
      ) : (
        /* Horizontal paged categories — one page per category */
        <div
          ref={scrollRef}
          onScroll={onCatScroll}
          style={{
            display: 'flex',
            overflowX: 'scroll',
            scrollSnapType: 'x mandatory',
            scrollbarWidth: 'none',
            height: `calc(var(--vkb-key-h, 48px) * ${GRID_ROWS} + ${(GRID_ROWS - 1) * 5}px + 4px)`,
            WebkitOverflowScrolling: 'touch',
          } as React.CSSProperties}
        >
          {emojiCategories.map((cat, ci) => (
            <div
              key={ci}
              style={{
                minWidth: '100%',
                scrollSnapAlign: 'start',
                display: 'grid',
                gridTemplateColumns: 'repeat(8, 1fr)',
                gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
                gap: '5px',
                padding: '2px 0',
                alignContent: 'start',
                overflowY: 'auto',
                boxSizing: 'border-box',
              }}
            >
              {cat.emojis.map((e, i) => emojiBtn(e, i))}
            </div>
          ))}
        </div>
      )}

      {/* Category bar: ABC | icons… | ⌫ */}
      <div
        ref={catBarRef}
        style={{
          display: 'flex',
          alignItems: 'center',
          borderTop: '1px solid #B0B7C0',
          backgroundColor: '#CDD1D6',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          padding: '3px 0 2px',
          gap: '2px',
        } as React.CSSProperties}
      >
        {/* ABC — back to language */}
        <button
          type="button"
          style={{
            flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            minWidth: '42px', height: '34px',
            borderRadius: KEY_RADIUS,
            border: 'none',
            backgroundColor: '#FFFFFF',
            boxShadow: KEY_SHADOW,
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '700',
            color: '#1C1C1E',
            touchAction: 'manipulation',
            letterSpacing: '0.3px',
          }}
          onPointerDown={e => { e.preventDefault(); setLanguage(prevLang) }}
          onContextMenu={e => e.preventDefault()}
        >
          ABC
        </button>

        {/* Category icons */}
        {emojiCategories.map((cat, i) => (
          <button
            key={i}
            type="button"
            aria-label={cat.label}
            style={{
              flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              minWidth: '36px', height: '34px',
              borderRadius: KEY_RADIUS,
              border: 'none',
              backgroundColor: activeCat === i && !searchResults ? '#FFFFFF' : 'transparent',
              boxShadow: activeCat === i && !searchResults ? KEY_SHADOW : 'none',
              cursor: 'pointer',
              fontSize: '20px',
              touchAction: 'manipulation',
              filter: activeCat === i && !searchResults ? 'none' : 'grayscale(1) opacity(0.5)',
              transition: 'background-color 80ms, filter 80ms',
            }}
            onPointerDown={e => { e.preventDefault(); goToCategory(i) }}
            onContextMenu={e => e.preventDefault()}
          >
            {cat.icon}
          </button>
        ))}

        {/* Backspace */}
        <button
          type="button"
          style={{
            flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            minWidth: '42px', height: '34px',
            borderRadius: KEY_RADIUS,
            border: 'none',
            backgroundColor: '#ADB5BD',
            boxShadow: KEY_SHADOW,
            cursor: 'pointer',
            fontSize: '16px',
            color: '#1C1C1E',
            touchAction: 'manipulation',
            marginLeft: 'auto',
          }}
          onPointerDown={e => { e.preventDefault(); backspace() }}
          onContextMenu={e => e.preventDefault()}
        >
          ⌫
        </button>
      </div>
    </div>
  )
}

export default memo(EmojiPanel)
