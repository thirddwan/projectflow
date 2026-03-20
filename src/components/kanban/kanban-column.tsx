'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { KanbanCard } from './kanban-card'

interface Task {
  id: string
  title: string
  priority: string
  status: string
  due_date?: string | null
  assignee?: { name: string } | null
  order: number
}

interface Column {
  id: string
  label: string
  color: string
  tasks: Task[]
}

interface KanbanColumnProps {
  column: Column
  projectId: string
}

export function KanbanColumn({ column, projectId }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id })

  return (
    <div
      className="flex flex-col rounded-lg shrink-0"
      style={{
        width: '280px',
        backgroundColor: 'hsl(var(--surface))',
        border: isOver
          ? '1px solid hsl(var(--accent))'
          : '1px solid hsl(var(--border))',
        transition: 'border-color 0.15s',
      }}
    >
      {/* 컬럼 헤더 */}
      <div className="flex items-center justify-between px-3 py-3 border-b" style={{ borderColor: 'hsl(var(--border))' }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: column.color }} />
          <span className="text-sm font-medium" style={{ color: 'hsl(var(--text-primary))' }}>
            {column.label}
          </span>
          <span
            className="text-xs px-1.5 py-0.5 rounded-full font-medium"
            style={{
              backgroundColor: 'hsl(var(--surface-hover))',
              color: 'hsl(var(--text-muted))',
            }}
          >
            {column.tasks.length}
          </span>
        </div>
        <Link
          href={`/projects/${projectId}/tasks/new?status=${column.id}`}
          className="rounded p-0.5 hover:bg-surface-hover transition-colors"
          style={{ color: 'hsl(var(--text-muted))' }}
        >
          <Plus size={15} />
        </Link>
      </div>

      {/* Task 목록 */}
      <div
        ref={setNodeRef}
        className="flex-1 p-2 space-y-2 overflow-y-auto"
        style={{ minHeight: '200px', maxHeight: 'calc(100vh - 280px)' }}
      >
        <SortableContext
          items={column.tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {column.tasks.map((task) => (
            <KanbanCard key={task.id} task={task} />
          ))}
        </SortableContext>

        {column.tasks.length === 0 && (
          <div
            className="flex items-center justify-center h-20 rounded-md text-xs"
            style={{
              border: '1px dashed hsl(var(--border))',
              color: 'hsl(var(--text-muted))',
            }}
          >
            Task 없음
          </div>
        )}
      </div>
    </div>
  )
}
