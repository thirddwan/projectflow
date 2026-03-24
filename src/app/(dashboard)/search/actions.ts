'use server'

import { createClient } from '@/lib/supabase/server'

export async function globalSearch(query: string) {
  if (!query.trim()) return { projects: [], tasks: [] }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { projects: [], tasks: [] }

  const { data: membership } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', user.id)
    .order('joined_at', { ascending: true })
    .limit(1)
    .single()

  if (!membership) return { projects: [], tasks: [] }

  const q = `%${query.trim()}%`

  const [{ data: projects }, { data: tasks }] = await Promise.all([
    supabase
      .from('projects')
      .select('id, name, color, status')
      .eq('workspace_id', membership.workspace_id)
      .ilike('name', q)
      .limit(5),
    supabase
      .from('tasks')
      .select('id, title, status, priority, project:projects!inner(id, name, color, workspace_id)')
      .eq('projects.workspace_id', membership.workspace_id)
      .ilike('title', q)
      .limit(8),
  ])

  return { projects: projects ?? [], tasks: tasks ?? [] }
}
