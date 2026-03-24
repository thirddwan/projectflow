'use client'

interface AcceptInviteClientProps {
  workspaceName: string
  inviteeEmail: string
  token: string
}

export function AcceptInviteClient({ workspaceName, inviteeEmail, token }: AcceptInviteClientProps) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: 'hsl(var(--background))' }}
    >
      <div className="w-full max-w-sm space-y-6">
        {/* 로고 */}
        <div className="text-center space-y-3">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto"
            style={{ backgroundColor: 'hsl(var(--accent))' }}
          >
            <span className="text-white text-xl font-bold">PF</span>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'hsl(var(--text-primary))' }}>
            초대를 받았습니다
          </h1>
          <p className="text-sm" style={{ color: 'hsl(var(--text-secondary))' }}>
            <strong>{workspaceName}</strong> 워크스페이스에 초대되었습니다.
            <br />
            로그인하거나 회원가입하여 참여하세요.
          </p>
        </div>

        <div
          className="rounded-lg p-5 space-y-3"
          style={{ backgroundColor: 'hsl(var(--surface))', border: '1px solid hsl(var(--border))' }}
        >
          <p className="text-xs text-center" style={{ color: 'hsl(var(--text-muted))' }}>
            초대된 이메일: <strong style={{ color: 'hsl(var(--text-secondary))' }}>{inviteeEmail}</strong>
          </p>

          <a
            href={`/login?redirect=/auth/invite/${token}`}
            className="block w-full py-2.5 px-4 rounded-md text-sm font-medium text-white text-center transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'hsl(var(--accent))' }}
          >
            로그인하여 참여
          </a>
          <a
            href={`/register?email=${encodeURIComponent(inviteeEmail)}&redirect=/auth/invite/${token}`}
            className="block w-full py-2.5 px-4 rounded-md text-sm font-medium text-center transition-colors"
            style={{
              border: '1px solid hsl(var(--border))',
              color: 'hsl(var(--text-secondary))',
            }}
          >
            회원가입 후 참여
          </a>
        </div>
      </div>
    </div>
  )
}
