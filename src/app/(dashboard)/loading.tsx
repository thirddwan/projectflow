export default function DashboardLoading() {
  return (
    <div className="space-y-4 max-w-5xl animate-pulse">
      <div className="h-8 w-48 rounded-md" style={{ backgroundColor: 'hsl(var(--border))' }} />
      <div className="h-4 w-64 rounded-md" style={{ backgroundColor: 'hsl(var(--border))' }} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-32 rounded-lg"
            style={{ backgroundColor: 'hsl(var(--surface))', border: '1px solid hsl(var(--border))' }}
          />
        ))}
      </div>
    </div>
  )
}
