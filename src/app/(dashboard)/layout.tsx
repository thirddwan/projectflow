import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'
import { ThemeProvider } from '@/components/layout/theme-provider'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'hsl(var(--background))' }}>
        {/* 사이드바 */}
        <Sidebar />

        {/* 메인 영역 */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          {/* 상단 바 */}
          <Topbar />

          {/* 컨텐츠 + 광고 */}
          <div className="flex flex-1 overflow-hidden">
            {/* 메인 컨텐츠 */}
            <main className="flex-1 overflow-y-auto p-6">
              {children}
            </main>

            {/* AdSense 우측 사이드 — 데스크탑 전용 */}
            <aside
              className="hidden xl:flex flex-col gap-4 p-4 border-l shrink-0"
              style={{
                width: '300px',
                borderColor: 'hsl(var(--border))',
                backgroundColor: 'hsl(var(--surface))',
              }}
            >
              {/* AdSense 광고 영역 */}
              <div
                className="rounded-md flex items-center justify-center text-xs"
                style={{
                  width: '300px',
                  height: '600px',
                  border: '1px dashed hsl(var(--border))',
                  color: 'hsl(var(--text-muted))',
                }}
              >
                광고 영역 (300×600)
              </div>
            </aside>
          </div>
        </div>
      </div>
    </ThemeProvider>
  )
}
