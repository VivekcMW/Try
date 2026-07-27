/**
 * POST /api/mobile/safety/evidence/upload
 * Body: { sessionId: string; chunkIndex: number; data: string (base64); lat?: number; lng?: number }
 *
 * Streams each base64-encoded video chunk to Cloudflare R2.
 * In dev/E2E (R2 not configured) acknowledges without uploading.
 */
import { NextRequest, NextResponse } from 'next/server';
import { isR2Configured, uploadToR2 } from '@/lib/r2';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });

  const { sessionId, chunkIndex, data, lat, lng } = body as {
    sessionId?: string;
    chunkIndex?: number;
    data?: string;
    lat?: number;
    lng?: number;
  };

  if (!sessionId || data === undefined) {
    return NextResponse.json({ error: 'sessionId and data required' }, { status: 400 });
  }

  const key = `evidence/${sessionId}/chunk-${String(chunkIndex ?? 0).padStart(6, '0')}.bin`;

  if (isR2Configured()) {
    try {
      const buffer = Buffer.from(data, 'base64');
      await uploadToR2({ key, body: buffer, contentType: 'application/octet-stream' });
    } catch (e) {
      console.error(`[evidence] R2 upload failed session=${sessionId} chunk=${chunkIndex}`, e);
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
  } else {
    console.info(`[evidence] session=${sessionId} chunk=${chunkIndex} lat=${lat} lng=${lng} (R2 not configured — stub)`);
  }

  return NextResponse.json({ ok: true, sessionId, chunkIndex, storedAt: new Date().toISOString() });
}
