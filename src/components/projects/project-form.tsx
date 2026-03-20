'use client'

import { useFormState, useFormStatus } from 'react-dom'
import type { Project, ProjectColor, ProjectStatus } from '@/types'

const COLORS: { value: ProjectColor; label: string; hex: string }[] = [
  { value: 'blue',   label: '파랑', hex: '#2383E2' },
  { value: 'purple', label: '보라', hex: '#9333EA' },
  { value: 'green',  label: '초록', hex: '#16A34A' },
  { value: 'orange', label: '주황', hex: '#EA580C' },
  { value: 'red',    label: '빨강', hex: '#DC2626' },
  { value: 'pink',   label: '분홍', hex: '#DB2777' },
  { value: 'yellow', label: '노랑', hex: '#CA8A04' },
]

const STATUSES: { value: ProjectStatus; label: string }[] = [
  { value: 'active',    label: '진행 중' },
  { value: 'on_hold',   label: '보류' },
  { value: 'completed', label: '완료' },
  { value: 'cancelled', label: '취소' },
]

interface ProjectFormProps {
  project?: Project
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

export function ProjectForm({ project, action, submitLabel }: ProjectFormProps) {
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
        {/* 프로젝트 이름 */}
        <div className="space-y-1">
          <label className="block text-sm font-medium" style={{ color: 'hsl(var(--text-primary))' }}>
            프로젝트 이름 <span style={{ color: 'hsl(var(--danger))' }}>*</span>
          </label>
          <input
            name="name"
            type="text"
            placeholder="예: ProjectFlow 개발"
            required
            defaultValue={project?.name}
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
            rows={3}
            placeholder="프로젝트에 대한 간략한 설명을 입력하세요"
            defaultValue={project?.description}
            className="w-full px-3 py-2 rounded-md text-sm outline-none resize-none"
            style={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              color: 'hsl(var(--text-primary))',
            }}
          />
        </div>

        {/* 색상 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium" style={{ color: 'hsl(var(--text-primary))' }}>
            색상
          </label>
          <div className="flex gap-2 flex-wrap">
            {COLORS.map((c) => (
              <label key={c.value} className="cursor-pointer">
                <input
                  type="radio"
                  name="color"
                  value={c.value}
                  defaultChecked={project ? project.color === c.value : c.value === 'blue'}
                  className="sr-only peer"
                />
                <div
                  title={c.label}
                  className="w-7 h-7 rounded-full peer-checked:ring-2 peer-checked:ring-offset-2 transition-transform hover:scale-110"
                  style={{
                    backgroundColor: c.hex,
                    outlineOffset: '2px',
                  }}
                />
              </label>
            ))}
          </div>
        </div>

        {/* 상태 (수정 시만) */}
        {project && (
          <div className="space-y-1">
            <label className="block text-sm font-medium" style={{ color: 'hsl(var(--text-primary))' }}>
              상태
            </label>
            <select
              name="status"
              defaultValue={project.status}
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
        )}

        {/* 기간 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium" style={{ color: 'hsl(var(--text-primary))' }}>
              시작일
            </label>
            <input
              name="start_date"
              type="date"
              defaultValue={project?.start_date}
              className="w-full px-3 py-2 rounded-md text-sm outline-none"
              style={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                color: 'hsl(var(--text-primary))',
              }}
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium" style={{ color: 'hsl(var(--text-primary))' }}>
              종료일
            </label>
            <input
              name="end_date"
              type="date"
              defaultValue={project?.end_date}
              className="w-full px-3 py-2 rounded-md text-sm outline-none"
              style={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                color: 'hsl(var(--text-primary))',
              }}
            />
          </div>
        </div>

        <SubmitButton label={submitLabel} />
      </form>
    </div>
  )
}
