'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FolderOpen,
  CheckSquare,
  Bug,
  Users,
  Bell,
  Settings,
  ChevronDown,
  Plus,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: '대시보드' },
  { href: '/projects', icon: FolderOpen, label: '프로젝트' },
  { href: '/dashboard?view=tasks', icon: CheckSquare, label: '내 할 일' },
  { href: '/dashboard?view=bugs', icon: Bug, label: '버그 리포트' },
  { href: '/team', icon: Users, label: '팀 관리' },
  { href: '/notifications', icon: Bell, label: '알림' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="flex flex-col h-screen border-r"
      style={{
        width: '240px',
        borderColor: 'hsl(var(--border))',
        backgroundColor: 'hsl(var(--surface))',
      }}
    >
      {/* 로고 */}
      <div className="flex items-center gap-2 px-4 py-4 border-b" style={{ borderColor: 'hsl(var(--border))' }}>
        <div className="w-6 h-6 rounded bg-accent flex items-center justify-center">
          <span className="text-white text-xs font-bold">PF</span>
        </div>
        <span className="font-semibold text-sm" style={{ color: 'hsl(var(--text-primary))' }}>
          ProjectFlow
        </span>
      </div>

      {/* 워크스페이스 선택 */}
      <div
        className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-surface-hover mx-2 my-1 rounded"
        style={{ color: 'hsl(var(--text-secondary))' }}
      >
        <span className="text-xs font-medium">내 워크스페이스</span>
        <ChevronDown size={14} />
      </div>

      {/* 네비게이션 */}
      <nav className="flex-1 px-2 py-1 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn('sidebar-item', isActive && 'active')}
            >
              <item.icon size={16} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* 빠른 액션 */}
      <div className="px-2 py-2 border-t" style={{ borderColor: 'hsl(var(--border))' }}>
        <button
          className="sidebar-item w-full"
          style={{ color: 'hsl(var(--accent))' }}
        >
          <Plus size={16} />
          <span>새 프로젝트</span>
        </button>
      </div>

      {/* 설정 */}
      <div className="px-2 py-2 border-t" style={{ borderColor: 'hsl(var(--border))' }}>
        <Link href="/settings" className="sidebar-item">
          <Settings size={16} />
          <span>설정</span>
        </Link>
      </div>
    </aside>
  )
}
