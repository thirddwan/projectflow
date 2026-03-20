'use client'

import { Bell, Moon, Sun, Search, User, Menu } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'
import { logout } from '@/app/(auth)/login/actions'

interface TopbarProps {
  onMenuClick?: () => void
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  useEffect(() => setMounted(true), [])

  return (
    <header
      className="flex items-center justify-between h-12 px-4 border-b shrink-0"
      style={{
        borderColor: 'hsl(var(--border))',
        backgroundColor: 'hsl(var(--background))',
      }}
    >
      <div className="flex items-center gap-3">
        {/* 모바일 햄버거 */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 rounded-md hover:bg-surface-hover transition-colors"
          style={{ color: 'hsl(var(--text-secondary))' }}
          aria-label="메뉴 열기"
        >
          <Menu size={20} />
        </button>

        {/* 검색 */}
        <div
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md cursor-pointer"
          style={{
            backgroundColor: 'hsl(var(--surface))',
            border: '1px solid hsl(var(--border))',
            color: 'hsl(var(--text-muted))',
            width: '240px',
          }}
        >
          <Search size={14} />
          <span className="text-sm">검색...</span>
          <kbd
            className="ml-auto text-xs px-1.5 py-0.5 rounded"
            style={{
              backgroundColor: 'hsl(var(--border))',
              color: 'hsl(var(--text-muted))',
            }}
          >
            ⌘K
          </kbd>
        </div>
      </div>

      {/* 우측 액션 */}
      <div className="flex items-center gap-2">
        {/* 알림 */}
        <button
          className="relative p-2 rounded-md hover:bg-surface-hover transition-colors"
          style={{ color: 'hsl(var(--text-secondary))' }}
          aria-label="알림"
        >
          <Bell size={18} />
          <span
            className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500"
            aria-hidden="true"
          />
        </button>

        {/* 다크모드 토글 */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-md hover:bg-surface-hover transition-colors"
            style={{ color: 'hsl(var(--text-secondary))' }}
            aria-label="테마 전환"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        )}

        {/* 사용자 메뉴 */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
            style={{ backgroundColor: 'hsl(var(--accent))' }}
            aria-label="프로필"
          >
            <User size={16} />
          </button>

          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowUserMenu(false)}
              />
              <div
                className="absolute right-0 top-10 z-20 w-48 rounded-lg py-1 shadow-lg"
                style={{
                  backgroundColor: 'hsl(var(--surface))',
                  border: '1px solid hsl(var(--border))',
                }}
              >
                <form action={logout}>
                  <button
                    type="submit"
                    className="w-full text-left px-4 py-2 text-sm hover:bg-surface-hover transition-colors"
                    style={{ color: 'hsl(var(--danger))' }}
                  >
                    로그아웃
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
