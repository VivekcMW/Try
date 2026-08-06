/**
 * Email OTP Client using Resend
 * 
 * FREE TIER: 3,000 emails/month forever
 * Setup time: 5 minutes
 * No approval needed
 * 
 * Setup:
 * 1. Sign up: https://resend.com/signup
 * 2. Get API key from dashboard
 * 3. Verify your domain (or use onboarding@resend.dev for testing)
 * 4. Add RESEND_API_KEY to .env.local
 * 
 * Docs: https://resend.com/docs
 */

import { Resend } from 'resend';

interface EmailOTPResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export class EmailOTPClient {
  private resend: Resend | null = null;
  private fromEmail: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    
    if (apiKey) {
      this.resend = new Resend(apiKey);
      this.fromEmail = process.env.RESEND_FROM_EMAIL || 'Lokul.club <onboarding@resend.dev>';
    } else {
      console.warn('⚠️  Resend API key missing. Email OTP disabled.');
    }
  }

  /**
   * Send OTP via email
   * Cost: FREE (3,000/month)
   */
  async sendOTP(email: string, otp: string, userName?: string): Promise<EmailOTPResponse> {
    if (!this.resend) {
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: `Your Lokul.club verification code: ${otp}`,
        html: this.getOTPEmailTemplate(otp, userName),
      });

      if (error) {
        console.error('❌ Resend error:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Email OTP sent:', { email, messageId: data?.id });
      return { success: true, messageId: data?.id };
    } catch (error) {
      console.error('❌ Email send error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Beautiful OTP email template
   */
  private getOTPEmailTemplate(otp: string, userName?: string): string {
    const greeting = userName ? `Hi ${userName},` : 'Hello,';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your Verification Code</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 40px 20px; text-align: center;">
                      <div style="width: 48px; height: 48px; margin: 0 auto 16px; background: linear-gradient(135deg, #1D65AF, #165499); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                        <span style="font-size: 24px; color: white; font-weight: bold;">L</span>
                      </div>
                      <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #111827;">Lokul.club</h1>
                      <p style="margin: 8px 0 0; font-size: 14px; color: #6b7280;">Your neighbourhood, connected.</p>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding: 0 40px 40px;">
                      <p style="margin: 0 0 24px; font-size: 16px; color: #374151;">${greeting}</p>
                      
                      <p style="margin: 0 0 24px; font-size: 16px; color: #374151;">
                        Your verification code is:
                      </p>

                      <!-- OTP Box -->
                      <div style="background: #EEF4FB; border: 2px solid #1D65AF; border-radius: 8px; padding: 24px; text-align: center; margin: 0 0 24px;">
                        <div style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #1D65AF; font-family: 'Courier New', monospace;">
                          ${otp}
                        </div>
                      </div>

                      <p style="margin: 0 0 16px; font-size: 14px; color: #6b7280;">
                        ⏱️ This code will expire in <strong>5 minutes</strong>.
                      </p>

                      <p style="margin: 0 0 24px; font-size: 14px; color: #6b7280;">
                        🔒 For your security, do not share this code with anyone.
                      </p>

                      <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; margin-top: 24px;">
                        <p style="margin: 0; font-size: 13px; color: #9ca3af;">
                          If you didn't request this code, please ignore this email or contact support if you're concerned.
                        </p>
                      </div>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 24px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
                      <p style="margin: 0; font-size: 12px; color: #6b7280; text-align: center;">
                        © ${new Date().getFullYear()} Lokul.club — Connecting neighbourhoods across India
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;
  }

  /**
   * Check if email service is configured
   */
  isConfigured(): boolean {
    return !!this.resend;
  }
}

// Singleton instance
export const emailOTPClient = new EmailOTPClient();
