import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { getProjects } from './actions'
import { ProjectCard } from '@/components/projects/project-card'

export const metadata: Metadata = { title: '프로젝트' }

export default async function ProjectsPage() {
  const projects = await getProjects()

  return (
    <div className="space-y-6 max-w-5xl">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'hsl(var(--text-primary))' }}>
            프로젝트
          </h1>
          <p className="text-sm mt-1" style={{ color: 'hsl(var(--text-secondary))' }}>
            {projects.length}개의 프로젝트
          </p>
        </div>
        <Link
          href="/projects/new"
          className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-white"
          style={{ backgroundColor: 'hsl(var(--accent))' }}
        >
          <Plus size={16} />
          새 프로젝트
        </Link>
      </div>

      {/* 프로젝트 목록 */}
      {projects.length === 0 ? (
        <div
          className="text-center py-16 rounded-lg"
          style={{ border: '1px dashed hsl(var(--border))' }}
        >
          <p className="text-lg font-medium mb-2" style={{ color: 'hsl(var(--text-primary))' }}>
            프로젝트가 없습니다
          </p>
          <p className="text-sm mb-6" style={{ color: 'hsl(var(--text-muted))' }}>
            새 프로젝트를 만들어 팀과 함께 시작하세요
          </p>
          <Link
            href="/projects/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-white"
            style={{ backgroundColor: 'hsl(var(--accent))' }}
          >
            <Plus size={16} />
            첫 번째 프로젝트 만들기
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}
