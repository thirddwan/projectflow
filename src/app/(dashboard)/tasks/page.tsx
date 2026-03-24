import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { getAllTasks } from './actions'
import { TaskRow } from '@/components/tasks/task-row'

const TaskFilter = dynamic(
  () => import('@/components/tasks/task-filter').then((m) => ({ default: m.TaskFilter })),
  { ssr: false }
)

export const metadata: Metadata = { title: '내 할 일' }

const PRIORITY_ORDER: Record<string, number> = {
  urgent: 0, high: 1, normal: 2, low: 3,
}

export default async function TasksPage({
  searchParams,
}: {
  searchParams: { status?: string; priority?: string; search?: string }
}) {
  const allTasks = await getAllTasks()

  // 필터 적용
  const filtered = allTasks.filter((t) => {
    if (searchParams.status && t.status !== searchParams.status) return false
    if (searchParams.priority && t.priority !== searchParams.priority) return false
    if (searchParams.search) {
      const q = searchParams.search.toLowerCase()
      if (!t.title.toLowerCase().includes(q)) return false
    }
    return true
  })

  const sorted = [...filtered].sort(
    (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
  )

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'hsl(var(--text-primary))' }}>
            내 할 일
          </h1>
          <p className="text-sm mt-1" style={{ color: 'hsl(var(--text-secondary))' }}>
            {(searchParams.status || searchParams.priority || searchParams.search)
              ? `${sorted.length} / ${allTasks.length}개`
              : `전체 ${allTasks.length}개`}
          </p>
        </div>

        <TaskFilter />
      </div>

      {sorted.length === 0 ? (
        <div
          className="text-center py-16 rounded-lg"
          style={{ border: '1px dashed hsl(var(--border))' }}
        >
          <p className="text-sm" style={{ color: 'hsl(var(--text-muted))' }}>
            {allTasks.length === 0
              ? '할 일이 없습니다. 프로젝트에서 Task를 추가해보세요.'
              : '필터 조건에 맞는 Task가 없습니다.'}
          </p>
        </div>
      ) : (
        <div
          className="rounded-lg overflow-hidden"
          style={{ border: '1px solid hsl(var(--border))' }}
        >
          {sorted.map((task, i) => (
            <TaskRow key={task.id} task={task} isLast={i === sorted.length - 1} />
          ))}
        </div>
      )}
    </div>
  )
}
