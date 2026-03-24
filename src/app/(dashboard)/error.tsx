'use client'

import { useEffect } from 'react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4">
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
        style={{ backgroundColor: 'hsl(4 72% 51% / 0.1)' }}
      >
        ⚠️
      </div>
      <h2 className="text-lg font-semibold" style={{ color: 'hsl(var(--text-primary))' }}>
        오류가 발생했습니다
      </h2>
      <p className="text-sm text-center max-w-sm" style={{ color: 'hsl(var(--text-secondary))' }}>
        {error.message || '알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'}
      </p>
      <button
        onClick={reset}
        className="px-4 py-2 rounded-md text-sm font-medium text-white"
        style={{ backgroundColor: 'hsl(var(--accent))' }}
      >
        다시 시도
      </button>
    </div>
  )
}
