/**
 * POST /api/web/ads/creative-media
 * Body: { data: string (base64 data URL) }
 *
 * Uploads a self-serve advertiser's creative image to R2 ahead of booking
 * submission (the campaign/creative don't exist yet at upload time — the
 * key is content-addressed under ads/drafts/). Returns the storage key,
 * which the client then includes as creative.mediaKey in the booking POST.
 */
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { isR2Configured, uploadToR2, dataUrlToBuffer, r2PublicUrl } from "@/lib/r2";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.data) {
    return NextResponse.json({ error: "data (base64 image) required" }, { status: 400 });
  }

  let buffer: Buffer;
  let contentType: string;
  try {
    ({ buffer, contentType } = dataUrlToBuffer(body.data));
  } catch {
    return NextResponse.json({ error: "Invalid image data" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(contentType)) {
    return NextResponse.json({ error: "Only JPEG, PNG, or WEBP images are allowed" }, { status: 400 });
  }
  if (buffer.length > MAX_BYTES) {
    return NextResponse.json({ error: "Image must be under 5MB" }, { status: 400 });
  }

  const ext = contentType.split("/")[1];
  const key = `ads/drafts/${randomUUID()}.${ext}`;

  if (!isR2Configured()) {
    return NextResponse.json({ key, url: body.data }); // dev/E2E — echo the data URL back
  }

  try {
    await uploadToR2({ key, body: buffer, contentType });
  } catch (e) {
    console.error("[ads/creative-media] R2 upload failed", e);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  return NextResponse.json({ key, url: r2PublicUrl(key) });
}
