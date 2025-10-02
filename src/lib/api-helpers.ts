import { z } from 'zod'
import { ErrorResponse } from './zod'

// Error types for consistent error handling
export class APIError extends Error {
  constructor(
    public message: string,
    public status: number,
    public code?: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'APIError'
  }
}

// Predefined error types
export const ValidationError = (message: string, details?: unknown) => 
  new APIError(message, 400, 'VALIDATION_ERROR', details)

export const UnauthorizedError = (message: string = 'Unauthorized') => 
  new APIError(message, 401, 'UNAUTHORIZED')

export const ForbiddenError = (message: string = 'Forbidden') => 
  new APIError(message, 403, 'FORBIDDEN')

export const NotFoundError = (message: string = 'Not found') => 
  new APIError(message, 404, 'NOT_FOUND')

export const ConflictError = (message: string, details?: unknown) => 
  new APIError(message, 409, 'CONFLICT', details)

export const InternalError = (message: string = 'Internal server error', details?: unknown) => 
  new APIError(message, 500, 'INTERNAL_ERROR', details)

// Helper to create error responses
export function createErrorResponse(error: APIError): Response {
  const errorResponse: z.infer<typeof ErrorResponse> = {
    error: error.message,
    code: error.code,
    details: error.details
  }
  
  return new Response(JSON.stringify(errorResponse), {
    status: error.status,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

// Helper to handle unknown errors
export function handleUnknownError(error: unknown): Response {
  console.error('Unexpected error:', error)
  
  if (error instanceof APIError) {
    return createErrorResponse(error)
  }
  
  if (error instanceof Error) {
    return createErrorResponse(InternalError(error.message))
  }
  
  return createErrorResponse(InternalError('An unexpected error occurred'))
}

// Helper to validate request body with Zod
export async function validateBody<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<T> {
  try {
    const json = await request.json()
    const result = schema.safeParse(json)
    
    if (!result.success) {
      const details = result.error.issues.map(issue => ({
        path: issue.path.join('.'),
        message: issue.message,
        code: issue.code
      }))
      throw ValidationError('Invalid request body', details)
    }
    
    return result.data
  } catch (error) {
    if (error instanceof APIError) {
      throw error
    }
    throw ValidationError('Invalid JSON in request body')
  }
}

// Helper to validate query parameters with Zod
export function validateQuery<T>(
  searchParams: URLSearchParams,
  schema: z.ZodSchema<T>
): T {
  const params = Object.fromEntries(searchParams.entries())
  const result = schema.safeParse(params)
  
  if (!result.success) {
    const details = result.error.issues.map(issue => ({
      path: issue.path.join('.'),
      message: issue.message,
      code: issue.code
    }))
    throw ValidationError('Invalid query parameters', details)
  }
  
  return result.data
}

// Helper to validate path parameters with Zod
export function validateParams<T>(
  params: Record<string, string | string[] | undefined>,
  schema: z.ZodSchema<T>
): T {
  const result = schema.safeParse(params)
  
  if (!result.success) {
    const details = result.error.issues.map(issue => ({
      path: issue.path.join('.'),
      message: issue.message,
      code: issue.code
    }))
    throw ValidationError('Invalid path parameters', details)
  }
  
  return result.data
}

// Helper to create success responses
export function createSuccessResponse(data?: unknown, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

// Helper to handle Supabase errors
export function handleSupabaseError(error: unknown, context?: string): never {
  console.error(`Supabase error${context ? ` in ${context}` : ''}:`, error)
  
  // Handle specific Supabase error codes
  if (error?.code === 'PGRST116') {
    throw NotFoundError('Resource not found')
  }
  
  if (error?.code === '23505') {
    throw ConflictError('Resource already exists')
  }
  
  if (error?.code === '23503') {
    throw ConflictError('Referenced resource does not exist')
  }
  
  if (error?.code === '42501') {
    throw ForbiddenError('Insufficient permissions')
  }
  
  // Generic database error
  throw InternalError(`Database error: ${error?.message || 'Unknown error'}`)
}

// Wrapper for route handlers with error handling
export function withErrorHandling<T extends unknown[]>(
  handler: (...args: T) => Promise<Response>
) {
  return async (...args: T): Promise<Response> => {
    try {
      return await handler(...args)
    } catch (error) {
      return handleUnknownError(error)
    }
  }
}

// Helper to check authentication
export async function requireAuth(supabase: unknown) {
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    throw InternalError('Failed to verify authentication')
  }
  
  if (!user) {
    throw UnauthorizedError('Authentication required')
  }
  
  return user
}

// Helper to check team access
export async function requireTeamAccess(
  supabase: unknown,
  user: unknown,
  teamCode: string
) {
  // Check if user is a coach for this team
  const { data: coachTeam, error } = await supabase
    .from('coach_team')
    .select(`
      id,
      teams!inner(code, name)
    `)
    .eq('coach_id', user.id)
    .eq('teams.code', teamCode)
    .maybeSingle()
  
  if (error) {
    handleSupabaseError(error, 'team access check')
  }
  
  if (!coachTeam) {
    throw ForbiddenError(`Access denied for team ${teamCode}`)
  }
  
  return coachTeam
}

// Helper to check lead coach access
export async function requireLeadCoachAccess(
  supabase: unknown,
  user: unknown,
  teamCode: string
) {
  const { data: coachTeam, error } = await supabase
    .from('coach_team')
    .select(`
      id,
      role,
      teams!inner(code, name)
    `)
    .eq('coach_id', user.id)
    .eq('teams.code', teamCode)
    .eq('role', 'lead')
    .maybeSingle()
  
  if (error) {
    handleSupabaseError(error, 'lead coach access check')
  }
  
  if (!coachTeam) {
    throw ForbiddenError(`Lead coach access required for team ${teamCode}`)
  }
  
  return coachTeam
}
