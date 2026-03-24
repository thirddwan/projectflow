'use client'

import Link from 'next/link'
import { Calendar, Flag } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const PRIORITY_LABEL: Record<string, string> = {
  urgent: '긴급', high: '높음', normal: '보통', low: '낮음',
}
const PRIORITY_COLOR: Record<string, string> = {
  urgent: 'hsl(4 72% 51%)',
  high:   'hsl(43 100% 48%)',
  normal: 'hsl(var(--accent))',
  low:    'hsl(var(--text-muted))',
}

interface Task {
  id: string
  title: string
  priority: string
  status: string
  due_date?: string | null
  assignee?: { name: string } | null
}

interface KanbanCardProps {
  task: Task
  isOverlay?: boolean
}

export function KanbanCard({ task, isOverlay }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  }

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done'

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`kanban-card ${isOverlay ? 'shadow-lg rotate-1' : ''}`}
    >
      {/* 우선순위 인디케이터 */}
      <div
        className="absolute top-0 left-0 w-1 h-full rounded-l-md"
        style={{ backgroundColor: PRIORITY_COLOR[task.priority] }}
      />

      <div className="pl-2 space-y-2">
        {/* 제목 */}
        <Link href={`/tasks/${task.id}`} onClick={(e) => e.stopPropagation()}>
          <p
            className="text-sm font-medium leading-snug hover:text-accent transition-colors line-clamp-2"
            style={{ color: 'hsl(var(--text-primary))' }}
          >
            {task.title}
          </p>
        </Link>

        {/* 메타 */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {task.assignee && (
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold"
                title={task.assignee.name}
                style={{ backgroundColor: 'hsl(var(--accent))' }}
              >
                {task.assignee.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs">
            {task.due_date && (
              <span
                className="flex items-center gap-0.5"
                style={{ color: isOverdue ? 'hsl(var(--danger))' : 'hsl(var(--text-muted))' }}
              >
                <Calendar size={11} />
                {new Date(task.due_date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
              </span>
            )}
            <span
              className="flex items-center gap-0.5 font-medium"
              style={{ color: PRIORITY_COLOR[task.priority] }}
              title={PRIORITY_LABEL[task.priority]}
            >
              <Flag size={11} />
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
