'use client'

import { useEffect, useRef } from 'react'
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListChecks,
  Quote,
  Code,
  Minus,
} from 'lucide-react'

const ITEMS = [
  { id: 'h1', label: 'Heading 1', icon: Heading1, hint: '# ' },
  { id: 'h2', label: 'Heading 2', icon: Heading2, hint: '## ' },
  { id: 'h3', label: 'Heading 3', icon: Heading3, hint: '### ' },
  { id: 'bullet', label: 'Bulleted list', icon: List, hint: '' },
  { id: 'numbered', label: 'Numbered list', icon: ListOrdered, hint: '' },
  { id: 'todo', label: 'To-do list', icon: ListChecks, hint: '' },
  { id: 'quote', label: 'Quote', icon: Quote, hint: '' },
  { id: 'code', label: 'Code block', icon: Code, hint: '' },
  { id: 'divider', label: 'Divider', icon: Minus, hint: '' },
]

export function SlashMenu({
  position,
  onSelect,
  onClose,
}: {
  position: { top: number; left: number }
  onSelect: (id: string) => void
  onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <div
      ref={ref}
      className="fixed z-50 w-72 overflow-hidden rounded-lg border border-[rgba(55,53,47,0.09)] bg-white py-1 shadow-xl"
      style={{ top: position.top, left: position.left }}
    >
      <p className="px-3 py-1.5 text-xs font-medium text-[rgba(55,53,47,0.5)]">Basic blocks</p>
      {ITEMS.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelect(item.id)}
          className="flex w-full items-center gap-3 px-3 py-1.5 text-left text-sm hover:bg-[rgba(55,53,47,0.08)]"
        >
          <item.icon className="h-4 w-4 text-[rgba(55,53,47,0.55)]" />
          <span className="flex-1 text-[#37352f]">{item.label}</span>
          {item.hint && (
            <span className="text-xs text-[rgba(55,53,47,0.4)]">{item.hint}</span>
          )}
        </button>
      ))}
    </div>
  )
}
