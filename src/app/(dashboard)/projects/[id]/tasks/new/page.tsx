import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { notFound } from 'next/navigation'
import { getProject } from '@/app/(dashboard)/projects/actions'
import { createTask } from '@/app/(dashboard)/tasks/actions'
import { TaskForm } from '@/components/tasks/task-form'

export const metadata: Metadata = { title: 'Task 추가' }

export default async function NewTaskPage({ params }: { params: { id: string } }) {
  const project = await getProject(params.id)
  if (!project) notFound()

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/projects/${params.id}`}
          className="flex items-center gap-1 text-sm hover:underline"
          style={{ color: 'hsl(var(--text-secondary))' }}
        >
          <ChevronLeft size={16} />
          {project.name}
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'hsl(var(--text-primary))' }}>
          새 Task
        </h1>
      </div>

      <TaskForm projectId={params.id} action={createTask} submitLabel="Task 생성" />
    </div>
  )
}
