/**
 * Aadhaar Verification - Provider Abstraction
 * 
 * Supports multiple providers:
 * - Surepass (recommended for quick start)
 * - API Setu (government gateway)
 * - Karza, IDfy (enterprise)
 * 
 * Usage:
 * ```ts
 * import { aadhaarClient } from '@/lib/aadhaar'
 * 
 * // Send OTP
 * const { transactionId } = await aadhaarClient.sendOTP('123456789012')
 * 
 * // Verify OTP
 * const result = await aadhaarClient.verifyOTP('123456789012', '123456', transactionId)
 * ```
 */

import type { AadhaarProvider, AadhaarProviderType } from './types'
import { surepassAadhaar } from './surepass-client'
import { apiSetuAadhaar } from './api-setu-client'

// Determine which provider to use based on env
const ACTIVE_PROVIDER: AadhaarProviderType = 
  (process.env.AADHAAR_PROVIDER as AadhaarProviderType) || 'surepass'

/**
 * Get the active Aadhaar verification provider
 */
function getAadhaarProvider(): AadhaarProvider {
  switch (ACTIVE_PROVIDER) {
    case 'api-setu':
      return apiSetuAadhaar
    case 'surepass':
      return surepassAadhaar
    // Add more providers here as needed
    // case 'karza':
    //   return karzaAadhaar
    // case 'idfy':
    //   return idfyAadhaar
    default:
      console.warn(`Unknown Aadhaar provider: ${ACTIVE_PROVIDER}, falling back to Surepass`)
      return surepassAadhaar
  }
}

/**
 * Active Aadhaar client
 * Automatically uses the configured provider
 */
export const aadhaarClient = getAadhaarProvider()

// Re-export types
export type { 
  AadhaarProvider, 
  AadhaarOTPResponse, 
  AadhaarVerificationResult,
  AadhaarProviderType,
} from './types'

// Re-export specific clients for direct use
export { surepassAadhaar } from './surepass-client'
export { apiSetuAadhaar } from './api-setu-client'
