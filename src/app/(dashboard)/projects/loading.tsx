export default function ProjectsLoading() {
  return (
    <div className="space-y-4 max-w-5xl animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-8 w-32 rounded-md" style={{ backgroundColor: 'hsl(var(--border))' }} />
        <div className="h-9 w-28 rounded-md" style={{ backgroundColor: 'hsl(var(--border))' }} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-36 rounded-lg"
            style={{ backgroundColor: 'hsl(var(--surface))', border: '1px solid hsl(var(--border))' }}
          />
        ))}
      </div>
    </div>
  )
}
