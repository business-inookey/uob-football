-- UoB Football Seed Data
-- Run this after all migrations

-- Insert teams
insert into teams (code, name) values
('1s', 'Firsts'),
('2s', 'Seconds'),
('3s', 'Thirds'),
('4s', 'Fourths'),
('5s', 'Fifths'),
('Devs', 'Development');

-- Insert stat definitions
insert into stat_definitions (key, label, higher_is_better) values
('speed', 'Speed', true),
('stamina', 'Stamina', true),
('strength', 'Strength', true),
('passing', 'Passing', true),
('dribbling', 'Dribbling', true),
('finishing', 'Finishing', true),
('tackling', 'Tackling', true),
('positioning', 'Positioning', true),
('crossing', 'Crossing', true),
('shooting', 'Shooting', true),
('heading', 'Heading', true),
('agility', 'Agility', true),
('balance', 'Balance', true),
('jumping', 'Jumping', true),
('reactions', 'Reactions', true);

-- NOTE: Removed auth.users trigger due to permissions. Profiles are created app-side.
