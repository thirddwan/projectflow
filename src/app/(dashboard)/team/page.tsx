import type { Metadata } from 'next'
import { getTeamData, inviteMember, cancelInvitation, removeMember } from './actions'
import { TeamClient } from '@/components/team/team-client'

export const metadata: Metadata = { title: '팀 관리' }

export default async function TeamPage() {
  const data = await getTeamData()

  if (!data) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm" style={{ color: 'hsl(var(--text-muted))' }}>
          워크스페이스 정보를 불러올 수 없습니다.
        </p>
      </div>
    )
  }

  return (
    <TeamClient
      data={data}
      inviteMember={inviteMember}
      cancelInvitation={cancelInvitation}
      removeMember={removeMember}
    />
  )
}
