/**
 * API Setu Aadhaar Verification Client
 * 
 * Docs: https://apisetu.gov.in/
 * Apply: https://partners.apisetu.gov.in/
 */

import type { AadhaarProvider, AadhaarOTPResponse, AadhaarVerificationResult } from './types'

const API_SETU_CONFIG = {
  clientId: process.env.APISETU_AADHAAR_CLIENT_ID!,
  clientSecret: process.env.APISETU_AADHAAR_CLIENT_SECRET!,
  baseUrl: process.env.APISETU_AADHAAR_BASE_URL || 'https://apisetu.gov.in/certificate/v3/aadhaar',
  sandbox: process.env.APISETU_AADHAAR_ENV === 'sandbox',
}

if (!API_SETU_CONFIG.clientId && process.env.NODE_ENV === 'production') {
  console.warn('⚠️  API Setu Aadhaar not configured')
}

class APISetuAadhaarClient implements AadhaarProvider {
  private clientId: string
  private clientSecret: string
  private baseUrl: string

  constructor(clientId?: string, clientSecret?: string, baseUrl?: string) {
    this.clientId = clientId || API_SETU_CONFIG.clientId
    this.clientSecret = clientSecret || API_SETU_CONFIG.clientSecret
    this.baseUrl = baseUrl || API_SETU_CONFIG.baseUrl
  }

  private ensureConfigured() {
    if (!this.clientId || !this.clientSecret) {
      throw new Error('API Setu credentials are required')
    }
  }

  /**
   * Get access token for API Setu
   */
  private async getAccessToken(): Promise<string> {
    this.ensureConfigured()
    const response = await fetch(`${this.baseUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
      }).toString(),
    })

    if (!response.ok) {
      throw new Error('Failed to get API Setu access token')
    }

    const data = await response.json()
    return data.access_token
  }

  /**
   * Send OTP to Aadhaar-linked mobile
   */
  async sendOTP(aadhaarNumber: string): Promise<AadhaarOTPResponse> {
    // Validate Aadhaar number
    if (!/^\d{12}$/.test(aadhaarNumber)) {
      throw new Error('Invalid Aadhaar number format')
    }

    const accessToken = await this.getAccessToken()

    const response = await fetch(`${this.baseUrl}/otp/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        aadhaar_number: aadhaarNumber,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`API Setu OTP failed: ${error.message || response.statusText}`)
    }

    const data = await response.json()

    return {
      success: true,
      transactionId: data.transaction_id || data.txn_id,
      message: 'OTP sent to Aadhaar-linked mobile',
      validUntil: new Date(Date.now() + 10 * 60 * 1000),
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
    if (!/^\d{6}$/.test(otp)) {
      throw new Error('Invalid OTP format')
    }

    const accessToken = await this.getAccessToken()

    const response = await fetch(`${this.baseUrl}/otp/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        transaction_id: transactionId,
        otp: otp,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      return {
        success: false,
        verified: false,
        error: error.message || 'Verification failed',
      }
    }

    const data = await response.json()

    if (!data.verified) {
      return {
        success: false,
        verified: false,
        error: data.message || 'Invalid OTP',
      }
    }

    // Parse API Setu eKYC response
    const kyc = data.data || data.ekyc_data

    return {
      success: true,
      verified: true,
      data: {
        aadhaarNumber: kyc.masked_aadhaar || `XXXX XXXX ${aadhaarNumber.slice(-4)}`,
        name: kyc.name || kyc.full_name,
        dob: kyc.dob || kyc.date_of_birth,
        gender: parseGender(kyc.gender),
        address: {
          line1: kyc.address?.care_of || kyc.address?.house || '',
          line2: kyc.address?.street || kyc.address?.locality,
          city: kyc.address?.district || '',
          state: kyc.address?.state || '',
          pincode: kyc.address?.pincode || kyc.address?.zip || '',
          country: 'India',
        },
        photo: kyc.photo || kyc.profile_image,
        email: kyc.email,
        mobile: kyc.mobile,
      },
    }
  }
}

function parseGender(gender: string): 'M' | 'F' | 'O' {
  const g = gender?.toUpperCase()
  if (g === 'M' || g === 'MALE') return 'M'
  if (g === 'F' || g === 'FEMALE') return 'F'
  return 'O'
}

// Export singleton instance
export const apiSetuAadhaar = new APISetuAadhaarClient()

// Export class for custom instances
export { APISetuAadhaarClient }
