'use client'

import { Cloud, CloudOff, Loader2, Check, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useWorkspace } from './WorkspaceProvider'

export function SyncBanner() {
  const { syncStatus, isCloudEnabled } = useWorkspace()

  if (syncStatus === 'loading') {
    return (
      <div className="flex items-center gap-2 border-b border-[rgba(55,53,47,0.06)] bg-[#f7f6f3] px-4 py-1.5 text-xs text-[rgba(55,53,47,0.55)]">
        <Loader2 className="h-3 w-3 animate-spin" />
        Loading your workspace…
      </div>
    )
  }

  if (!isCloudEnabled) {
    return (
      <div className="flex items-center justify-between gap-2 border-b border-amber-200/80 bg-amber-50 px-4 py-1.5 text-xs text-amber-900">
        <span className="flex items-center gap-2">
          <CloudOff className="h-3.5 w-3.5 shrink-0" />
          Saved on this device only. Sign in to store pages & tasks in the cloud when you deploy.
        </span>
        <Link href="/auth" className="shrink-0 font-medium underline hover:no-underline">
          Sign in
        </Link>
      </div>
    )
  }

  if (syncStatus === 'saving') {
    return (
      <div className="flex items-center gap-2 border-b border-[rgba(55,53,47,0.06)] bg-[#f7f6f3] px-4 py-1.5 text-xs text-[rgba(55,53,47,0.55)]">
        <Loader2 className="h-3 w-3 animate-spin" />
        Saving to cloud…
      </div>
    )
  }

  if (syncStatus === 'error') {
    return (
      <div className="flex items-center gap-2 border-b border-red-200 bg-red-50 px-4 py-1.5 text-xs text-red-800">
        <AlertCircle className="h-3.5 w-3.5" />
        Cloud save failed. Check Supabase setup (run workspace_migration.sql). Data is still on this device.
      </div>
    )
  }

  if (syncStatus === 'saved') {
    return (
      <div className="flex items-center gap-2 border-b border-[rgba(55,53,47,0.06)] bg-[#f7f6f3] px-4 py-1.5 text-xs text-[rgba(55,53,47,0.55)]">
        <Check className="h-3 w-3 text-green-600" />
        <Cloud className="h-3 w-3" />
        Synced to cloud — your data loads on any device when you sign in.
      </div>
    )
  }

  return null
}
