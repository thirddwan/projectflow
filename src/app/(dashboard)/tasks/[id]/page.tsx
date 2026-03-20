import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { getTask } from '../actions'
import { TaskDetailClient } from '@/components/tasks/task-detail-client'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const task = await getTask(params.id)
  return { title: task?.title ?? 'Task' }
}

export default async function TaskDetailPage({ params }: { params: { id: string } }) {
  const task = await getTask(params.id)
  if (!task) notFound()

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <Link
          href={`/projects/${task.project_id}`}
          className="flex items-center gap-1 text-sm hover:underline"
          style={{ color: 'hsl(var(--text-secondary))' }}
        >
          <ChevronLeft size={16} />
          프로젝트로 돌아가기
        </Link>
      </div>

      <TaskDetailClient task={task} />
    </div>
  )
}
