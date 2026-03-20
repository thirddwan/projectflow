'use client'

import { useFormState, useFormStatus } from 'react-dom'
import Link from 'next/link'

type AuthMode = 'login' | 'register' | 'forgot-password'

interface AuthFormProps {
  mode: AuthMode
  action: (formData: FormData) => Promise<{ error: string } | void>
  submitLabel: string
}

const initialState = { error: '' }

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-2 px-4 rounded-md text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
      style={{ backgroundColor: 'hsl(var(--accent))' }}
    >
      {pending ? '처리 중...' : label}
    </button>
  )
}

export function AuthForm({ mode, action, submitLabel }: AuthFormProps) {
  const [state, formAction] = useFormState(
    async (_: typeof initialState, formData: FormData) => {
      const result = await action(formData)
      if (result?.error) return { error: result.error }
      return initialState
    },
    initialState
  )

  return (
    <div
      className="rounded-lg p-6 space-y-4"
      style={{
        backgroundColor: 'hsl(var(--surface))',
        border: '1px solid hsl(var(--border))',
      }}
    >
      {state.error && (
        <p
          className="text-xs text-center px-3 py-2 rounded-md"
          style={{
            backgroundColor: 'hsl(4 72% 51% / 0.1)',
            color: 'hsl(4 72% 51%)',
          }}
        >
          {state.error}
        </p>
      )}

      <form action={formAction} className="space-y-4">
        {/* 이름 (회원가입만) */}
        {mode === 'register' && (
          <div className="space-y-1">
            <label
              htmlFor="name"
              className="block text-sm font-medium"
              style={{ color: 'hsl(var(--text-primary))' }}
            >
              이름
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="홍길동"
              required
              className="w-full px-3 py-2 rounded-md text-sm outline-none transition-colors focus:ring-1"
              style={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                color: 'hsl(var(--text-primary))',
              }}
            />
          </div>
        )}

        {/* 이메일 */}
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
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            className="w-full px-3 py-2 rounded-md text-sm outline-none transition-colors"
            style={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              color: 'hsl(var(--text-primary))',
            }}
          />
        </div>

        {/* 비밀번호 (비밀번호 찾기 제외) */}
        {mode !== 'forgot-password' && (
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
              name="password"
              type="password"
              placeholder="••••••••"
              required
              minLength={8}
              className="w-full px-3 py-2 rounded-md text-sm outline-none transition-colors"
              style={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                color: 'hsl(var(--text-primary))',
              }}
            />
            {mode === 'register' && (
              <p className="text-xs" style={{ color: 'hsl(var(--text-muted))' }}>
                최소 8자 이상
              </p>
            )}
          </div>
        )}

        {/* 로그인 유지 + 비밀번호 찾기 (로그인만) */}
        {mode === 'login' && (
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="remember" className="rounded" />
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
        )}

        <SubmitButton label={submitLabel} />
      </form>
    </div>
  )
}
