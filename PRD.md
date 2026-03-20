# ProjectFlow — Product Requirements Document (PRD) v2.0

> 수익형 프로젝트 관리 SaaS 웹 애플리케이션
> 작성일: 2026-03-20 | 상태: Phase 1 MVP 개발 중

---

## 1. 프로젝트 개요

### 1.1 제품 비전
팀 프로젝트를 **타임라인 · 칸반 · 할 일 · 버그 리포트** 하나의 플랫폼에서 관리하고,
Google AdSense 광고 수익 + 추후 Freemium 유료 플랜으로 수익을 창출하는 웹 서비스

### 1.2 핵심 목표
- 개인/소규모 팀이 무료로 사용할 수 있는 프로젝트 관리 도구 제공
- Notion 스타일의 깔끔한 UI/UX로 진입 장벽 낮추기
- Google AdSense 승인 → 광고 수익 → Freemium 전환 단계적 수익화

### 1.3 타겟 사용자
- 스타트업 / 소규모 개발팀 (2~10명)
- 프리랜서 개발자 / 디자이너
- 사이드 프로젝트 운영자
- IT 프로젝트를 관리하는 기획자/PM

---

## 2. 기술 스택

### Frontend
| 항목 | 선택 |
|------|------|
| 프레임워크 | Next.js 14 (App Router) |
| 언어 | TypeScript |
| 스타일링 | Tailwind CSS + shadcn/ui |
| 상태 관리 | Zustand + TanStack Query |
| 드래그앤드롭 | @dnd-kit (칸반 보드) |
| 타임라인 | Frappe Gantt (Phase 2) |
| 다크모드 | next-themes |

### Backend / BaaS
| 항목 | 선택 |
|------|------|
| DB | Supabase (PostgreSQL) |
| 인증 | Supabase Auth (이메일/소셜) |
| 실시간 | Supabase Realtime (WebSocket) |
| 파일 저장 | Supabase Storage |
| 이메일 발송 | Resend + React Email |

### 배포 / 수익화
| 항목 | 선택 |
|------|------|
| 호스팅 | Vercel |
| 광고 | Google AdSense |
| 도메인 | 추후 결정 |

---

## 3. 핵심 기능 명세

### 3.1 인증 (Authentication)
- **이메일/비밀번호** 회원가입 · 로그인
- 이메일 인증 (Supabase Auth 기본 제공)
- 비밀번호 찾기 (이메일 발송)
- 로그인 상태 유지 (Remember me)
- 로그아웃

### 3.2 워크스페이스 & 팀
- 워크스페이스 생성 (개인/팀)
- 이메일로 팀원 초대 (초대 링크 발송)
- 역할 관리: `owner` · `admin` · `member` · `viewer`
- @멘션 기능 (코멘트 내 팀원 태그)

### 3.3 프로젝트 관리
- 프로젝트 CRUD (생성·수정·삭제·아카이브)
- 프로젝트별 색상 태그 지정
- 프로젝트 상태: `진행 중` · `완료` · `보류` · `취소`
- 프로젝트 멤버 관리

### 3.4 타임라인 (Gantt Chart) — Phase 2
- 프로젝트 전체 일정을 Gantt 차트로 시각화
- 드래그로 기간 조정 (시작일 · 종료일)
- 마일스톤 표시
- Phase별 그룹화 뷰

### 3.5 칸반 보드
- 컬럼: `백로그` · `할 일` · `진행 중` · `검토` · `완료`
- 카드 드래그앤드롭 (실시간 상태 변경)
- 카드에 담당자 · 마감일 · 우선순위 표시
- 컬럼 커스터마이징 (추가/삭제/이름 변경)

### 3.6 Task & Todo
- Task 생성 (제목 · 설명 · 담당자 · 마감일 · 우선순위)
- 우선순위: `긴급` · `높음` · `보통` · `낮음`
- 체크리스트 (Sub-task) — 항목별 완료 처리
- Task 상세 페이지 (코멘트 · 첨부파일 · 활동 로그)
- 필터: Phase별 · 담당자별 · 우선순위별 · 상태별

### 3.7 버그 리포트 — Phase 3
- 버그 등록 (제목 · 재현 방법 · 예상/실제 결과 · 스크린샷)
- 심각도: `Critical` · `Major` · `Minor` · `Trivial`
- 상태: `신규` · `확인됨` · `수정 중` · `해결됨` · `닫힘`
- 버그 담당자 지정 · 코멘트 지원

### 3.8 코멘트 & 협업
- Task / 버그에 코멘트 작성
- @멘션 → 이메일 알림 발송 (Resend)
- 코멘트 수정 · 삭제
- 실시간 업데이트 (Supabase Realtime)

### 3.9 알림 (Notifications)
- 인앱 알림 (벨 아이콘 · 읽음/안읽음)
- 이메일 알림: 멘션 · 마감 임박 · 초대
- 알림 설정 (on/off 개별 제어)

### 3.10 WBS 업로드 — Phase 3
- 표준 WBS 템플릿 제공 (Excel/PDF 다운로드)
- Excel(.xlsx) / PDF 업로드 → 프로젝트 자동 생성
- 파싱 라이브러리: `xlsx` + `pdf-parse`
- 업로드 후 Task 일괄 생성 및 칸반 배치

---

## 4. 디자인 가이드라인

### 4.1 기본 컨셉
- **Notion 스타일** — 깔끔한 화이트 바탕, 미니멀 UI
- 다크모드 기본 지원 (CSS 변수 기반 테마)
- 폰트: Pretendard (CDN)
- 반응형: 모바일 · 태블릿 · 데스크탑

### 4.2 디자인 토큰 (CSS 변수)
```css
/* Light Mode */
--background: 0 0% 100%
--surface: 60 5% 96%          /* #F7F7F5 */
--border: 60 4% 91%           /* #E9E9E7 */
--text-primary: 0 0% 9%
--text-secondary: 0 0% 40%
--text-muted: 0 0% 60%
--accent: 211 80% 51%         /* #2383E2 */
```

### 4.3 레이아웃 구조
```
[Sidebar 240px] | [Main Content flex-1] | [AdSense Sidebar 300px, xl only]
```

---

## 5. 라우팅 구조

```
/                          → 랜딩 페이지
/login                     → 로그인
/register                  → 회원가입
/forgot-password           → 비밀번호 찾기
/dashboard                 → 대시보드 (홈)
/projects                  → 프로젝트 목록
/projects/[id]             → 프로젝트 상세
/projects/[id]/kanban      → 칸반 보드
/projects/[id]/timeline    → 타임라인 (Gantt)
/tasks                     → 전체 Task 목록
/tasks/[id]                → Task 상세
/bugs                      → 버그 리포트 목록
/bugs/[id]                 → 버그 상세
/team                      → 팀 관리
/notifications             → 알림 목록
/settings                  → 설정
/settings/profile          → 프로필 설정
/settings/workspace        → 워크스페이스 설정
```

---

## 6. DB 스키마 (Supabase PostgreSQL)

### 주요 테이블
```sql
users            -- 사용자 (Supabase Auth 연동)
workspaces       -- 워크스페이스
workspace_members -- 워크스페이스 멤버 (role 포함)
invitations      -- 초대 링크
projects         -- 프로젝트
tasks            -- Task
checklists       -- Sub-task (체크리스트)
comments         -- 코멘트 (Task/Bug 공통)
attachments      -- 첨부파일
bug_reports      -- 버그 리포트
notifications    -- 알림
wbs_imports      -- WBS 업로드 이력
```

### RLS 정책
- 워크스페이스 멤버만 해당 데이터 접근 가능
- owner/admin만 워크스페이스 설정 변경 가능
- viewer는 읽기만 허용

---

## 7. AdSense 수익화 전략

| 광고 위치 | 포맷 | 노출 조건 |
|-----------|------|-----------|
| 대시보드 우측 사이드바 | 300×600 | 데스크탑 (xl 이상) |
| 프로젝트 목록 하단 | 반응형 배너 | 전체 |
| 버그 대시보드 상단 | 728×90 | 데스크탑 |
| 랜딩 페이지 하단 | 728×90 | 비로그인 사용자 |

> AdSense 코드는 승인 전까지 placeholder로 표시. 승인 후 `src/app/layout.tsx`의 Script 주석 해제.

---

## 8. 개발 로드맵

### Phase 1 — MVP (3/20 ~ 4/17, 4주)
> 목표: 핵심 기능 완성 + 배포 가능한 MVP

| Task ID | 내용 | 마감 | 상태 |
|---------|------|------|------|
| PF-001 | Next.js 14 + Supabase 초기 세팅 | 3/25 | 🔄 진행 중 |
| PF-002 | Tailwind CSS + shadcn/ui 디자인 시스템 | 3/25 | 🔄 진행 중 |
| PF-003 | 다크모드 레이아웃 구성 (Notion 스타일) | 3/27 | 🔄 진행 중 |
| PF-004 | Supabase Auth 이메일 인증 | 3/29 | 🔄 진행 중 |
| PF-005 | 로그인/회원가입 페이지 UI | 3/29 | 📋 할 일 |
| PF-006 | 프로젝트 CRUD (생성·수정·삭제) | 4/5 | 📋 할 일 |
| PF-007 | 칸반 보드 UI + dnd-kit 드래그앤드롭 | 4/10 | 📋 할 일 |
| PF-008 | Task 생성/수정/삭제 + 상세 페이지 | 4/12 | 📋 할 일 |
| PF-009 | 체크리스트 (Sub-task) 기능 | 4/14 | 📋 할 일 |
| PF-010 | 반응형 최적화 + 모바일 대응 | 4/17 | 📋 할 일 |

### Phase 2 — 협업 (4/18 ~ 5/8, 3주)
> 목표: 팀 협업 + 타임라인 + 실시간 동기화

| Task ID | 내용 | 마감 |
|---------|------|------|
| PF-011 | Gantt 타임라인 (Frappe Gantt) | 4/24 |
| PF-012 | 팀원 이메일 초대 + Resend 발송 | 4/26 |
| PF-013 | Supabase Realtime 실시간 업데이트 | 4/29 |
| PF-014 | 코멘트 + @멘션 기능 | 5/3 |
| PF-015 | 인앱 알림 + 이메일 알림 | 5/6 |
| PF-016 | 파일 첨부 (Supabase Storage) | 5/8 |

### Phase 3 — 고급 기능 (5/9 ~ 5/29, 3주)
> 목표: 버그 리포트 + WBS 업로드 + AdSense 연동

| Task ID | 내용 | 마감 |
|---------|------|------|
| PF-017 | 버그 리포트 CRUD + 심각도 관리 | 5/15 |
| PF-018 | WBS Excel/PDF 업로드 + 파싱 | 5/20 |
| PF-019 | WBS 표준 템플릿 제작 + 다운로드 | 5/22 |
| PF-020 | Google AdSense 연동 + 광고 배치 | 5/26 |
| PF-021 | 대시보드 고급 통계 + 차트 | 5/29 |

### Phase 4 — 최적화 (5/30 ~ 6/12, 2주)
> 목표: 성능 최적화 + SEO + 프로덕션 배포

| Task ID | 내용 | 마감 |
|---------|------|------|
| PF-022 | SEO 최적화 (메타태그 · sitemap · robots) | 6/3 |
| PF-023 | 성능 최적화 (이미지 · 번들 · 캐싱) | 6/6 |
| PF-024 | 에러 모니터링 (Sentry) | 6/9 |
| PF-025 | 프로덕션 배포 + 최종 QA | 6/12 |

---

## 9. 비기능 요구사항

| 항목 | 요구사항 |
|------|---------|
| 성능 | LCP 2.5초 이하, FID 100ms 이하 |
| 보안 | Supabase RLS + HTTPS + 환경변수 분리 |
| 접근성 | WCAG 2.1 AA 수준 |
| 브라우저 지원 | Chrome · Safari · Firefox · Edge 최신 2버전 |
| 언어 | 한국어 (추후 영어 다국어 지원) |
| 반응형 | 모바일(375px~) · 태블릿(768px~) · 데스크탑(1280px~) |

---

## 10. 환경 변수

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Resend (이메일)
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Google AdSense (승인 후 입력)
NEXT_PUBLIC_ADSENSE_PUBLISHER_ID=
```

---

## 11. 관련 링크

- **Notion 대시보드**: https://www.notion.so/3280a63293128133b3c3da94ffb2be6e
- **프로젝트 DB (타임라인)**: https://www.notion.so/d774cdb315c54842924a38ea10774dfe
- **할 일 DB (칸반)**: https://www.notion.so/b4b1fa914cdf4a9db47d91514763494d
- **로컬 개발**: http://localhost:3000
- **배포 (예정)**: Vercel

---

*ProjectFlow PRD v2.0 — 2026-03-20*
