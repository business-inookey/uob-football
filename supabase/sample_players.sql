-- Sample Players for Testing
-- Run this in Supabase SQL Editor to add test players

-- Insert sample players for each team
insert into players (full_name, primary_position, current_team) values
-- Firsts team
('John Smith', 'GK', '1s'),
('Mike Johnson', 'DEF', '1s'),
('David Brown', 'DEF', '1s'),
('Tom Wilson', 'DEF', '1s'),
('James Davis', 'DEF', '1s'),
('Alex Miller', 'MID', '1s'),
('Chris Garcia', 'MID', '1s'),
('Ryan Martinez', 'MID', '1s'),
('Sam Anderson', 'WNG', '1s'),
('Luke Taylor', 'WNG', '1s'),
('Ben Thomas', 'ST', '1s'),
('Jake Jackson', 'ST', '1s'),

-- Seconds team
('Oliver White', 'GK', '2s'),
('Harry Harris', 'DEF', '2s'),
('George Martin', 'DEF', '2s'),
('Jack Thompson', 'DEF', '2s'),
('Charlie Garcia', 'DEF', '2s'),
('William Martinez', 'MID', '2s'),
('James Robinson', 'MID', '2s'),
('Henry Clark', 'MID', '2s'),
('Thomas Rodriguez', 'WNG', '2s'),
('Daniel Lewis', 'WNG', '2s'),
('Matthew Lee', 'ST', '2s'),
('Joseph Walker', 'ST', '2s'),

-- Development team
('Robert Hall', 'GK', 'Devs'),
('Christopher Allen', 'DEF', 'Devs'),
('Daniel Young', 'DEF', 'Devs'),
('Matthew King', 'DEF', 'Devs'),
('Anthony Wright', 'DEF', 'Devs'),
('Mark Lopez', 'MID', 'Devs'),
('Donald Hill', 'MID', 'Devs'),
('Steven Scott', 'MID', 'Devs'),
('Paul Green', 'WNG', 'Devs'),
('Andrew Adams', 'WNG', 'Devs'),
('Joshua Baker', 'ST', 'Devs'),
('Kenneth Gonzalez', 'ST', 'Devs');
