'use server'

import { createClient } from '@/lib/supabase/server'

export async function getDashboardData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // 워크스페이스 조회
  const { data: membership } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', user.id)
    .order('joined_at', { ascending: true })
    .limit(1)
    .single()

  if (!membership) return null

  // 워크스페이스 내 프로젝트 ID 목록
  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, color, status')
    .eq('workspace_id', membership.workspace_id)

  const projectIds = projects?.map((p) => p.id) ?? []
  const activeProjectCount = projects?.filter((p) => p.status === 'active').length ?? 0

  if (projectIds.length === 0) {
    return {
      activeProjectCount: 0,
      tasksDueThisWeek: 0,
      overdueTaskCount: 0,
      recentTasks: [],
      user,
    }
  }

  const today = new Date().toISOString().split('T')[0]
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]

  // 병렬 쿼리
  const [
    { count: tasksDueThisWeek },
    { count: overdueTaskCount },
    { data: recentTasks },
  ] = await Promise.all([
    supabase
      .from('tasks')
      .select('id', { count: 'exact', head: true })
      .in('project_id', projectIds)
      .neq('status', 'done')
      .not('due_date', 'is', null)
      .gte('due_date', today)
      .lte('due_date', nextWeek),
    supabase
      .from('tasks')
      .select('id', { count: 'exact', head: true })
      .in('project_id', projectIds)
      .neq('status', 'done')
      .not('due_date', 'is', null)
      .lt('due_date', today),
    supabase
      .from('tasks')
      .select('id, title, status, priority, due_date, project:projects(id, name, color)')
      .in('project_id', projectIds)
      .neq('status', 'done')
      .order('created_at', { ascending: false })
      .limit(8),
  ])

  return {
    activeProjectCount,
    tasksDueThisWeek: tasksDueThisWeek ?? 0,
    overdueTaskCount: overdueTaskCount ?? 0,
    recentTasks: recentTasks ?? [],
    user,
  }
}
