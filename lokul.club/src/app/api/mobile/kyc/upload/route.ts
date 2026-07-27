/**
 * POST /api/mobile/kyc/upload
 * Body: { userId, kind: KycDocType, fileDataUrl: string (base64 data URL) }
 *
 * Uploads the document image to Cloudflare R2 (when configured) and creates
 * a KycDocument record pointing at the R2 storage key.
 * Falls back to a deterministic stub key when R2 is not configured (dev/E2E).
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isR2Configured, uploadToR2, dataUrlToBuffer } from "@/lib/r2";

const VALID_KINDS = [
  "rent_agreement",
  "electricity_bill",
  "society_noc",
  "aadhaar",
  "pan_card",
  "passport",
  "driving_license",
  "voter_id",
  "ration_card",
  "digilocker",
] as const;

type KycDocType = (typeof VALID_KINDS)[number];

const ALLOWED_MIME_PREFIXES = ["data:image/jpeg", "data:image/png", "data:image/webp", "data:application/pdf"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const { userId, kind, fileDataUrl } = body as {
    userId?: string;
    kind?: string;
    fileDataUrl?: string;
  };

  if (!userId || !kind || !fileDataUrl) {
    return NextResponse.json(
      { error: "userId, kind, and fileDataUrl are required" },
      { status: 400 }
    );
  }

  if (!VALID_KINDS.includes(kind as KycDocType)) {
    return NextResponse.json({ error: "Invalid document kind" }, { status: 400 });
  }

  if (!ALLOWED_MIME_PREFIXES.some((p) => fileDataUrl.startsWith(p))) {
    return NextResponse.json(
      { error: "fileDataUrl must be a JPEG, PNG, WEBP, or PDF data URL" },
      { status: 400 }
    );
  }

  // Rough size guard before base64 decode (base64 ~= 4/3 of binary)
  if (fileDataUrl.length > MAX_SIZE_BYTES * 1.4) {
    return NextResponse.json({ error: "File too large (max 10 MB)" }, { status: 413 });
  }

  let storageKey: string;
  const ext = fileDataUrl.startsWith("data:application/pdf") ? "pdf" : "jpg";
  const key = `kyc/${userId}/${kind}/${Date.now()}.${ext}`;

  if (isR2Configured()) {
    try {
      const { buffer, contentType } = dataUrlToBuffer(fileDataUrl);
      storageKey = await uploadToR2({ key, body: buffer, contentType });
    } catch (e) {
      console.error("[kyc/upload] R2 upload failed", e);
      return NextResponse.json({ error: "File upload failed" }, { status: 500 });
    }
  } else {
    // Dev/E2E stub — just record the key without uploading
    storageKey = key;
  }

  const doc = await prisma.kycDocument.create({
    data: {
      userId,
      type:       kind as KycDocType,
      storageKey,
      status:     "pending",
    },
  });

  return NextResponse.json(
    { id: doc.id, storageKey, status: doc.status },
    { status: 201 }
  );
}

