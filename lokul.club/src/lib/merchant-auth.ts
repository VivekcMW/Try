/**
 * Merchant web authentication helpers
 * Uses signed cookies to store merchant session (userId + merchantId)
 */

import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "lokul_merchant_session";
const SESSION_SECRET = process.env.MERCHANT_SESSION_SECRET ?? "lokul-merchant-secret-change-in-production";
const SECRET_KEY = new TextEncoder().encode(SESSION_SECRET);
const SESSION_DURATION = 7 * 24 * 60 * 60; // 7 days in seconds

export type MerchantSession = {
  userId: string;
  merchantId: string;
  phone: string;
  createdAt: number;
};

/**
 * Create a signed session token for a merchant
 */
export async function createMerchantSession(userId: string, merchantId: string, phone: string): Promise<string> {
  const payload: MerchantSession = {
    userId,
    merchantId,
    phone,
    createdAt: Date.now(),
  };

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(SECRET_KEY);

  return token;
}

/**
 * Verify and decode a merchant session token
 */
export async function verifyMerchantSession(token: string): Promise<MerchantSession | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as MerchantSession;
  } catch {
    return null;
  }
}

/**
 * Set merchant session cookie
 */
export async function setMerchantSessionCookie(userId: string, merchantId: string, phone: string) {
  const token = await createMerchantSession(userId, merchantId, phone);
  const cookieStore = await cookies();
  
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION,
    path: "/",
  });
}

/**
 * Get current merchant session from cookie
 */
export async function getMerchantSession(): Promise<MerchantSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  
  if (!token) return null;
  return verifyMerchantSession(token);
}

/**
 * Clear merchant session cookie
 */
export async function clearMerchantSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Require merchant authentication - throws if not authenticated
 * Returns { userId, merchantId, merchant } on success
 */
export async function requireMerchant() {
  const session = await getMerchantSession();
  
  if (!session) {
    throw new Error("Unauthorized: No merchant session");
  }

  // Verify the merchant still exists and is active
  const merchant = await prisma.merchant.findUnique({
    where: { id: session.merchantId },
    include: { owner: { select: { id: true, name: true, phone: true, avatarUrl: true } } },
  });

  if (!merchant) {
    throw new Error("Unauthorized: Merchant not found");
  }

  if (merchant.status === "suspended" || merchant.isBlacklisted) {
    throw new Error("Unauthorized: Merchant account suspended");
  }

  return {
    userId: session.userId,
    merchantId: session.merchantId,
    merchant,
  };
}

/**
 * Get merchant data if authenticated (doesn't throw)
 */
export async function getOptionalMerchant() {
  try {
    return await requireMerchant();
  } catch {
    return null;
  }
}
