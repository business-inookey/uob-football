import { requireCoach } from "@/lib/auth";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import VideoClient from "./VideoClient";

async function getTeams() {
  const supabase = await createClient();
  const { data: teams } = await supabase
    .from('teams')
    .select('code, name')
    .order('code');
  return teams || [];
}

async function getVideoAssets(team: string) {
  const supabase = await createClient();
  const serviceSupabase = await createServiceClient();
  
  // Use service client to bypass RLS (similar to API)
  let query = serviceSupabase
    .from('video_assets')
    .select(`
      id,
      title,
      url,
      provider,
      meta,
      team_id,
      created_at
    `)
    .order('created_at', { ascending: false });

  // Filter by team if specified
  if (team && team !== 'all' && team !== '') {
    const { data: teamData } = await serviceSupabase
      .from('teams')
      .select('id')
      .eq('code', team)
      .single();
    
    if (teamData) {
      query = query.eq('team_id', teamData.id);
    }
  }

  const { data: videoAssets, error } = await query;
  
  if (error) {
    console.error('Error fetching video assets:', error);
    return [];
  }

  if (!videoAssets || videoAssets.length === 0) {
    return [];
  }

  // Get team names for the video assets
  const teamIds = [...new Set(videoAssets.map(v => v.team_id).filter(Boolean))];
  const { data: teams } = await serviceSupabase
    .from('teams')
    .select('id, code, name')
    .in('id', teamIds);

  // Map team names to video assets
  const videoAssetsWithTeams = videoAssets.map(asset => ({
    ...asset,
    teams: teams?.find(t => t.id === asset.team_id) || null
  }));
  
  return videoAssetsWithTeams;
}

export default async function VideoPage({ searchParams }: { searchParams?: Promise<{ team?: string }> }) {
  await requireCoach();
  const params = await searchParams;
  const teams = await getTeams();
  const team = params?.team || teams[0]?.code || '';
  const videoAssets = await getVideoAssets(team);

  return (
    <VideoClient teams={teams} team={team} videoAssets={videoAssets as any} />
  );
}