import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 날짜 포맷팅
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(date))
}

// 상대적 날짜 (예: 3일 전)
export function formatRelativeDate(date: string | Date): string {
  const now = new Date()
  const target = new Date(date)
  const diff = now.getTime() - target.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor(diff / (1000 * 60))

  if (minutes < 1) return '방금 전'
  if (hours < 1) return `${minutes}분 전`
  if (days < 1) return `${hours}시간 전`
  if (days < 7) return `${days}일 전`
  return formatDate(date)
}

// D-Day 계산
export function calcDDay(dueDate: string): string {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)
  const diff = Math.floor((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (diff < 0) return `D+${Math.abs(diff)} 지연`
  if (diff === 0) return 'D-Day'
  return `D-${diff}`
}

// 파일 크기 포맷
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// 우선순위 색상
export const PRIORITY_COLORS = {
  urgent: 'text-red-500 bg-red-50 dark:bg-red-950',
  high: 'text-orange-500 bg-orange-50 dark:bg-orange-950',
  normal: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-950',
  low: 'text-green-500 bg-green-50 dark:bg-green-950',
} as const

// 우선순위 한국어
export const PRIORITY_LABELS = {
  urgent: '긴급',
  high: '높음',
  normal: '보통',
  low: '낮음',
} as const

// Task 상태 설정
export const STATUS_CONFIG = {
  backlog: { label: '백로그', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
  todo: { label: '할 일', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
  in_progress: { label: '진행 중', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' },
  review: { label: '검토', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' },
  done: { label: '완료', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
} as const

// 프로젝트 색상
export const PROJECT_COLORS = {
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
  green: 'bg-green-500',
  orange: 'bg-orange-500',
  red: 'bg-red-500',
  pink: 'bg-pink-500',
  yellow: 'bg-yellow-500',
} as const
