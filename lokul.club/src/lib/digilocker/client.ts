/**
 * DigiLocker API Client
 * 
 * Handles OAuth SSO and Requestor API for document verification
 * via API Setu Partners integration
 */

const DIGILOCKER_CONFIG = {
  clientId: process.env.NEXT_PUBLIC_DIGILOCKER_CLIENT_ID!,
  clientSecret: process.env.DIGILOCKER_CLIENT_SECRET!,
  redirectUri: process.env.DIGILOCKER_REDIRECT_URI!,
  
  // API Setu endpoints
  authUrl: process.env.DIGILOCKER_AUTH_URL || 'https://apisetu.gov.in/certificate/v3/digilocker/oauth2',
  apiUrl: process.env.DIGILOCKER_API_URL || 'https://apisetu.gov.in/certificate/v3/digilocker',
  requestorUrl: process.env.DIGILOCKER_REQUESTOR_API_URL || 'https://apisetu.gov.in/certificate/v3/digilocker/requestor',
  
  env: process.env.DIGILOCKER_ENV || 'sandbox',
}

// Validate required env vars
if (!DIGILOCKER_CONFIG.clientId && process.env.NODE_ENV === 'production') {
  console.warn('⚠️  DigiLocker not configured - SSO will be unavailable')
}

export interface DigiLockerUser {
  id: string              // DigiLocker user ID
  name: string
  dob: string            // YYYY-MM-DD
  gender: 'M' | 'F' | 'O'
  email?: string
  mobile?: string
  aadhaarSeeded: boolean
}

export interface DigiLockerDocument {
  uri: string            // DigiLocker document URI
  name: string
  type: string           // 'AADHRC', 'PANCR', 'GSTIN', etc.
  issueDate: string
  issuer: string
  description: string
}

/**
 * Generate OAuth authorization URL
 * User will be redirected here to authenticate
 */
export function getDigiLockerAuthUrl(state?: string): string {
  if (!DIGILOCKER_CONFIG.clientId) {
    throw new Error('DigiLocker client ID not configured')
  }

  const params = new URLSearchParams({
    client_id: DIGILOCKER_CONFIG.clientId,
    redirect_uri: DIGILOCKER_CONFIG.redirectUri,
    response_type: 'code',
    state: state || generateState(),
    scope: 'openid profile email phone',
  })

  const baseUrl = DIGILOCKER_CONFIG.env === 'sandbox'
    ? `${DIGILOCKER_CONFIG.authUrl}/sandbox/authorize`
    : `${DIGILOCKER_CONFIG.authUrl}/authorize`

  return `${baseUrl}?${params.toString()}`
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(code: string): Promise<{
  access_token: string
  token_type: string
  expires_in: number
  refresh_token?: string
}> {
  const response = await fetch(`${DIGILOCKER_CONFIG.authUrl}/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${DIGILOCKER_CONFIG.clientId}:${DIGILOCKER_CONFIG.clientSecret}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: DIGILOCKER_CONFIG.redirectUri,
    }).toString(),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`DigiLocker token exchange failed: ${error}`)
  }

  return response.json()
}

/**
 * Get user profile from DigiLocker
 */
export async function getDigiLockerUser(accessToken: string): Promise<DigiLockerUser> {
  const response = await fetch(`${DIGILOCKER_CONFIG.apiUrl}/userinfo`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`DigiLocker user info fetch failed: ${error}`)
  }

  const data = await response.json()
  
  return {
    id: data.sub || data.digilocker_id,
    name: data.name,
    dob: data.dob,
    gender: data.gender,
    email: data.email,
    mobile: data.mobile,
    aadhaarSeeded: data.aadhaar_seeded === true,
  }
}

/**
 * List documents available in user's DigiLocker
 */
export async function listUserDocuments(accessToken: string): Promise<DigiLockerDocument[]> {
  const response = await fetch(`${DIGILOCKER_CONFIG.apiUrl}/documents`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`DigiLocker documents list failed: ${error}`)
  }

  const data = await response.json()
  return data.documents || []
}

/**
 * Request specific document from user's DigiLocker (with consent)
 * 
 * @param accessToken - User's access token
 * @param docType - Document type: 'AADHRC', 'PANCR', 'GSTIN', 'DL', etc.
 * @param purpose - Purpose of request (for user consent)
 */
export async function requestDocument(
  accessToken: string,
  docType: string,
  purpose: string
): Promise<{ requestId: string; consentUrl: string }> {
  const response = await fetch(`${DIGILOCKER_CONFIG.requestorUrl}/request`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      doc_type: docType,
      purpose,
      validity_days: 30,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`DigiLocker document request failed: ${error}`)
  }

  return response.json()
}

/**
 * Fetch requested document after user consent
 */
export async function fetchDocument(
  accessToken: string,
  documentUri: string
): Promise<{ content: string; format: 'pdf' | 'xml'; metadata: any }> {
  const response = await fetch(`${DIGILOCKER_CONFIG.apiUrl}/document/${encodeURIComponent(documentUri)}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`DigiLocker document fetch failed: ${error}`)
  }

  const data = await response.json()
  
  return {
    content: data.content,          // Base64 encoded PDF/XML
    format: data.format,
    metadata: data.metadata || {},
  }
}

/**
 * Verify Aadhaar eSign/eKYC
 */
export async function verifyAadhaar(
  accessToken: string,
  aadhaarNumber: string
): Promise<{ verified: boolean; name: string; address: string }> {
  const response = await fetch(`${DIGILOCKER_CONFIG.apiUrl}/verify/aadhaar`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      aadhaar_number: aadhaarNumber,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Aadhaar verification failed: ${error}`)
  }

  return response.json()
}

// Utility functions

function generateState(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export function validateState(state: string, expectedState: string): boolean {
  return state === expectedState
}

// Document type constants
export const DOCUMENT_TYPES = {
  AADHAAR: 'AADHRC',        // Aadhaar Card
  PAN: 'PANCR',             // PAN Card
  GST: 'GSTIN',             // GST Certificate
  DRIVING_LICENSE: 'DL',    // Driving License
  FSSAI: 'FSSAI',           // FSSAI License
  TRADE_LICENSE: 'TRADLIC', // Trade License
  SHOP_ACT: 'SHOPACT',      // Shop & Establishment Certificate
  BANK_STATEMENT: 'BNKSTMT',
} as const

export type DocumentType = typeof DOCUMENT_TYPES[keyof typeof DOCUMENT_TYPES]
