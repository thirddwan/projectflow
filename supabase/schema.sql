-- =============================================
-- ProjectFlow — Supabase DB Schema
-- =============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =============================================
-- 1. users (Supabase Auth 연동)
-- =============================================
create table public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null unique,
  name        text not null,
  avatar_url  text,
  created_at  timestamptz default now() not null
);
alter table public.users enable row level security;

-- 본인만 자신의 정보 수정 가능, 워크스페이스 멤버는 조회 가능
create policy "Users can view own profile" on public.users
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.users
  for update using (auth.uid() = id);
create policy "Users are viewable by workspace members" on public.users
  for select using (
    exists (
      select 1 from public.workspace_members wm1
      join public.workspace_members wm2 on wm1.workspace_id = wm2.workspace_id
      where wm1.user_id = auth.uid() and wm2.user_id = users.id
    )
  );

-- Auth 회원가입 시 자동으로 users 레코드 생성
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.users (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =============================================
-- 2. workspaces
-- =============================================
create table public.workspaces (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,  
  slug        text unique,
  owner_id    uuid not null references public.users(id) on delete cascade,
  created_at  timestamptz default now() not null
);
alter table public.workspaces enable row level security;

create policy "Workspace members can view workspace" on public.workspaces
  for select using (
    exists (
      select 1 from public.workspace_members
      where workspace_id = workspaces.id and user_id = auth.uid()
    )
  );
create policy "Workspace owner can update" on public.workspaces
  for update using (owner_id = auth.uid());
create policy "Authenticated users can create workspace" on public.workspaces
  for insert with check (owner_id = auth.uid());
create policy "Workspace owner can delete" on public.workspaces
  for delete using (owner_id = auth.uid());

-- =============================================
-- 3. workspace_members
-- =============================================
create type workspace_role as enum ('owner', 'admin', 'member', 'viewer');

create table public.workspace_members (
  id            uuid primary key default uuid_generate_v4(),
  workspace_id  uuid not null references public.workspaces(id) on delete cascade,
  user_id       uuid not null references public.users(id) on delete cascade,
  role          workspace_role not null default 'member',
  invited_at    timestamptz default now() not null,
  joined_at     timestamptz,
  unique(workspace_id, user_id)
);
alter table public.workspace_members enable row level security;

create policy "Members can view workspace members" on public.workspace_members
  for select using (
    exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = workspace_members.workspace_id and wm.user_id = auth.uid()
    )
  );
create policy "Owner/admin can manage members" on public.workspace_members
  for all using (
    exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = workspace_members.workspace_id
        and wm.user_id = auth.uid()
        and wm.role in ('owner', 'admin')
    )
  );

-- 워크스페이스 생성 시 owner를 멤버로 자동 추가
create or replace function public.handle_new_workspace()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.workspace_members (workspace_id, user_id, role, joined_at)
  values (new.id, new.owner_id, 'owner', now());
  return new;
end;
$$;

create trigger on_workspace_created
  after insert on public.workspaces
  for each row execute procedure public.handle_new_workspace();

-- =============================================
-- 4. invitations
-- =============================================
create type invitation_status as enum ('pending', 'accepted', 'expired');

create table public.invitations (
  id            uuid primary key default uuid_generate_v4(),
  workspace_id  uuid not null references public.workspaces(id) on delete cascade,
  email         text not null,
  token         text not null unique default encode(gen_random_bytes(32), 'hex'),
  role          workspace_role not null default 'member',
  expires_at    timestamptz not null default (now() + interval '7 days'),
  status        invitation_status not null default 'pending',
  created_at    timestamptz default now() not null
);
alter table public.invitations enable row level security;

create policy "Workspace admins can manage invitations" on public.invitations
  for all using (
    exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = invitations.workspace_id
        and wm.user_id = auth.uid()
        and wm.role in ('owner', 'admin')
    )
  );
create policy "Anyone can view invitation by token" on public.invitations
  for select using (true);

-- =============================================
-- 5. projects
-- =============================================
create type project_status as enum ('active', 'on_hold', 'completed', 'cancelled');
create type project_color as enum ('blue', 'purple', 'green', 'orange', 'red', 'pink', 'yellow');

create table public.projects (
  id            uuid primary key default uuid_generate_v4(),
  workspace_id  uuid not null references public.workspaces(id) on delete cascade,
  name          text not null,
  description   text,
  color         project_color not null default 'blue',
  status        project_status not null default 'active',
  start_date    date,
  end_date      date,
  created_by    uuid not null references public.users(id),
  created_at    timestamptz default now() not null,
  updated_at    timestamptz default now() not null
);
alter table public.projects enable row level security;

create policy "Workspace members can view projects" on public.projects
  for select using (
    exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = projects.workspace_id and wm.user_id = auth.uid()
    )
  );
create policy "Members can create projects" on public.projects
  for insert with check (
    exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = projects.workspace_id
        and wm.user_id = auth.uid()
        and wm.role in ('owner', 'admin', 'member')
    )
  );
create policy "Members can update projects" on public.projects
  for update using (
    exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = projects.workspace_id
        and wm.user_id = auth.uid()
        and wm.role in ('owner', 'admin', 'member')
    )
  );
create policy "Owner/admin can delete projects" on public.projects
  for delete using (
    exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = projects.workspace_id
        and wm.user_id = auth.uid()
        and wm.role in ('owner', 'admin')
    )
  );

-- =============================================
-- 6. tasks
-- =============================================
create type task_priority as enum ('urgent', 'high', 'normal', 'low');
create type task_status as enum ('backlog', 'todo', 'in_progress', 'review', 'done');

create table public.tasks (
  id              uuid primary key default uuid_generate_v4(),
  project_id      uuid not null references public.projects(id) on delete cascade,
  title           text not null,
  description     text,
  assignee_id     uuid references public.users(id) on delete set null,
  priority        task_priority not null default 'normal',
  status          task_status not null default 'backlog',
  start_date      date,
  due_date        date,
  "order"         integer not null default 0,
  parent_task_id  uuid references public.tasks(id) on delete cascade,
  created_by      uuid not null references public.users(id),
  created_at      timestamptz default now() not null,
  updated_at      timestamptz default now() not null
);
alter table public.tasks enable row level security;

create policy "Project members can view tasks" on public.tasks
  for select using (
    exists (
      select 1 from public.projects p
      join public.workspace_members wm on wm.workspace_id = p.workspace_id
      where p.id = tasks.project_id and wm.user_id = auth.uid()
    )
  );
create policy "Members can create tasks" on public.tasks
  for insert with check (
    exists (
      select 1 from public.projects p
      join public.workspace_members wm on wm.workspace_id = p.workspace_id
      where p.id = tasks.project_id
        and wm.user_id = auth.uid()
        and wm.role in ('owner', 'admin', 'member')
    )
  );
create policy "Members can update tasks" on public.tasks
  for update using (
    exists (
      select 1 from public.projects p
      join public.workspace_members wm on wm.workspace_id = p.workspace_id
      where p.id = tasks.project_id
        and wm.user_id = auth.uid()
        and wm.role in ('owner', 'admin', 'member')
    )
  );
create policy "Owner/admin can delete tasks" on public.tasks
  for delete using (
    exists (
      select 1 from public.projects p
      join public.workspace_members wm on wm.workspace_id = p.workspace_id
      where p.id = tasks.project_id
        and wm.user_id = auth.uid()
        and wm.role in ('owner', 'admin', 'member')
    )
  );

-- =============================================
-- 7. checklists (Sub-task)
-- =============================================
create table public.checklists (
  id            uuid primary key default uuid_generate_v4(),
  task_id       uuid not null references public.tasks(id) on delete cascade,
  title         text not null,
  is_completed  boolean not null default false,
  "order"       integer not null default 0,
  created_at    timestamptz default now() not null
);
alter table public.checklists enable row level security;

create policy "Task members can manage checklists" on public.checklists
  for all using (
    exists (
      select 1 from public.tasks t
      join public.projects p on p.id = t.project_id
      join public.workspace_members wm on wm.workspace_id = p.workspace_id
      where t.id = checklists.task_id and wm.user_id = auth.uid()
    )
  );

-- =============================================
-- 8. comments
-- =============================================
create table public.comments (
  id          uuid primary key default uuid_generate_v4(),
  task_id     uuid not null references public.tasks(id) on delete cascade,
  user_id     uuid not null references public.users(id) on delete cascade,
  content     text not null,
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);
alter table public.comments enable row level security;

create policy "Workspace members can view comments" on public.comments
  for select using (
    exists (
      select 1 from public.tasks t
      join public.projects p on p.id = t.project_id
      join public.workspace_members wm on wm.workspace_id = p.workspace_id
      where t.id = comments.task_id and wm.user_id = auth.uid()
    )
  );
create policy "Members can create comments" on public.comments
  for insert with check (user_id = auth.uid());
create policy "Users can update own comments" on public.comments
  for update using (user_id = auth.uid());
create policy "Users can delete own comments" on public.comments
  for delete using (user_id = auth.uid());

-- =============================================
-- 9. attachments
-- =============================================
create table public.attachments (
  id          uuid primary key default uuid_generate_v4(),
  task_id     uuid not null references public.tasks(id) on delete cascade,
  file_name   text not null,
  file_url    text not null,
  file_size   bigint not null,
  created_by  uuid not null references public.users(id),
  created_at  timestamptz default now() not null
);
alter table public.attachments enable row level security;

create policy "Task members can manage attachments" on public.attachments
  for all using (
    exists (
      select 1 from public.tasks t
      join public.projects p on p.id = t.project_id
      join public.workspace_members wm on wm.workspace_id = p.workspace_id
      where t.id = attachments.task_id and wm.user_id = auth.uid()
    )
  );

-- =============================================
-- 10. notifications
-- =============================================
create type notification_type as enum (
  'task_assigned', 'mention', 'due_date_reminder',
  'bug_assigned', 'invitation', 'project_status_change', 'new_comment'
);

create table public.notifications (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.users(id) on delete cascade,
  type        notification_type not null,
  title       text not null,
  body        text not null,
  is_read     boolean not null default false,
  related_id  uuid,
  created_at  timestamptz default now() not null
);
alter table public.notifications enable row level security;

create policy "Users can view own notifications" on public.notifications
  for select using (user_id = auth.uid());
create policy "Users can update own notifications" on public.notifications
  for update using (user_id = auth.uid());

-- =============================================
-- updated_at 자동 업데이트 트리거
-- =============================================
create or replace function public.set_updated_at()
returns trigger language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at_projects
  before update on public.projects
  for each row execute procedure public.set_updated_at();

create trigger set_updated_at_tasks
  before update on public.tasks
  for each row execute procedure public.set_updated_at();

create trigger set_updated_at_comments
  before update on public.comments
  for each row execute procedure public.set_updated_at();

-- =============================================
-- 인덱스
-- =============================================
create index idx_workspace_members_workspace on public.workspace_members(workspace_id);
create index idx_workspace_members_user on public.workspace_members(user_id);
create index idx_projects_workspace on public.projects(workspace_id);
create index idx_tasks_project on public.tasks(project_id);
create index idx_tasks_assignee on public.tasks(assignee_id);
create index idx_tasks_status on public.tasks(status);
create index idx_checklists_task on public.checklists(task_id);
create index idx_comments_task on public.comments(task_id);
create index idx_notifications_user on public.notifications(user_id);
