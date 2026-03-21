import type { Metadata } from 'next'
import { CheckSquare, FolderOpen, Clock, AlertTriangle } from 'lucide-react'

export const metadata: Metadata = {
  title: '대시보드',
}

// 임시 통계 데이터 (실제로는 Supabase에서 가져옴)
const STATS = [
  { label: '진행 중인 프로젝트', value: '4', icon: FolderOpen, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950' },
  { label: '이번 주 할 일', value: '12', icon: CheckSquare, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950' },
  { label: '마감 임박 (7일)', value: '3', icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-950' },
  { label: '미해결 버그', value: '2', icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950' },
]

const RECENT_TASKS = [
  { id: 'PF-001', title: 'Next.js 14 + Supabase 초기 세팅', status: '진행 중', priority: '높음', due: '3/25' },
  { id: 'PF-002', title: 'Tailwind CSS + shadcn/ui 디자인 시스템', status: '진행 중', priority: '높음', due: '3/25' },
  { id: 'PF-003', title: '다크모드 레이아웃 구성', status: '진행 중', priority: '높음', due: '3/27' },
  { id: 'PF-004', title: 'Supabase Auth 이메일 인증', status: '진행 중', priority: '높음', due: '3/29' },
  { id: 'PF-005', title: '로그인/회원가입 페이지 UI', status: '할 일', priority: '보통', due: '3/29' },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6 max-w-5xl">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'hsl(var(--text-primary))' }}>
          안녕하세요 👋
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'hsl(var(--text-secondary))' }}>
          오늘도 프로젝트 목표를 향해 달려봐요!
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat) => (
          <div key={stat.label} className="notion-card flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.bg}`}>
              <stat.icon size={20} className={stat.color} />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: 'hsl(var(--text-primary))' }}>
                {stat.value}
              </p>
              <p className="text-xs" style={{ color: 'hsl(var(--text-muted))' }}>
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 이번 주 할 일 */}
      <div className="notion-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold" style={{ color: 'hsl(var(--text-primary))' }}>
            🔥 이번 주 진행 중 Tasks
          </h2>
          <span
            className="text-xs px-2 py-1 rounded-full"
            style={{
              backgroundColor: 'hsl(var(--surface-hover))',
              color: 'hsl(var(--text-secondary))',
            }}
          >
            Phase 1 MVP
          </span>
        </div>
        <div className="space-y-2">
          {RECENT_TASKS.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 p-3 rounded-md cursor-pointer transition-colors hover:bg-surface-hover"
              style={{ border: '1px solid hsl(var(--border))' }}
            >
              <input type="checkbox" className="rounded" readOnly />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'hsl(var(--text-primary))' }}>
                  <span className="text-text-muted mr-2">{task.id}</span>
                  {task.title}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className="hidden xs:inline-flex text-xs px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: task.status === '진행 중' ? 'hsl(211 80% 51% / 0.1)' : 'hsl(var(--surface-hover))',
                    color: task.status === '진행 중' ? 'hsl(var(--accent))' : 'hsl(var(--text-secondary))',
                  }}
                >
                  {task.status}
                </span>
                <span className="hidden sm:block text-xs" style={{ color: 'hsl(var(--text-muted))' }}>
                  ~{task.due}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Phase 진행 현황 */}
      <div className="notion-card">
        <h2 className="font-semibold mb-4" style={{ color: 'hsl(var(--text-primary))' }}>
          📅 ProjectFlow 개발 로드맵
        </h2>
        <div className="space-y-3">
          {[
            { phase: 'Phase 1', title: 'MVP — 인증·칸반·Task', period: '3/20 ~ 4/17', progress: 16, status: '진행 중', color: '#2383E2' },
            { phase: 'Phase 2', title: '협업 — 타임라인·초대·실시간', period: '4/18 ~ 5/8', progress: 0, status: '예정', color: '#9B9B9B' },
            { phase: 'Phase 3', title: '고급 — 버그·WBS·AdSense', period: '5/9 ~ 5/29', progress: 0, status: '예정', color: '#9B9B9B' },
            { phase: 'Phase 4', title: '최적화 — 성능·SEO·배포', period: '5/30 ~ 6/12', progress: 0, status: '예정', color: '#9B9B9B' },
          ].map((item) => (
            <div key={item.phase} className="flex items-center gap-4">
              <div className="w-16 sm:w-20 shrink-0">
                <span className="text-xs font-medium" style={{ color: item.color }}>
                  {item.phase}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1 gap-2">
                  <span className="text-xs truncate" style={{ color: 'hsl(var(--text-secondary))' }}>
                    {item.title}
                  </span>
                  <span className="hidden sm:block text-xs shrink-0" style={{ color: 'hsl(var(--text-muted))' }}>
                    {item.period}
                  </span>
                </div>
                <div
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ backgroundColor: 'hsl(var(--border))' }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${item.progress}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
              <span
                className="text-xs w-12 text-right shrink-0"
                style={{ color: 'hsl(var(--text-muted))' }}
              >
                {item.progress}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
