/**
 * POST /api/merchant/settings/logo
 * Body: { fileDataUrl: string (base64 data URL) }
 *
 * Uploads the merchant logo to Cloudflare R2 (when configured) and updates
 * merchant.avatarUrl with a public URL. In dev without R2, stores the data
 * URL directly so the UI still works end-to-end.
 */
import { NextResponse } from "next/server";
import { requireMerchant } from "@/lib/merchant-auth";
import prisma from "@/lib/prisma";
import { isR2Configured, uploadToR2, dataUrlToBuffer, r2PublicUrl } from "@/lib/r2";

const ALLOWED_MIME_PREFIXES = [
  "data:image/jpeg",
  "data:image/png",
  "data:image/webp",
  "data:image/svg+xml",
];
const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB — logos should be small

export async function POST(request: Request) {
  try {
    const { merchantId } = await requireMerchant();
    const body = await request.json().catch(() => null);
    if (!body?.fileDataUrl || typeof body.fileDataUrl !== "string") {
      return NextResponse.json({ error: "fileDataUrl is required" }, { status: 400 });
    }

    const { fileDataUrl } = body as { fileDataUrl: string };

    if (!ALLOWED_MIME_PREFIXES.some((p) => fileDataUrl.startsWith(p))) {
      return NextResponse.json(
        { error: "Logo must be a JPEG, PNG, WEBP, or SVG image" },
        { status: 400 }
      );
    }

    if (fileDataUrl.length > MAX_SIZE_BYTES * 1.4) {
      return NextResponse.json({ error: "Logo too large (max 2 MB)" }, { status: 413 });
    }

    let avatarUrl: string;

    if (isR2Configured()) {
      const { buffer, contentType } = dataUrlToBuffer(fileDataUrl);
      const ext = contentType.split("/")[1]?.replace("+xml", "") || "png";
      const key = `merchant-logos/${merchantId}/${Date.now()}.${ext}`;
      await uploadToR2({ key, body: buffer, contentType });
      avatarUrl = r2PublicUrl(key);
    } else {
      // Dev/E2E: store the data URL directly so the UI still previews correctly.
      avatarUrl = fileDataUrl;
    }

    const updated = await prisma.merchant.update({
      where: { id: merchantId },
      data: { avatarUrl },
      select: { avatarUrl: true },
    });

    return NextResponse.json({ success: true, avatarUrl: updated.avatarUrl });
  } catch (error: any) {
    if (error.message?.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error uploading merchant logo:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
