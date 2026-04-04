-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- TRIPS
create table trips (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  organiser_id uuid references auth.users(id) not null,
  rough_window_start date,
  rough_window_end date,
  status text not null default 'formation'
    check (status in ('formation','alignment','destination_voting','date_voting','confirmed','active')),
  invite_code text unique not null,
  destination text,
  confirmed_start date,
  confirmed_end date,
  destination_poll_deadline timestamptz,
  date_poll_deadline timestamptz,
  created_at timestamptz default now()
);

-- TRIP MEMBERS
create table trip_members (
  id uuid primary key default uuid_generate_v4(),
  trip_id uuid references trips(id) on delete cascade not null,
  user_id uuid references auth.users(id) not null,
  role text not null default 'member' check (role in ('organiser','member')),
  commitment_status text not null default 'pending'
    check (commitment_status in ('pending','in','out')),
  joined_at timestamptz default now(),
  unique(trip_id, user_id)
);

-- MEMBER PROFILES (travel style + vibes)
create table member_profiles (
  id uuid primary key default uuid_generate_v4(),
  trip_id uuid references trips(id) on delete cascade not null,
  user_id uuid references auth.users(id) not null,
  pace text check (pace in ('relaxed','moderate','packed')),
  accommodation text check (accommodation in ('budget','mid','luxury')),
  activity_type text check (activity_type in ('outdoors','culture','food','nightlife','mixed')),
  dietary text check (dietary in ('no_restriction','vegetarian','vegan','halal','other')),
  vibe_selections text[] default '{}',
  updated_at timestamptz default now(),
  unique(trip_id, user_id)
);

-- MEMBER BUDGETS (owner-only read via RLS)
create table member_budgets (
  id uuid primary key default uuid_generate_v4(),
  trip_id uuid references trips(id) on delete cascade not null,
  user_id uuid references auth.users(id) not null,
  max_budget integer not null,
  updated_at timestamptz default now(),
  unique(trip_id, user_id)
);

-- DESTINATION OPTIONS
create table destination_options (
  id uuid primary key default uuid_generate_v4(),
  trip_id uuid references trips(id) on delete cascade not null,
  name text not null,
  description text,
  image_url text,
  proposed_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- DESTINATION VOTES
create table destination_votes (
  id uuid primary key default uuid_generate_v4(),
  trip_id uuid references trips(id) on delete cascade not null,
  destination_id uuid references destination_options(id) on delete cascade not null,
  user_id uuid references auth.users(id) not null,
  created_at timestamptz default now(),
  unique(trip_id, user_id, destination_id)
);

-- DATE OPTIONS
create table date_options (
  id uuid primary key default uuid_generate_v4(),
  trip_id uuid references trips(id) on delete cascade not null,
  start_date date not null,
  end_date date not null,
  label text,
  proposed_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- DATE AVAILABILITY
create table date_availability (
  id uuid primary key default uuid_generate_v4(),
  trip_id uuid references trips(id) on delete cascade not null,
  date_option_id uuid references date_options(id) on delete cascade not null,
  user_id uuid references auth.users(id) not null,
  availability text not null check (availability in ('available','preferred','unavailable')),
  updated_at timestamptz default now(),
  unique(trip_id, date_option_id, user_id)
);

-- ACTIVITY PREFERENCES
create table activity_preferences (
  id uuid primary key default uuid_generate_v4(),
  trip_id uuid references trips(id) on delete cascade not null,
  user_id uuid references auth.users(id) not null,
  rankings text[] not null default '{}',
  updated_at timestamptz default now(),
  unique(trip_id, user_id)
);

-- CONFLICT FLAGS
create table conflict_flags (
  id uuid primary key default uuid_generate_v4(),
  trip_id uuid references trips(id) on delete cascade not null,
  flagged_by uuid references auth.users(id) not null,
  context text not null check (context in ('destination','dates')),
  reason text,
  status text not null default 'open' check (status in ('open','resolved','force_locked')),
  deadline timestamptz,
  created_at timestamptz default now()
);

-- =====================
-- RLS POLICIES
-- =====================

alter table trips enable row level security;
alter table trip_members enable row level security;
alter table member_profiles enable row level security;
alter table member_budgets enable row level security;
alter table destination_options enable row level security;
alter table destination_votes enable row level security;
alter table date_options enable row level security;
alter table date_availability enable row level security;
alter table activity_preferences enable row level security;
alter table conflict_flags enable row level security;

-- trips
create policy "trips_select" on trips for select
  using (id in (select trip_id from trip_members where user_id = auth.uid()));
create policy "trips_insert" on trips for insert
  with check (organiser_id = auth.uid());
create policy "trips_update" on trips for update
  using (organiser_id = auth.uid());

-- trip_members
create policy "trip_members_select" on trip_members for select
  using (trip_id in (select trip_id from trip_members where user_id = auth.uid()));
create policy "trip_members_insert" on trip_members for insert
  with check (user_id = auth.uid());
create policy "trip_members_update" on trip_members for update
  using (user_id = auth.uid());

-- member_profiles
create policy "profiles_select" on member_profiles for select
  using (trip_id in (select trip_id from trip_members where user_id = auth.uid()));
create policy "profiles_insert" on member_profiles for insert
  with check (user_id = auth.uid());
create policy "profiles_update" on member_profiles for update
  using (user_id = auth.uid());

-- member_budgets: CRITICAL — owner-only read
create policy "budgets_select_own" on member_budgets for select
  using (user_id = auth.uid());
create policy "budgets_insert" on member_budgets for insert
  with check (user_id = auth.uid());
create policy "budgets_update" on member_budgets for update
  using (user_id = auth.uid());

-- destination_options
create policy "dest_options_select" on destination_options for select
  using (trip_id in (select trip_id from trip_members where user_id = auth.uid()));
create policy "dest_options_insert" on destination_options for insert
  with check (
    trip_id in (
      select trip_id from trip_members
      where user_id = auth.uid() and role = 'organiser'
    )
  );

-- destination_votes
create policy "dest_votes_select" on destination_votes for select
  using (trip_id in (select trip_id from trip_members where user_id = auth.uid()));
create policy "dest_votes_insert" on destination_votes for insert
  with check (user_id = auth.uid());

-- date_options
create policy "date_options_select" on date_options for select
  using (trip_id in (select trip_id from trip_members where user_id = auth.uid()));
create policy "date_options_insert" on date_options for insert
  with check (
    trip_id in (
      select trip_id from trip_members
      where user_id = auth.uid() and role = 'organiser'
    )
  );

-- date_availability
create policy "date_avail_select" on date_availability for select
  using (trip_id in (select trip_id from trip_members where user_id = auth.uid()));
create policy "date_avail_insert" on date_availability for insert
  with check (user_id = auth.uid());
create policy "date_avail_update" on date_availability for update
  using (user_id = auth.uid());

-- activity_preferences
create policy "activity_prefs_select" on activity_preferences for select
  using (trip_id in (select trip_id from trip_members where user_id = auth.uid()));
create policy "activity_prefs_insert" on activity_preferences for insert
  with check (user_id = auth.uid());
create policy "activity_prefs_update" on activity_preferences for update
  using (user_id = auth.uid());

-- conflict_flags
create policy "conflict_select" on conflict_flags for select
  using (trip_id in (select trip_id from trip_members where user_id = auth.uid()));
create policy "conflict_insert" on conflict_flags for insert
  with check (user_id = auth.uid());
create policy "conflict_update_organiser" on conflict_flags for update
  using (
    trip_id in (
      select trip_id from trip_members
      where user_id = auth.uid() and role = 'organiser'
    )
  );

-- =====================
-- REALTIME PUBLICATIONS
-- =====================
alter publication supabase_realtime add table destination_votes;
alter publication supabase_realtime add table date_availability;
alter publication supabase_realtime add table trip_members;
alter publication supabase_realtime add table member_profiles;
