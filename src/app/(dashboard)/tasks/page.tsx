import type { Metadata } from 'next'
import { getAllTasks } from './actions'
import { TaskRow } from '@/components/tasks/task-row'

export const metadata: Metadata = { title: '내 할 일' }

const PRIORITY_ORDER: Record<string, number> = {
  urgent: 0, high: 1, normal: 2, low: 3,
}

export default async function TasksPage() {
  const tasks = await getAllTasks()
  const sorted = [...tasks].sort(
    (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
  )

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'hsl(var(--text-primary))' }}>
          내 할 일
        </h1>
        <p className="text-sm mt-1" style={{ color: 'hsl(var(--text-secondary))' }}>
          전체 {tasks.length}개
        </p>
      </div>

      {sorted.length === 0 ? (
        <div
          className="text-center py-16 rounded-lg"
          style={{ border: '1px dashed hsl(var(--border))' }}
        >
          <p className="text-sm" style={{ color: 'hsl(var(--text-muted))' }}>
            할 일이 없습니다. 프로젝트에서 Task를 추가해보세요.
          </p>
        </div>
      ) : (
        <div
          className="rounded-lg overflow-hidden"
          style={{ border: '1px solid hsl(var(--border))' }}
        >
          {sorted.map((task, i) => (
            <TaskRow
              key={task.id}
              task={task}
              isLast={i === sorted.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}
