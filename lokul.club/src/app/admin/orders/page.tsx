import { getServerUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import AdminOrdersTable from "@/components/admin/AdminOrdersTable";
import { Suspense } from "react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Orders | Lokul Admin" };

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; search?: string }>;
}) {
  const user = await getServerUser();
  // Bypass auth in development
  if (process.env.NODE_ENV !== "development" && user && (user as any)?.role !== "admin") redirect("/admin/login");

  const sp     = await searchParams;
  const page   = Math.max(1, parseInt(sp.page ?? "1", 10));
  const status = sp.status ?? "";
  const search = sp.search ?? "";
  const PAGE_SIZE = 30;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    ...(status ? { status } : {}),
    ...(search
      ? {
          OR: [
            { buyer:   { name: { contains: search, mode: "insensitive" as const } } },
            { seller:  { name: { contains: search, mode: "insensitive" as const } } },
            { listing: { title: { contains: search, mode: "insensitive" as const } } },
          ],
        }
      : {}),
  };

  const noRealDb = (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");
  const E2E = process.env.E2E_TEST === "1" || noRealDb;

  const [orders, total] = E2E ? [[], 0] : await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        buyer:   { select: { id: true, name: true, phone: true } },
        seller:  { select: { id: true, name: true, phone: true } },
        listing: { select: { id: true, title: true, category: true } },
        rating:  { select: { score: true } },
      },
      orderBy: { createdAt: "desc" },
      skip:  (page - 1) * PAGE_SIZE,
      take:  PAGE_SIZE,
    }),
    prisma.order.count({ where }),
  ]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Orders & Bookings"
        description="Peer-to-peer service orders — track status, disputes and completions."
      />
      <Suspense>
        <AdminOrdersTable orders={orders as never} total={total} page={page} pages={Math.ceil(total / PAGE_SIZE)} status={status} search={search} />
      </Suspense>
    </div>
  );
}
