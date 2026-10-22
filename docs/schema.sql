-- MasterPath database schema (Supabase / Postgres)
-- Run in: Supabase Dashboard -> SQL Editor -> New query -> paste -> Run

create extension if not exists vector;

-- ---------------------------------------------------------------
-- Users
-- ---------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  role        text not null default 'student' check (role in ('student', 'admin')),
  branch      text,
  semester    smallint,
  created_at  timestamptz not null default now()
);

-- Auto-create a profile row when someone signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------
-- Syllabus structure
-- ---------------------------------------------------------------
create table public.courses (
  id          serial primary key,
  code        text unique,
  name        text not null,
  created_at  timestamptz not null default now()
);

create table public.topics (
  id          serial primary key,
  course_id   int not null references public.courses(id) on delete cascade,
  parent_id   int references public.topics(id) on delete set null,
  unit        text,
  name        text not null,
  position    int not null default 0
);
create index topics_course_idx on public.topics(course_id);

-- ---------------------------------------------------------------
-- Study material + RAG chunks (RAG teammate fills chunks)
-- ---------------------------------------------------------------
create table public.documents (
  id            uuid primary key default gen_random_uuid(),
  course_id     int not null references public.courses(id) on delete cascade,
  title         text not null,
  storage_path  text not null,
  status        text not null default 'uploaded'
                check (status in ('uploaded', 'processing', 'ready', 'failed')),
  error         text,
  uploaded_by   uuid references public.profiles(id),
  created_at    timestamptz not null default now()
);

-- NOTE: vector size must match the embedding model.
-- 768 = Gemini text-embedding, 1536 = OpenAI text-embedding-3-small.
-- Agree this with the RAG teammate before loading data.
create table public.chunks (
  id           bigserial primary key,
  document_id  uuid not null references public.documents(id) on delete cascade,
  topic_id     int references public.topics(id) on delete set null,
  content      text not null,
  page         int,
  embedding    vector(768)
);
create index chunks_document_idx on public.chunks(document_id);
create index chunks_topic_idx on public.chunks(topic_id);
create index chunks_embedding_idx on public.chunks
  using hnsw (embedding vector_cosine_ops);

-- ---------------------------------------------------------------
-- Questions, quizzes, attempts
-- ---------------------------------------------------------------
create table public.questions (
  id              bigserial primary key,
  topic_id        int not null references public.topics(id) on delete cascade,
  type            text not null check (type in ('mcq', 'numerical', 'short', 'long')),
  difficulty      smallint not null default 3 check (difficulty between 1 and 5),
  prompt          text not null,
  options         jsonb,            -- mcq: ["A text", "B text", ...]
  correct_answer  text,             -- mcq: option index/text, numerical: value
  rubric          text,             -- short/long: what a good answer contains
  explanation     text,
  source          text not null default 'generated' check (source in ('seed', 'generated')),
  created_at      timestamptz not null default now()
);
create index questions_topic_diff_idx on public.questions(topic_id, difficulty);

create table public.quizzes (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references public.profiles(id) on delete cascade,
  course_id   int not null references public.courses(id),
  topic_id    int references public.topics(id),
  status      text not null default 'in_progress' check (status in ('in_progress', 'finished')),
  created_at  timestamptz not null default now(),
  finished_at timestamptz
);

create table public.quiz_questions (
  quiz_id      uuid not null references public.quizzes(id) on delete cascade,
  question_id  bigint not null references public.questions(id),
  position     int not null,
  primary key (quiz_id, question_id)
);

-- Most important table: source data for the ML models and the dashboard.
create table public.attempts (
  id              bigserial primary key,
  student_id      uuid not null references public.profiles(id) on delete cascade,
  question_id     bigint not null references public.questions(id),
  quiz_id         uuid references public.quizzes(id) on delete set null,
  topic_id        int not null references public.topics(id),   -- copied from question for fast queries
  difficulty      smallint not null,                           -- copied from question at attempt time
  answer          text,
  is_correct      boolean,
  score           numeric(4,3) check (score between 0 and 1),  -- partial credit for long answers
  time_taken_sec  int,
  hints_used      smallint not null default 0,
  feedback        text,
  created_at      timestamptz not null default now()
);
create index attempts_student_time_idx on public.attempts(student_id, created_at desc);
create index attempts_student_topic_idx on public.attempts(student_id, topic_id);

-- ---------------------------------------------------------------
-- Student knowledge profile
-- ---------------------------------------------------------------
create table public.mastery (
  student_id     uuid not null references public.profiles(id) on delete cascade,
  topic_id       int not null references public.topics(id) on delete cascade,
  score          numeric(4,3) not null default 0.5 check (score between 0 and 1),
  attempts_count int not null default 0,
  correct_count  int not null default 0,
  updated_at     timestamptz not null default now(),
  primary key (student_id, topic_id)
);

-- ---------------------------------------------------------------
-- Chat tutor
-- ---------------------------------------------------------------
create table public.chat_sessions (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references public.profiles(id) on delete cascade,
  course_id   int references public.courses(id),
  title       text,
  created_at  timestamptz not null default now()
);

create table public.chat_messages (
  id          bigserial primary key,
  session_id  uuid not null references public.chat_sessions(id) on delete cascade,
  role        text not null check (role in ('user', 'assistant')),
  content     text not null,
  image_url   text,
  sources     jsonb,            -- [{chunk_id, document_title, page}]
  topic_id    int references public.topics(id),
  created_at  timestamptz not null default now()
);
create index chat_messages_session_idx on public.chat_messages(session_id, created_at);

-- ---------------------------------------------------------------
-- Learning plans
-- ---------------------------------------------------------------
create table public.learning_plans (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references public.profiles(id) on delete cascade,
  course_id   int not null references public.courses(id),
  summary     text,
  is_current  boolean not null default true,
  created_at  timestamptz not null default now()
);

create table public.plan_items (
  id          bigserial primary key,
  plan_id     uuid not null references public.learning_plans(id) on delete cascade,
  topic_id    int references public.topics(id),
  title       text not null,
  action      text,             -- e.g. "Revise notes", "Practice 5 medium questions"
  position    int not null,
  status      text not null default 'todo' check (status in ('todo', 'done')),
  due_date    date
);

-- ---------------------------------------------------------------
-- Row Level Security
-- The Express backend uses the service-role key (bypasses RLS).
-- These policies protect data if the frontend ever queries Supabase directly.
-- ---------------------------------------------------------------
alter table public.profiles       enable row level security;
alter table public.attempts       enable row level security;
alter table public.mastery        enable row level security;
alter table public.quizzes        enable row level security;
alter table public.chat_sessions  enable row level security;
alter table public.chat_messages  enable row level security;
alter table public.learning_plans enable row level security;
alter table public.plan_items     enable row level security;

create policy "own profile"   on public.profiles       for select using (id = auth.uid());
create policy "own attempts"  on public.attempts       for select using (student_id = auth.uid());
create policy "own mastery"   on public.mastery        for select using (student_id = auth.uid());
create policy "own quizzes"   on public.quizzes        for select using (student_id = auth.uid());
create policy "own sessions"  on public.chat_sessions  for select using (student_id = auth.uid());
create policy "own plans"     on public.learning_plans for select using (student_id = auth.uid());
create policy "own messages"  on public.chat_messages  for select using (
  exists (select 1 from public.chat_sessions s where s.id = session_id and s.student_id = auth.uid())
);
create policy "own plan items" on public.plan_items    for select using (
  exists (select 1 from public.learning_plans p where p.id = plan_id and p.student_id = auth.uid())
);
