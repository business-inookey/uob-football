import { requireCoach } from "@/lib/auth";

export default async function GamesPage() {
  await requireCoach();
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Games</h1>
      <p className="text-sm text-muted-foreground">Intra-club fixtures. Coming soon.</p>
    </div>
  );
}


