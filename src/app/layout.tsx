import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'ProjectFlow — 스마트 프로젝트 관리',
    template: '%s | ProjectFlow',
  },
  description:
    '팀 협업을 위한 직관적인 프로젝트 관리 플랫폼. 타임라인, 칸반 보드, 버그 리포트, WBS 업로드까지 한 곳에서.',
  keywords: ['프로젝트 관리', '칸반', '타임라인', '협업', '버그 리포트', 'WBS'],
  openGraph: {
    title: 'ProjectFlow — 스마트 프로젝트 관리',
    description: '팀 협업을 위한 직관적인 프로젝트 관리 플랫폼',
    type: 'website',
    locale: 'ko_KR',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
