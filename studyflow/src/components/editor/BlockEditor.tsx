'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Highlight from '@tiptap/extension-highlight'
import { useEffect, useCallback, useState } from 'react'
import { EditorToolbar } from './EditorToolbar'
import { SlashMenu } from './SlashMenu'

interface BlockEditorProps {
  content: string
  onChange: (json: string) => void
  placeholder?: string
}

function parseContent(raw: string) {
  if (!raw) return undefined
  try {
    return JSON.parse(raw)
  } catch {
    return {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: raw }] }],
    }
  }
}

export function BlockEditor({ content, onChange, placeholder = "Type '/' for commands…" }: BlockEditorProps) {
  const [slashOpen, setSlashOpen] = useState(false)
  const [slashPos, setSlashPos] = useState({ top: 0, left: 0 })

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Placeholder.configure({ placeholder }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Underline,
      Link.configure({ openOnClick: false }),
      Highlight,
    ],
    content: parseContent(content),
    editorProps: {
      attributes: { class: 'outline-none' },
      handleKeyDown: (view, event) => {
        if (event.key === '/') {
          const coords = view.coordsAtPos(view.state.selection.from)
          setSlashPos({ top: coords.bottom + 8, left: coords.left })
          setSlashOpen(true)
        }
        if (event.key === 'Escape') setSlashOpen(false)
        return false
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(JSON.stringify(ed.getJSON()))
    },
  })

  useEffect(() => {
    if (!editor) return
    const parsed = parseContent(content)
    const current = JSON.stringify(editor.getJSON())
    const incoming = JSON.stringify(parsed)
    if (incoming !== current) {
      editor.commands.setContent(parsed ?? '', { emitUpdate: false })
    }
  }, [content, editor])

  const runSlash = useCallback(
    (action: string) => {
      if (!editor) return
      setSlashOpen(false)
      const chain = editor.chain().focus()
      switch (action) {
        case 'h1':
          chain.toggleHeading({ level: 1 }).run()
          break
        case 'h2':
          chain.toggleHeading({ level: 2 }).run()
          break
        case 'h3':
          chain.toggleHeading({ level: 3 }).run()
          break
        case 'bullet':
          chain.toggleBulletList().run()
          break
        case 'numbered':
          chain.toggleOrderedList().run()
          break
        case 'todo':
          chain.toggleTaskList().run()
          break
        case 'quote':
          chain.toggleBlockquote().run()
          break
        case 'code':
          chain.toggleCodeBlock().run()
          break
        case 'divider':
          chain.setHorizontalRule().run()
          break
        default:
          break
      }
      // Remove trailing slash character if present
      const { from } = editor.state.selection
      const charBefore = editor.state.doc.textBetween(Math.max(0, from - 1), from)
      if (charBefore === '/') {
        editor.commands.deleteRange({ from: from - 1, to: from })
      }
    },
    [editor]
  )

  if (!editor) return null

  return (
    <div className="notion-editor relative">
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
      {slashOpen && (
        <SlashMenu
          position={slashPos}
          onSelect={runSlash}
          onClose={() => setSlashOpen(false)}
        />
      )}
    </div>
  )
}
