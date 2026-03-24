'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const password = (form.elements.namedItem('password') as HTMLInputElement).value
    const confirm = (form.elements.namedItem('confirm') as HTMLInputElement).value

    if (password !== confirm) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }
    if (password.length < 8) {
      setError('비밀번호는 최소 8자 이상이어야 합니다.')
      return
    }

    startTransition(async () => {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password })
      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
        setTimeout(() => router.push('/dashboard'), 2000)
      }
    })
  }

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
            새 비밀번호 설정
          </h1>
          <p className="text-sm" style={{ color: 'hsl(var(--text-secondary))' }}>
            사용할 새 비밀번호를 입력하세요.
          </p>
        </div>

        {success ? (
          <div
            className="text-sm text-center px-4 py-3 rounded-md"
            style={{
              backgroundColor: 'hsl(var(--success) / 0.1)',
              color: 'hsl(var(--success))',
              border: '1px solid hsl(var(--success) / 0.2)',
            }}
          >
            비밀번호가 변경되었습니다. 대시보드로 이동합니다...
          </div>
        ) : (
          <div
            className="rounded-lg p-6 space-y-4"
            style={{
              backgroundColor: 'hsl(var(--surface))',
              border: '1px solid hsl(var(--border))',
            }}
          >
            {error && (
              <p
                className="text-xs text-center px-3 py-2 rounded-md"
                style={{
                  backgroundColor: 'hsl(4 72% 51% / 0.1)',
                  color: 'hsl(4 72% 51%)',
                }}
              >
                {error}
              </p>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium"
                  style={{ color: 'hsl(var(--text-primary))' }}
                >
                  새 비밀번호
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  minLength={8}
                  className="w-full px-3 py-2 rounded-md text-sm outline-none"
                  style={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    color: 'hsl(var(--text-primary))',
                  }}
                />
                <p className="text-xs" style={{ color: 'hsl(var(--text-muted))' }}>최소 8자 이상</p>
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="confirm"
                  className="block text-sm font-medium"
                  style={{ color: 'hsl(var(--text-primary))' }}
                >
                  비밀번호 확인
                </label>
                <input
                  id="confirm"
                  name="confirm"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="w-full px-3 py-2 rounded-md text-sm outline-none"
                  style={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    color: 'hsl(var(--text-primary))',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-2 px-4 rounded-md text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ backgroundColor: 'hsl(var(--accent))' }}
              >
                {isPending ? '변경 중...' : '비밀번호 변경'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
