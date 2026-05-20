'use client'

import type { ReactNode } from 'react'

export function ToolPage({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <div className="mx-auto max-w-3xl px-8 py-10">
      <h1 className="text-2xl font-bold text-[#37352f]">{title}</h1>
      {description && (
        <p className="mt-1 text-sm text-[rgba(55,53,47,0.55)]">{description}</p>
      )}
      <div className="mt-8">{children}</div>
    </div>
  )
}
