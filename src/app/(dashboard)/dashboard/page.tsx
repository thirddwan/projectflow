import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckSquare, FolderOpen, Clock, AlertTriangle, Plus } from 'lucide-react'
import { getDashboardData } from './actions'

export const metadata: Metadata = { title: '대시보드' }

const COLOR_MAP: Record<string, string> = {
  blue: '#2383E2', purple: '#9333EA', green: '#16A34A',
  orange: '#EA580C', red: '#DC2626', pink: '#DB2777', yellow: '#CA8A04',
}
const STATUS_LABEL: Record<string, string> = {
  backlog: '백로그', todo: '할 일', in_progress: '진행 중', review: '검토', done: '완료',
}
const PRIORITY_COLOR: Record<string, string> = {
  urgent: 'hsl(4 72% 51%)', high: 'hsl(43 100% 48%)',
  normal: 'hsl(211 80% 51%)', low: 'hsl(0 0% 61%)',
}
const PRIORITY_LABEL: Record<string, string> = {
  urgent: '긴급', high: '높음', normal: '보통', low: '낮음',
}

export default async function DashboardPage() {
  const data = await getDashboardData()

  const stats = [
    {
      label: '진행 중인 프로젝트', value: String(data?.activeProjectCount ?? 0),
      icon: FolderOpen, colorClass: 'text-blue-500', bgClass: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      label: '이번 주 마감', value: String(data?.tasksDueThisWeek ?? 0),
      icon: Clock, colorClass: 'text-yellow-500', bgClass: 'bg-yellow-50 dark:bg-yellow-950',
    },
    {
      label: '기한 초과', value: String(data?.overdueTaskCount ?? 0),
      icon: AlertTriangle, colorClass: 'text-red-500', bgClass: 'bg-red-50 dark:bg-red-950',
    },
    {
      label: '미완료 Tasks', value: String(data?.recentTasks.length ?? 0),
      icon: CheckSquare, colorClass: 'text-green-500', bgClass: 'bg-green-50 dark:bg-green-950',
    },
  ]

  const userName = (data?.user as { user_metadata?: { name?: string } })?.user_metadata?.name ?? '사용자'

  return (
    <div className="space-y-6 max-w-5xl">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'hsl(var(--text-primary))' }}>
          안녕하세요, {userName}님
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'hsl(var(--text-secondary))' }}>
          오늘도 프로젝트 목표를 향해 달려봐요!
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="notion-card flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${stat.bgClass}`}>
              <stat.icon size={20} className={stat.colorClass} />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold" style={{ color: 'hsl(var(--text-primary))' }}>
                {stat.value}
              </p>
              <p className="text-xs truncate" style={{ color: 'hsl(var(--text-muted))' }}>
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 미완료 Task 목록 */}
      <div className="notion-card space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold" style={{ color: 'hsl(var(--text-primary))' }}>
            진행 중인 Tasks
          </h2>
          <Link
            href="/tasks"
            className="text-xs hover:underline"
            style={{ color: 'hsl(var(--accent))' }}
          >
            전체 보기
          </Link>
        </div>

        {!data || data.recentTasks.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm" style={{ color: 'hsl(var(--text-muted))' }}>
              진행 중인 Task가 없습니다.
            </p>
            <Link
              href="/projects/new"
              className="inline-flex items-center gap-1 mt-3 text-sm"
              style={{ color: 'hsl(var(--accent))' }}
            >
              <Plus size={14} />
              새 프로젝트 시작하기
            </Link>
          </div>
        ) : (
          <div className="space-y-1">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {data.recentTasks.map((task: any) => (
              <Link
                key={task.id}
                href={`/tasks/${task.id}`}
                className="flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors hover:bg-surface-hover"
                style={{ border: '1px solid hsl(var(--border))' }}
              >
                {/* 프로젝트 색상 점 */}
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: task.project ? COLOR_MAP[task.project.color] ?? COLOR_MAP.blue : 'hsl(var(--border))' }}
                />

                {/* 제목 */}
                <p className="flex-1 text-sm truncate" style={{ color: 'hsl(var(--text-primary))' }}>
                  {task.title}
                </p>

                {/* 메타 */}
                <div className="flex items-center gap-2 shrink-0">
                  {task.project && (
                    <span className="hidden sm:block text-xs" style={{ color: 'hsl(var(--text-muted))' }}>
                      {task.project.name}
                    </span>
                  )}
                  {task.due_date && (
                    <span
                      className="hidden xs:block text-xs"
                      style={{
                        color: new Date(task.due_date) < new Date()
                          ? 'hsl(var(--danger))'
                          : 'hsl(var(--text-muted))',
                      }}
                    >
                      {new Date(task.due_date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      color: PRIORITY_COLOR[task.priority],
                      backgroundColor: `${PRIORITY_COLOR[task.priority]}18`,
                    }}
                  >
                    {PRIORITY_LABEL[task.priority]}
                  </span>
                  <span
                    className="hidden sm:block text-xs px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: 'hsl(var(--surface-hover))',
                      color: 'hsl(var(--text-secondary))',
                    }}
                  >
                    {STATUS_LABEL[task.status]}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* 빠른 액션 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { href: '/projects/new', label: '새 프로젝트', desc: '프로젝트를 새로 시작합니다' },
          { href: '/projects',    label: '프로젝트 목록', desc: '전체 프로젝트를 확인합니다' },
          { href: '/team',        label: '팀 관리', desc: '팀원을 초대하고 관리합니다' },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="notion-card space-y-1 hover:border-accent/40 transition-colors"
            style={{ display: 'block' }}
          >
            <p className="text-sm font-medium" style={{ color: 'hsl(var(--text-primary))' }}>
              {item.label}
            </p>
            <p className="text-xs" style={{ color: 'hsl(var(--text-muted))' }}>
              {item.desc}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
