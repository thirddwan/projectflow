'use client'

import { useTransition } from 'react'
import { Trash2 } from 'lucide-react'
import { deleteProject } from '@/app/(dashboard)/projects/actions'

interface Props {
  projectId: string
  projectName: string
}

export function DeleteProjectButton({ projectId, projectName }: Props) {
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm(`"${projectName}" 프로젝트를 삭제하시겠습니까?\n\n모든 Task와 데이터가 함께 삭제됩니다.`)) return
    startTransition(async () => { await deleteProject(projectId) })
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors hover:bg-red-50 dark:hover:bg-red-950 disabled:opacity-50"
      style={{ border: '1px solid hsl(var(--border))', color: 'hsl(var(--danger))' }}
    >
      <Trash2 size={15} />
    </button>
  )
}
