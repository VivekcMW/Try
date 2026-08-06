/**
 * TEST API: Generate OTP
 * 
 * This endpoint demonstrates the 6-digit OTP generation logic
 * WITHOUT sending it anywhere. Just returns the OTP for testing.
 * 
 * Usage:
 * POST http://localhost:3000/api/otp/test-generate
 * Body: { "phone": "+919876543210" } (optional)
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * Generate cryptographically secure 6-digit OTP
 * Range: 100000 to 999999
 */
function generateOTP(): string {
  // crypto.randomInt is cryptographically secure (better than Math.random)
  const otp = crypto.randomInt(100000, 1000000).toString();
  return otp;
}

/**
 * Generate unique transaction ID for this OTP session
 */
function generateTransactionId(): string {
  const timestamp = Date.now();
  const randomHex = crypto.randomBytes(8).toString('hex');
  return `otp_${timestamp}_${randomHex}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { phone, email, count = 1 } = body;

    // Generate multiple OTPs to show they're random
    const otps = [];
    for (let i = 0; i < Math.min(count, 10); i++) {
      otps.push({
        otp: generateOTP(),
        transactionId: generateTransactionId(),
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
        createdAt: new Date(),
      });
    }

    console.log('🎲 Generated OTPs:', otps);

    return NextResponse.json({
      success: true,
      message: '6-digit OTP generated successfully (not sent anywhere)',
      data: {
        phone: phone || null,
        email: email || null,
        otps: otps,
        algorithm: 'crypto.randomInt(100000, 1000000)',
        security: 'Cryptographically secure random number generation',
        expiryMinutes: 5,
      },
      usage: {
        example: 'In production, this OTP would be sent via WhatsApp/Email/SMS',
        testMode: true,
      },
    });
  } catch (error) {
    console.error('❌ OTP generation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  // GET endpoint for easy browser testing
  const otps = [];
  for (let i = 0; i < 5; i++) {
    otps.push({
      otp: generateOTP(),
      transactionId: generateTransactionId(),
    });
  }

  return NextResponse.json({
    success: true,
    message: 'OTP generation test',
    samples: otps,
    info: {
      algorithm: 'crypto.randomInt(100000, 1000000)',
      range: '100000 to 999999 (6 digits)',
      security: 'Cryptographically secure',
    },
  });
}
