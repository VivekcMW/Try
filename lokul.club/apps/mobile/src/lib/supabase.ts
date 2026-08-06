/**
 * Phone OTP authentication using the backend API
 * (Not actually using Supabase - wraps /api/mobile/otp endpoints)
 */

import { apiFetch } from '@/services/apiClient';

/**
 * Send OTP code to the given phone number
 * @param phone Phone number in E.164 format (e.g., +919876543210)
 */
export async function sendPhoneOTP(phone: string): Promise<void> {
  await apiFetch('/api/mobile/otp/send', {
    method: 'POST',
    body: { phone },
    skipAuth: true,
  });
}

/**
 * Verify OTP code for the given phone number
 * @param phone Phone number in E.164 format
 * @param code 4-digit OTP code (in dev: use 1123)
 * @returns Session data if verification succeeds
 */
export async function verifyPhoneOTP(phone: string, code: string): Promise<{
  success: boolean;
  session?: {
    user: {
      id: string;
      phone: string;
      name: string | null;
    };
    token: string;
  };
  user?: {
    id: string;
    phone: string;
    name: string | null;
  };
  token?: string;
}> {
  const response = await apiFetch<{
    success: boolean;
    session?: {
      user: {
        id: string;
        phone: string;
        name: string | null;
      };
      token: string;
    };
    user?: {
      id: string;
      phone: string;
      name: string | null;
    };
    token?: string;
  }>('/api/mobile/otp/verify', {
    method: 'POST',
    body: { phone, code },
    skipAuth: true,
  });

  return response;
}
