'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useWorkspace } from '@/components/workspace/WorkspaceProvider'

export default function ChecklistRedirect() {
  const router = useRouter()
  const { pages, setActivePageId } = useWorkspace()

  useEffect(() => {
    const tasksPage = pages.find((p) => p.title === 'Study Tasks' && p.type === 'database')
    if (tasksPage) {
      setActivePageId(tasksPage.id)
      router.replace(`/p/${tasksPage.id}`)
    } else {
      router.replace('/')
    }
  }, [pages, router, setActivePageId])

  return null
}
