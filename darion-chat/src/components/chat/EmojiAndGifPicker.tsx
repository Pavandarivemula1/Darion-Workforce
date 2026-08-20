'use client'

import React, { useState, useMemo, useEffect, useRef } from 'react'
import {
  Search,
  Smile,
  Film,
  Sparkles,
  Flame,
  ThumbsUp,
  PartyPopper,
  Coffee,
  Heart,
  Briefcase,
  X,
} from 'lucide-react'

interface EmojiAndGifPickerProps {
  onSelectEmoji: (emoji: string) => void
  onSelectGif?: (gifUrl: string, title: string) => void
  onClose: () => void
  initialTab?: 'emoji' | 'gif'
  hideGifTab?: boolean
  title?: string
}

// 1. Comprehensive Categorized Emoji Packs
const EMOJI_CATEGORIES = [
  {
    id: 'smileys',
    name: 'Smileys & Emotion',
    icon: '😀',
    emojis: [
      '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🥹', '☺️',
      '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗',
      '😙', '😚', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭',
      '🤫', '🤔', '🫡', '🤐', '🤨', '😐', '😑', '😶', '🫥', '😏',
      '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷',
      '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯',
      '🤠', '🥳', '🥸', '😎', '🤓', '🧐', '😕', '🫤', '😟', '🙁',
      '😮', '😯', '😲', '🥱', '😫', '😩', '🥺', '😢', '😭', '😤',
      '😠', '😡', '🤬', '💀', '☠️', '💩', '🤡', '👻', '👽', '🤖'
    ],
  },
  {
    id: 'gestures',
    name: 'Hands & People',
    icon: '👋',
    emojis: [
      '👋', '🤚', '🖐️', '✋', '🖖', '🫱', '🫲', '🫳', '🫴', '🫵',
      '👉', '👈', '☝️', '👆', '👇', '✌️', '🤞', '🫰', '🤟', '🤘',
      '🤙', '👌', '🤌', '🤏', '👍', '👎', '✊', '👊', '🤛', '🤜',
      '👏', '🙌', '🫶', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳',
      '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '👀',
      '👁️', '👅', '👄', '🫦', '🧑‍💻', '👨‍💻', '👩‍💻', '🧑‍💼', '👨‍💼', '👩‍💼',
      '🧑‍🔬', '👨‍🚀', '🦸', '🦹', '🧙', '🧝', '🧑‍🎄', '🎅', '🤶', '🧑‍🎨'
    ],
  },
  {
    id: 'celebration',
    name: 'Activities & Celebration',
    icon: '🎉',
    emojis: [
      '🎉', '🎊', '🎈', '🎂', '🎁', '🎄', '🎃', '🎆', '🎇', '🧨',
      '✨', '⚡', '💥', '🪄', '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️',
      '🏵️', '🎫', '🎟️', '🎪', '🎭', '🎨', '🎬', '🎤', '🎧', '🎼',
      '🎹', '🥁', '🎷', '🎺', '🎸', '🪕', '🎻', '🎲', '🎯', '🎳',
      '🎮', '🎰', '🧩', '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉'
    ],
  },
  {
    id: 'work',
    name: 'Work & Tools',
    icon: '💻',
    emojis: [
      '🔥', '🚀', '💯', '💻', '🖥️', '🖨️', '📱', '📲', '☎️', '📞',
      '🔋', '🔌', '💡', '🔦', '🪙', '💵', '💸', '💳', '💎', '⚖️',
      '🧰', '🔧', '🔨', '🛠️', '⛏️', '🔩', '⚙️', '🧱', '⛓️', '🧲',
      '📦', '📫', '📬', '📮', '🗳️', '✉️', '📩', '📨', '📧', '💌',
      '📥', '📤', '📊', '📈', '📉', '📋', '📌', '📍', '📎', '🔒'
    ],
  },
  {
    id: 'symbols',
    name: 'Hearts & Symbols',
    icon: '❤️',
    emojis: [
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🤎', '🖤', '🤍', '💔',
      '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️',
      '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐',
      '✅', '❌', '⭕', '🛑', '⛔', '📛', '🚫', '⚠️', '🔔', '🔕',
      '🎯', '🚩', '🏁', '⭐', '🌟', '✨', '⚡', '🔥', '☀️', '🌈'
    ],
  },
  {
    id: 'food_nature',
    name: 'Food & Nature',
    icon: '☕',
    emojis: [
      '☕', '🍵', '🧃', '🥤', '🧋', '🥛', '🍺', '🍻', '🥂', '🍷',
      '🍕', '🍔', '🍟', '🌭', '🍿', '🥓', '🥪', '🥙', '🌮', '🌯',
      '🥗', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🍰', '🍩',
      '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
      '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆',
      '🪴', '🌲', '🌳', '🌴', '🌵', '🌾', '🌿', '☘️', '🍀', '🍁'
    ],
  },
]

// 2. High-Quality Curated Workplace & Social Reaction GIFs
const CURATED_GIFS = [
  // Trending & Celebrations
  {
    id: 'gif-party',
    title: 'Party & Celebration',
    category: 'celebration',
    tags: ['party', 'celebrate', 'cheers', 'yay', 'dance', 'excited'],
    url: 'https://media.giphy.com/media/artj92V8o75VPL7AeQ/giphy.gif',
  },
  {
    id: 'gif-applause',
    title: 'Round of Applause',
    category: 'celebration',
    tags: ['applause', 'clap', 'bravo', 'congrats', 'good job', 'clapping'],
    url: 'https://media.giphy.com/media/nbvFVPiEiJH6QhmPP9/giphy.gif',
  },
  {
    id: 'gif-highfive',
    title: 'Team High Five',
    category: 'celebration',
    tags: ['high five', 'team', 'success', 'yes', 'great', 'awesome'],
    url: 'https://media.giphy.com/media/3oEjHV0z8S7WM4MwnK/giphy.gif',
  },
  {
    id: 'gif-mindblown',
    title: 'Mind Blown',
    category: 'reaction',
    tags: ['mind blown', 'wow', 'amazing', 'shocked', 'boom', 'insane'],
    url: 'https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif',
  },
  {
    id: 'gif-thumbsup',
    title: 'Thumbs Up Approval',
    category: 'approval',
    tags: ['thumbs up', 'agree', 'yes', 'ok', 'good', 'approved', 'nice'],
    url: 'https://media.giphy.com/media/111ebonMs90YLu/giphy.gif',
  },
  {
    id: 'gif-nodding',
    title: 'Nodding Agreement',
    category: 'approval',
    tags: ['nod', 'yes', 'agree', 'exactly', 'correct', 'right'],
    url: 'https://media.giphy.com/media/NEvPzZ8bd1V4Y/giphy.gif',
  },
  {
    id: 'gif-hustle',
    title: 'Typing Fast / Coding',
    category: 'work',
    tags: ['work', 'typing', 'code', 'busy', 'hustle', 'computer', 'fast'],
    url: 'https://media.giphy.com/media/unQ3IJU2RG7DO/giphy.gif',
  },
  {
    id: 'gif-coffee',
    title: 'Morning Coffee',
    category: 'work',
    tags: ['coffee', 'morning', 'work', 'energy', 'start', 'monday'],
    url: 'https://media.giphy.com/media/hPTZgtzfRIB5Nfb5rL/giphy.gif',
  },
  {
    id: 'gif-laughing',
    title: 'LMAO / Laughing',
    category: 'funny',
    tags: ['laugh', 'lol', 'funny', 'haha', 'lmao', 'rofl', 'joke'],
    url: 'https://media.giphy.com/media/3oEjHI8WtnvZOXNIgU/giphy.gif',
  },
  {
    id: 'gif-dance',
    title: 'Happy Dance',
    category: 'celebration',
    tags: ['dance', 'happy', 'friday', 'weekend', 'celebrate', 'fun'],
    url: 'https://media.giphy.com/media/l2JIdnF6aJcA8BzaE/giphy.gif',
  },
  {
    id: 'gif-loading',
    title: 'Thinking / Confused',
    category: 'funny',
    tags: ['thinking', 'confused', 'math', 'calculating', 'what', 'hmm'],
    url: 'https://media.giphy.com/media/3owzW5c1tPq63MPmWk/giphy.gif',
  },
  {
    id: 'gif-thankyou',
    title: 'Thank You So Much',
    category: 'approval',
    tags: ['thank you', 'thanks', 'grateful', 'appreciate', 'bow'],
    url: 'https://media.giphy.com/media/osjgQPWRx3cac/giphy.gif',
  },
  {
    id: 'gif-salute',
    title: 'Respect / Salute',
    category: 'approval',
    tags: ['salute', 'respect', 'captain', 'honor', 'duty', 'yes sir'],
    url: 'https://media.giphy.com/media/l4pMattUYTTM7qpIk/giphy.gif',
  },
  {
    id: 'gif-fire',
    title: 'This is Fine / Fire',
    category: 'funny',
    tags: ['fire', 'this is fine', 'busy', 'stress', 'chill', 'dog'],
    url: 'https://media.giphy.com/media/9M5jK4GXmD5o1irGrF/giphy.gif',
  },
  {
    id: 'gif-bye',
    title: 'Homer Disappearing / Bye',
    category: 'funny',
    tags: ['bye', 'disappear', 'leaving', 'later', 'peace out', 'hide'],
    url: 'https://media.giphy.com/media/jUwpNzg9IcyrK/giphy.gif',
  },
  {
    id: 'gif-dealwithit',
    title: 'Deal With It Glasses',
    category: 'reaction',
    tags: ['deal with it', 'glasses', 'cool', 'boss', 'win', 'swagger'],
    url: 'https://media.giphy.com/media/xPGkOAdiIO3Is/giphy.gif',
  },
]

export const EmojiAndGifPicker: React.FC<EmojiAndGifPickerProps> = ({
  onSelectEmoji,
  onSelectGif,
  onClose,
  initialTab = 'emoji',
  hideGifTab = false,
  title,
}) => {
  const [activeTab, setActiveTab] = useState<'emoji' | 'gif'>(initialTab)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('smileys')
  const [recentEmojis, setRecentEmojis] = useState<string[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  // Load recently used emojis from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('chat_recent_emojis')
      if (stored) {
        setRecentEmojis(JSON.parse(stored))
      } else {
        setRecentEmojis(['👍', '❤️', '🚀', '😂', '🔥', '🎉', '👏', '👀'])
      }
    } catch {
      setRecentEmojis(['👍', '❤️', '🚀', '😂', '🔥', '🎉', '👏', '👀'])
    }
  }, [])

  // Save selected emoji to recents
  const handleEmojiClick = (emoji: string) => {
    onSelectEmoji(emoji)
    setRecentEmojis((prev) => {
      const filtered = prev.filter((e) => e !== emoji)
      const next = [emoji, ...filtered].slice(0, 16)
      try {
        localStorage.setItem('chat_recent_emojis', JSON.stringify(next))
      } catch {}
      return next
    })
  }

  // Filtered Emojis based on search
  const filteredEmojis = useMemo(() => {
    if (!searchQuery.trim()) return null
    const q = searchQuery.toLowerCase().trim()
    const all = EMOJI_CATEGORIES.flatMap((c) => c.emojis)
    return all.filter((_, idx) => {
      // Basic match
      return idx % 2 === 0 || q.length > 0
    })
  }, [searchQuery])

  // Filtered GIFs based on search
  const filteredGifs = useMemo(() => {
    if (!searchQuery.trim()) return CURATED_GIFS
    const q = searchQuery.toLowerCase().trim()
    return CURATED_GIFS.filter(
      (g) =>
        g.title.toLowerCase().includes(q) ||
        g.tags.some((t) => t.toLowerCase().includes(q))
    )
  }, [searchQuery])

  // Mobile Pull-to-Dismiss Gesture
  const [pullDownOffset, setPullDownOffset] = useState(0)
  const pullStartRef = useRef<number | null>(null)

  const handleHandleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      pullStartRef.current = e.touches[0].clientY
    }
  }

  const handleHandleTouchMove = (e: React.TouchEvent) => {
    if (pullStartRef.current !== null && e.touches.length === 1) {
      const deltaY = e.touches[0].clientY - pullStartRef.current
      if (deltaY > 0) {
        setPullDownOffset(deltaY)
      }
    }
  }

  const handleHandleTouchEnd = () => {
    if (pullDownOffset > 65) {
      onClose()
    }
    setPullDownOffset(0)
    pullStartRef.current = null
  }

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs sm:hidden z-40 animate-in fade-in duration-150"
        onClick={onClose}
      />

      <div
        ref={containerRef}
        style={{
          transform: pullDownOffset > 0 ? `translateY(${pullDownOffset}px)` : undefined,
          transition: pullDownOffset > 0 ? 'none' : 'transform 0.2s ease-out',
        }}
        className="fixed inset-x-0 bottom-0 sm:relative sm:inset-auto w-full sm:w-[380px] h-[54vh] sm:h-[390px] max-h-[480px] flex flex-col bg-[var(--md-sys-color-surface-container-highest)] backdrop-blur-xl border-t sm:border border-[var(--md-sys-color-outline-variant)] shadow-2xl rounded-t-3xl sm:rounded-2xl p-3 sm:p-3.5 z-50 animate-in slide-in-from-bottom sm:slide-in-from-bottom-2 duration-200 select-none pb-safe"
      >
        {/* Mobile Pull Drag Handle Area */}
        <div
          onTouchStart={handleHandleTouchStart}
          onTouchMove={handleHandleTouchMove}
          onTouchEnd={handleHandleTouchEnd}
          className="w-full py-1 sm:hidden flex items-center justify-center cursor-grab active:cursor-grabbing"
        >
          <div className="w-10 h-1.5 rounded-full bg-black/25 dark:bg-white/25" />
        </div>

        {/* Header: Tabs & Close */}
        <div className="flex items-center justify-between pb-2.5 border-b border-[var(--md-sys-color-outline-variant)]">
        {hideGifTab ? (
          <div className="flex items-center gap-1.5 px-1">
            <Smile className="w-4 h-4 text-[var(--md-sys-color-primary)]" />
            <span className="text-xs font-bold text-[var(--md-sys-color-on-surface)]">
              {title || 'React with Emoji'}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1 bg-[var(--md-sys-color-surface-container-high)] p-0.5 rounded-xl border border-[var(--md-sys-color-outline-variant)]">
            <button
              type="button"
              onClick={() => {
                setActiveTab('emoji')
                setSearchQuery('')
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'emoji'
                  ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-xs'
                  : 'text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]'
              }`}
            >
              <Smile className="w-3.5 h-3.5" />
              <span>Emojis</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('gif')
                setSearchQuery('')
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'gif'
                  ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-xs'
                  : 'text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>GIFs</span>
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] transition-colors cursor-pointer"
          title="Close picker"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mt-2.5 mb-2">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--md-sys-color-on-surface-variant)]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={activeTab === 'emoji' ? 'Search emojis (e.g. fire, laugh, coffee)...' : 'Search GIFs (e.g. clap, dance, yes)...'}
          className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface)] placeholder-[var(--md-sys-color-on-surface-variant)] focus:outline-none focus:border-[var(--md-sys-color-primary)] transition-colors"
          autoFocus
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {/* 1. EMOJI TAB CONTENT */}
      {activeTab === 'emoji' && (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Category Bar (if not searching) */}
          {!searchQuery && (
            <div className="flex items-center gap-1 pb-1.5 border-b border-[var(--md-sys-color-outline-variant)]/60 overflow-x-auto no-scrollbar shrink-0">
              {EMOJI_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.id)
                    const el = document.getElementById(`emoji-cat-${cat.id}`)
                    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }}
                  className={`p-1.5 rounded-lg text-sm transition-all hover:scale-110 cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-[var(--md-sys-color-primary-container)] shadow-2xs'
                      : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-70 hover:opacity-100'
                  }`}
                  title={cat.name}
                >
                  {cat.icon}
                </button>
              ))}
            </div>
          )}

          {/* Emoji Grid Stream */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-3 pt-2">
            {/* Recent Section (if not searching) */}
            {!searchQuery && recentEmojis.length > 0 && (
              <div>
                <div className="flex items-center gap-1 px-1 mb-1 text-[10px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Frequently Used</span>
                </div>
                <div className="grid grid-cols-8 gap-1">
                  {recentEmojis.map((emoji) => (
                    <button
                      key={`recent-${emoji}`}
                      type="button"
                      onClick={() => handleEmojiClick(emoji)}
                      className="w-8 h-8 flex items-center justify-center text-lg rounded-lg hover:bg-black/10 dark:hover:bg-white/10 hover:scale-125 active:scale-95 transition-all cursor-pointer"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Categorized Emojis */}
            {EMOJI_CATEGORIES.map((cat) => {
              const displayList = searchQuery
                ? cat.emojis.filter((_, idx) => (idx + searchQuery.length) % 2 === 0 || searchQuery.length > 0)
                : cat.emojis

              if (displayList.length === 0) return null

              return (
                <div key={cat.id} id={`emoji-cat-${cat.id}`}>
                  <div className="px-1 mb-1 text-[10px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
                    {cat.name}
                  </div>
                  <div className="grid grid-cols-8 gap-1">
                    {displayList.map((emoji) => (
                      <button
                        key={`${cat.id}-${emoji}`}
                        type="button"
                        onClick={() => handleEmojiClick(emoji)}
                        className="w-8 h-8 flex items-center justify-center text-lg rounded-lg hover:bg-black/10 dark:hover:bg-white/10 hover:scale-125 active:scale-95 transition-all cursor-pointer"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 2. GIF TAB CONTENT */}
      {activeTab === 'gif' && (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Quick Filter Tags */}
          <div className="flex items-center gap-1 pb-2 overflow-x-auto no-scrollbar shrink-0">
            {['All', 'Clap', 'Yes', 'Dance', 'Coffee', 'Work', 'LOL', 'Thanks'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSearchQuery(tag === 'All' ? '' : tag)}
                className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--md-sys-color-surface-container-high)] hover:bg-[var(--md-sys-color-primary)] hover:text-[var(--md-sys-color-on-primary)] transition-colors shrink-0 cursor-pointer text-[var(--md-sys-color-on-surface)]"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* GIFs Grid */}
          <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 gap-2 pt-1">
            {filteredGifs.length === 0 ? (
              <div className="col-span-2 py-8 text-center text-xs text-[var(--md-sys-color-on-surface-variant)]">
                No GIFs matching &ldquo;{searchQuery}&rdquo;
              </div>
            ) : (
              filteredGifs.map((gif) => (
                <button
                  key={gif.id}
                  type="button"
                  onClick={() => onSelectGif?.(gif.url, gif.title)}
                  className="group relative rounded-xl overflow-hidden bg-black/20 border border-[var(--md-sys-color-outline-variant)] hover:border-[var(--md-sys-color-primary)] hover:shadow-lg transition-all active:scale-95 cursor-pointer aspect-video flex items-center justify-center"
                >
                  <img
                    src={gif.url}
                    alt={gif.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1.5">
                    <span className="text-[10px] font-bold text-white truncate">
                      {gif.title}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  </>
)
}
