import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { ProjectForm } from '@/components/projects/project-form'
import { createProject } from '../actions'

export const metadata: Metadata = { title: '새 프로젝트' }

export default function NewProjectPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/projects"
          className="flex items-center gap-1 text-sm hover:underline"
          style={{ color: 'hsl(var(--text-secondary))' }}
        >
          <ChevronLeft size={16} />
          프로젝트 목록
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'hsl(var(--text-primary))' }}>
          새 프로젝트
        </h1>
        <p className="text-sm mt-1" style={{ color: 'hsl(var(--text-secondary))' }}>
          프로젝트를 생성하고 팀과 함께 시작하세요
        </p>
      </div>

      <ProjectForm action={createProject} submitLabel="프로젝트 생성" />
    </div>
  )
}
