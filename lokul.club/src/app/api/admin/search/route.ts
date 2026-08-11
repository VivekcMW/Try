import { getServerUser } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { globalAdminSearch } from "@/lib/admin-platform";

export async function GET(req: NextRequest) {
  const user = await getServerUser();
  if ((user as { role?: string } | null)?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const q = req.nextUrl.searchParams.get("q") ?? "";
  const results = await globalAdminSearch(q);
  return NextResponse.json({ results });
}
