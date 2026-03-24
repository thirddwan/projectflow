'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { Search, X } from 'lucide-react'

const STATUS_OPTIONS = [
  { value: 'backlog',     label: '백로그' },
  { value: 'todo',        label: '할 일' },
  { value: 'in_progress', label: '진행 중' },
  { value: 'review',      label: '검토' },
  { value: 'done',        label: '완료' },
]
const PRIORITY_OPTIONS = [
  { value: 'urgent', label: '긴급' },
  { value: 'high',   label: '높음' },
  { value: 'normal', label: '보통' },
  { value: 'low',    label: '낮음' },
]

export function TaskFilter() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const status   = searchParams.get('status')   ?? ''
  const priority = searchParams.get('priority') ?? ''
  const search   = searchParams.get('search')   ?? ''

  const update = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }, [router, pathname, searchParams])

  const hasFilter = status || priority || search

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* 검색 */}
      <div className="relative">
        <Search
          size={14}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: 'hsl(var(--text-muted))' }}
        />
        <input
          type="text"
          placeholder="검색..."
          value={search}
          onChange={(e) => update('search', e.target.value)}
          className="pl-8 pr-3 py-1.5 text-sm rounded-md outline-none w-40"
          style={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            color: 'hsl(var(--text-primary))',
          }}
        />
      </div>

      {/* 상태 필터 */}
      <select
        value={status}
        onChange={(e) => update('status', e.target.value)}
        className="px-2.5 py-1.5 text-sm rounded-md outline-none"
        style={{
          backgroundColor: status ? 'hsl(var(--accent) / 0.1)' : 'hsl(var(--background))',
          border: `1px solid ${status ? 'hsl(var(--accent) / 0.4)' : 'hsl(var(--border))'}`,
          color: status ? 'hsl(var(--accent))' : 'hsl(var(--text-secondary))',
        }}
      >
        <option value="">전체 상태</option>
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      {/* 우선순위 필터 */}
      <select
        value={priority}
        onChange={(e) => update('priority', e.target.value)}
        className="px-2.5 py-1.5 text-sm rounded-md outline-none"
        style={{
          backgroundColor: priority ? 'hsl(var(--accent) / 0.1)' : 'hsl(var(--background))',
          border: `1px solid ${priority ? 'hsl(var(--accent) / 0.4)' : 'hsl(var(--border))'}`,
          color: priority ? 'hsl(var(--accent))' : 'hsl(var(--text-secondary))',
        }}
      >
        <option value="">전체 우선순위</option>
        {PRIORITY_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      {/* 필터 초기화 */}
      {hasFilter && (
        <button
          onClick={() => {
            const params = new URLSearchParams()
            router.replace(pathname, { scroll: false })
          }}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-md transition-colors"
          style={{
            backgroundColor: 'hsl(var(--surface-hover))',
            color: 'hsl(var(--text-secondary))',
          }}
        >
          <X size={12} />
          초기화
        </button>
      )}
    </div>
  )
}
