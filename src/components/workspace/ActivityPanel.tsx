'use client'

import { History, X } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { ActivityEntry } from '@/lib/workspace/types'

const ACTION_LABELS: Record<ActivityEntry['action'], string> = {
  created: 'Created',
  updated: 'Updated',
  deleted: 'Deleted',
  moved: 'Moved',
  noted: 'Note',
}

export function ActivityPanel({
  entries,
  open,
  onClose,
}: {
  entries: ActivityEntry[]
  open: boolean
  onClose: () => void
}) {
  if (!open) return null

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-black/20"
        aria-label="Close history"
        onClick={onClose}
      />
      <aside className="fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col border-l border-[rgba(55,53,47,0.09)] bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[rgba(55,53,47,0.09)] px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#37352f]">
            <History className="h-4 w-4" />
            History
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 hover:bg-[rgba(55,53,47,0.08)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {entries.length === 0 ? (
            <p className="py-8 text-center text-sm text-[rgba(55,53,47,0.45)]">
              No activity yet. Edits and deletes will show up here.
            </p>
          ) : (
            <ul className="space-y-3">
              {entries.map((entry) => (
                <li key={entry.id} className="text-sm">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-medium text-[#37352f]">
                      {ACTION_LABELS[entry.action]}
                    </span>
                    <time className="shrink-0 text-xs text-[rgba(55,53,47,0.4)]">
                      {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
                    </time>
                  </div>
                  <p className="mt-0.5 break-words text-[rgba(55,53,47,0.65)]">{entry.detail}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </>
  )
}

export function HistoryButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-md border border-[rgba(55,53,47,0.12)] px-3 py-1.5 text-sm text-[rgba(55,53,47,0.65)] hover:bg-[rgba(55,53,47,0.04)]"
    >
      <History className="h-4 w-4" />
      History
    </button>
  )
}
