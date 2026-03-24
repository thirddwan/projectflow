import type { Metadata } from 'next'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { notFound } from 'next/navigation'
import { LayoutGrid, GanttChart, Settings, Plus } from 'lucide-react'
import { getProject } from '../actions'
import { getTasksByProject } from '@/app/(dashboard)/tasks/actions'
import { TaskRow } from '@/components/tasks/task-row'
import { DeleteProjectButton } from '@/components/projects/delete-project-button'

// useSearchParams 사용 컴포넌트 — SSR 비활성화로 hydration 충돌 방지
const TaskFilter = dynamic(
  () => import('@/components/tasks/task-filter').then((m) => ({ default: m.TaskFilter })),
  { ssr: false }
)

const COLOR_MAP: Record<string, string> = {
  blue: '#2383E2', purple: '#9333EA', green: '#16A34A',
  orange: '#EA580C', red: '#DC2626', pink: '#DB2777', yellow: '#CA8A04',
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const project = await getProject(params.id)
  return { title: project?.name ?? '프로젝트' }
}

export default async function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { status?: string; priority?: string; search?: string }
}) {
  const [project, allTasks] = await Promise.all([
    getProject(params.id),
    getTasksByProject(params.id),
  ])

  if (!project) notFound()

  const color = COLOR_MAP[project.color] ?? COLOR_MAP.blue

  // 필터 적용
  const tasks = allTasks.filter((t) => {
    if (searchParams.status && t.status !== searchParams.status) return false
    if (searchParams.priority && t.priority !== searchParams.priority) return false
    if (searchParams.search) {
      const q = searchParams.search.toLowerCase()
      if (!t.title.toLowerCase().includes(q)) return false
    }
    return true
  })

  const taskStats = {
    total: allTasks.length,
    done: allTasks.filter((t) => t.status === 'done').length,
    inProgress: allTasks.filter((t) => t.status === 'in_progress').length,
    backlog: allTasks.filter((t) => t.status === 'backlog').length,
  }
  const progressPct = taskStats.total > 0
    ? Math.round((taskStats.done / taskStats.total) * 100)
    : 0

  return (
    <div className="space-y-6 max-w-5xl">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shrink-0"
            style={{ backgroundColor: color }}
          >
            {project.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold truncate" style={{ color: 'hsl(var(--text-primary))' }}>
              {project.name}
            </h1>
            {project.description && (
              <p className="text-sm mt-0.5" style={{ color: 'hsl(var(--text-secondary))' }}>
                {project.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/projects/${project.id}/timeline`}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium"
            style={{ border: '1px solid hsl(var(--border))', color: 'hsl(var(--text-secondary))' }}
          >
            <GanttChart size={15} />
            타임라인
          </Link>
          <Link
            href={`/projects/${project.id}/kanban`}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium"
            style={{ border: '1px solid hsl(var(--border))', color: 'hsl(var(--text-secondary))' }}
          >
            <LayoutGrid size={15} />
            칸반
          </Link>
          <Link
            href={`/projects/${project.id}/settings`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm"
            style={{ border: '1px solid hsl(var(--border))', color: 'hsl(var(--text-secondary))' }}
          >
            <Settings size={15} />
          </Link>
          <DeleteProjectButton projectId={project.id} projectName={project.name} />
        </div>
      </div>

      {/* 진행률 */}
      <div className="notion-card space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span style={{ color: 'hsl(var(--text-secondary))' }}>전체 진행률</span>
          <span className="font-medium" style={{ color: 'hsl(var(--text-primary))' }}>
            {progressPct}%
          </span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'hsl(var(--border))' }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${progressPct}%`, backgroundColor: color }}
          />
        </div>
        <div className="flex items-center gap-4 text-xs" style={{ color: 'hsl(var(--text-muted))' }}>
          <span>전체 {taskStats.total}</span>
          <span>완료 {taskStats.done}</span>
          <span>진행 중 {taskStats.inProgress}</span>
          <span>백로그 {taskStats.backlog}</span>
        </div>
      </div>

      {/* Task 목록 */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <h2 className="font-semibold" style={{ color: 'hsl(var(--text-primary))' }}>
            Tasks
            {(searchParams.status || searchParams.priority || searchParams.search) && (
              <span className="ml-2 text-sm font-normal" style={{ color: 'hsl(var(--text-muted))' }}>
                ({tasks.length} / {allTasks.length})
              </span>
            )}
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <TaskFilter />
            <Link
              href={`/projects/${project.id}/tasks/new`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-white shrink-0"
              style={{ backgroundColor: 'hsl(var(--accent))' }}
            >
              <Plus size={15} />
              Task 추가
            </Link>
          </div>
        </div>

        {tasks.length === 0 ? (
          <div
            className="text-center py-10 rounded-lg"
            style={{ border: '1px dashed hsl(var(--border))' }}
          >
            <p className="text-sm" style={{ color: 'hsl(var(--text-muted))' }}>
              {allTasks.length === 0
                ? '아직 Task가 없습니다. 첫 번째 Task를 추가하세요.'
                : '필터 조건에 맞는 Task가 없습니다.'}
            </p>
          </div>
        ) : (
          <div
            className="rounded-lg overflow-hidden"
            style={{ border: '1px solid hsl(var(--border))' }}
          >
            {tasks.map((task, i) => (
              <TaskRow key={task.id} task={task} isLast={i === tasks.length - 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
