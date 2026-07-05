create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  summary text,
  content_html text,
  thumbnail_url text,
  status text default 'published',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists profiles (
  id uuid primary key references auth.users(id),
  full_name varchar(100),
  avatar_url text,
  role varchar(20) default 'admin',
  phone varchar(20),
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table posts enable row level security;
alter table profiles enable row level security;

drop policy if exists "Allow public read access to posts" on posts;
create policy "Allow public read access to posts"
on posts for select
using (true);

drop policy if exists "Allow admin to insert posts" on posts;
create policy "Allow admin to insert posts"
on posts for insert
with check (
  exists (
    select 1
    from profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

drop policy if exists "Allow admin to update posts" on posts;
create policy "Allow admin to update posts"
on posts for update
using (
  exists (
    select 1
    from profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

drop policy if exists "Allow admin to delete posts" on posts;
create policy "Allow admin to delete posts"
on posts for delete
using (
  exists (
    select 1
    from profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

drop policy if exists "Allow users to read own profile" on profiles;
create policy "Allow users to read own profile"
on profiles for select
using (auth.uid() = id);

drop policy if exists "Allow users to update own profile" on profiles;
create policy "Allow users to update own profile"
on profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);