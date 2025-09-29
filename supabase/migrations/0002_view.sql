-- UoB Football Composite View Migration
-- Run this after 0001_core.sql

-- Helper function for current user ID (moved to public to avoid auth schema perms)
create or replace function public.uid_or_null() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claims', true)::jsonb->>'sub','')::uuid
$$;

-- Composite view using global min/max per stat
create view v_player_composite as
with mm as (
  select sd.key,
         min(ps.value)::numeric as min_v,
         max(ps.value)::numeric as max_v
  from stat_definitions sd
  left join player_stats ps on ps.stat_key = sd.key
  group by sd.key
),
norm as (
  select
    ps.player_id,
    ps.team_id,
    ps.stat_key,
    case
      when mm.max_v = mm.min_v then 0.5
      else case
        when sd.higher_is_better
          then (ps.value - mm.min_v) / nullif(mm.max_v - mm.min_v,0)
        else (mm.max_v - ps.value) / nullif(mm.max_v - mm.min_v,0)
      end
    end as norm_v
  from player_stats ps
  join stat_definitions sd on sd.key = ps.stat_key
  join mm on mm.key = ps.stat_key
),
w as (
  select team_id, stat_key, weight from team_weights
)
select
  n.player_id,
  n.team_id,
  sum(n.norm_v * coalesce(w.weight, 1)) as composite_score
from norm n
left join w on w.team_id = n.team_id and w.stat_key = n.stat_key
group by n.player_id, n.team_id;
