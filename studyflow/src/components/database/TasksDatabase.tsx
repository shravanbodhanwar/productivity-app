'use client'

import { useState } from 'react'
import { Plus, Trash2, StickyNote, ChevronDown, ChevronUp } from 'lucide-react'
import { useWorkspace } from '@/components/workspace/WorkspaceProvider'
import { ActivityPanel, HistoryButton } from '@/components/workspace/ActivityPanel'
import type { TaskRow, TaskStatus } from '@/lib/workspace/types'

const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: 'todo', label: 'To do', color: 'bg-[rgba(55,53,47,0.04)]' },
  { id: 'in_progress', label: 'In progress', color: 'bg-[rgba(35,131,226,0.06)]' },
  { id: 'done', label: 'Done', color: 'bg-[rgba(46,125,50,0.06)]' },
]

const PRIORITY_STYLES = {
  low: 'text-[rgba(55,53,47,0.55)]',
  medium: 'text-amber-700',
  high: 'text-red-600',
}

export function TasksDatabase({ pageId }: { pageId: string }) {
  const { pages, addTask, updateTask, deleteTask, getPageActivity } = useWorkspace()
  const [historyOpen, setHistoryOpen] = useState(false)
  const page = pages.find((p) => p.id === pageId)
  const tasks = page?.tasks ?? []
  const activity = getPageActivity(pageId)

  const byStatus = (status: TaskStatus) => tasks.filter((t) => t.status === status)

  return (
    <div className="w-full">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[rgba(55,53,47,0.55)]">
          {tasks.filter((t) => t.status === 'done').length} of {tasks.length} complete
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <HistoryButton onClick={() => setHistoryOpen(true)} />
          <button
            type="button"
            onClick={() => addTask(pageId)}
            className="flex items-center gap-1.5 rounded-md bg-[#37352f] px-3 py-2 text-sm text-white hover:bg-[#2f2d28]"
          >
            <Plus className="h-4 w-4" />
            New task
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {COLUMNS.map((col) => (
          <div
            key={col.id}
            className={`min-w-0 rounded-xl p-4 ${col.color}`}
          >
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-[rgba(55,53,47,0.5)]">
              {col.label}
              <span className="ml-2 font-normal">({byStatus(col.id).length})</span>
            </h3>
            <div className="flex flex-col gap-4">
              {byStatus(col.id).map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onUpdate={(patch) => updateTask(pageId, task.id, patch)}
                  onDelete={() => {
                    if (confirm('Delete this task?')) deleteTask(pageId, task.id)
                  }}
                />
              ))}
              {byStatus(col.id).length === 0 && (
                <p className="py-6 text-center text-xs text-[rgba(55,53,47,0.35)]">
                  No tasks
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <ActivityPanel entries={activity} open={historyOpen} onClose={() => setHistoryOpen(false)} />
    </div>
  )
}

function TaskCard({
  task,
  onUpdate,
  onDelete,
}: {
  task: TaskRow
  onUpdate: (patch: Partial<TaskRow>) => void
  onDelete: () => void
}) {
  const [notesOpen, setNotesOpen] = useState(Boolean(task.notes))

  return (
    <article className="min-w-0 rounded-lg border border-[rgba(55,53,47,0.1)] bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-2">
        <textarea
          value={task.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Task name"
          rows={1}
          onInput={(e) => {
            const el = e.currentTarget
            el.style.height = 'auto'
            el.style.height = `${el.scrollHeight}px`
          }}
          className="min-h-[1.5rem] w-full min-w-0 resize-none overflow-hidden break-words bg-transparent text-sm font-medium leading-snug text-[#37352f] outline-none placeholder:text-[rgba(55,53,47,0.35)]"
        />
        <button
          type="button"
          onClick={onDelete}
          title="Delete task"
          className="shrink-0 rounded p-1.5 text-[rgba(55,53,47,0.4)] hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        <select
          value={task.status}
          onChange={(e) => onUpdate({ status: e.target.value as TaskStatus })}
          className="rounded-md border border-[rgba(55,53,47,0.1)] bg-white px-2.5 py-1.5 text-xs outline-none focus:border-[#2383e2]"
        >
          <option value="todo">To do</option>
          <option value="in_progress">In progress</option>
          <option value="done">Done</option>
        </select>
        <select
          value={task.priority}
          onChange={(e) =>
            onUpdate({ priority: e.target.value as TaskRow['priority'] })
          }
          className={`rounded-md border border-[rgba(55,53,47,0.1)] bg-white px-2.5 py-1.5 text-xs outline-none focus:border-[#2383e2] ${PRIORITY_STYLES[task.priority]}`}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div className="border-t border-[rgba(55,53,47,0.08)] pt-3">
        <button
          type="button"
          onClick={() => setNotesOpen(!notesOpen)}
          className="flex w-full items-center gap-2 text-xs font-medium text-[rgba(55,53,47,0.55)] hover:text-[#37352f]"
        >
          <StickyNote className="h-3.5 w-3.5" />
          {notesOpen ? 'Hide note' : task.notes ? 'View note' : 'Add note'}
          {notesOpen ? (
            <ChevronUp className="ml-auto h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="ml-auto h-3.5 w-3.5" />
          )}
        </button>
        {notesOpen && (
          <textarea
            value={task.notes}
            onChange={(e) => onUpdate({ notes: e.target.value })}
            placeholder="Add details, links, or study notes for this task…"
            rows={3}
            className="mt-2 w-full min-w-0 resize-y rounded-md border border-[rgba(55,53,47,0.1)] bg-[#f7f6f3] px-3 py-2 text-sm leading-relaxed text-[#37352f] outline-none placeholder:text-[rgba(55,53,47,0.35)] focus:border-[#2383e2]"
          />
        )}
      </div>
    </article>
  )
}
