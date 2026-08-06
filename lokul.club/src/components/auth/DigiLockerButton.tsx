'use client'

import { useState } from 'react'
import { getDigiLockerAuthUrl } from '@/lib/digilocker/client'

interface DigiLockerButtonProps {
  className?: string
  variant?: 'default' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  onError?: (error: Error) => void
}

/**
 * DigiLocker SSO Login Button
 * 
 * Initiates OAuth flow with DigiLocker for government-verified authentication
 */
export default function DigiLockerButton({
  className = '',
  variant = 'default',
  size = 'md',
  onError,
}: DigiLockerButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    try {
      setLoading(true)

      // Generate CSRF state token
      const state = Math.random().toString(36).substring(2) + Date.now().toString(36)
      
      // Store state in sessionStorage for validation
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('digilocker_oauth_state', state)
      }

      // Get DigiLocker authorization URL
      const authUrl = getDigiLockerAuthUrl(state)

      // Redirect to DigiLocker
      window.location.href = authUrl

    } catch (error) {
      console.error('DigiLocker login error:', error)
      setLoading(false)
      
      if (onError && error instanceof Error) {
        onError(error)
      }
    }
  }

  // Styling based on variant and size
  const baseStyles = 'inline-flex items-center justify-center gap-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const variantStyles = {
    default: 'bg-[#FF6B35] hover:bg-[#E85A28] text-white focus:ring-[#FF6B35]',
    outline: 'border-2 border-[#FF6B35] text-[#FF6B35] hover:bg-[#FF6B35] hover:text-white focus:ring-[#FF6B35]',
  }

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }

  const disabledStyles = loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'

  return (
    <button
      type="button"
      onClick={handleLogin}
      disabled={loading}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabledStyles} ${className}`}
    >
      {/* DigiLocker Logo */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        <path
          d="M12 2L4 6V12C4 16.5 7.5 20.5 12 22C16.5 20.5 20 16.5 20 12V6L12 2Z"
          fill="currentColor"
          opacity="0.3"
        />
        <path
          d="M12 22C16.5 20.5 20 16.5 20 12V6L12 2L4 6V12C4 16.5 7.5 20.5 12 22Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9 12L11 14L15 10"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <span>
        {loading ? 'Connecting...' : 'Login with DigiLocker'}
      </span>
    </button>
  )
}

/**
 * Compact DigiLocker icon button (for mobile/compact layouts)
 */
export function DigiLockerIconButton({
  className = '',
  onError,
}: Omit<DigiLockerButtonProps, 'size' | 'variant'>) {
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    try {
      setLoading(true)
      const state = Math.random().toString(36).substring(2)
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('digilocker_oauth_state', state)
      }
      const authUrl = getDigiLockerAuthUrl(state)
      window.location.href = authUrl
    } catch (error) {
      console.error('DigiLocker login error:', error)
      setLoading(false)
      if (onError && error instanceof Error) {
        onError(error)
      }
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogin}
      disabled={loading}
      className={`p-3 rounded-lg bg-[#FF6B35] hover:bg-[#E85A28] text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:ring-offset-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      title="Login with DigiLocker"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 2L4 6V12C4 16.5 7.5 20.5 12 22C16.5 20.5 20 16.5 20 12V6L12 2Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9 12L11 14L15 10"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}
