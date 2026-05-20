export type PageType = 'page' | 'database'

export type TaskStatus = 'todo' | 'in_progress' | 'done'

export interface TaskRow {
  id: string
  title: string
  notes: string
  status: TaskStatus
  priority: 'low' | 'medium' | 'high'
  dueDate?: string
}

export interface ActivityEntry {
  id: string
  pageId: string
  taskId?: string
  action: 'created' | 'updated' | 'deleted' | 'moved' | 'noted'
  detail: string
  createdAt: string
}

export interface WorkspacePage {
  id: string
  parentId: string | null
  title: string
  icon: string
  type: PageType
  content: string
  cover?: string
  tasks?: TaskRow[]
  createdAt: string
  updatedAt: string
  isFavorite?: boolean
}

export interface WorkspaceState {
  pages: WorkspacePage[]
  activity: ActivityEntry[]
  activePageId: string | null
  sidebarCollapsed: boolean
}

export type SyncStatus = 'idle' | 'loading' | 'saving' | 'saved' | 'error' | 'local-only'
