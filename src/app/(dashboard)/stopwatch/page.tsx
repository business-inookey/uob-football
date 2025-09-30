import { requireCoach } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import StopwatchClient from './StopwatchClient';

export default async function StopwatchPage() {
  await requireCoach();

  // Fetch only teams data - players will be fetched dynamically
  const supabase = await createClient();
  const teamsResult = await supabase.from('teams').select('id, code, name').order('code');

  const teams = teamsResult.data || [];

  // Debug logging
  console.log('Teams fetched:', teams.length, teams);
  if (teamsResult.error) console.error('Teams error:', teamsResult.error);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Stopwatch Drills</h1>
        <p className="text-muted-foreground mt-2">
          Time player laps and automatically update pace & stamina stats
        </p>
      </div>
      
      <StopwatchClient teams={teams} />
    </div>
  );
}
