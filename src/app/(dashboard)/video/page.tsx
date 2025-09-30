import { requireCoach } from "@/lib/auth";
import VideoClient from "./VideoClient";

async function getTeams() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/teams`, { cache: 'no-store' })
  if (!res.ok) return [] as Array<{ code: string; name: string }>
  return res.json()
}

async function getVideoAssets(team: string) {
  const params = new URLSearchParams()
  if (team) params.set('team', team)
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/video-assets?${params}`, { cache: 'no-store' })
  if (!res.ok) return []
  return res.json()
}

export default async function VideoPage({ searchParams }: { searchParams?: Promise<{ team?: string }> }) {
  await requireCoach();
  const params = await searchParams
  const teams = await getTeams();
  const team = params?.team || 'all'
  const videoAssets = await getVideoAssets(team)

  return (
    <VideoClient teams={teams} team={team} videoAssets={videoAssets} />
  );
}