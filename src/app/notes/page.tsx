'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useWorkspace } from '@/components/workspace/WorkspaceProvider'

export default function NotesRedirect() {
  const router = useRouter()
  const { pages, setActivePageId } = useWorkspace()

  useEffect(() => {
    const notesPage = pages.find((p) => p.title === 'Quick Notes') ?? pages.find((p) => p.type === 'page')
    if (notesPage) {
      setActivePageId(notesPage.id)
      router.replace(`/p/${notesPage.id}`)
    } else {
      router.replace('/')
    }
  }, [pages, router, setActivePageId])

  return null
}
