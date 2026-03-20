'use client'

import { useState, useTransition } from 'react'
import { Trash2, Calendar, Flag, CheckSquare, MessageSquare, Pencil } from 'lucide-react'
import {
  updateTask,
  deleteTask,
  createChecklist,
  toggleChecklist,
  deleteChecklist,
  createComment,
  deleteComment,
} from '@/app/(dashboard)/tasks/actions'

const PRIORITY_LABEL: Record<string, string> = {
  urgent: '긴급', high: '높음', normal: '보통', low: '낮음',
}
const PRIORITY_COLOR: Record<string, string> = {
  urgent: 'hsl(4 72% 51%)',
  high:   'hsl(43 100% 48%)',
  normal: 'hsl(var(--accent))',
  low:    'hsl(var(--text-muted))',
}
const STATUS_LABEL: Record<string, string> = {
  backlog: '백로그', todo: '할 일', in_progress: '진행 중', review: '검토', done: '완료',
}
const STATUSES = ['backlog', 'todo', 'in_progress', 'review', 'done'] as const
const PRIORITIES = ['urgent', 'high', 'normal', 'low'] as const

interface TaskDetailClientProps {
  task: {
    id: string
    project_id: string
    title: string
    description?: string | null
    priority: string
    status: string
    due_date?: string | null
    assignee?: { id: string; name: string } | null
    checklists?: { id: string; title: string; is_completed: boolean; order: number }[]
    comments?: { id: string; content: string; user_id: string; created_at: string; user?: { id: string; name: string } | null }[]
  }
}

export function TaskDetailClient({ task }: TaskDetailClientProps) {
  const [isPending, startTransition] = useTransition()
  const [isEditing, setIsEditing] = useState(false)
  const [checklistInput, setChecklistInput] = useState('')
  const [commentInput, setCommentInput] = useState('')

  // 상태/우선순위 빠른 변경
  function handleFieldChange(field: string, value: string) {
    const formData = new FormData()
    formData.set('title', task.title)
    formData.set('description', task.description ?? '')
    formData.set('priority', task.priority)
    formData.set('status', task.status)
    formData.set(field, value)
    startTransition(async () => { await updateTask(task.id, formData) })
  }

  // 체크리스트 추가
  function handleAddChecklist(e: React.FormEvent) {
    e.preventDefault()
    if (!checklistInput.trim()) return
    startTransition(async () => { await createChecklist(task.id, checklistInput.trim()) })
    setChecklistInput('')
  }

  // 코멘트 추가
  function handleAddComment(e: React.FormEvent) {
    e.preventDefault()
    if (!commentInput.trim()) return
    startTransition(async () => { await createComment(task.id, commentInput.trim()) })
    setCommentInput('')
  }

  // 삭제
  function handleDelete() {
    if (!confirm(`"${task.title}" Task를 삭제하시겠습니까?`)) return
    startTransition(async () => { await deleteTask(task.id, task.project_id) })
  }

  const checklistDone = task.checklists?.filter((c) => c.is_completed).length ?? 0
  const checklistTotal = task.checklists?.length ?? 0

  return (
    <div className="space-y-6">
      {/* 제목 + 액션 */}
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h1
            className="text-2xl font-bold"
            style={{ color: 'hsl(var(--text-primary))' }}
          >
            {task.title}
          </h1>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm"
            style={{ border: '1px solid hsl(var(--border))', color: 'hsl(var(--text-secondary))' }}
          >
            <Pencil size={14} />
            수정
          </button>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors hover:bg-red-50 dark:hover:bg-red-950"
            style={{ border: '1px solid hsl(var(--border))', color: 'hsl(var(--danger))' }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 메인 컨텐츠 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 수정 폼 */}
          {isEditing && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const fd = new FormData(e.currentTarget)
                startTransition(() => updateTask(task.id, fd).then(() => setIsEditing(false)))
              }}
              className="notion-card space-y-4"
            >
              <input
                name="title"
                defaultValue={task.title}
                required
                placeholder="제목"
                className="w-full text-lg font-semibold bg-transparent outline-none"
                style={{ color: 'hsl(var(--text-primary))' }}
              />
              <textarea
                name="description"
                defaultValue={task.description ?? ''}
                rows={4}
                placeholder="설명을 입력하세요..."
                className="w-full text-sm bg-transparent outline-none resize-none"
                style={{ color: 'hsl(var(--text-secondary))' }}
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-3 py-1.5 rounded-md text-sm text-white"
                  style={{ backgroundColor: 'hsl(var(--accent))' }}
                >
                  저장
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 rounded-md text-sm"
                  style={{ border: '1px solid hsl(var(--border))', color: 'hsl(var(--text-secondary))' }}
                >
                  취소
                </button>
              </div>
            </form>
          )}

          {/* 설명 */}
          {!isEditing && task.description && (
            <div className="notion-card">
              <p className="text-sm whitespace-pre-wrap" style={{ color: 'hsl(var(--text-secondary))' }}>
                {task.description}
              </p>
            </div>
          )}

          {/* 체크리스트 */}
          <div className="notion-card space-y-3">
            <div className="flex items-center justify-between">
              <h3
                className="font-semibold flex items-center gap-2"
                style={{ color: 'hsl(var(--text-primary))' }}
              >
                <CheckSquare size={16} style={{ color: 'hsl(var(--accent))' }} />
                체크리스트
                {checklistTotal > 0 && (
                  <span className="text-xs font-normal" style={{ color: 'hsl(var(--text-muted))' }}>
                    {checklistDone}/{checklistTotal}
                  </span>
                )}
              </h3>
            </div>

            {/* 진행 바 */}
            {checklistTotal > 0 && (
              <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'hsl(var(--border))' }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.round((checklistDone / checklistTotal) * 100)}%`,
                    backgroundColor: 'hsl(var(--accent))',
                  }}
                />
              </div>
            )}

            {/* 체크리스트 항목 */}
            <div className="space-y-1">
              {task.checklists?.sort((a, b) => a.order - b.order).map((item) => (
                <div key={item.id} className="flex items-center gap-2 group">
                  <input
                    type="checkbox"
                    checked={item.is_completed}
                    onChange={(e) => {
                      startTransition(async () => { await toggleChecklist(item.id, task.id, e.target.checked) })
                    }}
                    className="rounded"
                  />
                  <span
                    className="flex-1 text-sm"
                    style={{
                      color: item.is_completed ? 'hsl(var(--text-muted))' : 'hsl(var(--text-primary))',
                      textDecoration: item.is_completed ? 'line-through' : 'none',
                    }}
                  >
                    {item.title}
                  </span>
                  <button
                    onClick={() => startTransition(async () => { await deleteChecklist(item.id, task.id) })}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: 'hsl(var(--text-muted))' }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>

            {/* 체크리스트 추가 */}
            <form onSubmit={handleAddChecklist} className="flex gap-2">
              <input
                value={checklistInput}
                onChange={(e) => setChecklistInput(e.target.value)}
                placeholder="항목 추가..."
                className="flex-1 px-2 py-1.5 rounded text-sm outline-none"
                style={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  color: 'hsl(var(--text-primary))',
                }}
              />
              <button
                type="submit"
                disabled={isPending || !checklistInput.trim()}
                className="px-3 py-1.5 rounded text-sm text-white disabled:opacity-50"
                style={{ backgroundColor: 'hsl(var(--accent))' }}
              >
                추가
              </button>
            </form>
          </div>

          {/* 코멘트 */}
          <div className="notion-card space-y-4">
            <h3
              className="font-semibold flex items-center gap-2"
              style={{ color: 'hsl(var(--text-primary))' }}
            >
              <MessageSquare size={16} style={{ color: 'hsl(var(--accent))' }} />
              코멘트 {task.comments?.length ? `(${task.comments.length})` : ''}
            </h3>

            {/* 코멘트 목록 */}
            <div className="space-y-3">
              {task.comments?.map((comment) => (
                <div key={comment.id} className="flex gap-3 group">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ backgroundColor: 'hsl(var(--accent))' }}
                  >
                    {comment.user?.name?.charAt(0).toUpperCase() ?? '?'}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium" style={{ color: 'hsl(var(--text-primary))' }}>
                        {comment.user?.name ?? '알 수 없음'}
                      </span>
                      <span className="text-xs" style={{ color: 'hsl(var(--text-muted))' }}>
                        {new Date(comment.created_at).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap" style={{ color: 'hsl(var(--text-secondary))' }}>
                      {comment.content}
                    </p>
                  </div>
                  <button
                    onClick={() => startTransition(async () => { await deleteComment(comment.id, task.id) })}
                    className="opacity-0 group-hover:opacity-100 transition-opacity self-start mt-1"
                    style={{ color: 'hsl(var(--text-muted))' }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>

            {/* 코멘트 입력 */}
            <form onSubmit={handleAddComment} className="space-y-2">
              <textarea
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="코멘트를 입력하세요..."
                rows={3}
                className="w-full px-3 py-2 rounded-md text-sm outline-none resize-none"
                style={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  color: 'hsl(var(--text-primary))',
                }}
              />
              <button
                type="submit"
                disabled={isPending || !commentInput.trim()}
                className="px-3 py-1.5 rounded-md text-sm text-white disabled:opacity-50"
                style={{ backgroundColor: 'hsl(var(--accent))' }}
              >
                코멘트 달기
              </button>
            </form>
          </div>
        </div>

        {/* 사이드 메타 */}
        <div className="space-y-4">
          <div className="notion-card space-y-4">
            {/* 상태 */}
            <div className="space-y-1">
              <label className="text-xs font-medium" style={{ color: 'hsl(var(--text-muted))' }}>
                상태
              </label>
              <select
                value={task.status}
                onChange={(e) => handleFieldChange('status', e.target.value)}
                className="w-full px-2 py-1.5 rounded text-sm outline-none"
                style={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  color: 'hsl(var(--text-primary))',
                }}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                ))}
              </select>
            </div>

            {/* 우선순위 */}
            <div className="space-y-1">
              <label className="text-xs font-medium" style={{ color: 'hsl(var(--text-muted))' }}>
                우선순위
              </label>
              <select
                value={task.priority}
                onChange={(e) => handleFieldChange('priority', e.target.value)}
                className="w-full px-2 py-1.5 rounded text-sm outline-none"
                style={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  color: PRIORITY_COLOR[task.priority],
                }}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{PRIORITY_LABEL[p]}</option>
                ))}
              </select>
            </div>

            {/* 마감일 */}
            {task.due_date && (
              <div className="space-y-1">
                <label className="text-xs font-medium flex items-center gap-1" style={{ color: 'hsl(var(--text-muted))' }}>
                  <Calendar size={12} /> 마감일
                </label>
                <p className="text-sm" style={{ color: 'hsl(var(--text-primary))' }}>
                  {new Date(task.due_date).toLocaleDateString('ko-KR', {
                    year: 'numeric', month: 'long', day: 'numeric',
                  })}
                </p>
              </div>
            )}

            {/* 담당자 */}
            {task.assignee && (
              <div className="space-y-1">
                <label className="text-xs font-medium" style={{ color: 'hsl(var(--text-muted))' }}>
                  담당자
                </label>
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: 'hsl(var(--accent))' }}
                  >
                    {task.assignee.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm" style={{ color: 'hsl(var(--text-primary))' }}>
                    {task.assignee.name}
                  </span>
                </div>
              </div>
            )}

            {/* 우선순위 배지 */}
            <div className="pt-2 border-t" style={{ borderColor: 'hsl(var(--border))' }}>
              <span
                className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
                style={{
                  backgroundColor: `${PRIORITY_COLOR[task.priority]}15`,
                  color: PRIORITY_COLOR[task.priority],
                }}
              >
                <Flag size={11} />
                {PRIORITY_LABEL[task.priority]}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
