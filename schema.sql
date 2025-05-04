-- ========== CLEANUP ==========
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user;

drop table if exists study_blocks cascade;
drop table if exists user_availability cascade;
drop table if exists tasks cascade;
drop table if exists user_courses cascade;
drop table if exists preferences cascade;
drop table if exists courses cascade;
drop table if exists users cascade;

-- ========== USERS TABLE ==========
create table users (
  id uuid primary key,
  email text,
  name text,
  password_hash text,
  profile_picture text,
  auth_provider text,
  auth_id text,
  created_at timestamp default now()
);

-- Enable RLS
alter table users enable row level security;

-- Grant necessary permissions
grant usage on schema public to postgres, anon, authenticated, service_role;
grant all privileges on all tables in schema public to postgres, service_role;
grant all privileges on all functions in schema public to postgres, service_role;
grant all privileges on all sequences in schema public to postgres, service_role;

-- RLS Policies
create policy "Users can view own data"
  on users for select
  using (auth.uid() = id);

create policy "Users can insert own data"
  on users for insert
  with check (auth.uid() = id);

create policy "Users can update own data"
  on users for update
  using (auth.uid() = id);

-- Allow Supabase system to insert users via trigger
grant insert on public.users to authenticator;
grant insert on public.users to service_role;

-- Add first_login_complete column
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_login_complete BOOLEAN DEFAULT false;

-- ========== SUPABASE OAUTH TRIGGER ==========
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- Log the trigger execution
  raise notice 'Trigger fired for new user: %', new.id;
  raise notice 'User email: %', new.email;
  raise notice 'User metadata: %', new.raw_user_meta_data;
  raise notice 'App metadata: %', new.raw_app_meta_data;

  -- Insert into public.users
  insert into public.users (
    id,
    email,
    name,
    profile_picture,
    auth_provider,
    auth_id,
    created_at
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', new.email),
    new.raw_user_meta_data->>'avatar_url',
    new.raw_app_meta_data->>'provider',
    new.raw_app_meta_data->>'provider_id',
    now()
  )
  on conflict (id) do nothing;

  -- Log successful insertion
  raise notice 'Successfully inserted user into public.users';

  return new;
exception
  when others then
    -- Log any errors
    raise exception 'Error in handle_new_user: %', SQLERRM;
end;
$$ language plpgsql security definer;

-- Create the trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Grant execute permission on the function
grant execute on function public.handle_new_user to service_role;
grant execute on function public.handle_new_user to postgres;

-- ========== PREFERENCES ==========
create table preferences (
  user_id uuid primary key references users(id) on delete cascade,
  best_study_time text,
  preferred_session_length int,
  preferred_break_length int,
  max_classes_per_day int,
  fatigue_threshold int,
  difficulty_order_preference text
);

alter table preferences enable row level security;

create policy "Manage own preferences"
  on preferences for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ========== COURSES ==========
create table courses (
  id uuid primary key,
  course_code text,
  title text,
  university text,
  avg_difficulty_score float,
  created_at timestamp default now()
);

-- ========== USER COURSES ==========
create table user_courses (
  id uuid primary key,
  user_id uuid references users(id) on delete cascade,
  course_id uuid references courses(id) on delete cascade,
  course_name text,
  priority int,
  difficulty int,
  topics text,
  total_weight float,
  color_override text,
  created_at timestamp default now()
);

alter table user_courses enable row level security;

create policy "Own user_course link"
  on user_courses for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ========== TASKS ==========
create table tasks (
  id uuid primary key,
  user_id uuid references users(id) on delete cascade,
  course_id uuid references courses(id) on delete cascade,
  title text,
  due_date timestamp,
  estimated_duration int,
  completed boolean,
  priority int,
  color text,
  created_at timestamp default now()
);

alter table tasks enable row level security;

create policy "Own tasks"
  on tasks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ========== STUDY BLOCKS ==========
create table study_blocks (
  id uuid primary key,
  user_id uuid references users(id) on delete cascade,
  course_id uuid references courses(id),
  task_id uuid references tasks(id),
  start_time timestamp,
  end_time timestamp,
  status text,
  created_by_engine boolean,
  color text,
  created_at timestamp default now()
);

alter table study_blocks enable row level security;

create policy "Own study blocks"
  on study_blocks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ========== USER AVAILABILITY ==========
create table user_availability (
  id uuid primary key,
  user_id uuid references users(id) on delete cascade,
  day_of_week text,
  start_time time,
  end_time time,
  type text,
  recurring boolean,
  created_at timestamp default now()
);

alter table user_availability enable row level security;

create policy "Own availability"
  on user_availability for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id); 