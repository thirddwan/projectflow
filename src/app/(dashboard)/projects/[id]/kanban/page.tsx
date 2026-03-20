import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft, Plus } from 'lucide-react'
import { getProject } from '@/app/(dashboard)/projects/actions'
import { getTasksByProject } from '@/app/(dashboard)/tasks/actions'
import { KanbanBoard } from '@/components/kanban/kanban-board'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const project = await getProject(params.id)
  return { title: `${project?.name ?? '프로젝트'} — 칸반` }
}

const COLUMN_DEFS = [
  { id: 'backlog',     label: '백로그',  color: 'hsl(var(--text-muted))' },
  { id: 'todo',        label: '할 일',   color: '#6366F1' },
  { id: 'in_progress', label: '진행 중', color: 'hsl(var(--accent))' },
  { id: 'review',      label: '검토',    color: '#F59E0B' },
  { id: 'done',        label: '완료',    color: '#10B981' },
]

export default async function KanbanPage({ params }: { params: { id: string } }) {
  const [project, tasks] = await Promise.all([
    getProject(params.id),
    getTasksByProject(params.id),
  ])

  if (!project) notFound()

  // 컬럼별로 분류
  const columns = COLUMN_DEFS.map((col) => ({
    ...col,
    tasks: tasks
      .filter((t) => t.status === col.id)
      .sort((a, b) => a.order - b.order),
  }))

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href={`/projects/${params.id}`}
            className="flex items-center gap-1 text-sm hover:underline"
            style={{ color: 'hsl(var(--text-secondary))' }}
          >
            <ChevronLeft size={16} />
            {project.name}
          </Link>
          <span style={{ color: 'hsl(var(--text-muted))' }}>/</span>
          <span className="text-sm font-medium" style={{ color: 'hsl(var(--text-primary))' }}>
            칸반 보드
          </span>
        </div>
        <Link
          href={`/projects/${params.id}/tasks/new`}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-white"
          style={{ backgroundColor: 'hsl(var(--accent))' }}
        >
          <Plus size={15} />
          Task 추가
        </Link>
      </div>

      {/* 칸반 보드 */}
      <div className="flex-1 overflow-x-auto">
        <KanbanBoard columns={columns} projectId={params.id} />
      </div>
    </div>
  )
}
