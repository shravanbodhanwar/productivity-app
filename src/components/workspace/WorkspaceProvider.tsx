'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { WorkspacePage, WorkspaceState, TaskRow, ActivityEntry, SyncStatus } from '@/lib/workspace/types'
import {
  loadWorkspace,
  saveWorkspace,
  createPage as makePage,
  createTask,
  logActivity,
} from '@/lib/workspace/store'
import { loadWorkspaceFromCloud, saveWorkspaceToCloud } from '@/lib/workspace/sync'

interface WorkspaceContextValue {
  pages: WorkspacePage[]
  activity: ActivityEntry[]
  activePageId: string | null
  activePage: WorkspacePage | undefined
  sidebarCollapsed: boolean
  syncStatus: SyncStatus
  isCloudEnabled: boolean
  setActivePageId: (id: string | null) => void
  toggleSidebar: () => void
  addPage: (opts?: Parameters<typeof makePage>[1]) => WorkspacePage
  updatePage: (id: string, patch: Partial<WorkspacePage>) => void
  deletePage: (id: string) => void
  addTask: (pageId: string) => void
  updateTask: (pageId: string, taskId: string, patch: Partial<TaskRow>) => void
  deleteTask: (pageId: string, taskId: string) => void
  getPageActivity: (pageId: string) => ActivityEntry[]
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null)

const SAVE_DEBOUNCE_MS = 800

export function WorkspaceProvider({
  children,
  userId,
}: {
  children: ReactNode
  userId?: string | null
}) {
  const [state, setState] = useState<WorkspaceState | null>(null)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('loading')
  const [isCloudEnabled, setIsCloudEnabled] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hydrated = useRef(false)

  useEffect(() => {
    let cancelled = false

    async function init() {
      setSyncStatus('loading')
      const local = loadWorkspace()

      if (userId) {
        setIsCloudEnabled(true)
        const cloud = await loadWorkspaceFromCloud(userId)
        if (cancelled) return

        if (cloud) {
          setState(cloud)
          saveWorkspace(cloud)
          setSyncStatus('saved')
        } else {
          setState(local)
          setSyncStatus('saving')
          const result = await saveWorkspaceToCloud(userId, local)
          if (!cancelled) setSyncStatus(result.ok ? 'saved' : 'error')
        }
      } else {
        setIsCloudEnabled(false)
        setState(local)
        setSyncStatus('local-only')
      }
      hydrated.current = true
    }

    init()
    return () => {
      cancelled = true
    }
  }, [userId])

  const persist = useCallback(
    (next: WorkspaceState) => {
      saveWorkspace(next)
      if (!userId || !hydrated.current) return

      if (saveTimer.current) clearTimeout(saveTimer.current)
      setSyncStatus('saving')
      saveTimer.current = setTimeout(async () => {
        const result = await saveWorkspaceToCloud(userId, next)
        setSyncStatus(result.ok ? 'saved' : 'error')
      }, SAVE_DEBOUNCE_MS)
    },
    [userId]
  )

  useEffect(() => {
    if (state && hydrated.current) persist(state)
  }, [state, persist])

  const pushActivity = useCallback(
    (entry: Omit<ActivityEntry, 'id' | 'createdAt'>) => {
      setState((s) => (s ? { ...s, activity: logActivity(s.activity, entry) } : s))
    },
    []
  )

  const setActivePageId = useCallback((id: string | null) => {
    setState((s) => (s ? { ...s, activePageId: id } : s))
  }, [])

  const toggleSidebar = useCallback(() => {
    setState((s) => (s ? { ...s, sidebarCollapsed: !s.sidebarCollapsed } : s))
  }, [])

  const addPage = useCallback(
    (opts?: Parameters<typeof makePage>[1]) => {
      const page = makePage(state?.pages ?? [], opts ?? {})
      setState((s) =>
        s
          ? { ...s, pages: [...s.pages, page], activePageId: page.id }
          : { pages: [page], activity: [], activePageId: page.id, sidebarCollapsed: false }
      )
      pushActivity({
        pageId: page.id,
        action: 'created',
        detail: `Created ${page.type === 'database' ? 'database' : 'page'} "${page.title}"`,
      })
      return page
    },
    [state?.pages, pushActivity]
  )

  const updatePage = useCallback(
    (id: string, patch: Partial<WorkspacePage>) => {
      setState((s) => {
        if (!s) return s
        return {
          ...s,
          pages: s.pages.map((p) =>
            p.id === id ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p
          ),
        }
      })
      if (patch.title) {
        pushActivity({ pageId: id, action: 'updated', detail: `Renamed page to "${patch.title}"` })
      }
    },
    [pushActivity]
  )

  const deletePage = useCallback(
    (id: string) => {
      const title = state?.pages.find((p) => p.id === id)?.title ?? 'Page'
      setState((s) => {
        if (!s) return s
        const removeIds = new Set<string>()
        const collect = (pid: string) => {
          removeIds.add(pid)
          s.pages.filter((p) => p.parentId === pid).forEach((c) => collect(c.id))
        }
        collect(id)
        const pages = s.pages.filter((p) => !removeIds.has(p.id))
        const activePageId =
          s.activePageId && removeIds.has(s.activePageId) ? pages[0]?.id ?? null : s.activePageId
        return { ...s, pages, activePageId }
      })
      pushActivity({ pageId: id, action: 'deleted', detail: `Deleted page "${title}"` })
    },
    [state?.pages, pushActivity]
  )

  const addTask = useCallback(
    (pageId: string) => {
      const task = createTask()
      setState((s) => {
        if (!s) return s
        return {
          ...s,
          pages: s.pages.map((p) =>
            p.id === pageId
              ? { ...p, tasks: [...(p.tasks ?? []), task], updatedAt: new Date().toISOString() }
              : p
          ),
        }
      })
      pushActivity({
        pageId,
        taskId: task.id,
        action: 'created',
        detail: 'Added a new task',
      })
    },
    [pushActivity]
  )

  const updateTask = useCallback(
    (pageId: string, taskId: string, patch: Partial<TaskRow>) => {
      const prev = state?.pages
        .find((p) => p.id === pageId)
        ?.tasks?.find((t) => t.id === taskId)

      setState((s) => {
        if (!s) return s
        return {
          ...s,
          pages: s.pages.map((p) =>
            p.id === pageId
              ? {
                  ...p,
                  tasks: (p.tasks ?? []).map((t) => (t.id === taskId ? { ...t, ...patch } : t)),
                  updatedAt: new Date().toISOString(),
                }
              : p
          ),
        }
      })

      if (patch.notes !== undefined && patch.notes !== prev?.notes) {
        pushActivity({
          pageId,
          taskId,
          action: 'noted',
          detail: patch.notes ? 'Updated task notes' : 'Cleared task notes',
        })
      } else if (patch.title && patch.title !== prev?.title) {
        pushActivity({
          pageId,
          taskId,
          action: 'updated',
          detail: `Renamed task to "${patch.title}"`,
        })
      } else if (patch.status && patch.status !== prev?.status) {
        pushActivity({
          pageId,
          taskId,
          action: 'moved',
          detail: `Moved task to ${patch.status.replace('_', ' ')}`,
        })
      } else if (patch.priority && patch.priority !== prev?.priority) {
        pushActivity({
          pageId,
          taskId,
          action: 'updated',
          detail: `Set priority to ${patch.priority}`,
        })
      }
    },
    [state?.pages, pushActivity]
  )

  const deleteTask = useCallback(
    (pageId: string, taskId: string) => {
      const title =
        state?.pages.find((p) => p.id === pageId)?.tasks?.find((t) => t.id === taskId)?.title ||
        'Task'
      setState((s) => {
        if (!s) return s
        return {
          ...s,
          pages: s.pages.map((p) =>
            p.id === pageId
              ? {
                  ...p,
                  tasks: (p.tasks ?? []).filter((t) => t.id !== taskId),
                  updatedAt: new Date().toISOString(),
                }
              : p
          ),
        }
      })
      pushActivity({
        pageId,
        taskId,
        action: 'deleted',
        detail: `Deleted task "${title || 'Untitled'}"`,
      })
    },
    [state?.pages, pushActivity]
  )

  const getPageActivity = useCallback(
    (pageId: string) => {
      if (!state) return []
      return state.activity.filter((a) => a.pageId === pageId)
    },
    [state]
  )

  const value = useMemo<WorkspaceContextValue | null>(() => {
    if (!state) return null
    const activePage = state.pages.find((p) => p.id === state.activePageId)
    return {
      pages: state.pages,
      activity: state.activity,
      activePageId: state.activePageId,
      activePage,
      sidebarCollapsed: state.sidebarCollapsed,
      syncStatus,
      isCloudEnabled,
      setActivePageId,
      toggleSidebar,
      addPage,
      updatePage,
      deletePage,
      addTask,
      updateTask,
      deleteTask,
      getPageActivity,
    }
  }, [
    state,
    syncStatus,
    isCloudEnabled,
    setActivePageId,
    toggleSidebar,
    addPage,
    updatePage,
    deletePage,
    addTask,
    updateTask,
    deleteTask,
    getPageActivity,
  ])

  if (!value) {
    return (
      <div className="flex h-screen items-center justify-center text-[rgba(55,53,47,0.5)]">
        Loading workspace…
      </div>
    )
  }

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext)
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider')
  return ctx
}
