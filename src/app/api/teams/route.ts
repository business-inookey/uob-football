import { createClient } from '@/lib/supabase/server'
import { withErrorHandling, handleSupabaseError, createSuccessResponse } from '@/lib/api-helpers'

async function getTeams() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('teams')
    .select('id, code, name')
    .order('code', { ascending: true })

  if (error) {
    handleSupabaseError(error, 'fetching teams')
  }

  return createSuccessResponse(data)
}

export const GET = withErrorHandling(getTeams)


