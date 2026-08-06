/**
 * POST /api/admin/push/send  — broadcast Expo push notifications
 *   Body: { title, body, data?, target: 'all'|'pinCode'|'society', pinCode?, societyId? }
 */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

interface ExpoMessage {
  to: string | string[];
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: string;
}

async function sendBatch(messages: ExpoMessage[]) {
  const res = await fetch(EXPO_PUSH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(messages),
  });
  return res.json();
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if ((session?.user as { role?: string } | undefined)?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, body, data, target, pinCode, societyId } = await req.json();
    if (!title || !body || !target) {
      return NextResponse.json({ error: "title, body, target required" }, { status: 400 });
    }

    // Build where clause
    const where: Record<string, unknown> = { isActive: true };
    if (target === "pinCode" && pinCode) {
      where.user = { pinCode };
    } else if (target === "society" && societyId) {
      where.user = { societyId };
    }

    const tokens = await prisma.pushToken.findMany({ where, select: { token: true } });
    if (!tokens.length) return NextResponse.json({ sent: 0 });

    // Batch in chunks of 100 (Expo limit)
    const CHUNK = 100;
    let sent = 0;
    for (let i = 0; i < tokens.length; i += CHUNK) {
      const chunk = tokens.slice(i, i + CHUNK).map((t) => t.token);
      await sendBatch([{ to: chunk, title, body, data, sound: "default" }]);
      sent += chunk.length;
    }
    return NextResponse.json({ sent });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
