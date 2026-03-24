export default function ProjectDetailLoading() {
  return (
    <div className="space-y-6 max-w-5xl animate-pulse">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl" style={{ backgroundColor: 'hsl(var(--border))' }} />
        <div className="space-y-2">
          <div className="h-7 w-48 rounded-md" style={{ backgroundColor: 'hsl(var(--border))' }} />
          <div className="h-4 w-64 rounded-md" style={{ backgroundColor: 'hsl(var(--border))' }} />
        </div>
      </div>
      {/* 진행률 카드 */}
      <div
        className="rounded-lg p-4 space-y-3"
        style={{ backgroundColor: 'hsl(var(--surface))', border: '1px solid hsl(var(--border))' }}
      >
        <div className="h-4 w-full rounded-full" style={{ backgroundColor: 'hsl(var(--border))' }} />
        <div className="h-2 w-full rounded-full" style={{ backgroundColor: 'hsl(var(--border))' }} />
      </div>
      {/* 태스크 목록 */}
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-14 rounded-lg"
            style={{ backgroundColor: 'hsl(var(--surface))', border: '1px solid hsl(var(--border))' }}
          />
        ))}
      </div>
    </div>
  )
}
