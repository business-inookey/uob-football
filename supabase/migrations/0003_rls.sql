-- UoB Football RLS Policies Migration
-- Run this after 0002_view.sql

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table coaches enable row level security;
alter table coach_team enable row level security;
alter table players enable row level security;
alter table player_team_history enable row level security;
alter table player_stats enable row level security;
alter table player_notes enable row level security;
alter table team_weights enable row level security;
alter table games enable row level security;
alter table video_assets enable row level security;

-- Public read access for teams and stat definitions
create policy "teams are viewable by everyone" on teams
  for select using (true);

create policy "stat_definitions are viewable by everyone" on stat_definitions
  for select using (true);

-- Profiles: users can read their own profile
create policy "users can view own profile" on profiles
  for select using (public.uid_or_null() = id);

create policy "users can update own profile" on profiles
  for update using (public.uid_or_null() = id);

-- Profiles: users can insert their own profile on first login
create policy "users can insert own profile" on profiles
  for insert with check (public.uid_or_null() = id);

-- Coaches: users can read their own coach record
create policy "coaches can view own record" on coaches
  for select using (profile_id = public.uid_or_null());

-- Coach-team: coaches can read their team memberships
create policy "coaches can view own team memberships" on coach_team
  for select using (
    coach_id in (
      select id from coaches where profile_id = public.uid_or_null()
    )
  );

-- Players: everyone can read players
create policy "players are viewable by everyone" on players
  for select using (true);

-- Player team history: everyone can read
create policy "player_team_history is viewable by everyone" on player_team_history
  for select using (true);

-- Player stats: coaches can read/write for their assigned teams
create policy "coaches can read team stats" on player_stats
  for select using (
    exists (
      select 1 from coach_team ct
      join coaches c on c.id = ct.coach_id
      where c.profile_id = public.uid_or_null()
        and ct.team_id = player_stats.team_id
    )
  );

create policy "coaches can insert team stats" on player_stats
  for insert with check (
    exists (
      select 1 from coach_team ct
      join coaches c on c.id = ct.coach_id
      where c.profile_id = public.uid_or_null()
        and ct.team_id = player_stats.team_id
    )
  );

create policy "coaches can update team stats" on player_stats
  for update using (
    exists (
      select 1 from coach_team ct
      join coaches c on c.id = ct.coach_id
      where c.profile_id = public.uid_or_null()
        and ct.team_id = player_stats.team_id
    )
  );

-- Player notes: coaches can read/write for their assigned teams
create policy "coaches can read team notes" on player_notes
  for select using (
    exists (
      select 1 from coach_team ct
      join coaches c on c.id = ct.coach_id
      where c.profile_id = public.uid_or_null()
        and ct.team_id = player_notes.team_id
    )
  );

create policy "coaches can insert team notes" on player_notes
  for insert with check (
    exists (
      select 1 from coach_team ct
      join coaches c on c.id = ct.coach_id
      where c.profile_id = public.uid_or_null()
        and ct.team_id = player_notes.team_id
    )
  );

-- Team weights: lead coaches only
create policy "lead coaches can read team weights" on team_weights
  for select using (
    exists (
      select 1 from coach_team ct
      join coaches c on c.id = ct.coach_id
      where c.profile_id = public.uid_or_null()
        and ct.team_id = team_weights.team_id
        and ct.role = 'lead_coach'
    )
  );

create policy "lead coaches can update team weights" on team_weights
  for update using (
    exists (
      select 1 from coach_team ct
      join coaches c on c.id = ct.coach_id
      where c.profile_id = public.uid_or_null()
        and ct.team_id = team_weights.team_id
        and ct.role = 'lead_coach'
    )
  );

create policy "lead coaches can insert team weights" on team_weights
  for insert with check (
    exists (
      select 1 from coach_team ct
      join coaches c on c.id = ct.coach_id
      where c.profile_id = auth.uid()
        and ct.team_id = team_weights.team_id
        and ct.role = 'lead_coach'
    )
  );

-- Games: everyone can read, coaches can write for their teams
create policy "games are viewable by everyone" on games
  for select using (true);

create policy "coaches can insert games" on games
  for insert with check (
    exists (
      select 1 from coach_team ct
      join coaches c on c.id = ct.coach_id
      where c.profile_id = auth.uid()
        and (ct.team_id = games.home_team or ct.team_id = games.away_team)
    )
  );

create policy "coaches can update games" on games
  for update using (
    exists (
      select 1 from coach_team ct
      join coaches c on c.id = ct.coach_id
      where c.profile_id = auth.uid()
        and (ct.team_id = games.home_team or ct.team_id = games.away_team)
    )
  );

-- Video assets: coaches can read/write for their assigned teams
create policy "coaches can read team video assets" on video_assets
  for select using (
    exists (
      select 1 from coach_team ct
      join coaches c on c.id = ct.coach_id
      where c.profile_id = auth.uid()
        and ct.team_id = video_assets.team_id
    )
  );

create policy "coaches can insert team video assets" on video_assets
  for insert with check (
    exists (
      select 1 from coach_team ct
      join coaches c on c.id = ct.coach_id
      where c.profile_id = auth.uid()
        and ct.team_id = video_assets.team_id
    )
  );
