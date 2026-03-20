'use client'

import { useFormState, useFormStatus } from 'react-dom'
import type { Task, TaskPriority, TaskStatus } from '@/types'

const PRIORITIES: { value: TaskPriority; label: string }[] = [
  { value: 'urgent', label: '긴급' },
  { value: 'high',   label: '높음' },
  { value: 'normal', label: '보통' },
  { value: 'low',    label: '낮음' },
]

const STATUSES: { value: TaskStatus; label: string }[] = [
  { value: 'backlog',     label: '백로그' },
  { value: 'todo',        label: '할 일' },
  { value: 'in_progress', label: '진행 중' },
  { value: 'review',      label: '검토' },
  { value: 'done',        label: '완료' },
]

interface TaskFormProps {
  projectId: string
  task?: Task
  action: (formData: FormData) => Promise<{ error: string } | void>
  submitLabel: string
}

const initialState = { error: '' }

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-2 px-4 rounded-md text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
      style={{ backgroundColor: 'hsl(var(--accent))' }}
    >
      {pending ? '처리 중...' : label}
    </button>
  )
}

export function TaskForm({ projectId, task, action, submitLabel }: TaskFormProps) {
  const [state, formAction] = useFormState(
    async (_: typeof initialState, formData: FormData) => {
      const result = await action(formData)
      if (result?.error) return { error: result.error }
      return initialState
    },
    initialState
  )

  return (
    <div
      className="rounded-lg p-6 space-y-5"
      style={{
        backgroundColor: 'hsl(var(--surface))',
        border: '1px solid hsl(var(--border))',
      }}
    >
      {state.error && (
        <p
          className="text-xs px-3 py-2 rounded-md"
          style={{ backgroundColor: 'hsl(4 72% 51% / 0.1)', color: 'hsl(4 72% 51%)' }}
        >
          {state.error}
        </p>
      )}

      <form action={formAction} className="space-y-5">
        <input type="hidden" name="project_id" value={projectId} />

        {/* 제목 */}
        <div className="space-y-1">
          <label className="block text-sm font-medium" style={{ color: 'hsl(var(--text-primary))' }}>
            제목 <span style={{ color: 'hsl(var(--danger))' }}>*</span>
          </label>
          <input
            name="title"
            type="text"
            placeholder="Task 제목을 입력하세요"
            required
            defaultValue={task?.title}
            className="w-full px-3 py-2 rounded-md text-sm outline-none"
            style={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              color: 'hsl(var(--text-primary))',
            }}
          />
        </div>

        {/* 설명 */}
        <div className="space-y-1">
          <label className="block text-sm font-medium" style={{ color: 'hsl(var(--text-primary))' }}>
            설명
          </label>
          <textarea
            name="description"
            rows={4}
            placeholder="Task에 대한 설명을 입력하세요"
            defaultValue={task?.description}
            className="w-full px-3 py-2 rounded-md text-sm outline-none resize-none"
            style={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              color: 'hsl(var(--text-primary))',
            }}
          />
        </div>

        {/* 우선순위 + 상태 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium" style={{ color: 'hsl(var(--text-primary))' }}>
              우선순위
            </label>
            <select
              name="priority"
              defaultValue={task?.priority ?? 'normal'}
              className="w-full px-3 py-2 rounded-md text-sm outline-none"
              style={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                color: 'hsl(var(--text-primary))',
              }}
            >
              {PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium" style={{ color: 'hsl(var(--text-primary))' }}>
              상태
            </label>
            <select
              name="status"
              defaultValue={task?.status ?? 'backlog'}
              className="w-full px-3 py-2 rounded-md text-sm outline-none"
              style={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                color: 'hsl(var(--text-primary))',
              }}
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 마감일 */}
        <div className="space-y-1">
          <label className="block text-sm font-medium" style={{ color: 'hsl(var(--text-primary))' }}>
            마감일
          </label>
          <input
            name="due_date"
            type="date"
            defaultValue={task?.due_date}
            className="w-full px-3 py-2 rounded-md text-sm outline-none"
            style={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              color: 'hsl(var(--text-primary))',
            }}
          />
        </div>

        <SubmitButton label={submitLabel} />
      </form>
    </div>
  )
}
