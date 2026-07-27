/**
 * GET /api/mobile/chat/ably-token?userId=...
 * Issues a short-lived Ably TokenRequest for the requesting user.
 * The mobile client exchanges this for a real token without ever seeing the root API key.
 */
import { NextRequest, NextResponse } from "next/server";
import { createAblyToken } from "@/lib/ably";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }
  try {
    const tokenRequest = await createAblyToken(userId);
    if (!tokenRequest) {
      // Ably not configured — return 204 so mobile falls back to polling
      return new NextResponse(null, { status: 204 });
    }
    return NextResponse.json(tokenRequest);
  } catch (e) {
    console.error("[ably-token]", e);
    return NextResponse.json({ error: "Token generation failed" }, { status: 500 });
  }
}
