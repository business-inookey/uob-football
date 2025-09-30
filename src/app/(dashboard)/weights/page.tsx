import { requireCoach } from "@/lib/auth";

export default async function WeightsPage() {
  await requireCoach();
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Weights</h1>
      <p className="text-sm text-muted-foreground">Lead-coach only. Coming soon.</p>
    </div>
  );
}


