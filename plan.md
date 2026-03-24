# ProjectFlow — 구현 계획서 (plan.md)

> 최종 업데이트: 2026-03-23
> 기준 브랜치: main | 현재 단계: Phase 1 MVP 완료 후 버그 수정 & Phase 2 진입

---

## 1. 제품 비전 요약

팀 프로젝트를 **타임라인 · 칸반 · 할 일 · 버그 리포트** 하나의 플랫폼에서 관리.
Google AdSense 광고 수익 → Freemium 유료 플랜으로 단계적 수익화.

---

## 2. 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | Next.js 14 (App Router) |
| 언어 | TypeScript 5 |
| 스타일링 | Tailwind CSS 3 + CSS Variables |
| 컴포넌트 | Radix UI primitives |
| 상태 관리 | Zustand 5 + TanStack Query 5 |
| DnD | @dnd-kit/core + @dnd-kit/sortable |
| 타임라인 | 커스텀 React Gantt (frappe-gantt 제거 예정) |
| DB / Auth | Supabase (PostgreSQL + SSR) |
| 이메일 | Resend |
| 배포 | Vercel |

---

## 3. 페이즈별 구현 계획

### Phase 0 — 버그 수정 (즉시)
> research.md에서 발견된 버그/문제 우선 해결

| ID | 항목 | 우선순위 | 상태 |
|----|------|----------|------|
| FIX-01 | Kanban: 중복 `SortableContext` 제거 | 🔴 Critical | ✅ 완료 |
| FIX-02 | Kanban: `updateTaskStatus` await 누락 + 에러 처리 | 🔴 Critical | ✅ 완료 |
| FIX-03 | Kanban: `handleDragEnd` 스테일 state 클로저 버그 | 🔴 Critical | ✅ 완료 |
| FIX-04 | Gantt: `position: sticky` + `overflow: hidden` 충돌 | 🟠 High | ✅ 완료 |
| FIX-05 | 데드 코드 제거: `frappe-gantt` npm + CSS + 타입 선언 | 🟡 Medium | ✅ 완료 |
| FIX-06 | Security: `updateProject` / `deleteProject` 소유권 확인 추가 | 🟠 High | ✅ 완료 |
| FIX-07 | Type: `WorkspaceMember.invited_at` 선택 필드로 수정 | 🟡 Medium | ✅ 완료 |

---

### Phase 1 — MVP 핵심 기능 (완료 기준 확인)

#### 1-1. 인증 (완료 ✅)
- [x] 이메일/비밀번호 회원가입 · 로그인
- [x] Supabase Auth 세션 관리 (SSR 쿠키)
- [x] 미들웨어 인증 가드
- [ ] 소셜 로그인 (Google) — 미구현
- [ ] 비밀번호 찾기 이메일 — 미구현

#### 1-2. 워크스페이스 (부분 완료)
- [x] 워크스페이스 자동 생성 (첫 로그인 시)
- [ ] 워크스페이스 설정 페이지 — 미구현
- [ ] 팀원 초대 (Resend 이메일) — 미구현
- [ ] 역할 관리 UI — 미구현

#### 1-3. 프로젝트 관리 (완료 ✅)
- [x] 프로젝트 CRUD
- [x] 색상 태그
- [x] 상태 관리
- [x] 진행률 표시

#### 1-4. 칸반 보드 (완료, 버그 있음 ⚠️)
- [x] 5컬럼 칸반 (백로그/할일/진행중/검토/완료)
- [x] 카드 DnD (컬럼 간 이동)
- [x] 우선순위 · 담당자 · 마감일 표시
- [x] FIX-01/02/03 적용 완료

#### 1-5. Task 관리 (완료 ✅)
- [x] Task CRUD + 체크리스트
- [x] 코멘트
- [x] 상세 페이지
- [ ] 파일 첨부 — 미구현
- [ ] 필터/정렬 — 미구현

#### 1-6. 타임라인 (완료, 버그 있음 ⚠️)
- [x] 커스텀 Gantt 차트 (일/주/월 뷰)
- [x] 오늘 기준선 표시
- [x] 상태별 바 색상
- [x] FIX-04 적용 완료 (scroll sync 방식으로 헤더 고정)
- [ ] 드래그로 기간 조정 — 미구현

---

### Phase 2 — 고도화 (다음 단계)

#### 2-1. 타임라인 강화
- [ ] Gantt 바 드래그로 날짜 조정
- [ ] 마일스톤 표시
- [ ] Task 간 의존성 화살표

#### 2-2. 실시간 협업
- [ ] Supabase Realtime 연동 (WebSocket)
- [ ] 칸반 카드 실시간 동기화
- [ ] 온라인 팀원 표시 (presence)

#### 2-3. 팀 기능
- [ ] 팀원 초대 (이메일, Resend)
- [ ] 역할별 권한 UI
- [ ] @멘션 (코멘트)
- [ ] 알림 센터

#### 2-4. Task 고도화
- [ ] 파일 첨부 (Supabase Storage)
- [ ] Task 필터 (담당자 · 우선순위 · 상태)
- [ ] Task 검색
- [ ] 활동 로그

#### 2-5. 수익화 기반
- [ ] Google AdSense 광고 슬롯 실 적용
- [ ] 랜딩 페이지 제작
- [ ] SEO 최적화 (메타 태그, sitemap)

---

### Phase 3 — 버그 리포트 & WBS Import

#### 3-1. 버그 리포트
- [ ] 버그 등록 폼 (심각도, 재현 방법, 예상/실제 결과)
- [ ] 버그 목록 필터
- [ ] 스크린샷 첨부

#### 3-2. WBS Import
- [ ] Excel/CSV 파일 파싱 (xlsx 라이브러리 활용)
- [ ] Task 일괄 생성
- [ ] 가져오기 결과 미리보기

---

## 4. 디렉터리 구조 (목표)

```
src/
├── app/
│   ├── (auth)/                    # 로그인, 회원가입, 비번찾기
│   ├── (dashboard)/
│   │   ├── layout.tsx             # 사이드바 레이아웃
│   │   ├── dashboard/             # 대시보드 홈
│   │   ├── projects/
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx       # 프로젝트 목록 뷰
│   │   │   │   ├── kanban/        # 칸반 보드
│   │   │   │   ├── timeline/      # 타임라인(Gantt)
│   │   │   │   ├── tasks/new      # Task 생성
│   │   │   │   └── settings/      # 프로젝트 설정 (미구현)
│   │   │   └── actions.ts
│   │   ├── tasks/
│   │   │   ├── [id]/              # Task 상세
│   │   │   └── actions.ts
│   │   └── team/                  # 팀 관리 (미구현)
│   └── globals.css
├── components/
│   ├── kanban/                    # 칸반 컴포넌트
│   ├── gantt/                     # Gantt 컴포넌트
│   ├── tasks/                     # Task 컴포넌트
│   ├── projects/                  # 프로젝트 컴포넌트
│   └── layout/                    # 레이아웃 컴포넌트
├── lib/
│   └── supabase/                  # Supabase 클라이언트
└── types/
    └── index.ts                   # 전체 타입 정의
```

---

## 5. DB 스키마 핵심 테이블

```
auth.users          ← Supabase 관리
public.users        ← 프로필 (트리거로 자동 생성)
public.workspaces
public.workspace_members (role: owner|admin|member|viewer)
public.projects     (color, status, start_date, end_date)
public.tasks        (priority, status, type, order, start_date, due_date)
public.checklists
public.comments
public.attachments
public.bug_reports  ← Phase 3
public.notifications
```

---

## 6. 구현 우선순위

```
✅ 완료: Phase 0 버그 수정 (FIX-01 ~ FIX-07)
✅ 완료: 비밀번호 재설정 페이지 (/auth/reset-password)
✅ 완료: 프로젝트 설정 페이지 (/projects/[id]/settings)
✅ 완료: loading.tsx / error.tsx 추가

✅ 완료: 대시보드 실제 데이터 연동 (하드코딩 → Supabase 쿼리)
✅ 완료: Task 필터링 + 검색 (프로젝트 상세 & 전체 Tasks 페이지)
✅ 완료: 팀 관리 페이지 (/team) — 멤버 목록 + 역할 표시 + 삭제
✅ 완료: 팀원 초대 (Resend 이메일, 초대 수락 페이지 /auth/invite/[token])
✅ 완료: 로그인 redirect 파라미터 지원 (초대 링크 → 로그인 → 초대 수락 플로우)

▶ 다음: Phase 2-1 (Gantt 드래그로 날짜 조정)
▶ 다음: Phase 2-2 (Supabase Realtime 실시간 동기화)
▶ 다음: Phase 2-4 (파일 첨부, 활동 로그)
▶ 다음: Phase 2-5 (AdSense, 랜딩 페이지, SEO)
▶ 다음: Phase 3 (버그 리포트, WBS Excel import)
```
