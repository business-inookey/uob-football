import { requireCoach } from "@/lib/auth";

export default async function DashboardPage() {
  const { profile, teams } = await requireCoach();
  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Welcome, {profile.full_name}</h1>
        <p className="text-sm text-muted-foreground">Manage your team data</p>
      </div>
      <div>
        <h2 className="font-semibold mb-2">Your Teams</h2>
        {teams?.length ? (
          <ul className="list-disc pl-6">
            {teams.map((t: any) => (
              <li key={`${t.team_id}-${t.role}`}>{t.teams?.name ?? t.team_id} — {t.role}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No team access yet.</p>
        )}
      </div>
    </div>
  );
}


