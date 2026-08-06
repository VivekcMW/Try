/**
 * Supabase Client - Server-side
 * 
 * Use this in:
 * - API routes (app/api/*)
 * - Server components
 * - Server actions
 * 
 * This uses the service_role key for admin operations.
 */

import { createClient } from '@supabase/supabase-js'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing env.SUPABASE_SERVICE_ROLE_KEY')
}

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

/**
 * Get user from Supabase Auth by access token
 */
export async function getSupabaseUser(accessToken: string) {
  const { data, error } = await supabaseAdmin.auth.getUser(accessToken)
  if (error || !data.user) {
    return null
  }
  return data.user
}

/**
 * Verify and get user session from request headers
 */
export async function getSupabaseSession(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  return getSupabaseUser(token)
}

/**
 * Create Supabase client for server components
 * Use this in Server Components and Server Actions
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

/**
 * Get current session in Server Components
 * Equivalent to NextAuth's getServerSession()
 */
export async function getServerSession() {
  // Check for local admin session cookie first (for local dev)
  const cookieStore = await cookies();
  const adminSession = cookieStore.get('admin_session');
  
  if (adminSession?.value === 'authenticated') {
    // Return a mock session for local admin
    return {
      user: {
        id: 'local-admin',
        email: process.env.ADMIN_EMAIL || 'admin@lokul.club',
        role: 'admin'
      },
      access_token: 'local-admin-token',
      token_type: 'bearer',
      expires_at: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    } as any;
  }

  // Fallback to Supabase auth
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

/**
 * Get current user in Server Components
 */
export async function getServerUser() {
  // Check for local admin session cookie first (for local dev)
  const cookieStore = await cookies();
  const adminSession = cookieStore.get('admin_session');
  
  if (adminSession?.value === 'authenticated') {
    // Return a mock user for local admin
    return {
      id: 'local-admin',
      email: process.env.ADMIN_EMAIL || 'admin@lokul.club',
      role: 'admin',
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    } as any;
  }

  // Fallback to Supabase auth
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
