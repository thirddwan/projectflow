'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import type { Task, Project } from '@/types'

type ViewMode = 'Day' | 'Week' | 'Month'

const COL_WIDTH: Record<ViewMode, number> = { Day: 44, Week: 140, Month: 110 }
const ROW_HEIGHT = 36
const HEADER_H = 52
const LABEL_W = 160

const STATUS_COLOR: Record<string, string> = {
  backlog: '#94a3b8',
  todo: '#60a5fa',
  in_progress: '#f59e0b',
  review: '#a78bfa',
  done: '#34d399',
}

const MONTHS_KO = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']

/* ---- date helpers ---- */
function d0(s: string): Date {
  const [y, m, day] = s.split('T')[0].split('-').map(Number)
  return new Date(y, m - 1, day)
}
function addDays(d: Date, n: number): Date {
  const r = new Date(d); r.setDate(d.getDate() + n); return r
}
function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1)
}
function dayDiff(a: Date, b: Date): number {
  return Math.round((a.getTime() - b.getTime()) / 86400000)
}
function weekStart(d: Date): Date {
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const r = new Date(d); r.setDate(d.getDate() + diff)
  r.setHours(0, 0, 0, 0); return r
}
function monthStart(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}
function monthDiff(a: Date, b: Date): number {
  return (a.getFullYear() - b.getFullYear()) * 12 + (a.getMonth() - b.getMonth())
}

/* ---- column generation ---- */
function genColumns(rangeStart: Date, rangeEnd: Date, mode: ViewMode) {
  const cols: { date: Date; label: string; groupLabel?: string; isNewGroup?: boolean }[] = []
  if (mode === 'Day') {
    let cur = new Date(rangeStart)
    while (cur <= rangeEnd) {
      const isNewGroup = cur.getDate() === 1
      const groupLabel = isNewGroup ? MONTHS_KO[cur.getMonth()] + ' ' + cur.getFullYear() : undefined
      cols.push({ date: new Date(cur), label: String(cur.getDate()), groupLabel, isNewGroup })
      cur = addDays(cur, 1)
    }
  } else if (mode === 'Week') {
    let cur = weekStart(rangeStart)
    while (cur <= rangeEnd) {
      const label = `${cur.getMonth()+1}/${cur.getDate()}`
      const isNewGroup = cur.getDate() <= 7
      const groupLabel = isNewGroup ? MONTHS_KO[cur.getMonth()] + ' ' + cur.getFullYear() : undefined
      cols.push({ date: new Date(cur), label, groupLabel, isNewGroup })
      cur = addDays(cur, 7)
    }
  } else {
    let cur = monthStart(rangeStart)
    while (cur <= rangeEnd) {
      const isNewGroup = cur.getMonth() === 0
      const groupLabel = isNewGroup ? String(cur.getFullYear()) : undefined
      cols.push({ date: new Date(cur), label: MONTHS_KO[cur.getMonth()], groupLabel, isNewGroup })
      cur = addMonths(cur, 1)
    }
  }
  return cols
}

/* ---- bar position ---- */
function barPos(taskStart: Date, taskEnd: Date, rangeStart: Date, mode: ViewMode, cw: number) {
  if (mode === 'Day') {
    const left = dayDiff(taskStart, rangeStart) * cw
    const width = Math.max(dayDiff(taskEnd, taskStart), 1) * cw
    return { left, width }
  } else if (mode === 'Week') {
    const ws = weekStart(rangeStart)
    const tsw = weekStart(taskStart)
    const leftWeeks = Math.round(dayDiff(tsw, ws) / 7)
    const dayOffset = dayDiff(taskStart, tsw)
    const left = leftWeeks * cw + (dayOffset / 7) * cw
    const durationDays = Math.max(dayDiff(taskEnd, taskStart), 1)
    const width = (durationDays / 7) * cw
    return { left, width }
  } else {
    const ms = monthStart(rangeStart)
    const left = monthDiff(monthStart(taskStart), ms) * cw
    const dur = Math.max(monthDiff(monthStart(taskEnd), monthStart(taskStart)), 1)
    return { left, width: Math.max(dur * cw, cw * 0.5) }
  }
}

/* ---- today pos ---- */
function todayPos(rangeStart: Date, mode: ViewMode, cw: number): number {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  if (mode === 'Day') return dayDiff(today, rangeStart) * cw + cw / 2
  if (mode === 'Week') {
    const ws = weekStart(rangeStart)
    const tw = weekStart(today)
    const weeks = Math.round(dayDiff(tw, ws) / 7)
    const dayOff = dayDiff(today, tw)
    return weeks * cw + (dayOff / 7) * cw + cw / 2
  }
  const ms = monthStart(rangeStart)
  const tm = monthStart(today)
  return monthDiff(tm, ms) * cw + cw / 2
}

interface GanttChartProps { tasks: Task[]; project: Project }

export function GanttChart({ tasks, project }: GanttChartProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('Week')
  const scrollRef = useRef<HTMLDivElement>(null)
  // FIX-04: 헤더를 별도 ref로 관리하여 scroll sync (sticky + overflow 충돌 해결)
  const headerScrollRef = useRef<HTMLDivElement>(null)

  /* build rows */
  const rows = useMemo(() => {
    const result: { id: string; title: string; start: Date; end: Date; status: string }[] = []
    if (project.start_date || project.end_date) {
      const s = project.start_date ? d0(project.start_date) : d0(project.end_date!)
      const e = project.end_date ? d0(project.end_date) : addDays(s, 7)
      result.push({ id: `proj-${project.id}`, title: project.name, start: s, end: e, status: 'project' })
    }
    for (const t of tasks) {
      if (!t.start_date && !t.due_date) continue
      const s = t.start_date ? d0(t.start_date) : d0(t.due_date!)
      const rawEnd = t.due_date ? d0(t.due_date) : addDays(s, 1)
      const e = rawEnd > s ? rawEnd : addDays(s, 1)
      result.push({ id: t.id, title: t.title, start: s, end: e, status: t.status })
    }
    return result
  }, [tasks, project])

  /* date range */
  const { rangeStart, rangeEnd } = useMemo(() => {
    if (rows.length === 0) {
      const today = new Date(); today.setHours(0, 0, 0, 0)
      return { rangeStart: addDays(today, -14), rangeEnd: addDays(today, 30) }
    }
    const minDate = rows.reduce((a, r) => r.start < a ? r.start : a, rows[0].start)
    const maxDate = rows.reduce((a, r) => r.end > a ? r.end : a, rows[0].end)
    const pad = viewMode === 'Day' ? 7 : viewMode === 'Week' ? 21 : 45
    return { rangeStart: addDays(minDate, -pad), rangeEnd: addDays(maxDate, pad) }
  }, [rows, viewMode])

  const cw = COL_WIDTH[viewMode]
  const cols = useMemo(() => genColumns(rangeStart, rangeEnd, viewMode), [rangeStart, rangeEnd, viewMode])
  const totalW = cols.length * cw
  const todayX = useMemo(() => todayPos(rangeStart, viewMode, cw), [rangeStart, viewMode, cw])

  /* scroll to today on mount / viewMode change */
  useEffect(() => {
    if (!scrollRef.current) return
    const targetX = todayX - scrollRef.current.clientWidth / 2 + LABEL_W / 2
    scrollRef.current.scrollLeft = Math.max(0, targetX)
  }, [viewMode, todayX])

  /* FIX-04: 바디 스크롤 시 헤더도 동기화 */
  function handleBodyScroll() {
    if (headerScrollRef.current && scrollRef.current) {
      headerScrollRef.current.scrollLeft = scrollRef.current.scrollLeft
    }
  }

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 rounded-lg"
        style={{ border: '1px dashed hsl(var(--border))' }}>
        <p className="text-sm" style={{ color: 'hsl(var(--text-muted))' }}>
          시작일 또는 마감일이 설정된 Task가 없습니다.
        </p>
        <p className="text-xs mt-1" style={{ color: 'hsl(var(--text-muted))' }}>
          Task에 날짜를 추가하면 타임라인이 표시됩니다.
        </p>
      </div>
    )
  }

  /* group labels */
  const groups: { label: string; colStart: number; span: number }[] = []
  cols.forEach((col, i) => {
    if (col.isNewGroup && col.groupLabel) {
      if (groups.length > 0) groups[groups.length - 1].span = i - groups[groups.length - 1].colStart
      groups.push({ label: col.groupLabel, colStart: i, span: 1 })
    }
  })
  if (groups.length > 0) groups[groups.length - 1].span = cols.length - groups[groups.length - 1].colStart
  if (groups.length === 0 && cols.length > 0) {
    const firstCol = cols[0]
    const label = viewMode === 'Month'
      ? String(firstCol.date.getFullYear())
      : MONTHS_KO[firstCol.date.getMonth()] + ' ' + firstCol.date.getFullYear()
    groups.push({ label, colStart: 0, span: cols.length })
  }

  const VIEW_MODES: ViewMode[] = ['Day', 'Week', 'Month']

  return (
    <div className="space-y-3">
      {/* view mode selector */}
      <div className="flex items-center gap-1 p-1 rounded-lg w-fit"
        style={{ backgroundColor: 'hsl(var(--surface))', border: '1px solid hsl(var(--border))' }}>
        {VIEW_MODES.map((m) => (
          <button key={m} onClick={() => setViewMode(m)}
            className="px-3 py-1 rounded-md text-sm font-medium transition-colors"
            style={{
              backgroundColor: viewMode === m ? 'hsl(var(--accent))' : 'transparent',
              color: viewMode === m ? '#fff' : 'hsl(var(--text-secondary))',
            }}>
            {m === 'Day' ? '일간' : m === 'Week' ? '주간' : '월간'}
          </button>
        ))}
      </div>

      {/* chart */}
      <div className="rounded-lg overflow-hidden" style={{ border: '1px solid hsl(var(--border))' }}>
        {/* FIX-04: 헤더와 바디를 분리하여 sticky 대신 scroll sync 방식으로 처리 */}
        <div style={{ display: 'flex' }}>

          {/* ---- 고정 레이블 컬럼 ---- */}
          <div style={{ width: LABEL_W, flexShrink: 0, borderRight: '1px solid hsl(var(--border))' }}>
            {/* 헤더 높이 맞춤 */}
            <div style={{
              height: HEADER_H,
              borderBottom: '1px solid hsl(var(--border))',
              backgroundColor: 'hsl(var(--surface))',
            }} />
            {/* task 레이블 */}
            {rows.map((row, i) => (
              <div key={row.id}
                style={{
                  height: ROW_HEIGHT,
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: 12,
                  paddingRight: 8,
                  fontSize: 12,
                  color: 'hsl(var(--text-primary))',
                  borderBottom: i < rows.length - 1 ? '1px solid hsl(var(--border))' : 'none',
                  backgroundColor: i % 2 === 0 ? 'hsl(var(--background))' : 'hsl(var(--surface))',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  fontWeight: row.status === 'project' ? 600 : 400,
                }}
              >
                {row.title}
              </div>
            ))}
          </div>

          {/* ---- 우측: 헤더 + 바디 (flex column) ---- */}
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

            {/* 헤더: overflowX hidden + JS scroll sync */}
            <div
              ref={headerScrollRef}
              style={{
                overflowX: 'hidden',
                flexShrink: 0,
                height: HEADER_H,
                backgroundColor: 'hsl(var(--surface))',
                borderBottom: '1px solid hsl(var(--border))',
              }}
            >
              <div style={{ width: totalW }}>
                {/* 월/연 레이블 */}
                <div style={{ height: 22, position: 'relative', borderBottom: '1px solid hsl(var(--border))' }}>
                  {groups.map((g) => (
                    <div key={g.label + g.colStart}
                      style={{
                        position: 'absolute',
                        left: g.colStart * cw,
                        width: g.span * cw,
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        paddingLeft: 8,
                        fontSize: 11,
                        fontWeight: 600,
                        color: 'hsl(var(--text-secondary))',
                        borderRight: '1px solid hsl(var(--border))',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                      }}
                    >{g.label}</div>
                  ))}
                </div>
                {/* 컬럼 레이블 */}
                <div style={{ height: 30, position: 'relative' }}>
                  {cols.map((col, i) => {
                    const today = new Date(); today.setHours(0, 0, 0, 0)
                    const isToday = viewMode === 'Day' && col.date.getTime() === today.getTime()
                    return (
                      <div key={i}
                        style={{
                          position: 'absolute',
                          left: i * cw,
                          width: cw,
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 11,
                          color: isToday ? '#fff' : 'hsl(var(--text-muted))',
                          backgroundColor: isToday ? 'hsl(var(--accent))' : 'transparent',
                          borderRadius: isToday ? 4 : 0,
                          fontWeight: isToday ? 700 : 400,
                        }}
                      >{col.label}</div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* 바디: 실제 스크롤 영역 */}
            <div
              ref={scrollRef}
              onScroll={handleBodyScroll}
              style={{ overflowX: 'auto', overflowY: 'hidden' }}
            >
              <div style={{ width: totalW, position: 'relative' }}>
                {/* 오늘 수직선 */}
                {todayX >= 0 && todayX <= totalW && (
                  <div style={{
                    position: 'absolute',
                    left: todayX,
                    top: 0,
                    bottom: 0,
                    width: 2,
                    backgroundColor: 'hsl(var(--accent))',
                    opacity: 0.5,
                    zIndex: 5,
                    pointerEvents: 'none',
                  }} />
                )}

                {rows.map((row, i) => {
                  const { left, width } = barPos(row.start, row.end, rangeStart, viewMode, cw)
                  const barColor = row.status === 'project'
                    ? '#6366f1'
                    : (STATUS_COLOR[row.status] ?? '#60a5fa')
                  return (
                    <div key={row.id}
                      style={{
                        height: ROW_HEIGHT,
                        position: 'relative',
                        borderBottom: i < rows.length - 1 ? '1px solid hsl(var(--border))' : 'none',
                        backgroundColor: i % 2 === 0 ? 'hsl(var(--background))' : 'hsl(var(--surface))',
                      }}
                    >
                      {/* 컬럼 그리드 라인 */}
                      {cols.map((_col, ci) => (
                        <div key={ci} style={{
                          position: 'absolute', left: ci * cw, top: 0, bottom: 0, width: 1,
                          backgroundColor: 'hsl(var(--border))', opacity: 0.5,
                        }} />
                      ))}
                      {/* 바 */}
                      <div style={{
                        position: 'absolute',
                        left,
                        width: Math.max(width, 4),
                        top: 6,
                        height: ROW_HEIGHT - 12,
                        backgroundColor: barColor,
                        borderRadius: 4,
                        zIndex: 2,
                        display: 'flex',
                        alignItems: 'center',
                        paddingLeft: 6,
                        overflow: 'hidden',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                      }}>
                        <span style={{
                          fontSize: 11, color: '#fff', fontWeight: 500,
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>
                          {width > 40 ? row.title : ''}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
