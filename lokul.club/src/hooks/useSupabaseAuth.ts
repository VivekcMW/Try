/**
 * useAuth Hook - Client-side authentication
 * 
 * Use this in client components to:
 * - Get current user
 * - Check auth state
 * - Sign in/out
 * - Listen to auth changes
 */

'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { User, Session } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  return {
    user,
    session,
    loading,
    isAuthenticated: !!user,
    signOut: () => supabase.auth.signOut(),
  }
}

/**
 * Phone OTP Authentication
 */
export function usePhoneAuth() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendOTP = async (phone: string) => {
    try {
      setLoading(true)
      setError(null)

      const { error } = await supabase.auth.signInWithOtp({
        phone,
      })

      if (error) throw error

      return { success: true }
    } catch (err: any) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const verifyOTP = async (phone: string, token: string) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: 'sms',
      })

      if (error) throw error

      return { success: true, session: data.session }
    } catch (err: any) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  return {
    sendOTP,
    verifyOTP,
    loading,
    error,
  }
}

/**
 * Email/Password Authentication (for Admin)
 */
export function useEmailAuth() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      return { success: true, session: data.session }
    } catch (err: any) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      })

      if (error) throw error

      return { success: true, user: data.user }
    } catch (err: any) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  return {
    signIn,
    signUp,
    loading,
    error,
  }
}
