'use client'

import { usePathname } from 'next/navigation'
import { WorkspaceProvider } from './WorkspaceProvider'
import { Sidebar } from './Sidebar'
import { SyncBanner } from './SyncBanner'
import { LogOut } from 'lucide-react'

const WORKSPACE_ROUTES = ['/', '/p', '/chat', '/calendar', '/timer', '/notifications', '/notes', '/checklist']

function isWorkspaceRoute(path: string) {
  if (path === '/auth') return false
  return WORKSPACE_ROUTES.some((r) => path === r || path.startsWith('/p/'))
}

export function AppShell({
  children,
  userId,
  userEmail,
  onLogout,
}: {
  children: React.ReactNode
  userId?: string | null
  userEmail?: string
  onLogout?: () => void
}) {
  const pathname = usePathname()

  if (!isWorkspaceRoute(pathname)) {
    return <>{children}</>
  }

  return (
    <WorkspaceProvider userId={userId}>
      <div className="flex h-screen overflow-hidden bg-white">
        <Sidebar userEmail={userEmail} />
        <div className="flex min-w-0 flex-1 flex-col">
          <SyncBanner />
          {onLogout && (
            <header className="flex h-9 shrink-0 items-center justify-end gap-2 border-b border-[rgba(55,53,47,0.06)] px-4">
              <button
                type="button"
                onClick={onLogout}
                className="flex items-center gap-1.5 rounded px-2 py-1 text-xs text-[rgba(55,53,47,0.55)] hover:bg-[rgba(55,53,47,0.08)]"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </button>
            </header>
          )}
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </WorkspaceProvider>
  )
}
