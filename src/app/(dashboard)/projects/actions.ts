'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { ProjectColor, ProjectStatus } from '@/types'

// 현재 사용자의 기본 워크스페이스 가져오기 (없으면 생성)
async function getOrCreateWorkspace(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data: member } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', userId)
    .order('joined_at', { ascending: true })
    .limit(1)
    .single()

  if (member) return member.workspace_id

  // 워크스페이스 없으면 생성
  const { data: workspace } = await supabase
    .from('workspaces')
    .insert({ name: '내 워크스페이스', owner_id: userId })
    .select('id')
    .single()

  if (!workspace) return undefined

  // 생성한 워크스페이스에 owner로 멤버 추가
  await supabase
    .from('workspace_members')
    .insert({ workspace_id: workspace.id, user_id: userId, role: 'owner' })

  return workspace.id
}

export async function getProjects() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const workspaceId = await getOrCreateWorkspace(supabase, user.id)
  if (!workspaceId) return []

  const { data } = await supabase
    .from('projects')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })

  return data ?? []
}

export async function getProject(id: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()
  return data
}

export async function createProject(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요합니다.' }

  const workspaceId = await getOrCreateWorkspace(supabase, user.id)
  if (!workspaceId) return { error: '워크스페이스를 찾을 수 없습니다.' }

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const color = (formData.get('color') as ProjectColor) || 'blue'
  const start_date = formData.get('start_date') as string
  const end_date = formData.get('end_date') as string

  if (!name?.trim()) return { error: '프로젝트 이름을 입력해주세요.' }

  const { data, error } = await supabase
    .from('projects')
    .insert({
      workspace_id: workspaceId,
      name: name.trim(),
      description: description?.trim() || null,
      color,
      status: 'active',
      start_date: start_date || null,
      end_date: end_date || null,
      created_by: user.id,
    })
    .select('id')
    .single()

  if (error) return { error: error.message }

  revalidatePath('/projects')
  redirect(`/projects/${data.id}`)
}

export async function updateProject(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요합니다.' }

  // 소유권 확인: 프로젝트가 사용자의 워크스페이스 소속인지 검증
  const { data: proj } = await supabase.from('projects').select('workspace_id').eq('id', id).single()
  if (proj) {
    const { data: member } = await supabase
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', proj.workspace_id)
      .eq('user_id', user.id)
      .single()
    if (!member) return { error: '권한이 없습니다.' }
  }

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const color = formData.get('color') as ProjectColor
  const status = formData.get('status') as ProjectStatus
  const start_date = formData.get('start_date') as string
  const end_date = formData.get('end_date') as string

  const { error } = await supabase
    .from('projects')
    .update({
      name: name?.trim(),
      description: description?.trim() || null,
      color,
      status,
      start_date: start_date || null,
      end_date: end_date || null,
    })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath(`/projects/${id}`)
  revalidatePath('/projects')
  return { success: true }
}

export async function deleteProject(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요합니다.' }

  // 소유권 확인
  const { data: proj } = await supabase.from('projects').select('workspace_id').eq('id', id).single()
  if (proj) {
    const { data: member } = await supabase
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', proj.workspace_id)
      .eq('user_id', user.id)
      .single()
    if (!member) return { error: '권한이 없습니다.' }
  }

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/projects')
  redirect('/projects')
}
