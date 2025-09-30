import { requireCoach } from "@/lib/auth";

export default async function ComparePage() {
  await requireCoach();
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Compare</h1>
      <p className="text-sm text-muted-foreground">Up to 4 players. Coming soon.</p>
    </div>
  );
}


