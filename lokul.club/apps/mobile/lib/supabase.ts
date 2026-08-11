/**
 * Supabase Client - React Native (Mobile App)
 * 
 * Handles authentication and data access for the mobile app.
 * Uses AsyncStorage for session persistence.
 */

import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Constants from 'expo-constants'

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? Constants.expoConfig?.extra?.supabaseUrl
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? Constants.expoConfig?.extra?.supabaseAnonKey

// Don't throw at import time — expo-router loads every route module eagerly
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Missing Supabase credentials — email login disabled. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to .env'
  )
}

export const supabase = createClient(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  supabaseAnonKey ?? 'placeholder-anon-key',
  {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Not needed for mobile
  },
})

/**
 * Send OTP to phone number
 * @param phone Phone number in E.164 format (e.g., +919876543210)
 */
export async function sendPhoneOTP(phone: string) {
  const { data, error } = await supabase.auth.signInWithOtp({
    phone,
    options: {
      // Optional: Set session data
      data: {
        app: 'mobile',
      },
    },
  })

  if (error) {
    throw error
  }

  return data
}

/**
 * Verify OTP and sign in
 * @param phone Phone number in E.164 format
 * @param token 6-digit OTP code
 */
export async function verifyPhoneOTP(phone: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: 'sms',
  })

  if (error) {
    throw error
  }

  return data
}

/**
 * Get current user
 */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) {
    console.error('Error getting user:', error)
    return null
  }
  return user
}

/**
 * Get current session
 */
export async function getCurrentSession() {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) {
    console.error('Error getting session:', error)
    return null
  }
  return session
}

/**
 * Sign out
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    throw error
  }
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(callback: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange(callback)
}

/**
 * Get access token for API calls
 */
export async function getAccessToken() {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token
}
