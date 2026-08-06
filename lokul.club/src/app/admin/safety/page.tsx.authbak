import { getServerUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SafetyTable from "@/components/admin/SafetyTable";
import { PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Safety / SOS | Lokul Admin" };

const noRealDb = (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");
const E2E = process.env.E2E_TEST === "1" || noRealDb;

const FIXTURE_SOS = [
  { id: "sos1", authorName: "Priya Sharma", body: "Suspicious person near gate", pinCode: "560001", status: "active", createdAt: new Date("2026-05-27T22:00:00Z") },
  { id: "sos2", authorName: "Deepa Nair",   body: "Chain snatching reported",    pinCode: "500033", status: "hidden", createdAt: new Date("2026-05-26T18:30:00Z") },
];

export default async function SafetyPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const user = await getServerUser();
  if ((session?.user as { role?: string } | undefined)?.role !== "admin") redirect("/admin/login");

  const sp     = await searchParams;
  const VALID_STATUSES = ["active", "hidden", "removed", "deleted"];
  const status = VALID_STATUSES.includes(sp.status ?? "") ? sp.status! : "";

  let alerts = FIXTURE_SOS as typeof FIXTURE_SOS;
  if (!E2E) {
    const raw = await prisma.post.findMany({
      where: { type: "sos", ...(status ? { status: status as never } : {}) },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { author: { select: { name: true } } },
    });
    alerts = raw.map(p => ({
      id: p.id,
      authorName: p.author.name ?? "Unknown",
      body: p.body,
      pinCode: p.pinCode ?? "",
      status: p.status as string,
      createdAt: p.createdAt,
    }));
  } else if (status) {
    alerts = alerts.filter(a => a.status === status);
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Safety / SOS" description="Emergency and safety posts requiring admin attention." />
      <SafetyTable alerts={alerts} status={status} />
    </div>
  );
}
