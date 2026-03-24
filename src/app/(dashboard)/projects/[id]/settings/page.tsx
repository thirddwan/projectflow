import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { getProject, updateProject } from '../../actions'
import { ProjectForm } from '@/components/projects/project-form'
import { DeleteProjectButton } from '@/components/projects/delete-project-button'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const project = await getProject(params.id)
  return { title: `${project?.name ?? '프로젝트'} — 설정` }
}

export default async function ProjectSettingsPage({ params }: { params: { id: string } }) {
  const project = await getProject(params.id)
  if (!project) notFound()

  async function handleUpdate(formData: FormData) {
    'use server'
    return updateProject(params.id, formData)
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* 뒤로 */}
      <Link
        href={`/projects/${params.id}`}
        className="flex items-center gap-1 text-sm hover:underline"
        style={{ color: 'hsl(var(--text-secondary))' }}
      >
        <ChevronLeft size={16} />
        {project.name}
      </Link>

      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'hsl(var(--text-primary))' }}>
          프로젝트 설정
        </h1>
        <p className="text-sm mt-1" style={{ color: 'hsl(var(--text-secondary))' }}>
          프로젝트 정보를 수정합니다.
        </p>
      </div>

      <ProjectForm
        project={project}
        action={handleUpdate}
        submitLabel="변경 사항 저장"
      />

      {/* 위험 구역 */}
      <div
        className="rounded-lg p-5 space-y-3"
        style={{
          border: '1px solid hsl(4 72% 51% / 0.3)',
          backgroundColor: 'hsl(4 72% 51% / 0.04)',
        }}
      >
        <h2 className="text-sm font-semibold" style={{ color: 'hsl(4 72% 51%)' }}>
          위험 구역
        </h2>
        <p className="text-xs" style={{ color: 'hsl(var(--text-secondary))' }}>
          프로젝트를 삭제하면 모든 Task, 체크리스트, 코멘트가 영구 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
        </p>
        <DeleteProjectButton projectId={project.id} projectName={project.name} />
      </div>
    </div>
  )
}
