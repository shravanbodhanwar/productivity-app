import type { WorkspaceState } from './types'

export async function loadWorkspaceFromCloud(
  userId: string
): Promise<WorkspaceState | null> {
  const { supabase } = await import('@/lib/supabase')
  if (!supabase) return null

  const { data, error } = await supabase
    .from('user_workspaces')
    .select('data, updated_at')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    console.error('Cloud load failed:', error.message)
    return null
  }

  if (!data?.data) return null
  const parsed = data.data as WorkspaceState
  if (!parsed.pages?.length) return null

  return {
    pages: parsed.pages,
    activity: parsed.activity ?? [],
    activePageId: parsed.activePageId ?? parsed.pages[0]?.id ?? null,
    sidebarCollapsed: parsed.sidebarCollapsed ?? false,
  }
}

export async function saveWorkspaceToCloud(
  userId: string,
  state: WorkspaceState
): Promise<{ ok: boolean; error?: string }> {
  const { supabase } = await import('@/lib/supabase')
  if (!supabase) return { ok: false, error: 'Supabase not configured' }

  const payload = {
    user_id: userId,
    data: {
      pages: state.pages,
      activity: state.activity,
      activePageId: state.activePageId,
      sidebarCollapsed: state.sidebarCollapsed,
    },
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase.from('user_workspaces').upsert(payload, {
    onConflict: 'user_id',
  })

  if (error) {
    console.error('Cloud save failed:', error.message)
    return { ok: false, error: error.message }
  }
  return { ok: true }
}
