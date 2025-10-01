import { requireLeadCoach } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import NotesClient from './NotesClient';

export default async function NotesPage() {
  await requireLeadCoach();

  // Fetch teams and players data
  const supabase = await createClient();
  const [teamsResult, playersResult] = await Promise.all([
    supabase.from('teams').select('id, code, name').order('code'),
    supabase.from('players').select('id, full_name, current_team').order('full_name'),
  ]);

  const teams = teamsResult.data || [];
  const players = playersResult.data || [];

  return (
    <NotesClient teams={teams} players={players} />
  );
}