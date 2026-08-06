/**
 * Aadhaar OTP API - Send OTP
 * 
 * POST /api/aadhaar/send-otp
 * Body: { aadhaarNumber: "123456789012" }
 */

import { NextRequest, NextResponse } from 'next/server'
import { aadhaarClient } from '@/lib/aadhaar'
import { getServerUser } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { aadhaarNumber } = body

    // Validate input
    if (!aadhaarNumber) {
      return NextResponse.json(
        { error: 'Aadhaar number is required' },
        { status: 400 }
      )
    }

    // Validate format (12 digits)
    if (!/^\d{12}$/.test(aadhaarNumber)) {
      return NextResponse.json(
        { error: 'Invalid Aadhaar number format. Must be 12 digits.' },
        { status: 400 }
      )
    }

    // Send OTP via configured provider
    const result = await aadhaarClient.sendOTP(aadhaarNumber)

    // Store transaction ID in session/database for verification
    // TODO: Store in Redis or database with expiry
    // await redis.setex(`aadhaar_txn:${user.id}`, 600, result.transactionId)

    return NextResponse.json({
      success: true,
      transactionId: result.transactionId,
      message: result.message,
      expiresIn: 600, // 10 minutes
    })

  } catch (error) {
    console.error('Aadhaar OTP send error:', error)
    
    const message = error instanceof Error ? error.message : 'Failed to send OTP'
    
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
