import { requireCoach } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import StopwatchClient from './StopwatchClient';

export default async function StopwatchPage() {
  await requireCoach();

  // Fetch only teams data - players will be fetched dynamically
  const supabase = await createClient();
  const teamsResult = await supabase.from('teams').select('id, code, name').order('code');

  const teams = teamsResult.data || [];

  return (
    <StopwatchClient teams={teams} />
  );
}