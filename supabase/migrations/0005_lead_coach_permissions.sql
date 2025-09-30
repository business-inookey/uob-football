-- Lead Coach Permissions Migration
-- This script sets up proper permissions for lead coaches to view all players

-- Update RLS policies to allow lead coaches to view all players
-- Drop existing policies first
drop policy if exists "players are viewable by everyone" on players;
drop policy if exists "player_team_history is viewable by everyone" on player_team_history;

-- Create new policies that allow lead coaches to see all data
create policy "players are viewable by everyone" on players
  for select using (true);

create policy "player_team_history is viewable by everyone" on player_team_history
  for select using (true);

-- Allow lead coaches to view all player stats (not just their assigned teams)
create policy "lead coaches can read all player stats" on player_stats
  for select using (
    exists (
      select 1 from coach_team ct
      join coaches c on c.id = ct.coach_id
      where c.profile_id = public.uid_or_null()
        and ct.role = 'lead_coach'
    )
  );

-- Allow lead coaches to view all player notes
create policy "lead coaches can read all player notes" on player_notes
  for select using (
    exists (
      select 1 from coach_team ct
      join coaches c on c.id = ct.coach_id
      where c.profile_id = public.uid_or_null()
        and ct.role = 'lead_coach'
    )
  );

-- Allow lead coaches to view all games
create policy "lead coaches can read all games" on games
  for select using (
    exists (
      select 1 from coach_team ct
      join coaches c on c.id = ct.coach_id
      where c.profile_id = public.uid_or_null()
        and ct.role = 'lead_coach'
    )
  );

-- Allow lead coaches to view all video assets
create policy "lead coaches can read all video assets" on video_assets
  for select using (
    exists (
      select 1 from coach_team ct
      join coaches c on c.id = ct.coach_id
      where c.profile_id = public.uid_or_null()
        and ct.role = 'lead_coach'
    )
  );

-- Grant additional permissions for lead coaches to manage all teams
create policy "lead coaches can insert player stats for any team" on player_stats
  for insert with check (
    exists (
      select 1 from coach_team ct
      join coaches c on c.id = ct.coach_id
      where c.profile_id = public.uid_or_null()
        and ct.role = 'lead_coach'
    )
  );

create policy "lead coaches can update player stats for any team" on player_stats
  for update using (
    exists (
      select 1 from coach_team ct
      join coaches c on c.id = ct.coach_id
      where c.profile_id = public.uid_or_null()
        and ct.role = 'lead_coach'
    )
  );

create policy "lead coaches can insert player notes for any team" on player_notes
  for insert with check (
    exists (
      select 1 from coach_team ct
      join coaches c on c.id = ct.coach_id
      where c.profile_id = public.uid_or_null()
        and ct.role = 'lead_coach'
    )
  );

create policy "lead coaches can update player notes for any team" on player_notes
  for update using (
    exists (
      select 1 from coach_team ct
      join coaches c on c.id = ct.coach_id
      where c.profile_id = public.uid_or_null()
        and ct.role = 'lead_coach'
    )
  );
