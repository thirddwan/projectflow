'use server'

import { revalidatePath } from 'next/cache'
import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'
import type { WorkspaceMemberRole } from '@/types'

// 모듈 최상단 초기화 금지 — 환경 변수 미설정 시 페이지 로드 오류 방지
function getResend() {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('RESEND_API_KEY가 설정되지 않았습니다.')
  return new Resend(key)
}

async function getMyWorkspace(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data } = await supabase
    .from('workspace_members')
    .select('workspace_id, role')
    .eq('user_id', userId)
    .order('joined_at', { ascending: true })
    .limit(1)
    .single()
  return data
}

export async function getTeamData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const membership = await getMyWorkspace(supabase, user.id)
  if (!membership) return null

  const [{ data: members }, { data: workspace }, { data: invitations }] = await Promise.all([
    supabase
      .from('workspace_members')
      .select('id, role, joined_at, user:users(id, name, email, avatar_url)')
      .eq('workspace_id', membership.workspace_id)
      .order('joined_at', { ascending: true }),
    supabase
      .from('workspaces')
      .select('id, name')
      .eq('id', membership.workspace_id)
      .single(),
    supabase
      .from('invitations')
      .select('id, email, role, status, expires_at, created_at')
      .eq('workspace_id', membership.workspace_id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false }),
  ])

  return {
    members: members ?? [],
    workspace,
    invitations: invitations ?? [],
    myRole: membership.role,
    currentUserId: user.id,
  }
}

export async function inviteMember(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요합니다.' }

  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const role = (formData.get('role') as WorkspaceMemberRole) || 'member'

  if (!email) return { error: '이메일을 입력해주세요.' }

  const membership = await getMyWorkspace(supabase, user.id)
  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    return { error: '팀원 초대 권한이 없습니다.' }
  }

  // 이미 워크스페이스 멤버인지 확인
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single()

  if (existingUser) {
    const { data: existingMember } = await supabase
      .from('workspace_members')
      .select('id')
      .eq('workspace_id', membership.workspace_id)
      .eq('user_id', existingUser.id)
      .single()
    if (existingMember) return { error: '이미 워크스페이스 멤버입니다.' }
  }

  // 이미 초대됐는지 확인
  const { data: existingInvite } = await supabase
    .from('invitations')
    .select('id')
    .eq('workspace_id', membership.workspace_id)
    .eq('email', email)
    .eq('status', 'pending')
    .single()

  if (existingInvite) return { error: '이미 초대가 발송된 이메일입니다.' }

  const { data: workspace } = await supabase
    .from('workspaces')
    .select('name')
    .eq('id', membership.workspace_id)
    .single()

  // 초대 레코드 생성
  const { data: invitation, error } = await supabase
    .from('invitations')
    .insert({ workspace_id: membership.workspace_id, email, role })
    .select('token')
    .single()

  if (error) return { error: error.message }

  // Resend 이메일 발송
  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/invite/${invitation.token}`
  const workspaceName = workspace?.name ?? 'ProjectFlow'

  try {
    const resend = getResend()
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: email,
      subject: `[ProjectFlow] ${workspaceName} 워크스페이스에 초대되었습니다`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
          <div style="background:#2383E2; width:48px; height:48px; border-radius:12px; display:flex; align-items:center; justify-content:center; margin-bottom:24px;">
            <span style="color:#fff; font-weight:700; font-size:18px;">PF</span>
          </div>
          <h1 style="font-size:22px; font-weight:700; color:#1a1a1a; margin:0 0 8px;">워크스페이스 초대</h1>
          <p style="color:#555; font-size:15px; line-height:1.6; margin:0 0 24px;">
            <strong>${workspaceName}</strong> 워크스페이스에 초대되었습니다.<br/>
            아래 버튼을 클릭해 초대를 수락하세요.
          </p>
          <a href="${inviteUrl}" style="display:inline-block; background:#2383E2; color:#fff; text-decoration:none; padding:12px 28px; border-radius:8px; font-size:15px; font-weight:600;">
            초대 수락하기
          </a>
          <p style="color:#999; font-size:13px; margin-top:24px;">
            이 링크는 7일 후 만료됩니다. 초대를 원하지 않으면 무시하세요.
          </p>
        </div>
      `,
    })
  } catch (e) {
    console.error('초대 이메일 발송 실패:', e)
    // 이메일 발송 실패해도 초대 레코드는 유지
  }

  revalidatePath('/team')
  return { success: true }
}

export async function cancelInvitation(invitationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요합니다.' }

  const { error } = await supabase
    .from('invitations')
    .update({ status: 'expired' })
    .eq('id', invitationId)

  if (error) return { error: error.message }
  revalidatePath('/team')
  return { success: true }
}

export async function removeMember(memberId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요합니다.' }

  const membership = await getMyWorkspace(supabase, user.id)
  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    return { error: '멤버 삭제 권한이 없습니다.' }
  }

  // owner는 삭제 불가
  const { data: target } = await supabase
    .from('workspace_members')
    .select('role, user_id')
    .eq('id', memberId)
    .single()

  if (target?.role === 'owner') return { error: '워크스페이스 소유자는 삭제할 수 없습니다.' }
  if (target?.user_id === user.id) return { error: '자기 자신은 삭제할 수 없습니다.' }

  const { error } = await supabase
    .from('workspace_members')
    .delete()
    .eq('id', memberId)

  if (error) return { error: error.message }
  revalidatePath('/team')
  return { success: true }
}
