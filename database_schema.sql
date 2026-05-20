-- Supabase Database Schema for StudyFlow

-- Users table (handled by Supabase Auth, but we extend it)
create table if not exists user_profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  email text unique,
  mood_level integer default 3,
  peak_study_hours text default '09:00-11:00,14:00-16:00',
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Calendar Events
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references user_profiles(id) on delete cascade,
  title text not null,
  description text,
  event_type text default 'study', -- study, exam, break, deadline
  start_time timestamp not null,
  end_time timestamp not null,
  status text default 'scheduled', -- scheduled, completed, cancelled
  priority integer default 3,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Notes
create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references user_profiles(id) on delete cascade,
  title text not null,
  content text not null,
  subject text,
  tags text[] default '{}',
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Flashcards (generated from notes)
create table if not exists flashcards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references user_profiles(id) on delete cascade,
  note_id uuid references notes(id) on delete set null,
  question text not null,
  answer text not null,
  difficulty integer default 1, -- 1-5
  last_reviewed timestamp,
  next_review timestamp,
  review_count integer default 0,
  easiness_factor float default 2.5, -- SM-2 algorithm
  created_at timestamp default now()
);

-- Checklist / Topics to Study
create table if not exists study_topics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references user_profiles(id) on delete cascade,
  topic text not null,
  subject text,
  status text default 'pending', -- pending, in_progress, completed
  priority integer default 3,
  due_date timestamp,
  resources text[] default '{}',
  notes text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- AI Chat History
create table if not exists chat_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references user_profiles(id) on delete cascade,
  role text not null, -- user, assistant
  message text not null,
  created_at timestamp default now()
);

-- Resource Recommendations (from AI web search)
create table if not exists resources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references user_profiles(id) on delete cascade,
  topic text not null,
  title text not null,
  url text not null,
  source text, -- reddit, youtube, stackoverflow, arxiv
  description text,
  rating integer default 5,
  created_at timestamp default now()
);

-- Notifications
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references user_profiles(id) on delete cascade,
  event_id uuid references events(id) on delete set null,
  message text not null,
  is_read boolean default false,
  created_at timestamp default now()
);

-- Mood/Energy Tracker
create table if not exists mood_tracker (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references user_profiles(id) on delete cascade,
  mood_level integer not null, -- 1-5
  energy_level integer not null, -- 1-5
  notes text,
  created_at timestamp default now()
);

-- Cloud workspace sync (pages, tasks, notes, history) — run supabase/workspace_migration.sql for RLS policies
create table if not exists user_workspaces (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Indexes for performance
create index if not exists idx_events_user_id on events(user_id);
create index if not exists idx_notes_user_id on notes(user_id);
create index if not exists idx_flashcards_user_id on flashcards(user_id);
create index if not exists idx_study_topics_user_id on study_topics(user_id);
create index if not exists idx_chat_history_user_id on chat_history(user_id);
create index if not exists idx_notifications_user_id on notifications(user_id);
create index if not exists idx_mood_tracker_user_id on mood_tracker(user_id);
