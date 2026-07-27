/**
 * Cloudflare R2 upload utility (AWS S3-compatible SDK).
 *
 * Environment variables required:
 *   CLOUDFLARE_R2_ACCOUNT_ID        — from Cloudflare dashboard
 *   CLOUDFLARE_R2_ACCESS_KEY_ID     — R2 API token key ID
 *   CLOUDFLARE_R2_SECRET_ACCESS_KEY — R2 API token secret
 *   CLOUDFLARE_R2_BUCKET            — bucket name (e.g. "lokul-kyc")
 *   CLOUDFLARE_R2_PUBLIC_BASE       — public CDN base URL (optional, for CDN URLs)
 */
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

let _client: S3Client | null = null;

function getR2Client(): S3Client {
  if (_client) return _client;

  const accountId  = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
  const accessKeyId     = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error("Cloudflare R2 credentials not configured");
  }

  _client = new S3Client({
    region:   "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
  return _client;
}

export function isR2Configured(): boolean {
  return !!(
    process.env.CLOUDFLARE_R2_ACCOUNT_ID &&
    process.env.CLOUDFLARE_R2_ACCESS_KEY_ID &&
    process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY &&
    process.env.CLOUDFLARE_R2_BUCKET
  );
}

function getBucket(): string {
  const bucket = process.env.CLOUDFLARE_R2_BUCKET;
  if (!bucket) throw new Error("CLOUDFLARE_R2_BUCKET not configured");
  return bucket;
}

/**
 * Upload a Buffer or Uint8Array to R2.
 * Returns the storage key (path within the bucket).
 */
export async function uploadToR2(opts: {
  key: string;
  body: Buffer | Uint8Array;
  contentType: string;
}): Promise<string> {
  const client = getR2Client();
  await client.send(
    new PutObjectCommand({
      Bucket:      getBucket(),
      Key:         opts.key,
      Body:        opts.body,
      ContentType: opts.contentType,
    })
  );
  return opts.key;
}

/**
 * Convert a base64 data-URL to a Buffer and extract MIME type.
 * e.g. "data:image/jpeg;base64,/9j/..." → { buffer, contentType: "image/jpeg" }
 */
export function dataUrlToBuffer(dataUrl: string): {
  buffer: Buffer;
  contentType: string;
} {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) throw new Error("Invalid data URL");
  return {
    contentType: match[1],
    buffer:      Buffer.from(match[2], "base64"),
  };
}

/**
 * Generate a public CDN URL for a stored key.
 * Falls back to an R2 unsigned URL if CLOUDFLARE_R2_PUBLIC_BASE is not set.
 */
export function r2PublicUrl(key: string): string {
  const base = process.env.CLOUDFLARE_R2_PUBLIC_BASE;
  if (base) return `${base.replace(/\/$/, "")}/${key}`;
  // No public CDN — return just the key; callers can generate signed URLs
  return key;
}

/**
 * Generate a short-lived pre-signed GET URL for private objects.
 * Useful for serving KYC documents to admins.
 */
export async function getPresignedUrl(
  key: string,
  expiresInSeconds = 3600
): Promise<string> {
  const client = getR2Client();
  return getSignedUrl(
    client,
    new PutObjectCommand({ Bucket: getBucket(), Key: key }),
    { expiresIn: expiresInSeconds }
  );
}

/** Delete an object from R2 (e.g. on KYC rejection + cleanup). */
export async function deleteFromR2(key: string): Promise<void> {
  const client = getR2Client();
  await client.send(
    new DeleteObjectCommand({ Bucket: getBucket(), Key: key })
  );
}
