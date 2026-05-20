'use client'

import { use } from 'react'
import { PageView } from '@/components/pages/PageView'
import { useWorkspace } from '@/components/workspace/WorkspaceProvider'
import { useEffect } from 'react'

export default function PageRoute({ params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = use(params)
  const { setActivePageId } = useWorkspace()

  useEffect(() => {
    setActivePageId(pageId)
  }, [pageId, setActivePageId])

  return <PageView pageId={pageId} />
}
