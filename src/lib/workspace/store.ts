import type { WorkspacePage, WorkspaceState, TaskRow, ActivityEntry } from './types'

const STORAGE_KEY = 'studyflow-workspace-v3'

export function createId(): string {
  return crypto.randomUUID()
}

function defaultPages(): WorkspacePage[] {
  const homeId = createId()
  const tasksId = createId()
  const notesId = createId()
  const now = new Date().toISOString()

  return [
    {
      id: homeId,
      parentId: null,
      title: 'Home',
      icon: '🏠',
      type: 'page',
      content: JSON.stringify({
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 1 },
            content: [{ type: 'text', text: 'Welcome to StudyFlow' }],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Your all-in-one study workspace — notes, tasks, calendar, and AI in one place.',
              },
            ],
          },
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: 'Quick start' }],
          },
          {
            type: 'taskList',
            content: [
              {
                type: 'taskItem',
                attrs: { checked: false },
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Create a new page from the sidebar' }],
                  },
                ],
              },
              {
                type: 'taskItem',
                attrs: { checked: false },
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Open Study Tasks to track your topics' }],
                  },
                ],
              },
              {
                type: 'taskItem',
                attrs: { checked: false },
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Use / for slash commands in any document' }],
                  },
                ],
              },
            ],
          },
        ],
      }),
      createdAt: now,
      updatedAt: now,
      isFavorite: true,
    },
    {
      id: tasksId,
      parentId: null,
      title: 'Study Tasks',
      icon: '✅',
      type: 'database',
      content: '',
      tasks: [
        {
          id: createId(),
          title: 'Review lecture notes',
          notes: '',
          status: 'todo',
          priority: 'high',
        },
        {
          id: createId(),
          title: 'Practice problem set',
          notes: '',
          status: 'in_progress',
          priority: 'medium',
        },
        {
          id: createId(),
          title: 'Read chapter 4',
          notes: '',
          status: 'done',
          priority: 'low',
        },
      ],
      createdAt: now,
      updatedAt: now,
      isFavorite: true,
    },
    {
      id: notesId,
      parentId: null,
      title: 'Quick Notes',
      icon: '📝',
      type: 'page',
      content: JSON.stringify({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Capture ideas here — headings, lists, and checkboxes all work.' }],
          },
        ],
      }),
      createdAt: now,
      updatedAt: now,
    },
  ]
}

function normalizeState(parsed: WorkspaceState): WorkspaceState {
  const pages = parsed.pages.map((p) => ({
    ...p,
    tasks: p.tasks?.map((t) => ({ ...t, notes: t.notes ?? '' })),
  }))
  return {
    pages,
    activity: parsed.activity ?? [],
    activePageId: parsed.activePageId ?? pages[0]?.id ?? null,
    sidebarCollapsed: parsed.sidebarCollapsed ?? false,
  }
}

function emptyState(): WorkspaceState {
  const pages = defaultPages()
  return { pages, activity: [], activePageId: pages[0].id, sidebarCollapsed: false }
}

export function loadWorkspace(): WorkspaceState {
  if (typeof window === 'undefined') return emptyState()

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const legacy = localStorage.getItem('studyflow-workspace-v2')
      if (legacy) {
        const migrated = normalizeState(JSON.parse(legacy) as WorkspaceState)
        saveWorkspace(migrated)
        return migrated
      }
      return emptyState()
    }
    const parsed = JSON.parse(raw) as WorkspaceState
    if (!parsed.pages?.length) return emptyState()
    return normalizeState(parsed)
  } catch {
    return emptyState()
  }
}

export function logActivity(
  activity: ActivityEntry[],
  entry: Omit<ActivityEntry, 'id' | 'createdAt'>
): ActivityEntry[] {
  const item: ActivityEntry = {
    ...entry,
    id: createId(),
    createdAt: new Date().toISOString(),
  }
  return [item, ...activity].slice(0, 200)
}

export function saveWorkspace(state: WorkspaceState): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function getPageTree(pages: WorkspacePage[], parentId: string | null = null): WorkspacePage[] {
  return pages
    .filter((p) => p.parentId === parentId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
}

export function createPage(
  pages: WorkspacePage[],
  opts: Partial<Pick<WorkspacePage, 'parentId' | 'title' | 'icon' | 'type'>>
): WorkspacePage {
  const now = new Date().toISOString()
  const type = opts.type ?? 'page'
  return {
    id: createId(),
    parentId: opts.parentId ?? null,
    title: opts.title ?? (type === 'database' ? 'Untitled database' : 'Untitled'),
    icon: opts.icon ?? (type === 'database' ? '📊' : '📄'),
    type,
    content:
      type === 'page'
        ? JSON.stringify({ type: 'doc', content: [{ type: 'paragraph' }] })
        : '',
    tasks: type === 'database' ? [] : undefined,
    createdAt: now,
    updatedAt: now,
  }
}

export function createTask(): TaskRow {
  return {
    id: createId(),
    title: '',
    notes: '',
    status: 'todo',
    priority: 'medium',
  }
}
