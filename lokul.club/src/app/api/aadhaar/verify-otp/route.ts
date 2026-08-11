/**
 * Aadhaar OTP API - Verify OTP
 * 
 * POST /api/aadhaar/verify-otp
 * Body: { aadhaarNumber: "123456789012", otp: "123456", transactionId: "xxx" }
 */

import { NextRequest, NextResponse } from 'next/server'
import { aadhaarClient } from '@/lib/aadhaar'
import { getServerUser } from '@/lib/supabase/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

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
    const { aadhaarNumber, otp, transactionId } = body

    // Validate inputs
    if (!aadhaarNumber || !otp || !transactionId) {
      return NextResponse.json(
        { error: 'Aadhaar number, OTP, and transaction ID are required' },
        { status: 400 }
      )
    }

    if (!/^\d{12}$/.test(aadhaarNumber)) {
      return NextResponse.json(
        { error: 'Invalid Aadhaar number format' },
        { status: 400 }
      )
    }

    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { error: 'Invalid OTP format. Must be 6 digits.' },
        { status: 400 }
      )
    }

    // Verify OTP via configured provider
    const result = await aadhaarClient.verifyOTP(aadhaarNumber, otp, transactionId)

    if (!result.success || !result.verified) {
      return NextResponse.json(
        { 
          success: false,
          verified: false,
          error: result.error || 'Verification failed' 
        },
        { status: 400 }
      )
    }

    // Update user record with Aadhaar verification
    const supabase = await createServerSupabaseClient()
    
    const { error: updateError } = await supabase
      .from('User')
      .update({
        aadhaarVerified: true,
        aadhaarName: result.data?.name,
        aadhaarDob: result.data?.dob ? new Date(result.data.dob) : null,
        aadhaarGender: result.data?.gender,
        aadhaarAddress: result.data?.address ? JSON.stringify(result.data.address) : null,
        updatedAt: new Date(),
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Failed to update user with Aadhaar data:', updateError)
      // Don't fail the request, verification was successful
    }

    // Return sanitized data (don't send photo/sensitive data to client)
    return NextResponse.json({
      success: true,
      verified: true,
      data: {
        aadhaarNumber: result.data?.aadhaarNumber, // Already masked
        name: result.data?.name,
        dob: result.data?.dob,
        gender: result.data?.gender,
        address: result.data?.address,
        // Omit photo for security
      },
    })

  } catch (error) {
    console.error('Aadhaar OTP verify error:', error)
    
    const message = error instanceof Error ? error.message : 'Failed to verify OTP'
    
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
