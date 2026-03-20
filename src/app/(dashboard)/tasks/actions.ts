'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { TaskPriority, TaskStatus } from '@/types'

export async function getTasksByProject(projectId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('tasks')
    .select(`
      *,
      assignee:users!tasks_assignee_id_fkey(id, name, avatar_url),
      checklists(*)
    `)
    .eq('project_id', projectId)
    .order('order', { ascending: true })
  return data ?? []
}

export async function getTask(id: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('tasks')
    .select(`
      *,
      assignee:users!tasks_assignee_id_fkey(id, name, avatar_url),
      checklists(*),
      comments(*, user:users!comments_user_id_fkey(id, name, avatar_url))
    `)
    .eq('id', id)
    .single()
  return data
}

export async function getAllTasks() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('tasks')
    .select(`
      *,
      project:projects(id, name, color),
      assignee:users!tasks_assignee_id_fkey(id, name, avatar_url)
    `)
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function createTask(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요합니다.' }

  const projectId = formData.get('project_id') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const priority = (formData.get('priority') as TaskPriority) || 'normal'
  const status = (formData.get('status') as TaskStatus) || 'backlog'
  const due_date = formData.get('due_date') as string

  if (!title?.trim()) return { error: '제목을 입력해주세요.' }

  // 현재 project의 max order 가져오기
  const { data: maxOrder } = await supabase
    .from('tasks')
    .select('order')
    .eq('project_id', projectId)
    .eq('status', status)
    .order('order', { ascending: false })
    .limit(1)
    .single()

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      project_id: projectId,
      title: title.trim(),
      description: description?.trim() || null,
      priority,
      status,
      due_date: due_date || null,
      order: (maxOrder?.order ?? -1) + 1,
      created_by: user.id,
    })
    .select('id')
    .single()

  if (error) return { error: error.message }

  revalidatePath(`/projects/${projectId}`)
  revalidatePath(`/projects/${projectId}/kanban`)
  redirect(`/tasks/${data.id}`)
}

export async function updateTask(id: string, formData: FormData) {
  const supabase = await createClient()

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const priority = formData.get('priority') as TaskPriority
  const status = formData.get('status') as TaskStatus
  const due_date = formData.get('due_date') as string
  const assignee_id = formData.get('assignee_id') as string

  const { data: task, error } = await supabase
    .from('tasks')
    .update({
      title: title?.trim(),
      description: description?.trim() || null,
      priority,
      status,
      due_date: due_date || null,
      assignee_id: assignee_id || null,
    })
    .eq('id', id)
    .select('project_id')
    .single()

  if (error) return { error: error.message }

  revalidatePath(`/tasks/${id}`)
  revalidatePath(`/projects/${task.project_id}`)
  revalidatePath(`/projects/${task.project_id}/kanban`)
  return { success: true }
}

export async function updateTaskStatus(id: string, status: TaskStatus, order: number) {
  const supabase = await createClient()

  const { data: task, error } = await supabase
    .from('tasks')
    .update({ status, order })
    .eq('id', id)
    .select('project_id')
    .single()

  if (error) return { error: error.message }

  revalidatePath(`/projects/${task.project_id}/kanban`)
  return { success: true }
}

export async function deleteTask(id: string, projectId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath(`/projects/${projectId}`)
  revalidatePath(`/projects/${projectId}/kanban`)
  redirect(`/projects/${projectId}`)
}

// ---- Checklist actions ----
export async function createChecklist(taskId: string, title: string) {
  const supabase = await createClient()

  const { data: maxOrder } = await supabase
    .from('checklists')
    .select('order')
    .eq('task_id', taskId)
    .order('order', { ascending: false })
    .limit(1)
    .single()

  const { error } = await supabase
    .from('checklists')
    .insert({ task_id: taskId, title, order: (maxOrder?.order ?? -1) + 1 })

  if (error) return { error: error.message }
  revalidatePath(`/tasks/${taskId}`)
  return { success: true }
}

export async function toggleChecklist(id: string, taskId: string, isCompleted: boolean) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('checklists')
    .update({ is_completed: isCompleted })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath(`/tasks/${taskId}`)
  return { success: true }
}

export async function deleteChecklist(id: string, taskId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('checklists')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath(`/tasks/${taskId}`)
  return { success: true }
}

// ---- Comment actions ----
export async function createComment(taskId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요합니다.' }

  const { error } = await supabase
    .from('comments')
    .insert({ task_id: taskId, user_id: user.id, content })

  if (error) return { error: error.message }
  revalidatePath(`/tasks/${taskId}`)
  return { success: true }
}

export async function deleteComment(id: string, taskId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath(`/tasks/${taskId}`)
  return { success: true }
}
