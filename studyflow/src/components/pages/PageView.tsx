'use client'

import { useState, useRef, useEffect } from 'react'
import { ImagePlus, MoreHorizontal, Trash2 } from 'lucide-react'
import { useWorkspace } from '@/components/workspace/WorkspaceProvider'
import { BlockEditor } from '@/components/editor/BlockEditor'
import { TasksDatabase } from '@/components/database/TasksDatabase'
import { ActivityPanel, HistoryButton } from '@/components/workspace/ActivityPanel'
import { formatDistanceToNow } from 'date-fns'

const COVER_GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
]

const EMOJI_PICK = ['📄', '📝', '📚', '🎯', '💡', '🔬', '📊', '✅', '🏠', '⭐', '🧠', '📅']

export function PageView({ pageId }: { pageId: string }) {
  const { pages, updatePage, deletePage, setActivePageId, getPageActivity } = useWorkspace()
  const page = pages.find((p) => p.id === pageId)
  const [menuOpen, setMenuOpen] = useState(false)
  const [iconPicker, setIconPicker] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const isDatabase = page?.type === 'database'
  const contentWidth = isDatabase ? 'max-w-[1200px]' : 'max-w-[720px]'

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
        setIconPicker(false)
      }
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  if (!page) {
    return (
      <div className="flex h-full items-center justify-center text-[rgba(55,53,47,0.5)]">
        Page not found
      </div>
    )
  }

  const cycleCover = () => {
    const idx = COVER_GRADIENTS.indexOf(page.cover ?? '')
    const next = COVER_GRADIENTS[(idx + 1) % COVER_GRADIENTS.length]
    updatePage(pageId, { cover: next })
  }

  const handleDelete = () => {
    if (confirm('Delete this page and all sub-pages?')) {
      deletePage(pageId)
      setActivePageId(pages.find((p) => p.parentId === null)?.id ?? null)
    }
  }

  return (
    <div className="min-h-full">
      {/* Cover */}
      <div className="group relative h-32 w-full">
        {page.cover ? (
          <div className="h-full w-full" style={{ background: page.cover }} />
        ) : (
          <div className="h-full w-full bg-[#f7f6f3]" />
        )}
        <button
          type="button"
          onClick={cycleCover}
          className="absolute bottom-3 right-4 flex items-center gap-1.5 rounded px-2 py-1 text-xs text-[rgba(55,53,47,0.5)] opacity-0 transition-opacity hover:bg-[rgba(55,53,47,0.08)] group-hover:opacity-100"
        >
          <ImagePlus className="h-3.5 w-3.5" />
          Change cover
        </button>
      </div>

      <div className={`mx-auto ${contentWidth} w-full px-6 pb-24 pt-8 md:px-10`}>
        {/* Icon + menu */}
        <div className="-mt-14 mb-2 flex items-end justify-between">
          <div className="relative">
            <button
              type="button"
              onClick={() => setIconPicker(!iconPicker)}
              className="flex h-16 w-16 items-center justify-center rounded text-5xl transition-transform hover:scale-105"
            >
              {page.icon}
            </button>
            {iconPicker && (
              <div className="absolute left-0 top-full z-20 mt-1 grid w-48 grid-cols-4 gap-1 rounded-lg border border-[rgba(55,53,47,0.09)] bg-white p-2 shadow-lg">
                {EMOJI_PICK.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => {
                      updatePage(pageId, { icon: e })
                      setIconPicker(false)
                    }}
                    className="rounded p-1 text-xl hover:bg-[rgba(55,53,47,0.08)]"
                  >
                    {e}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <HistoryButton onClick={() => setHistoryOpen(true)} />
            <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="rounded p-1.5 text-[rgba(55,53,47,0.45)] hover:bg-[rgba(55,53,47,0.08)]"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full z-20 mt-1 w-44 rounded-lg border border-[rgba(55,53,47,0.09)] bg-white py-1 shadow-lg">
                <button
                  type="button"
                  onClick={() => updatePage(pageId, { isFavorite: !page.isFavorite })}
                  className="w-full px-3 py-1.5 text-left text-sm hover:bg-[rgba(55,53,47,0.08)]"
                >
                  {page.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete page
                </button>
              </div>
            )}
            </div>
          </div>
        </div>

        {/* Title */}
        <input
          value={page.title}
          onChange={(e) => updatePage(pageId, { title: e.target.value })}
          placeholder="Untitled"
          className="mb-1 w-full border-0 bg-transparent text-4xl font-bold leading-tight text-[#37352f] outline-none placeholder:text-[rgba(55,53,47,0.3)]"
        />
        <p className="mb-8 text-xs text-[rgba(55,53,47,0.45)]">
          Edited {formatDistanceToNow(new Date(page.updatedAt), { addSuffix: true })}
          {page.type === 'database' && ' · Board view'}
        </p>

        {page.type === 'database' ? (
          <TasksDatabase pageId={pageId} />
        ) : (
          <BlockEditor
            content={page.content}
            onChange={(json) => updatePage(pageId, { content: json })}
            placeholder="Type '/' for commands, or start writing…"
          />
        )}
      </div>

      <ActivityPanel
        entries={getPageActivity(pageId)}
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
      />
    </div>
  )
}
