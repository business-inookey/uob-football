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

  // Debug logging
  console.log('Notes page - Teams fetched:', teams.length);
  console.log('Notes page - Players fetched:', players.length);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Player Notes</h1>
        <p className="text-muted-foreground mt-2">
          Add and manage notes for players by team
        </p>
      </div>
      
      <NotesClient teams={teams} players={players} />
    </div>
  );
}
