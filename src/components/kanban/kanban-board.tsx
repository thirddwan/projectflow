'use client'

import { useState, useRef, useEffect, useTransition } from 'react'
import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { KanbanColumn } from './kanban-column'
import { KanbanCard } from './kanban-card'
import { updateTaskStatus } from '@/app/(dashboard)/tasks/actions'
import type { TaskStatus } from '@/types'

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

interface KanbanBoardProps {
  columns: Column[]
  projectId: string
}

export function KanbanBoard({ columns: initialColumns, projectId }: KanbanBoardProps) {
  const [columns, setColumns] = useState(initialColumns)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [, startTransition] = useTransition()
  // FIX-03: 최신 columns 상태를 ref로 추적 (handleDragEnd 클로저 stale 방지)
  const columnsRef = useRef(columns)
  useEffect(() => { columnsRef.current = columns }, [columns])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  )

  function handleDragStart({ active }: DragStartEvent) {
    const col = columns.find((c) => c.tasks.some((t) => t.id === active.id))
    const task = col?.tasks.find((t) => t.id === active.id)
    if (task) setActiveTask(task)
  }

  function handleDragOver({ active, over }: DragOverEvent) {
    if (!over) return

    const activeColIdx = columns.findIndex((c) => c.tasks.some((t) => t.id === active.id))
    if (activeColIdx === -1) return

    // over가 컬럼 ID인 경우
    const overColIdx = columns.findIndex((c) => c.id === over.id)
    // over가 다른 컬럼의 task인 경우
    const overTaskColIdx = columns.findIndex((c) => c.tasks.some((t) => t.id === over.id))

    const targetColIdx = overColIdx !== -1 ? overColIdx : overTaskColIdx
    if (targetColIdx === -1 || targetColIdx === activeColIdx) return

    setColumns((prev) => {
      const next = [...prev]
      const activeTask = next[activeColIdx].tasks.find((t) => t.id === active.id)!
      next[activeColIdx] = {
        ...next[activeColIdx],
        tasks: next[activeColIdx].tasks.filter((t) => t.id !== active.id),
      }
      const overIdx = next[targetColIdx].tasks.findIndex((t) => t.id === over.id)
      const insertIdx = overIdx >= 0 ? overIdx : next[targetColIdx].tasks.length
      const newTasks = [...next[targetColIdx].tasks]
      newTasks.splice(insertIdx, 0, { ...activeTask, status: next[targetColIdx].id })
      next[targetColIdx] = { ...next[targetColIdx], tasks: newTasks }
      return next
    })
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveTask(null)
    if (!over) return

    const activeColIdx = columns.findIndex((c) => c.tasks.some((t) => t.id === active.id))
    if (activeColIdx === -1) return

    const overColIdx = columns.findIndex((c) => c.id === over.id)
    const overTaskColIdx = columns.findIndex((c) => c.tasks.some((t) => t.id === over.id))
    const targetColIdx = overColIdx !== -1 ? overColIdx : overTaskColIdx

    // 같은 컬럼 내 reorder
    if (targetColIdx === activeColIdx) {
      const col = columns[activeColIdx]
      const oldIdx = col.tasks.findIndex((t) => t.id === active.id)
      const newIdx = col.tasks.findIndex((t) => t.id === over.id)
      if (oldIdx !== newIdx && newIdx !== -1) {
        setColumns((prev) => {
          const next = [...prev]
          next[activeColIdx] = {
            ...next[activeColIdx],
            tasks: arrayMove(next[activeColIdx].tasks, oldIdx, newIdx),
          }
          return next
        })
      }
    }

    // FIX-02 + FIX-03: 최신 state(ref)로 서버 업데이트, startTransition으로 에러 처리
    const latestColumns = columnsRef.current
    const latestActiveColIdx = latestColumns.findIndex((c) => c.tasks.some((t) => t.id === active.id))
    const latestTargetColIdx = targetColIdx !== -1 ? targetColIdx : latestActiveColIdx
    const col = latestColumns[latestTargetColIdx]
    if (col) {
      const order = col.tasks.findIndex((t) => t.id === active.id)
      startTransition(async () => {
        await updateTaskStatus(active.id as string, col.id as TaskStatus, order)
      })
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 h-full pb-4" style={{ minWidth: 'max-content' }}>
        {columns.map((col) => (
          <KanbanColumn key={col.id} column={col} projectId={projectId} />
        ))}
      </div>

      <DragOverlay>
        {activeTask && <KanbanCard task={activeTask} isOverlay />}
      </DragOverlay>
    </DndContext>
  )
}
