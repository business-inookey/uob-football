-- Sample Stat Definitions Migration
-- This adds common football statistics to the stat_definitions table

INSERT INTO stat_definitions (key, label, min_value, max_value, higher_is_better) VALUES
-- Physical Stats (0-100 scale)
('pace', 'Pace', 0, 100, true),
('shooting', 'Shooting', 0, 100, true),
('passing', 'Passing', 0, 100, true),
('dribbling', 'Dribbling', 0, 100, true),
('defending', 'Defending', 0, 100, true),
('physical', 'Physical', 0, 100, true),

-- Performance Stats (0-50 scale for countable stats)
('goals_scored', 'Goals Scored', 0, 50, true),
('assists', 'Assists', 0, 50, true),
('clean_sheets', 'Clean Sheets', 0, 50, true),
('saves', 'Saves', 0, 50, true),

-- Advanced Stats (0-100 percentage scale)
('pass_accuracy', 'Pass Accuracy %', 0, 100, true),
('tackle_success', 'Tackle Success %', 0, 100, true),
('aerial_duels_won', 'Aerial Duels Won %', 0, 100, true),
('shots_on_target', 'Shots on Target %', 0, 100, true),

-- Match Stats
('minutes_played', 'Minutes Played', 0, 90, true),
('yellow_cards', 'Yellow Cards', 0, 10, false),
('red_cards', 'Red Cards', 0, 5, false),
('fouls_committed', 'Fouls Committed', 0, 20, false),
('fouls_won', 'Fouls Won', 0, 20, true),

-- Fitness Stats
('distance_covered', 'Distance Covered (km)', 0, 15, true),
('sprint_count', 'Sprint Count', 0, 50, true),
('recovery_time', 'Recovery Time (hours)', 0, 168, false)

ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  min_value = EXCLUDED.min_value,
  max_value = EXCLUDED.max_value,
  higher_is_better = EXCLUDED.higher_is_better;
