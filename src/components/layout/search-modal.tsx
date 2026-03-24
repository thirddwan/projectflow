'use client'

import { useState, useEffect, useRef, useTransition, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, FolderOpen, CheckSquare, X, ArrowRight } from 'lucide-react'
import { globalSearch } from '@/app/(dashboard)/search/actions'

const COLOR_MAP: Record<string, string> = {
  blue: '#2383E2', purple: '#9333EA', green: '#16A34A',
  orange: '#EA580C', red: '#DC2626', pink: '#DB2777', yellow: '#CA8A04',
}
const STATUS_LABEL: Record<string, string> = {
  backlog: '백로그', todo: '할 일', in_progress: '진행 중', review: '검토', done: '완료',
}

interface SearchResult {
  projects: Array<{ id: string; name: string; color: string; status: string }>
  tasks: Array<{
    id: string; title: string; status: string; priority: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    project: any
  }>
}

export function SearchModal() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult>({ projects: [], tasks: [] })
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)

  // ⌘K / Ctrl+K 단축키
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((v) => !v)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  // 모달 열릴 때 input focus
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setQuery('')
      setResults({ projects: [], tasks: [] })
      setSelectedIdx(0)
    }
  }, [open])

  // 검색 디바운스
  const search = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!q.trim()) { setResults({ projects: [], tasks: [] }); return }
    debounceRef.current = setTimeout(() => {
      startTransition(async () => {
        const res = await globalSearch(q)
        setResults(res)
        setSelectedIdx(0)
      })
    }, 250)
  }, [])

  function handleQueryChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value)
    search(e.target.value)
  }

  // 전체 결과 flat list (키보드 탐색용)
  const allItems = [
    ...results.projects.map((p) => ({ type: 'project' as const, item: p })),
    ...results.tasks.map((t) => ({ type: 'task' as const, item: t })),
  ]

  function navigate(type: string, id: string) {
    setOpen(false)
    router.push(type === 'project' ? `/projects/${id}` : `/tasks/${id}`)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIdx((i) => Math.min(i + 1, allItems.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIdx((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && allItems[selectedIdx]) {
      const { type, item } = allItems[selectedIdx]
      navigate(type, item.id)
    }
  }

  if (!open) return null

  const hasResults = results.projects.length > 0 || results.tasks.length > 0
  let itemIdx = 0

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xl rounded-xl overflow-hidden shadow-2xl"
        style={{
          backgroundColor: 'hsl(var(--surface))',
          border: '1px solid hsl(var(--border))',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 검색 입력 */}
        <div
          className="flex items-center gap-3 px-4 py-3"
          style={{ borderBottom: hasResults || isPending ? '1px solid hsl(var(--border))' : 'none' }}
        >
          <Search size={16} style={{ color: 'hsl(var(--text-muted))', flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="프로젝트, Task 검색..."
            value={query}
            onChange={handleQueryChange}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: 'hsl(var(--text-primary))' }}
          />
          {query && (
            <button onClick={() => { setQuery(''); setResults({ projects: [], tasks: [] }) }}>
              <X size={14} style={{ color: 'hsl(var(--text-muted))' }} />
            </button>
          )}
          <kbd
            className="text-xs px-1.5 py-0.5 rounded hidden sm:block"
            style={{ backgroundColor: 'hsl(var(--border))', color: 'hsl(var(--text-muted))' }}
          >
            ESC
          </kbd>
        </div>

        {/* 결과 */}
        {(hasResults || (query && !isPending)) && (
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {!hasResults && query && !isPending && (
              <div className="px-4 py-8 text-center text-sm" style={{ color: 'hsl(var(--text-muted))' }}>
                "{query}"에 대한 결과가 없습니다.
              </div>
            )}

            {/* 프로젝트 */}
            {results.projects.length > 0 && (
              <div>
                <div
                  className="px-4 py-2 text-xs font-semibold uppercase tracking-wide"
                  style={{ color: 'hsl(var(--text-muted))', backgroundColor: 'hsl(var(--background))' }}
                >
                  프로젝트
                </div>
                {results.projects.map((project) => {
                  const idx = itemIdx++
                  const isSelected = selectedIdx === idx
                  return (
                    <button
                      key={project.id}
                      onClick={() => navigate('project', project.id)}
                      onMouseEnter={() => setSelectedIdx(idx)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
                      style={{
                        backgroundColor: isSelected ? 'hsl(var(--surface-hover))' : 'transparent',
                        color: 'hsl(var(--text-primary))',
                      }}
                    >
                      <div
                        className="w-5 h-5 rounded flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{ backgroundColor: COLOR_MAP[project.color] ?? COLOR_MAP.blue }}
                      >
                        {project.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="flex-1 text-sm truncate">{project.name}</span>
                      <ArrowRight size={13} style={{ color: 'hsl(var(--text-muted))' }} />
                    </button>
                  )
                })}
              </div>
            )}

            {/* Tasks */}
            {results.tasks.length > 0 && (
              <div>
                <div
                  className="px-4 py-2 text-xs font-semibold uppercase tracking-wide"
                  style={{ color: 'hsl(var(--text-muted))', backgroundColor: 'hsl(var(--background))' }}
                >
                  Tasks
                </div>
                {results.tasks.map((task) => {
                  const idx = itemIdx++
                  const isSelected = selectedIdx === idx
                  const proj = Array.isArray(task.project) ? task.project[0] : task.project
                  return (
                    <button
                      key={task.id}
                      onClick={() => navigate('task', task.id)}
                      onMouseEnter={() => setSelectedIdx(idx)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
                      style={{
                        backgroundColor: isSelected ? 'hsl(var(--surface-hover))' : 'transparent',
                        color: 'hsl(var(--text-primary))',
                      }}
                    >
                      <CheckSquare size={15} style={{ color: 'hsl(var(--text-muted))', flexShrink: 0 }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{task.title}</p>
                        {proj && (
                          <p className="text-xs truncate" style={{ color: 'hsl(var(--text-muted))' }}>
                            {proj.name}
                          </p>
                        )}
                      </div>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full shrink-0"
                        style={{ backgroundColor: 'hsl(var(--border))', color: 'hsl(var(--text-secondary))' }}
                      >
                        {STATUS_LABEL[task.status]}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* 빈 상태 힌트 */}
        {!query && (
          <div className="px-4 py-4 flex items-center gap-4 text-xs" style={{ color: 'hsl(var(--text-muted))' }}>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded" style={{ backgroundColor: 'hsl(var(--border))' }}>↑↓</kbd>
              탐색
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded" style={{ backgroundColor: 'hsl(var(--border))' }}>Enter</kbd>
              이동
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded" style={{ backgroundColor: 'hsl(var(--border))' }}>ESC</kbd>
              닫기
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
