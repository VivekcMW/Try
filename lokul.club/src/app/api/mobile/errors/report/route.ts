/**
 * POST /api/mobile/errors/report — client-side crash report from the mobile app's ErrorBoundary
 *
 * No ErrorLog table exists yet, so reports are written to server logs (picked up by
 * whatever log aggregation is watching the Next.js server output) rather than a DB table.
 */
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { name, message, stack, componentStack, timestamp } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "message required" }, { status: 400 });
    }

    console.error("[mobile-crash]", JSON.stringify({
      name: name ?? "Error",
      message,
      stack,
      componentStack,
      timestamp: timestamp ?? new Date().toISOString(),
    }));

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to record report" }, { status: 400 });
  }
}
