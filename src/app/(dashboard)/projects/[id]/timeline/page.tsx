import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { LayoutGrid, List } from 'lucide-react'
import { getProject } from '../../actions'
import { getTasksByProject } from '@/app/(dashboard)/tasks/actions'
import { GanttChart } from '@/components/gantt/gantt-chart'

const COLOR_MAP: Record<string, string> = {
  blue: '#2383E2', purple: '#9333EA', green: '#16A34A',
  orange: '#EA580C', red: '#DC2626', pink: '#DB2777', yellow: '#CA8A04',
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const project = await getProject(params.id)
  return { title: `${project?.name ?? '프로젝트'} — 타임라인` }
}

export default async function TimelinePage({ params }: { params: { id: string } }) {
  const [project, tasks] = await Promise.all([
    getProject(params.id),
    getTasksByProject(params.id),
  ])

  if (!project) notFound()

  const color = COLOR_MAP[project.color] ?? COLOR_MAP.blue

  return (
    <div className="space-y-5">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0"
            style={{ backgroundColor: color }}
          >
            {project.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold truncate" style={{ color: 'hsl(var(--text-primary))' }}>
              {project.name}
            </h1>
            <p className="text-xs" style={{ color: 'hsl(var(--text-muted))' }}>타임라인</p>
          </div>
        </div>

        {/* 뷰 전환 버튼 */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/projects/${project.id}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm"
            style={{ border: '1px solid hsl(var(--border))', color: 'hsl(var(--text-secondary))' }}
          >
            <List size={15} />
            목록
          </Link>
          <Link
            href={`/projects/${project.id}/kanban`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm"
            style={{ border: '1px solid hsl(var(--border))', color: 'hsl(var(--text-secondary))' }}
          >
            <LayoutGrid size={15} />
            칸반
          </Link>
        </div>
      </div>

      {/* Gantt 차트 */}
      <GanttChart tasks={tasks} project={project} />

      {/* Task 날짜 현황 */}
      {tasks.length > 0 && (
        <div className="notion-card space-y-2">
          <h3 className="text-sm font-semibold" style={{ color: 'hsl(var(--text-primary))' }}>
            날짜 설정 현황
          </h3>
          <div className="flex items-center gap-4 text-xs" style={{ color: 'hsl(var(--text-muted))' }}>
            <span>전체 {tasks.length}개</span>
            <span>날짜 있음 {tasks.filter((t) => t.start_date || t.due_date).length}개</span>
            <span>날짜 없음 {tasks.filter((t) => !t.start_date && !t.due_date).length}개</span>
          </div>
        </div>
      )}
    </div>
  )
}
