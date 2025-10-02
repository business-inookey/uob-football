import { z } from 'zod'

// Common enums and types
export const TeamCode = z.enum(['1s', '2s', '3s', '4s', '5s', 'Devs'])
export const Position = z.enum(['GK', 'DEF', 'MID', 'WNG', 'ST'])
export const AttendanceStatus = z.enum(['present', 'absent', 'late', 'excused'])
export const RoleCode = z.enum(['lead', 'assistant'])

// UUID validation
export const UUID = z.string().uuid()
export const DateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
export const DateTimeString = z.string().datetime()

// Query parameter schemas
export const TeamQuery = z.object({
  team: z.string().min(1)
})

export const DateQuery = z.object({
  date: DateString
})

export const PlayerQuery = z.object({
  player_id: UUID
})

export const MonthQuery = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/)
})

// Team schemas
export const Team = z.object({
  id: UUID,
  code: TeamCode,
  name: z.string().min(1)
})

export const TeamResponse = z.object({
  team: Team,
  weights: z.array(z.object({
    stat_key: z.string(),
    weight: z.number()
  }))
})

// Player schemas
export const Player = z.object({
  id: UUID,
  full_name: z.string().min(1),
  primary_position: Position,
  current_team: TeamCode
})

export const PlayerImportRow = z.object({
  full_name: z.string().min(1),
  primary_position: z.string().min(1), // Will be mapped to Position
  current_team: TeamCode
})

export const PlayerImportBody = z.object({
  rows: z.array(PlayerImportRow).min(1)
})

// Stats schemas
export const StatEntry = z.object({
  player_id: UUID,
  stat_key: z.string().min(1),
  value: z.number().min(0),
  team_code: z.string().min(1)
})

export const StatsBody = z.object({
  entries: z.array(StatEntry).min(1)
})

// Attendance schemas
export const AttendanceEntry = z.object({
  player_id: UUID,
  team_code: z.string().min(1),
  date: DateString,
  status: AttendanceStatus,
  notes: z.string().optional()
})

export const AttendanceBody = z.object({
  entries: z.array(AttendanceEntry).min(1)
})

// Game schemas
export const GamePayload = z.object({
  id: UUID.optional(),
  home_team: z.string().min(1), // team code
  away_team: z.string().min(1), // team code
  kickoff_at: DateTimeString,
  location: z.string().optional(),
  notes: z.string().optional()
})

// Weight schemas
export const WeightItem = z.object({
  stat_key: z.string().min(1),
  weight: z.number().min(0.5).max(1.5)
})

export const WeightsBody = z.object({
  team_code: z.string().min(1),
  weights: z.array(WeightItem).min(1)
})

// Best XI schemas
export const BestXIQuery = z.object({
  team: z.string().min(1),
  formation: z.string().optional()
})

// Video schemas
export const VideoAsset = z.object({
  id: UUID.optional(),
  team_id: UUID,
  game_id: UUID.optional(),
  title: z.string().min(1),
  url: z.string().url(),
  description: z.string().optional(),
  recorded_at: DateTimeString.optional()
})

// Notes schemas
export const PlayerNote = z.object({
  id: UUID.optional(),
  player_id: UUID,
  team_id: UUID,
  note: z.string().min(1),
  created_by: UUID.optional()
})

// Drill schemas
export const DrillSession = z.object({
  id: UUID.optional(),
  team_id: UUID,
  drill_name: z.string().min(1),
  started_at: DateTimeString,
  ended_at: DateTimeString.optional(),
  created_by: UUID.optional()
})

export const DrillLap = z.object({
  session_id: UUID,
  player_id: UUID,
  lap_time: z.number().min(0), // in seconds
  recorded_at: DateTimeString
})

// Response schemas
export const SuccessResponse = z.object({
  ok: z.literal(true)
})

export const ErrorResponse = z.object({
  error: z.string(),
  code: z.string().optional(),
  details: z.any().optional()
})

export const BatchResult = z.object({
  ok: z.literal(true),
  results: z.array(z.object({
    status: z.enum(['inserted', 'updated', 'skipped']),
    reason: z.string().optional()
  }).and(z.record(z.any()))) // Allow additional fields
})

// Type exports
export type TeamCode = z.infer<typeof TeamCode>
export type Position = z.infer<typeof Position>
export type AttendanceStatus = z.infer<typeof AttendanceStatus>
export type RoleCode = z.infer<typeof RoleCode>
export type Team = z.infer<typeof Team>
export type Player = z.infer<typeof Player>
export type StatEntry = z.infer<typeof StatEntry>
export type AttendanceEntry = z.infer<typeof AttendanceEntry>
export type GamePayload = z.infer<typeof GamePayload>
export type WeightItem = z.infer<typeof WeightItem>
export type VideoAsset = z.infer<typeof VideoAsset>
export type PlayerNote = z.infer<typeof PlayerNote>
export type DrillSession = z.infer<typeof DrillSession>
export type DrillLap = z.infer<typeof DrillLap>
export type BatchResult = z.infer<typeof BatchResult>
