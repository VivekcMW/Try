import { NextRequest, NextResponse } from "next/server";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  // In production: increment click count in DB, log impression
  console.log(`Ad click recorded: ${id}`);
  return NextResponse.json({ ok: true });
}
