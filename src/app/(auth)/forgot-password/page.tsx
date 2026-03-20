import type { Metadata } from 'next'
import Link from 'next/link'
import { forgotPassword } from './actions'
import { AuthForm } from '@/components/auth/auth-form'

export const metadata: Metadata = {
  title: '비밀번호 찾기',
}

export default function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
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
            비밀번호 찾기
          </h1>
          <p className="text-sm" style={{ color: 'hsl(var(--text-secondary))' }}>
            가입 시 사용한 이메일을 입력하시면<br />재설정 링크를 보내드립니다.
          </p>
        </div>

        {/* 에러 */}
        {searchParams.error && (
          <div
            className="text-sm text-center px-4 py-2 rounded-md"
            style={{
              backgroundColor: 'hsl(4 72% 51% / 0.1)',
              color: 'hsl(4 72% 51%)',
              border: '1px solid hsl(4 72% 51% / 0.2)',
            }}
          >
            {searchParams.error}
          </div>
        )}

        {/* 폼 */}
        <AuthForm
          mode="forgot-password"
          action={forgotPassword}
          submitLabel="재설정 링크 보내기"
        />

        {/* 뒤로 */}
        <p className="text-center text-sm" style={{ color: 'hsl(var(--text-secondary))' }}>
          <Link
            href="/login"
            className="font-medium hover:underline"
            style={{ color: 'hsl(var(--accent))' }}
          >
            ← 로그인으로 돌아가기
          </Link>
        </p>
      </div>
    </div>
  )
}
