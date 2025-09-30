import { requireCoach } from "@/lib/auth";

export default async function BestXIPage() {
  await requireCoach();
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Best XI</h1>
      <p className="text-sm text-muted-foreground">Formation and export. Coming soon.</p>
    </div>
  );
}


