import { requireCoach } from "@/lib/auth";
import GamesClient from "./GamesClient";

async function getTeams() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/teams`, { cache: 'no-store' })
  if (!res.ok) return [] as Array<{ code: string; name: string }>
  return res.json()
}

async function getGames(team: string, month: string) {
  const params = new URLSearchParams()
  if (team) params.set('team', team)
  if (month) params.set('month', month)
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/games?${params}`, { cache: 'no-store' })
  if (!res.ok) return []
  return res.json()
}

export default async function GamesPage({ searchParams }: { searchParams?: Promise<{ team?: string; month?: string }> }) {
  await requireCoach();
  const params = await searchParams
  const teams = await getTeams();
  const team = params?.team || 'all'
  const month = params?.month || new Date().toISOString().slice(0,7)
  const games = await getGames(team, month)

  return (
    <GamesClient teams={teams} team={team} month={month} games={games} />
  );
}


