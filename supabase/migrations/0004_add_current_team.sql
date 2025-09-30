-- Add current_team column to players table
-- This allows direct team assignment without using player_team_history

-- Add current_team column to players table
alter table players add column current_team team_code;

-- Create index for better performance
create index idx_players_current_team on players(current_team);

-- Update existing players to have a default team (optional)
-- update players set current_team = '1s' where current_team is null;
