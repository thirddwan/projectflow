import type { Metadata } from 'next'
import Link from 'next/link'
import { register } from './actions'
import { AuthForm } from '@/components/auth/auth-form'

export const metadata: Metadata = {
  title: '회원가입',
}

export default function RegisterPage({
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
            ProjectFlow
          </h1>
          <p className="text-sm" style={{ color: 'hsl(var(--text-secondary))' }}>
            무료 계정을 만드세요
          </p>
        </div>

        {/* 에러 메시지 */}
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

        {/* 회원가입 폼 */}
        <AuthForm
          mode="register"
          action={register}
          submitLabel="회원가입"
        />

        {/* 링크 */}
        <p className="text-center text-sm" style={{ color: 'hsl(var(--text-secondary))' }}>
          이미 계정이 있으신가요?{' '}
          <Link
            href="/login"
            className="font-medium hover:underline"
            style={{ color: 'hsl(var(--accent))' }}
          >
            로그인
          </Link>
        </p>
      </div>
    </div>
  )
}
