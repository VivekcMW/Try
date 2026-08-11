/**
 * Surepass Aadhaar Verification Client
 * 
 * Docs: https://docs.surepass.io/
 * Signup: https://surepass.io/signup
 */

import type { AadhaarProvider, AadhaarOTPResponse, AadhaarVerificationResult } from './types'

const SUREPASS_CONFIG = {
  apiKey: process.env.SUREPASS_API_KEY!,
  baseUrl: process.env.SUREPASS_BASE_URL || 'https://kyc-api.surepass.io',
  sandbox: process.env.SUREPASS_ENV === 'sandbox',
}

if (!SUREPASS_CONFIG.apiKey && process.env.NODE_ENV === 'production') {
  console.warn('⚠️  Surepass API key not configured')
}

class SurepassAadhaarClient implements AadhaarProvider {
  private apiKey: string
  private baseUrl: string

  constructor(apiKey?: string, baseUrl?: string) {
    this.apiKey = apiKey || SUREPASS_CONFIG.apiKey
    this.baseUrl = baseUrl || SUREPASS_CONFIG.baseUrl
  }

  private ensureConfigured() {
    if (!this.apiKey) {
      throw new Error('Surepass API key is required')
    }
  }

  /**
   * Send OTP to Aadhaar-linked mobile
   */
  async sendOTP(aadhaarNumber: string): Promise<AadhaarOTPResponse> {
    this.ensureConfigured()
    // Validate Aadhaar number (12 digits)
    if (!/^\d{12}$/.test(aadhaarNumber)) {
      throw new Error('Invalid Aadhaar number format')
    }

    const response = await fetch(`${this.baseUrl}/api/v1/aadhaar-v2/generate-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        id_number: aadhaarNumber,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Surepass OTP failed: ${error.message || response.statusText}`)
    }

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.message || 'Failed to send OTP')
    }

    return {
      success: true,
      transactionId: data.data.client_id,
      message: 'OTP sent successfully',
      validUntil: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    }
  }

  /**
   * Verify OTP and get eKYC data
   */
  async verifyOTP(
    aadhaarNumber: string,
    otp: string,
    transactionId: string
  ): Promise<AadhaarVerificationResult> {
    // Validate OTP (6 digits)
    if (!/^\d{6}$/.test(otp)) {
      throw new Error('Invalid OTP format')
    }

    const response = await fetch(`${this.baseUrl}/api/v1/aadhaar-v2/submit-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        client_id: transactionId,
        otp: otp,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      return {
        success: false,
        verified: false,
        error: error.message || 'OTP verification failed',
      }
    }

    const data = await response.json()

    if (!data.success) {
      return {
        success: false,
        verified: false,
        error: data.message || 'Verification failed',
      }
    }

    // Parse Surepass response
    const kyc = data.data

    return {
      success: true,
      verified: true,
      data: {
        aadhaarNumber: maskAadhaar(aadhaarNumber),
        name: kyc.full_name || kyc.name,
        dob: kyc.dob, // Format: DD-MM-YYYY or YYYY-MM-DD
        gender: parseGender(kyc.gender),
        address: {
          line1: kyc.address?.house || kyc.care_of || '',
          line2: kyc.address?.street || kyc.address?.landmark,
          city: kyc.address?.dist || kyc.address?.district || '',
          state: kyc.address?.state || '',
          pincode: kyc.address?.zip || kyc.zip || '',
          country: kyc.address?.country || 'India',
        },
        photo: kyc.profile_image || kyc.photo_link,
        email: kyc.email,
        mobile: kyc.mobile_hash || kyc.phone,
      },
    }
  }
}

// Helper functions

function maskAadhaar(aadhaar: string): string {
  if (aadhaar.length !== 12) return aadhaar
  return `XXXX XXXX ${aadhaar.slice(-4)}`
}

function parseGender(gender: string): 'M' | 'F' | 'O' {
  const g = gender?.toUpperCase()
  if (g === 'M' || g === 'MALE') return 'M'
  if (g === 'F' || g === 'FEMALE') return 'F'
  return 'O'
}

// Export singleton instance
export const surepassAadhaar = new SurepassAadhaarClient()

// Export class for custom instances
export { SurepassAadhaarClient }
