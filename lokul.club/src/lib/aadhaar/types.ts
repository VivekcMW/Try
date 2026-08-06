/**
 * Aadhaar Verification Types
 * 
 * Common types used across all Aadhaar verification providers
 */

export interface AadhaarOTPResponse {
  success: boolean
  transactionId: string
  message: string
  validUntil?: Date
}

export interface AadhaarVerificationResult {
  success: boolean
  verified: boolean
  data?: {
    aadhaarNumber: string // Masked (XXXX XXXX 1234)
    name: string
    dob: string // YYYY-MM-DD
    gender: 'M' | 'F' | 'O'
    address: {
      line1: string
      line2?: string
      city: string
      state: string
      pincode: string
      country: string
    }
    photo?: string // Base64 encoded image
    email?: string
    mobile?: string
  }
  error?: string
}

export interface AadhaarProvider {
  /**
   * Send OTP to Aadhaar-linked mobile number
   */
  sendOTP(aadhaarNumber: string): Promise<AadhaarOTPResponse>

  /**
   * Verify OTP and fetch eKYC data
   */
  verifyOTP(
    aadhaarNumber: string,
    otp: string,
    transactionId: string
  ): Promise<AadhaarVerificationResult>
}

export type AadhaarProviderType = 'surepass' | 'karza' | 'api-setu' | 'idfy'
