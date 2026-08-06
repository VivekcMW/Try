import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const noRealDb = (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");
const E2E = process.env.E2E_TEST === "1" || noRealDb;

const E2E_EXPORT_ROWS = [
  { name: "Alice Resident",  email: "alice@example.com",  pincode: "560001", role: "resident", notify: true,  createdAt: new Date("2026-05-26T10:00:00Z") },
  { name: "Bob Merchant",    email: "bob@example.com",    pincode: "560002", role: "merchant", notify: false, createdAt: new Date("2026-05-25T10:00:00Z") },
];

export async function GET() {
  const session = await getServerSession(authOptions);
  if ((session?.user as { role?: string } | undefined)?.role !== "admin") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const entries = E2E
    ? E2E_EXPORT_ROWS
    : await prisma.waitlistEntry.findMany({
        orderBy: { createdAt: "desc" },
        select: { name: true, email: true, pincode: true, role: true, notify: true, createdAt: true },
      });

  const header = "Name,Email,Pin Code,Role,Notify,Signed Up\n";
  const rows = entries
    .map((e) =>
      [
        `"${e.name.replace(/"/g, '""')}"`,
        `"${e.email}"`,
        e.pincode,
        e.role,
        e.notify ? "yes" : "no",
        e.createdAt.toISOString(),
      ].join(",")
    )
    .join("\n");

  return new NextResponse(header + rows, {
    headers: {
      "Content-Type":        "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="lokul-waitlist-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
