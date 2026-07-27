/**
 * Mobile session token — dependency-free HMAC-signed bearer token.
 *
 * Format: base64url(JSON({ userId, iat })) + "." + HMAC-SHA256(payload, secret)
 * Verified with crypto.timingSafeEqual. No expiry — mirrors the app's existing
 * long-lived AsyncStorage session model (userId persisted indefinitely).
 *
 * MOBILE_TOKEN_SECRET should be set in production; falls back to NEXTAUTH_SECRET
 * so a fresh env still works, then to a dev-only constant so local/dev never 500s.
 */
import crypto from "crypto";

function getSecret(): string {
  return (
    process.env.MOBILE_TOKEN_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "dev-only-insecure-mobile-token-secret"
  );
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", getSecret()).update(payload).digest("hex");
}

export function signMobileToken(userId: string): string {
  const payload = Buffer.from(JSON.stringify({ userId, iat: Date.now() })).toString(
    "base64url"
  );
  return `${payload}.${sign(payload)}`;
}

/** Returns the verified userId, or null if the token is missing/malformed/invalid. */
export function verifyMobileToken(token: string | null | undefined): string | null {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = sign(payload);
  try {
    if (
      !crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(signature, "hex"))
    ) {
      return null;
    }
  } catch {
    return null;
  }

  try {
    const { userId } = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return typeof userId === "string" && userId ? userId : null;
  } catch {
    return null;
  }
}

/** Extracts and verifies the `Authorization: Bearer <token>` header. Returns the userId or null. */
export function requireMobileAuth(req: Request): string | null {
  const header = req.headers.get("authorization") ?? req.headers.get("Authorization");
  if (!header?.startsWith("Bearer ")) return null;
  return verifyMobileToken(header.slice("Bearer ".length));
}
