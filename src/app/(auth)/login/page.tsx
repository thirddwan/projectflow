import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '로그인',
}

export default function LoginPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: 'hsl(var(--background))' }}
    >
      <div className="w-full max-w-sm space-y-6">
        {/* 로고 */}
        <div className="text-center space-y-2">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto"
            style={{ backgroundColor: 'hsl(var(--accent))' }}
          >
            <span className="text-white text-xl font-bold">PF</span>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'hsl(var(--text-primary))' }}>
            ProjectFlow
          </h1>
          <p className="text-sm" style={{ color: 'hsl(var(--text-secondary))' }}>
            계정에 로그인하세요
          </p>
        </div>

        {/* 로그인 폼 */}
        <div
          className="rounded-lg p-6 space-y-4"
          style={{
            backgroundColor: 'hsl(var(--surface))',
            border: '1px solid hsl(var(--border))',
          }}
        >
          <div className="space-y-1">
            <label
              htmlFor="email"
              className="block text-sm font-medium"
              style={{ color: 'hsl(var(--text-primary))' }}
            >
              이메일
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="w-full px-3 py-2 rounded-md text-sm outline-none transition-colors"
              style={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                color: 'hsl(var(--text-primary))',
              }}
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="password"
              className="block text-sm font-medium"
              style={{ color: 'hsl(var(--text-primary))' }}
            >
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className="w-full px-3 py-2 rounded-md text-sm outline-none transition-colors"
              style={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                color: 'hsl(var(--text-primary))',
              }}
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded" />
              <span className="text-xs" style={{ color: 'hsl(var(--text-secondary))' }}>
                로그인 유지
              </span>
            </label>
            <Link
              href="/forgot-password"
              className="text-xs hover:underline"
              style={{ color: 'hsl(var(--accent))' }}
            >
              비밀번호 찾기
            </Link>
          </div>

          <button
            className="w-full py-2 px-4 rounded-md text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'hsl(var(--accent))' }}
          >
            로그인
          </button>
        </div>

        {/* 회원가입 링크 */}
        <p className="text-center text-sm" style={{ color: 'hsl(var(--text-secondary))' }}>
          아직 계정이 없으신가요?{' '}
          <Link
            href="/register"
            className="font-medium hover:underline"
            style={{ color: 'hsl(var(--accent))' }}
          >
            회원가입
          </Link>
        </p>
      </div>
    </div>
  )
}
