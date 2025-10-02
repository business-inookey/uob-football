import { createClient } from './supabase/server'

export type DbError = {
  message: string
  code?: string
  details?: string
}

export function handleDbError(error: unknown): DbError {
  if (error?.message) {
    return {
      message: error.message,
      code: error.code,
      details: error.details,
    }
  }
  
  return {
    message: 'An unexpected database error occurred',
    code: 'UNKNOWN_ERROR',
  }
}

export async function withDbErrorHandling<T>(
  operation: () => Promise<T>
): Promise<{ data: T | null; error: DbError | null }> {
  try {
    const data = await operation()
    return { data, error: null }
  } catch (error) {
    return { data: null, error: handleDbError(error) }
  }
}

// Common query helpers
export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }
  
  return user
}

export async function getCurrentProfile() {
  const user = await getCurrentUser()
  if (!user) return null
  
  const supabase = await createClient()
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  
  if (error) return null
  return profile
}
