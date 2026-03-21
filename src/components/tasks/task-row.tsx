import Link from 'next/link'
import { Calendar, User } from 'lucide-react'

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

interface TaskRowProps {
  task: {
    id: string
    title: string
    priority: string
    status: string
    due_date?: string | null
    assignee?: { name: string } | null
  }
  isLast?: boolean
}

export function TaskRow({ task, isLast }: TaskRowProps) {
  return (
    <Link
      href={`/tasks/${task.id}`}
      className="flex items-center gap-3 px-4 py-3 hover:bg-surface-hover transition-colors"
      style={{
        borderBottom: isLast ? 'none' : '1px solid hsl(var(--border))',
      }}
    >
      {/* 우선순위 점 */}
      <div
        className="w-2 h-2 rounded-full shrink-0"
        style={{ backgroundColor: PRIORITY_COLOR[task.priority] }}
      />

      {/* 제목 */}
      <p className="flex-1 text-sm font-medium truncate" style={{ color: 'hsl(var(--text-primary))' }}>
        {task.title}
      </p>

      {/* 메타 */}
      <div className="flex items-center gap-2 shrink-0 text-xs" style={{ color: 'hsl(var(--text-muted))' }}>
        {task.assignee && (
          <span className="hidden sm:flex items-center gap-1">
            <User size={12} />
            {task.assignee.name}
          </span>
        )}
        {task.due_date && (
          <span className="hidden sm:flex items-center gap-1">
            <Calendar size={12} />
            {new Date(task.due_date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
          </span>
        )}
        <span
          className="hidden xs:inline-flex px-2 py-0.5 rounded-full text-xs"
          style={{
            backgroundColor: 'hsl(var(--surface-hover))',
            color: 'hsl(var(--text-secondary))',
          }}
        >
          {STATUS_LABEL[task.status]}
        </span>
        <span
          className="px-2 py-0.5 rounded-full text-xs font-medium"
          style={{
            color: PRIORITY_COLOR[task.priority],
            backgroundColor: `${PRIORITY_COLOR[task.priority]}15`,
          }}
        >
          {PRIORITY_LABEL[task.priority]}
        </span>
      </div>
    </Link>
  )
}
