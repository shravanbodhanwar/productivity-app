'use client'

import Link from 'next/link'
import {
  FileText,
  LayoutGrid,
  MessageCircle,
  Calendar,
  Clock,
  Bell,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import { useWorkspace } from '@/components/workspace/WorkspaceProvider'
import { formatDistanceToNow } from 'date-fns'

const QUICK_LINKS = [
  { href: '/chat', icon: MessageCircle, label: 'AI Assistant', desc: 'Study help & scheduling' },
  { href: '/calendar', icon: Calendar, label: 'Calendar', desc: 'Events & sessions' },
  { href: '/timer', icon: Clock, label: 'Focus Timer', desc: 'Pomodoro sessions' },
  { href: '/notifications', icon: Bell, label: 'Reminders', desc: 'Stay on track' },
]

export function HomeView() {
  const { pages, setActivePageId } = useWorkspace()
  const favorites = pages.filter((p) => p.isFavorite)
  const recent = [...pages]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 6)

  return (
    <div className="mx-auto max-w-4xl px-8 py-12">
      <div className="mb-10">
        <div className="mb-2 flex items-center gap-2 text-sm text-[rgba(55,53,47,0.5)]">
          <Sparkles className="h-4 w-4" />
          Workspace
        </div>
        <h1 className="text-3xl font-bold text-[#37352f]">Good to see you</h1>
        <p className="mt-2 text-[rgba(55,53,47,0.65)]">
          Pick up where you left off, or jump into a tool below.
        </p>
      </div>

      {favorites.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[rgba(55,53,47,0.45)]">
            Favorites
          </h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {favorites.map((page) => (
              <Link
                key={page.id}
                href={`/p/${page.id}`}
                onClick={() => setActivePageId(page.id)}
                className="group flex items-center gap-3 rounded-lg border border-[rgba(55,53,47,0.09)] p-4 transition-all hover:bg-[rgba(55,53,47,0.04)] hover:shadow-sm"
              >
                <span className="text-2xl">{page.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-[#37352f]">{page.title}</p>
                  <p className="text-xs text-[rgba(55,53,47,0.45)]">
                    {page.type === 'database' ? 'Database' : 'Document'} ·{' '}
                    {formatDistanceToNow(new Date(page.updatedAt), { addSuffix: true })}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-[rgba(55,53,47,0.25)] transition-transform group-hover:translate-x-0.5 group-hover:text-[rgba(55,53,47,0.5)]" />
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mb-10">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[rgba(55,53,47,0.45)]">
          Recent pages
        </h2>
        <div className="divide-y divide-[rgba(55,53,47,0.09)] rounded-lg border border-[rgba(55,53,47,0.09)]">
          {recent.map((page) => (
            <Link
              key={page.id}
              href={`/p/${page.id}`}
              onClick={() => setActivePageId(page.id)}
              className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[rgba(55,53,47,0.04)] first:rounded-t-lg last:rounded-b-lg"
            >
              <span className="text-lg">{page.icon}</span>
              <span className="flex-1 truncate text-sm font-medium">{page.title}</span>
              {page.type === 'database' ? (
                <LayoutGrid className="h-4 w-4 text-[rgba(55,53,47,0.35)]" />
              ) : (
                <FileText className="h-4 w-4 text-[rgba(55,53,47,0.35)]" />
              )}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[rgba(55,53,47,0.45)]">
          Tools
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {QUICK_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-start gap-3 rounded-lg border border-[rgba(55,53,47,0.09)] p-4 transition-all hover:border-[rgba(55,53,47,0.16)] hover:shadow-sm"
            >
              <div className="rounded-md bg-[rgba(55,53,47,0.06)] p-2">
                <item.icon className="h-5 w-5 text-[rgba(55,53,47,0.55)]" />
              </div>
              <div>
                <p className="font-medium text-[#37352f]">{item.label}</p>
                <p className="text-sm text-[rgba(55,53,47,0.55)]">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
