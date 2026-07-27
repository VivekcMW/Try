import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import AdminEventsTable from "@/components/admin/AdminEventsTable";
import { Suspense } from "react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Events | Lokul Admin" };

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if ((session?.user as { role?: string } | undefined)?.role !== "admin") redirect("/admin/login");

  const sp     = await searchParams;
  const page   = Math.max(1, parseInt(sp.page ?? "1", 10));
  const search = sp.search ?? "";
  const PAGE_SIZE = 30;

  const where = {
    type: "event" as const,
    deletedAt: null,
    ...(search
      ? {
          OR: [
            { body:   { contains: search, mode: "insensitive" as const } },
            { author: { name: { contains: search, mode: "insensitive" as const } } },
          ],
        }
      : {}),
  };

  const noRealDb = (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");
  const E2E = process.env.E2E_TEST === "1" || noRealDb;

  const [posts, total] = E2E ? [[], 0] : await Promise.all([
    prisma.post.findMany({
      where,
      include: {
        author:    { select: { id: true, name: true } },
        eventRsvps: { select: { status: true } },
      },
      orderBy: { createdAt: "desc" },
      skip:  (page - 1) * PAGE_SIZE,
      take:  PAGE_SIZE,
    }),
    prisma.post.count({ where }),
  ]);

  const rows = posts.map((p) => ({
    id:         p.id,
    body:       p.body,
    pinCode:    p.pinCode,
    createdAt:  p.createdAt.toISOString(),
    author:     p.author,
    rsvpYes:    p.eventRsvps.filter((r) => r.status === "yes").length,
    rsvpMaybe:  p.eventRsvps.filter((r) => r.status === "maybe").length,
    rsvpNo:     p.eventRsvps.filter((r) => r.status === "no").length,
    totalRsvps: p.eventRsvps.length,
  }));

  return (
    <div className="space-y-4">
      <PageHeader
        title="Events"
        description="Community events with RSVP breakdown by pin code."
      />
      <Suspense>
        <AdminEventsTable
          events={rows}
          total={total}
          pages={Math.ceil(total / PAGE_SIZE)}
          page={page}
          search={search}
        />
      </Suspense>
    </div>
  );
}
