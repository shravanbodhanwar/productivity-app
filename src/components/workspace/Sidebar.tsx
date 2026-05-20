'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Search,
  Home,
  Star,
  FileText,
  LayoutGrid,
  PanelLeftClose,
  PanelLeft,
  MessageCircle,
  Calendar,
  Clock,
} from 'lucide-react'
import { useWorkspace } from './WorkspaceProvider'
import { getPageTree } from '@/lib/workspace/store'
import type { WorkspacePage } from '@/lib/workspace/types'

function PageTreeItem({
  page,
  depth,
  pathname,
  onNavigate,
}: {
  page: WorkspacePage
  depth: number
  pathname: string
  onNavigate: (id: string) => void
}) {
  const { pages, addPage } = useWorkspace()
  const [expanded, setExpanded] = useState(true)
  const children = getPageTree(pages, page.id)
  const href = `/p/${page.id}`
  const active = pathname === href

  return (
    <div>
      <div
        className={`group flex items-center gap-0.5 rounded-md pr-1 text-sm transition-colors ${
          active ? 'bg-[rgba(55,53,47,0.12)] font-medium' : 'hover:bg-[rgba(55,53,47,0.08)]'
        }`}
        style={{ paddingLeft: `${8 + depth * 12}px` }}
      >
        {children.length > 0 ? (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="shrink-0 rounded p-0.5 text-[rgba(55,53,47,0.4)] hover:bg-[rgba(55,53,47,0.08)]"
          >
            {expanded ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </button>
        ) : (
          <span className="w-4 shrink-0" />
        )}
        <Link
          href={href}
          onClick={() => onNavigate(page.id)}
          className="flex min-w-0 flex-1 items-center gap-2 py-1 pr-1"
        >
          <span className="shrink-0 text-base leading-none">{page.icon}</span>
          <span className="truncate text-[#37352f]">{page.title}</span>
        </Link>
        <button
          type="button"
          onClick={() => addPage({ parentId: page.id })}
          className="shrink-0 rounded p-0.5 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-[rgba(55,53,47,0.1)]"
          title="Add sub-page"
        >
          <Plus className="h-3.5 w-3.5 text-[rgba(55,53,47,0.45)]" />
        </button>
      </div>
      {expanded &&
        children.map((child) => (
          <PageTreeItem
            key={child.id}
            page={child}
            depth={depth + 1}
            pathname={pathname}
            onNavigate={onNavigate}
          />
        ))}
    </div>
  )
}

export function Sidebar({ userEmail }: { userEmail?: string }) {
  const pathname = usePathname()
  const { pages, sidebarCollapsed, toggleSidebar, addPage, setActivePageId } = useWorkspace()
  const [search, setSearch] = useState('')
  const [newMenu, setNewMenu] = useState(false)

  const rootPages = getPageTree(pages, null)
  const favorites = pages.filter((p) => p.isFavorite)
  const filtered = search.trim()
    ? pages.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()))
    : null

  if (sidebarCollapsed) {
    return (
      <aside className="flex w-12 flex-col items-center border-r border-[rgba(55,53,47,0.09)] bg-[#f7f6f3] py-3">
        <button
          type="button"
          onClick={toggleSidebar}
          className="rounded p-2 hover:bg-[rgba(55,53,47,0.08)]"
          title="Expand sidebar"
        >
          <PanelLeft className="h-5 w-5 text-[rgba(55,53,47,0.55)]" />
        </button>
      </aside>
    )
  }

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-[rgba(55,53,47,0.09)] bg-[#f7f6f3]">
      <div className="flex items-center justify-between px-3 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold text-[#37352f]">
          <span className="flex h-6 w-6 items-center justify-center rounded bg-[#37352f] text-xs text-white">
            S
          </span>
          StudyFlow
        </Link>
        <button
          type="button"
          onClick={toggleSidebar}
          className="rounded p-1.5 hover:bg-[rgba(55,53,47,0.08)]"
          title="Collapse"
        >
          <PanelLeftClose className="h-4 w-4 text-[rgba(55,53,47,0.5)]" />
        </button>
      </div>

      <div className="px-2 pb-2">
        <div className="flex items-center gap-2 rounded-md bg-[rgba(55,53,47,0.06)] px-2 py-1.5">
          <Search className="h-3.5 w-3.5 shrink-0 text-[rgba(55,53,47,0.4)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pages…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-[rgba(55,53,47,0.4)]"
          />
        </div>
      </div>

      <nav className="sidebar-scroll flex-1 overflow-y-auto px-2 pb-4">
        <Link
          href="/"
          className={`mb-0.5 flex items-center gap-2 rounded-md px-2 py-1.5 text-sm ${
            pathname === '/' ? 'bg-[rgba(55,53,47,0.12)] font-medium' : 'hover:bg-[rgba(55,53,47,0.08)]'
          }`}
        >
          <Home className="h-4 w-4 text-[rgba(55,53,47,0.55)]" />
          Home
        </Link>

        {favorites.length > 0 && !filtered && (
          <div className="mt-3">
            <p className="mb-1 px-2 text-xs font-medium text-[rgba(55,53,47,0.45)]">Favorites</p>
            {favorites.map((p) => (
              <Link
                key={p.id}
                href={`/p/${p.id}`}
                onClick={() => setActivePageId(p.id)}
                className={`flex items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-[rgba(55,53,47,0.08)] ${
                  pathname === `/p/${p.id}` ? 'bg-[rgba(55,53,47,0.12)]' : ''
                }`}
              >
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span className="truncate">{p.title}</span>
              </Link>
            ))}
          </div>
        )}

        <div className="relative mt-3">
          <div className="mb-1 flex items-center justify-between px-2">
            <p className="text-xs font-medium text-[rgba(55,53,47,0.45)]">Pages</p>
            <button
              type="button"
              onClick={() => setNewMenu(!newMenu)}
              className="rounded p-0.5 hover:bg-[rgba(55,53,47,0.1)]"
            >
              <Plus className="h-3.5 w-3.5 text-[rgba(55,53,47,0.5)]" />
            </button>
          </div>
          {newMenu && (
            <div className="absolute right-2 top-6 z-30 w-40 rounded-lg border border-[rgba(55,53,47,0.09)] bg-white py-1 shadow-lg">
              <button
                type="button"
                onClick={() => {
                  const p = addPage({ type: 'page', icon: '📄' })
                  setNewMenu(false)
                  setActivePageId(p.id)
                }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-[rgba(55,53,47,0.08)]"
              >
                <FileText className="h-4 w-4" />
                New page
              </button>
              <button
                type="button"
                onClick={() => {
                  const p = addPage({ type: 'database', icon: '📊', title: 'Untitled database' })
                  setNewMenu(false)
                  setActivePageId(p.id)
                }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-[rgba(55,53,47,0.08)]"
              >
                <LayoutGrid className="h-4 w-4" />
                New database
              </button>
            </div>
          )}
        </div>

        {filtered ? (
          filtered.map((p) => (
            <Link
              key={p.id}
              href={`/p/${p.id}`}
              onClick={() => setActivePageId(p.id)}
              className="flex items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-[rgba(55,53,47,0.08)]"
            >
              <span>{p.icon}</span>
              <span className="truncate">{p.title}</span>
            </Link>
          ))
        ) : (
          rootPages.map((page) => (
            <PageTreeItem
              key={page.id}
              page={page}
              depth={0}
              pathname={pathname}
              onNavigate={setActivePageId}
            />
          ))
        )}

        <div className="mt-4 border-t border-[rgba(55,53,47,0.09)] pt-3">
          <p className="mb-1 px-2 text-xs font-medium text-[rgba(55,53,47,0.45)]">Tools</p>
          {[
            { href: '/chat', icon: MessageCircle, label: 'AI Assistant' },
            { href: '/calendar', icon: Calendar, label: 'Calendar' },
            { href: '/timer', icon: Clock, label: 'Timer' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-[rgba(55,53,47,0.08)] ${
                pathname === item.href ? 'bg-[rgba(55,53,47,0.12)] font-medium' : ''
              }`}
            >
              <item.icon className="h-4 w-4 text-[rgba(55,53,47,0.55)]" />
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      {userEmail && (
        <div className="border-t border-[rgba(55,53,47,0.09)] px-3 py-2.5">
          <p className="truncate text-xs text-[rgba(55,53,47,0.5)]">{userEmail}</p>
        </div>
      )}
    </aside>
  )
}
