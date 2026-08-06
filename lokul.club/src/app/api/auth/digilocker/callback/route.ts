/**
 * DigiLocker OAuth Callback Handler
 * 
 * Handles the redirect from DigiLocker after user authentication
 * Creates/updates user in Supabase with DigiLocker credentials
 */

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { 
  exchangeCodeForToken, 
  getDigiLockerUser 
} from '@/lib/digilocker/client'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  // Handle errors from DigiLocker
  if (error) {
    console.error('DigiLocker OAuth error:', error)
    return NextResponse.redirect(
      new URL(`/login?error=digilocker_${error}`, request.url)
    )
  }

  // Validate authorization code
  if (!code) {
    return NextResponse.redirect(
      new URL('/login?error=missing_code', request.url)
    )
  }

  // TODO: Validate state parameter (CSRF protection)
  // const expectedState = cookies().get('digilocker_state')?.value
  // if (state !== expectedState) {
  //   return NextResponse.redirect(
  //     new URL('/login?error=invalid_state', request.url)
  //   )
  // }

  try {
    // Exchange code for access token
    const tokenData = await exchangeCodeForToken(code)
    
    // Get user info from DigiLocker
    const diglockerUser = await getDigiLockerUser(tokenData.access_token)

    // Create Supabase admin client
    const supabase = createServerSupabaseClient()

    // Check if user with this DigiLocker ID already exists
    let supabaseUser: any

    // First, try to find by digilocker_id in user metadata
    const { data: existingUsers } = await supabase
      .from('User')
      .select('*')
      .eq('digilockerId', diglockerUser.id)
      .single()

    if (existingUsers) {
      // User exists - update last login
      supabaseUser = existingUsers
    } else {
      // New user - create account
      // Use phone or email from DigiLocker if available
      const email = diglockerUser.email || `digilocker_${diglockerUser.id}@lokul.club`
      const phone = diglockerUser.mobile

      // Create auth user in Supabase
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        phone,
        email_confirm: true,
        phone_confirm: true,
        user_metadata: {
          name: diglockerUser.name,
          digilocker_id: diglockerUser.id,
          digilocker_verified: true,
          source: 'digilocker',
        },
      })

      if (authError) {
        throw new Error(`Failed to create Supabase user: ${authError.message}`)
      }

      // Create User record in database
      const { data: userData, error: userError } = await supabase
        .from('User')
        .insert({
          id: authData.user.id,
          email: email,
          phone: phone,
          name: diglockerUser.name,
          digilockerId: diglockerUser.id,
          diglockerVerified: true,
          diglockerName: diglockerUser.name,
          diglockerDob: new Date(diglockerUser.dob),
          diglockerGender: diglockerUser.gender,
          role: 'user',
        })
        .select()
        .single()

      if (userError) {
        console.error('Failed to create User record:', userError)
        // Auth user created but DB record failed - cleanup might be needed
      }

      supabaseUser = userData
    }

    // Create session for the user
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: supabaseUser.email,
    })

    if (sessionError) {
      throw new Error(`Failed to generate session: ${sessionError.message}`)
    }

    // Set session cookie and redirect to home
    const cookieStore = cookies()
    
    // Store DigiLocker access token for document requests
    cookieStore.set('digilocker_token', tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokenData.expires_in,
      path: '/',
    })

    // Redirect to home/dashboard
    const redirectUrl = new URL('/', request.url)
    const response = NextResponse.redirect(redirectUrl)

    return response

  } catch (error) {
    console.error('DigiLocker callback error:', error)
    return NextResponse.redirect(
      new URL('/login?error=authentication_failed', request.url)
    )
  }
}
