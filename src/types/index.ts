// ==========================================
// ProjectFlow — 전체 TypeScript 타입 정의
// ==========================================

// ---- 사용자 ----
export interface User {
  id: string
  email: string
  name: string
  avatar_url?: string
  created_at: string
}

// ---- 워크스페이스 ----
export interface Workspace {
  id: string
  name: string
  owner_id: string
  created_at: string
}

export type WorkspaceMemberRole = 'owner' | 'admin' | 'member' | 'viewer'

export interface WorkspaceMember {
  id: string
  workspace_id: string
  user_id: string
  role: WorkspaceMemberRole
  invited_at?: string
  joined_at?: string
  user?: User
}

// ---- 초대 ----
export type InvitationStatus = 'pending' | 'accepted' | 'expired'

export interface Invitation {
  id: string
  workspace_id: string
  email: string
  token: string
  role: WorkspaceMemberRole
  expires_at: string
  status: InvitationStatus
}

// ---- 프로젝트 ----
export type ProjectStatus = 'active' | 'on_hold' | 'completed' | 'cancelled'
export type ProjectColor =
  | 'blue' | 'purple' | 'green' | 'orange' | 'red' | 'pink' | 'yellow'

export interface Project {
  id: string
  workspace_id: string
  name: string
  description?: string
  color: ProjectColor
  status: ProjectStatus
  start_date?: string
  end_date?: string
  created_by: string
  created_at: string
}

// ---- Task ----
export type TaskPriority = 'urgent' | 'high' | 'normal' | 'low'
export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done'
export type TaskType = 'task' | 'bug'

export interface Task {
  id: string
  project_id: string
  title: string
  description?: string
  assignee_id?: string
  priority: TaskPriority
  status: TaskStatus
  type: TaskType
  start_date?: string
  due_date?: string
  order: number
  parent_task_id?: string
  created_by: string
  created_at: string
  updated_at: string
  // Relations
  assignee?: User
  checklists?: Checklist[]
  comments?: Comment[]
  attachments?: Attachment[]
  bug_report?: BugReport
}

// ---- 체크리스트 ----
export interface Checklist {
  id: string
  task_id: string
  title: string
  is_completed: boolean
  order: number
  created_at: string
}

// ---- 코멘트 ----
export interface Comment {
  id: string
  task_id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
  user?: User
}

// ---- 첨부파일 ----
export interface Attachment {
  id: string
  task_id: string
  file_name: string
  file_url: string
  file_size: number
  created_by: string
  created_at: string
}

// ---- 버그 리포트 ----
export type BugSeverity = 'critical' | 'major' | 'minor' | 'trivial'
export type BugStatus =
  | 'new' | 'confirmed' | 'in_progress' | 'pending_review' | 'resolved' | 'closed' | 'reopened'

export interface BugReport {
  id: string
  task_id: string
  severity: BugSeverity
  steps_to_reproduce: string
  expected_result: string
  actual_result: string
  environment?: string
  status: BugStatus
}

// ---- 알림 ----
export type NotificationType =
  | 'task_assigned'
  | 'mention'
  | 'due_date_reminder'
  | 'bug_assigned'
  | 'invitation'
  | 'project_status_change'
  | 'new_comment'

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  body: string
  is_read: boolean
  related_id?: string
  created_at: string
}

// ---- WBS Import ----
export type WBSImportStatus = 'pending' | 'processing' | 'success' | 'failed'

export interface WBSImport {
  id: string
  project_id: string
  file_url: string
  status: WBSImportStatus
  parsed_data?: WBSRow[]
  created_by: string
  created_at: string
}

export interface WBSRow {
  number: string
  task_name: string
  parent_task?: string
  assignee_email?: string
  start_date?: string
  end_date?: string
  priority?: TaskPriority
  status?: TaskStatus
  description?: string
}

// ---- 칸반 보드 ----
export interface KanbanColumn {
  id: TaskStatus
  title: string
  color: string
  tasks: Task[]
  wip_limit?: number
}

// ---- API 응답 ----
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}
