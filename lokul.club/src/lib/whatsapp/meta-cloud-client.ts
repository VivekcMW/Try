/**
 * WhatsApp Business Cloud API Client
 * FREE TIER: 1,000 conversations/month
 * Official Meta API - reliable, won't get banned
 * 
 * Setup:
 * 1. Create Meta Business account: https://business.facebook.com
 * 2. Create app at: https://developers.facebook.com/apps
 * 3. Add WhatsApp product
 * 4. Get Phone Number ID and Access Token
 * 5. Create OTP message template (pre-approval required)
 * 
 * Docs: https://developers.facebook.com/docs/whatsapp/cloud-api
 */

interface WhatsAppOTPResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export class MetaWhatsAppClient {
  private baseUrl = 'https://graph.facebook.com/v18.0';
  private phoneNumberId: string;
  private accessToken: string;

  constructor() {
    this.phoneNumberId = process.env.META_WHATSAPP_PHONE_NUMBER_ID || '';
    this.accessToken = process.env.META_WHATSAPP_ACCESS_TOKEN || '';

    if (!this.phoneNumberId || !this.accessToken) {
      console.warn('⚠️  WhatsApp Cloud API credentials missing. OTP delivery disabled.');
    }
  }

  /**
   * Send OTP via WhatsApp template message
   * Cost: FREE for first 1,000/month, then ~₹0.40/message
   */
  async sendOTP(phoneNumber: string, otp: string): Promise<WhatsAppOTPResponse> {
    if (!this.phoneNumberId || !this.accessToken) {
      return { success: false, error: 'WhatsApp API not configured' };
    }

    try {
      // Format phone: Remove +91 prefix if present, WhatsApp API needs full international format
      const formattedPhone = phoneNumber.startsWith('+') 
        ? phoneNumber.slice(1) 
        : phoneNumber.startsWith('91') 
          ? phoneNumber 
          : `91${phoneNumber}`;

      const response = await fetch(`${this.baseUrl}/${this.phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: formattedPhone,
          type: 'template',
          template: {
            name: 'otp_verification', // Your template name (must be pre-approved)
            language: {
              code: 'en', // or 'hi' for Hindi
            },
            components: [
              {
                type: 'body',
                parameters: [
                  {
                    type: 'text',
                    text: otp, // The {{1}} variable in template
                  },
                ],
              },
            ],
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ WhatsApp API error:', data);
        return {
          success: false,
          error: data.error?.message || 'Failed to send WhatsApp message',
        };
      }

      console.log('✅ WhatsApp OTP sent:', {
        phone: formattedPhone,
        messageId: data.messages?.[0]?.id,
      });

      return {
        success: true,
        messageId: data.messages?.[0]?.id,
      };
    } catch (error) {
      console.error('❌ WhatsApp send error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send OTP using text message (non-template)
   * ⚠️ WARNING: Only works for template-approved accounts
   * For testing, use template method above
   */
  async sendOTPDirectText(phoneNumber: string, otp: string): Promise<WhatsAppOTPResponse> {
    if (!this.phoneNumberId || !this.accessToken) {
      return { success: false, error: 'WhatsApp API not configured' };
    }

    try {
      const formattedPhone = phoneNumber.startsWith('+') 
        ? phoneNumber.slice(1) 
        : phoneNumber.startsWith('91') 
          ? phoneNumber 
          : `91${phoneNumber}`;

      const message = `Your Lokul.club verification code is: ${otp}\n\nValid for 5 minutes. Do not share this code.\n\nआपका Lokul.club सत्यापन कोड है: ${otp}`;

      const response = await fetch(`${this.baseUrl}/${this.phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: formattedPhone,
          type: 'text',
          text: {
            body: message,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ WhatsApp API error:', data);
        return {
          success: false,
          error: data.error?.message || 'Failed to send WhatsApp message',
        };
      }

      return {
        success: true,
        messageId: data.messages?.[0]?.id,
      };
    } catch (error) {
      console.error('❌ WhatsApp send error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check if WhatsApp API is configured
   */
  isConfigured(): boolean {
    return !!(this.phoneNumberId && this.accessToken);
  }
}

// Singleton instance
export const whatsappClient = new MetaWhatsAppClient();
