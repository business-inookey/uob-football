import { requireCoach } from "@/lib/auth";
import BestXIClient from "./BestXIClient";

async function getTeams() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/teams`, { cache: 'no-store' })
  if (!res.ok) return [] as Array<{ code: string; name: string }>
  return res.json()
}

export default async function BestXIPage() {
  await requireCoach();
  const teams = await getTeams();
  const defaultTeam = teams[0]?.code ?? '1s';

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">Best XI</h1>
      <BestXIClient teams={teams} defaultTeam={defaultTeam} />
    </div>
  );
}


