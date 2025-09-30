import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('teams')
    .select('id, code, name')
    .order('code', { ascending: true })

  if (error) return new Response(error.message, { status: 400 })
  return Response.json(data)
}


