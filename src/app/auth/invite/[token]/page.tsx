import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AcceptInviteClient } from '@/components/team/accept-invite-client'

export const metadata: Metadata = { title: '초대 수락' }

export default async function InvitePage({ params }: { params: { token: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 초대 조회
  const { data: invitation } = await supabase
    .from('invitations')
    .select('id, workspace_id, email, role, status, expires_at, workspace:workspaces(name)')
    .eq('token', params.token)
    .single()

  // 유효하지 않거나 만료된 초대
  if (!invitation || invitation.status !== 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: 'hsl(var(--background))' }}>
        <div className="w-full max-w-sm text-center space-y-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto"
            style={{ backgroundColor: 'hsl(4 72% 51% / 0.1)' }}>
            <span className="text-xl">⚠️</span>
          </div>
          <h1 className="text-xl font-bold" style={{ color: 'hsl(var(--text-primary))' }}>
            유효하지 않은 초대
          </h1>
          <p className="text-sm" style={{ color: 'hsl(var(--text-secondary))' }}>
            초대 링크가 만료됐거나 이미 사용된 링크입니다.
          </p>
          <a href="/login" className="inline-block text-sm hover:underline"
            style={{ color: 'hsl(var(--accent))' }}>
            로그인으로 이동
          </a>
        </div>
      </div>
    )
  }

  // 초대 만료 확인
  if (new Date(invitation.expires_at) < new Date()) {
    await supabase
      .from('invitations')
      .update({ status: 'expired' })
      .eq('id', invitation.id)

    return (
      <div className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: 'hsl(var(--background))' }}>
        <div className="w-full max-w-sm text-center space-y-4">
          <h1 className="text-xl font-bold" style={{ color: 'hsl(var(--text-primary))' }}>
            만료된 초대
          </h1>
          <p className="text-sm" style={{ color: 'hsl(var(--text-secondary))' }}>
            초대 링크가 만료되었습니다. 워크스페이스 관리자에게 재초대를 요청하세요.
          </p>
        </div>
      </div>
    )
  }

  // 이미 로그인한 경우 바로 수락 처리
  if (user) {
    // 이미 멤버인지 확인
    const { data: existingMember } = await supabase
      .from('workspace_members')
      .select('id')
      .eq('workspace_id', invitation.workspace_id)
      .eq('user_id', user.id)
      .single()

    if (!existingMember) {
      // 멤버 추가
      await supabase.from('workspace_members').insert({
        workspace_id: invitation.workspace_id,
        user_id: user.id,
        role: invitation.role,
        joined_at: new Date().toISOString(),
      })
    }
    // 초대 수락 처리
    await supabase
      .from('invitations')
      .update({ status: 'accepted' })
      .eq('id', invitation.id)

    redirect('/dashboard')
  }

  // 비로그인: 로그인/회원가입 유도
  const workspaceName = (invitation.workspace as { name?: string } | null)?.name ?? 'ProjectFlow'

  return (
    <AcceptInviteClient
      workspaceName={workspaceName}
      inviteeEmail={invitation.email}
      token={params.token}
    />
  )
}
