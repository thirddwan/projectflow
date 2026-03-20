import Link from 'next/link'
import { LayoutGrid, Calendar } from 'lucide-react'
import type { Project } from '@/types'

const COLOR_MAP: Record<string, string> = {
  blue:   '#2383E2',
  purple: '#9333EA',
  green:  '#16A34A',
  orange: '#EA580C',
  red:    '#DC2626',
  pink:   '#DB2777',
  yellow: '#CA8A04',
}

const STATUS_LABEL: Record<string, string> = {
  active:    '진행 중',
  on_hold:   '보류',
  completed: '완료',
  cancelled: '취소',
}

const STATUS_COLOR: Record<string, string> = {
  active:    'hsl(211 80% 51% / 0.12)',
  on_hold:   'hsl(43 100% 48% / 0.12)',
  completed: 'hsl(145 82% 33% / 0.12)',
  cancelled: 'hsl(0 0% 61% / 0.12)',
}
const STATUS_TEXT: Record<string, string> = {
  active:    'hsl(var(--accent))',
  on_hold:   'hsl(43 100% 48%)',
  completed: 'hsl(145 82% 33%)',
  cancelled: 'hsl(var(--text-muted))',
}

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  const color = COLOR_MAP[project.color] ?? COLOR_MAP.blue

  return (
    <Link
      href={`/projects/${project.id}`}
      className="notion-card block group"
    >
      {/* 색상 바 */}
      <div
        className="h-1 -mx-4 -mt-4 mb-4 rounded-t-md"
        style={{ backgroundColor: color }}
      />

      <div className="flex items-start justify-between gap-2 mb-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white text-sm font-bold"
          style={{ backgroundColor: color }}
        >
          {project.name.charAt(0).toUpperCase()}
        </div>
        <span
          className="text-xs px-2 py-0.5 rounded-full shrink-0"
          style={{
            backgroundColor: STATUS_COLOR[project.status],
            color: STATUS_TEXT[project.status],
          }}
        >
          {STATUS_LABEL[project.status]}
        </span>
      </div>

      <h3
        className="font-semibold mb-1 group-hover:text-accent transition-colors"
        style={{ color: 'hsl(var(--text-primary))' }}
      >
        {project.name}
      </h3>

      {project.description && (
        <p
          className="text-xs mb-3 line-clamp-2"
          style={{ color: 'hsl(var(--text-muted))' }}
        >
          {project.description}
        </p>
      )}

      <div
        className="flex items-center gap-3 text-xs pt-3 border-t"
        style={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--text-muted))' }}
      >
        <span className="flex items-center gap-1">
          <LayoutGrid size={12} />
          칸반
        </span>
        {project.end_date && (
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {new Date(project.end_date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>
    </Link>
  )
}
