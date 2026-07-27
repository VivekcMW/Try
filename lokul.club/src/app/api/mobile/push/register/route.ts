/**
 * POST /api/mobile/push/register  — register a push token for a user
 * DELETE /api/mobile/push/register — deregister a push token
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId, token, platform } = await req.json();
    if (!userId || !token || !platform) {
      return NextResponse.json({ error: "userId, token, platform required" }, { status: 400 });
    }
    const pt = await prisma.pushToken.upsert({
      where: { token },
      update: { userId, platform, isActive: true },
      create: { userId, token, platform, isActive: true },
    });
    return NextResponse.json(pt, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { token } = await req.json();
    if (!token) return NextResponse.json({ error: "token required" }, { status: 400 });
    await prisma.pushToken.updateMany({ where: { token }, data: { isActive: false } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
