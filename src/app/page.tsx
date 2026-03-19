import Link from 'next/link'
import { ArrowRight, LayoutDashboard, Clock, Bug, Upload, Users, CheckSquare } from 'lucide-react'

const FEATURES = [
  { icon: Clock, title: '타임라인 (Gantt)', desc: '프로젝트 전체 일정을 한눈에 — 드래그로 일정 조정' },
  { icon: LayoutDashboard, title: '칸반 보드', desc: '백로그부터 완료까지 — 실시간 드래그 협업' },
  { icon: CheckSquare, title: 'Task & Todo', desc: '체크리스트로 세부 작업을 빠짐없이 추적' },
  { icon: Bug, title: '버그 리포트', desc: '심각도별 이슈 관리 — Critical부터 Trivial까지' },
  { icon: Users, title: '팀 협업', desc: '이메일 초대 + @멘션 + 실시간 코멘트' },
  { icon: Upload, title: 'WBS 업로드', desc: 'Excel/PDF 업로드로 프로젝트 자동 생성' },
]

export default function LandingPage() {
  return (
    <div style={{ backgroundColor: 'hsl(var(--background))', minHeight: '100vh' }}>
      {/* 헤더 */}
      <header className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'hsl(var(--border))' }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--accent))' }}>
            <span className="text-white text-xs font-bold">PF</span>
          </div>
          <span className="font-semibold" style={{ color: 'hsl(var(--text-primary))' }}>ProjectFlow</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm px-4 py-1.5 rounded-md" style={{ color: 'hsl(var(--text-secondary))' }}>
            로그인
          </Link>
          <Link href="/register" className="text-sm px-4 py-1.5 rounded-md text-white" style={{ backgroundColor: 'hsl(var(--accent))' }}>
            무료로 시작하기
          </Link>
        </div>
      </header>

      {/* 히어로 */}
      <section className="text-center px-6 py-20 max-w-4xl mx-auto">
        <span className="inline-block text-xs font-medium px-3 py-1 rounded-full mb-6"
          style={{ backgroundColor: 'hsl(211 80% 51% / 0.1)', color: 'hsl(var(--accent))' }}>
          🚀 무료로 시작하세요
        </span>
        <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6" style={{ color: 'hsl(var(--text-primary))' }}>
          팀 프로젝트를<br />더 스마트하게 관리하세요
        </h1>
        <p className="text-lg mb-8 max-w-2xl mx-auto" style={{ color: 'hsl(var(--text-secondary))' }}>
          타임라인, 칸반 보드, 버그 리포트, WBS 업로드까지.<br />
          복잡한 프로젝트를 한 플랫폼에서 쉽게 관리하세요.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/register" className="flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium"
            style={{ backgroundColor: 'hsl(var(--accent))' }}>
            무료로 시작하기 <ArrowRight size={18} />
          </Link>
          <Link href="/dashboard" className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium"
            style={{ border: '1px solid hsl(var(--border))', color: 'hsl(var(--text-primary))' }}>
            데모 보기
          </Link>
        </div>
      </section>

      {/* 기능 */}
      <section className="px-6 py-16" style={{ backgroundColor: 'hsl(var(--surface))' }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12" style={{ color: 'hsl(var(--text-primary))' }}>
            모든 기능이 하나로
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="p-5 rounded-lg"
                style={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                  style={{ backgroundColor: 'hsl(211 80% 51% / 0.1)' }}>
                  <feature.icon size={20} style={{ color: 'hsl(var(--accent))' }} />
                </div>
                <h3 className="font-semibold mb-1" style={{ color: 'hsl(var(--text-primary))' }}>{feature.title}</h3>
                <p className="text-sm" style={{ color: 'hsl(var(--text-secondary))' }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 광고 배너 영역 */}
      <div className="max-w-3xl mx-auto my-8 px-4">
        <div className="rounded-lg flex items-center justify-center text-xs"
          style={{ height: '90px', border: '1px dashed hsl(var(--border))', color: 'hsl(var(--text-muted))' }}>
          광고 영역 (728×90) — AdSense 승인 후 활성화
        </div>
      </div>

      {/* 푸터 */}
      <footer className="border-t py-8 text-center" style={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--text-muted))' }}>
        <p className="text-sm">© 2026 ProjectFlow. All rights reserved.</p>
      </footer>
    </div>
  )
}
