'use client'

import { useState, useTransition } from 'react'
import { UserPlus, Mail, Crown, Shield, User, Trash2, X, Clock } from 'lucide-react'

const ROLE_LABEL: Record<string, string> = {
  owner: '소유자', admin: '관리자', member: '멤버', viewer: '뷰어',
}
const ROLE_ICON: Record<string, React.ElementType> = {
  owner: Crown, admin: Shield, member: User, viewer: User,
}
const ROLE_COLOR: Record<string, string> = {
  owner: 'hsl(43 100% 48%)', admin: 'hsl(211 80% 51%)',
  member: 'hsl(var(--text-secondary))', viewer: 'hsl(var(--text-muted))',
}

interface TeamData {
  members: Array<{
    id: string
    role: string
    joined_at?: string
    user: { id: string; name: string; email: string; avatar_url?: string } | null
  }>
  workspace: { id: string; name: string } | null
  invitations: Array<{
    id: string; email: string; role: string; status: string; expires_at: string; created_at: string
  }>
  myRole: string
  currentUserId: string
}

interface TeamClientProps {
  data: TeamData
  inviteMember: (formData: FormData) => Promise<{ error?: string; success?: boolean }>
  cancelInvitation: (id: string) => Promise<{ error?: string; success?: boolean }>
  removeMember: (id: string) => Promise<{ error?: string; success?: boolean }>
}

export function TeamClient({ data, inviteMember, cancelInvitation, removeMember }: TeamClientProps) {
  const [isPending, startTransition] = useTransition()
  const [inviteError, setInviteError] = useState('')
  const [inviteSuccess, setInviteSuccess] = useState(false)
  const canManage = ['owner', 'admin'].includes(data.myRole)

  function handleInvite(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setInviteError('')
    setInviteSuccess(false)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await inviteMember(formData)
      if (result?.error) {
        setInviteError(result.error)
      } else {
        setInviteSuccess(true)
        ;(e.target as HTMLFormElement).reset()
        setTimeout(() => setInviteSuccess(false), 3000)
      }
    })
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'hsl(var(--text-primary))' }}>
          팀 관리
        </h1>
        <p className="text-sm mt-1" style={{ color: 'hsl(var(--text-secondary))' }}>
          {data.workspace?.name} · 멤버 {data.members.length}명
        </p>
      </div>

      {/* 초대 폼 (owner/admin만) */}
      {canManage && (
        <div
          className="rounded-lg p-5 space-y-4"
          style={{ backgroundColor: 'hsl(var(--surface))', border: '1px solid hsl(var(--border))' }}
        >
          <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'hsl(var(--text-primary))' }}>
            <UserPlus size={16} />
            팀원 초대
          </h2>

          {inviteError && (
            <p className="text-xs px-3 py-2 rounded-md"
              style={{ backgroundColor: 'hsl(4 72% 51% / 0.1)', color: 'hsl(4 72% 51%)' }}>
              {inviteError}
            </p>
          )}
          {inviteSuccess && (
            <p className="text-xs px-3 py-2 rounded-md"
              style={{ backgroundColor: 'hsl(var(--success) / 0.1)', color: 'hsl(var(--success))' }}>
              초대 이메일을 발송했습니다.
            </p>
          )}

          <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-2">
            <input
              name="email"
              type="email"
              placeholder="이메일 주소"
              required
              className="flex-1 px-3 py-2 rounded-md text-sm outline-none"
              style={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                color: 'hsl(var(--text-primary))',
              }}
            />
            <select
              name="role"
              defaultValue="member"
              className="px-3 py-2 rounded-md text-sm outline-none"
              style={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                color: 'hsl(var(--text-secondary))',
              }}
            >
              <option value="admin">관리자</option>
              <option value="member">멤버</option>
              <option value="viewer">뷰어</option>
            </select>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-white disabled:opacity-60"
              style={{ backgroundColor: 'hsl(var(--accent))' }}
            >
              <Mail size={14} />
              {isPending ? '발송 중...' : '초대 보내기'}
            </button>
          </form>
        </div>
      )}

      {/* 멤버 목록 */}
      <div
        className="rounded-lg overflow-hidden"
        style={{ border: '1px solid hsl(var(--border))' }}
      >
        <div
          className="px-4 py-3 text-xs font-semibold uppercase tracking-wide"
          style={{
            backgroundColor: 'hsl(var(--surface))',
            borderBottom: '1px solid hsl(var(--border))',
            color: 'hsl(var(--text-muted))',
          }}
        >
          현재 멤버 ({data.members.length})
        </div>
        {data.members.map((member, i) => {
          const RoleIcon = ROLE_ICON[member.role] ?? User
          const isMe = member.user?.id === data.currentUserId
          return (
            <div
              key={member.id}
              className="flex items-center gap-3 px-4 py-3"
              style={{
                borderBottom: i < data.members.length - 1 ? '1px solid hsl(var(--border))' : 'none',
                backgroundColor: 'hsl(var(--background))',
              }}
            >
              {/* 아바타 */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                style={{ backgroundColor: ROLE_COLOR[member.role] }}
              >
                {member.user?.name?.charAt(0).toUpperCase() ?? '?'}
              </div>

              {/* 정보 */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: 'hsl(var(--text-primary))' }}>
                  {member.user?.name ?? '알 수 없음'}
                  {isMe && (
                    <span className="ml-1.5 text-xs" style={{ color: 'hsl(var(--text-muted))' }}>(나)</span>
                  )}
                </p>
                <p className="text-xs truncate" style={{ color: 'hsl(var(--text-muted))' }}>
                  {member.user?.email}
                </p>
              </div>

              {/* 역할 */}
              <span
                className="flex items-center gap-1 text-xs px-2 py-1 rounded-full shrink-0"
                style={{
                  color: ROLE_COLOR[member.role],
                  backgroundColor: `${ROLE_COLOR[member.role]}18`,
                }}
              >
                <RoleIcon size={11} />
                {ROLE_LABEL[member.role]}
              </span>

              {/* 삭제 (owner/admin만, owner는 삭제 불가) */}
              {canManage && !isMe && member.role !== 'owner' && (
                <button
                  onClick={() => startTransition(() => removeMember(member.id))}
                  disabled={isPending}
                  className="p-1.5 rounded-md transition-colors hover:bg-surface-hover disabled:opacity-40"
                  title="멤버 삭제"
                  style={{ color: 'hsl(var(--text-muted))' }}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* 대기 중인 초대 */}
      {data.invitations.length > 0 && (
        <div
          className="rounded-lg overflow-hidden"
          style={{ border: '1px solid hsl(var(--border))' }}
        >
          <div
            className="px-4 py-3 text-xs font-semibold uppercase tracking-wide"
            style={{
              backgroundColor: 'hsl(var(--surface))',
              borderBottom: '1px solid hsl(var(--border))',
              color: 'hsl(var(--text-muted))',
            }}
          >
            대기 중인 초대 ({data.invitations.length})
          </div>
          {data.invitations.map((inv, i) => (
            <div
              key={inv.id}
              className="flex items-center gap-3 px-4 py-3"
              style={{
                borderBottom: i < data.invitations.length - 1 ? '1px solid hsl(var(--border))' : 'none',
                backgroundColor: 'hsl(var(--background))',
              }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: 'hsl(var(--surface-hover))' }}
              >
                <Clock size={14} style={{ color: 'hsl(var(--text-muted))' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm" style={{ color: 'hsl(var(--text-primary))' }}>{inv.email}</p>
                <p className="text-xs" style={{ color: 'hsl(var(--text-muted))' }}>
                  {new Date(inv.expires_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })} 만료
                </p>
              </div>
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ backgroundColor: 'hsl(var(--surface-hover))', color: 'hsl(var(--text-muted))' }}
              >
                {ROLE_LABEL[inv.role]}
              </span>
              {canManage && (
                <button
                  onClick={() => startTransition(() => cancelInvitation(inv.id))}
                  disabled={isPending}
                  className="p-1.5 rounded-md transition-colors hover:bg-surface-hover disabled:opacity-40"
                  title="초대 취소"
                  style={{ color: 'hsl(var(--text-muted))' }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
