import { requireCoach } from "@/lib/auth";

export default async function VideoPage() {
  await requireCoach();
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Video</h1>
      <p className="text-sm text-muted-foreground">Veo 3 placeholder. Coming soon.</p>
    </div>
  );
}


