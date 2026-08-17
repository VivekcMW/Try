/**
 * Universal OTP Service with Multi-Provider Support
 * 
 * Priority order (configurable via env):
 * 1. WhatsApp (Meta Cloud API) - FREE 1,000/month
 * 2. Email (Resend) - FREE 3,000/month
 * 3. SMS (Twilio) - Paid fallback
 * 
 * Features:
 * - Automatic provider selection
 * - Fallback chain
 * - OTP generation & validation
 * - Rate limiting
 * - Database storage
 */

import { prisma } from '@/lib/prisma';
import { whatsappClient } from '@/lib/whatsapp/meta-cloud-client';
import { emailOTPClient } from '@/lib/otp/email-otp-client';
import crypto from 'crypto';

export type OTPProvider = 'whatsapp' | 'email' | 'sms' | 'auto';

interface SendOTPOptions {
  provider?: OTPProvider;
  expiryMinutes?: number;
  fallback?: boolean;
}

interface SendOTPResult {
  success: boolean;
  transactionId?: string;
  provider?: OTPProvider;
  error?: string;
  otp?: string; // Only included in dev mode
}

interface VerifyOTPResult {
  success: boolean;
  userId?: string;
  error?: string;
}

export class OTPService {
  private readonly OTP_LENGTH = 6;
  private readonly DEFAULT_EXPIRY_MINUTES = 5;
  private readonly MAX_ATTEMPTS = 3;

  /**
   * Generate cryptographically secure 6-digit OTP
   */
  private generateOTP(): string {
    // Generate random 6 digits (100000 to 999999)
    const otp = crypto.randomInt(100000, 1000000).toString();
    return otp;
  }

  /**
   * Generate unique transaction ID for OTP session
   */
  private generateTransactionId(): string {
    return `otp_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }

  /**
   * Determine which provider to use based on contact info and config
   */
  private selectProvider(
    phone?: string,
    email?: string,
    preferredProvider?: OTPProvider
  ): OTPProvider {
    // If provider explicitly specified, use it
    if (preferredProvider && preferredProvider !== 'auto') {
      return preferredProvider;
    }

    // Environment-based priority
    const priority = process.env.OTP_PROVIDER_PRIORITY || 'whatsapp,email,sms';
    const providers = priority.split(',').map(p => p.trim()) as OTPProvider[];

    for (const provider of providers) {
      if (provider === 'whatsapp' && phone && whatsappClient.isConfigured()) {
        return 'whatsapp';
      }
      if (provider === 'email' && email && emailOTPClient.isConfigured()) {
        return 'email';
      }
      if (provider === 'sms' && phone) {
        // SMS provider check would go here
        // For now, skip SMS
        continue;
      }
    }

    // Default fallback
    if (phone && whatsappClient.isConfigured()) return 'whatsapp';
    if (email && emailOTPClient.isConfigured()) return 'email';
    if (phone) return 'sms'; // Will fail if not configured

    throw new Error('No valid OTP provider available');
  }

  /**
   * Send OTP to user
   */
  async sendOTP(
    phone?: string,
    email?: string,
    options: SendOTPOptions = {}
  ): Promise<SendOTPResult> {
    const {
      provider: preferredProvider,
      expiryMinutes = this.DEFAULT_EXPIRY_MINUTES,
      fallback = true,
    } = options;

    if (!phone && !email) {
      return { success: false, error: 'Phone or email required' };
    }

    try {
      // DEV MODE: Bypass provider requirement, use fixed OTP
      const isDev = process.env.NODE_ENV === 'development' || process.env.E2E_TEST === '1';
      const otp = isDev ? '123456' : this.generateOTP();
      const transactionId = this.generateTransactionId();
      const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

      // In dev mode, skip providers and just store + log OTP
      if (isDev) {
        await prisma.otpVerification.create({
          data: {
            phone: phone || null,
            email: email || null,
            code: otp,
            transactionId,
            provider: 'sms', // Placeholder for dev
            expiresAt,
            attempts: 0,
            used: false,
          },
        });

        console.log(`🔧 [DEV MODE] OTP for ${phone || email}: ${otp} (transactionId: ${transactionId})`);

        return {
          success: true,
          transactionId,
          provider: 'sms',
          otp, // Include OTP in response for dev mode testing
        };
      }

      // PRODUCTION MODE: Use actual providers
      // Select provider
      let provider = this.selectProvider(phone, email, preferredProvider);

      // Try to send via selected provider
      let sendResult: { success: boolean; messageId?: string; error?: string };

      if (provider === 'whatsapp' && phone) {
        console.log(`📱 Sending WhatsApp OTP to ${phone}...`);
        sendResult = await whatsappClient.sendOTP(phone, otp);
      } else if (provider === 'email' && email) {
        console.log(`📧 Sending Email OTP to ${email}...`);
        sendResult = await emailOTPClient.sendOTP(email, otp);
      } else {
        return { success: false, error: `Provider ${provider} not implemented or configured` };
      }

      // If failed and fallback enabled, try next provider
      if (!sendResult.success && fallback) {
        console.warn(`⚠️  Primary provider ${provider} failed, trying fallback...`);
        
        if (provider === 'whatsapp' && email && emailOTPClient.isConfigured()) {
          provider = 'email';
          console.log(`📧 Fallback: Sending Email OTP to ${email}...`);
          sendResult = await emailOTPClient.sendOTP(email, otp);
        } else if (provider === 'email' && phone && whatsappClient.isConfigured()) {
          provider = 'whatsapp';
          console.log(`📱 Fallback: Sending WhatsApp OTP to ${phone}...`);
          sendResult = await whatsappClient.sendOTP(phone, otp);
        }
      }

      if (!sendResult.success) {
        return { success: false, error: sendResult.error || 'Failed to send OTP' };
      }

      // Store OTP in database
      await prisma.otpVerification.create({
        data: {
          phone: phone || null,
          email: email || null,
          code: otp,
          transactionId,
          provider,
          expiresAt,
          attempts: 0,
          used: false,
        },
      });

      console.log(`✅ OTP sent via ${provider}:`, {
        transactionId,
        expiresAt,
        messageId: sendResult.messageId,
      });

      return {
        success: true,
        transactionId,
        provider,
      };
    } catch (error) {
      console.error('❌ OTP send error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Verify OTP code
   */
  async verifyOTP(
    transactionId: string,
    code: string,
    phone?: string,
    email?: string
  ): Promise<VerifyOTPResult> {
    try {
      // Find OTP record
      const otpRecord = await prisma.otpVerification.findFirst({
        where: {
          OR: [
            { transactionId },
            { phone: phone || undefined },
            { email: email || undefined },
          ],
          used: false,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!otpRecord) {
        return { success: false, error: 'Invalid or expired OTP' };
      }

      // Check attempts
      if (otpRecord.attempts >= this.MAX_ATTEMPTS) {
        return { success: false, error: 'Too many attempts. Request a new OTP.' };
      }

      // Verify code
      if (otpRecord.code !== code) {
        // Increment attempts
        await prisma.otpVerification.update({
          where: { id: otpRecord.id },
          data: { attempts: otpRecord.attempts + 1 },
        });

        return {
          success: false,
          error: `Invalid OTP. ${this.MAX_ATTEMPTS - otpRecord.attempts - 1} attempts remaining.`,
        };
      }

      // Mark as used
      await prisma.otpVerification.update({
        where: { id: otpRecord.id },
        data: { used: true, verifiedAt: new Date() },
      });

      console.log(`✅ OTP verified:`, {
        transactionId: otpRecord.transactionId,
        provider: otpRecord.provider,
      });

      return {
        success: true,
        userId: otpRecord.userId || undefined,
      };
    } catch (error) {
      console.error('❌ OTP verify error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check if phone/email has pending OTP (rate limiting)
   */
  async hasPendingOTP(phone?: string, email?: string): Promise<boolean> {
    if (!phone && !email) return false;

    const isDev = process.env.NODE_ENV === 'development' || process.env.E2E_TEST === '1';
    if (isDev) {
      return false;
    }

    const recentOTP = await prisma.otpVerification.findFirst({
      where: {
        OR: [
          { phone: phone || undefined },
          { email: email || undefined },
        ],
        used: false,
        expiresAt: { gt: new Date() },
        createdAt: { gt: new Date(Date.now() - 60 * 1000) }, // Within last 60 seconds
      },
    });

    return !!recentOTP;
  }
}

// Singleton instance
export const otpService = new OTPService();
