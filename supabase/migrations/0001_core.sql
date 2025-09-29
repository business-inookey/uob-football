-- UoB Football Core Schema Migration
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create enums
create type position_group as enum ('GK','DEF','MID','WNG','ST');
create type team_code as enum ('1s','2s','3s','4s','5s','Devs');
create type role_code as enum ('coach','lead_coach','admin');

-- Core tables
create table profiles (
  id uuid primary key, -- no FK to auth.users to avoid auth schema perms
  full_name text not null,
  role role_code not null default 'coach',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table teams (
  id uuid primary key default gen_random_uuid(),
  code team_code unique not null,
  name text not null,
  created_at timestamptz not null default now()
);

create table coaches (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table coach_team (
  coach_id uuid references coaches(id) on delete cascade,
  team_id uuid references teams(id) on delete cascade,
  role role_code not null default 'coach',
  created_at timestamptz not null default now(),
  primary key (coach_id, team_id)
);

create table players (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  primary_position position_group not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table player_team_history (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references players(id) on delete cascade,
  team_id uuid not null references teams(id) on delete cascade,
  active bool not null default true,
  started_at timestamptz not null default now(),
  ended_at timestamptz
);

create table stat_definitions (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  label text not null,
  min_value int not null default 0,
  max_value int not null default 100,
  higher_is_better bool not null default true,
  created_at timestamptz not null default now()
);

create unique index stat_definitions_key_idx on stat_definitions (lower(key));

create table player_stats (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references players(id) on delete cascade,
  team_id uuid not null references teams(id) on delete cascade,
  stat_key text not null references stat_definitions(key) on delete cascade,
  value int not null check (value between 0 and 100),
  noted_by uuid not null references profiles(id) on delete set null,
  noted_at timestamptz not null default now(),
  unique (player_id, team_id, stat_key)
);

create table team_weights (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  stat_key text not null references stat_definitions(key) on delete cascade,
  weight numeric not null check (weight between 0.5 and 1.5),
  updated_by uuid not null references profiles(id) on delete set null,
  updated_at timestamptz not null default now(),
  unique (team_id, stat_key)
);

create table player_notes (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references players(id) on delete cascade,
  team_id uuid not null references teams(id) on delete cascade,
  note text not null,
  created_by uuid not null references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table games (
  id uuid primary key default gen_random_uuid(),
  home_team uuid not null references teams(id) on delete restrict,
  away_team uuid not null references teams(id) on delete restrict,
  kickoff_at timestamptz not null,
  location text,
  notes text,
  created_at timestamptz not null default now()
);

create table video_assets (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  title text not null,
  url text not null,
  provider text not null default 'veo3',
  meta jsonb not null default '{}',
  created_by uuid not null references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Create indices for performance
create index idx_player_stats_team_stat on player_stats (team_id, stat_key);
create index idx_team_weights_team on team_weights (team_id);
create index idx_player_team_history_player_active on player_team_history (player_id, active);
create index idx_coach_team_coach on coach_team (coach_id);
create index idx_coach_team_team on coach_team (team_id);

-- Create updated_at trigger function
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply updated_at triggers
create trigger update_profiles_updated_at before update on profiles
  for each row execute function update_updated_at_column();

create trigger update_players_updated_at before update on players
  for each row execute function update_updated_at_column();
