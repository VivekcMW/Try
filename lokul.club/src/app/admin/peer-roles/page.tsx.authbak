import { getServerUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import AdminPeerRolesTable from "@/components/admin/AdminPeerRolesTable";
import { Suspense } from "react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Peer Roles | Lokul Admin" };

export default async function AdminPeerRolesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; category?: string }>;
}) {
  const user = await getServerUser();
  if ((session?.user as { role?: string } | undefined)?.role !== "admin") redirect("/admin/login");

  const sp       = await searchParams;
  const page     = Math.max(1, parseInt(sp.page ?? "1", 10));
  const status   = sp.status ?? "";
  const category = sp.category ?? "";
  const PAGE_SIZE = 30;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    ...(status   ? { isActive: status === "active" } : {}),
    ...(category ? { category } : {}),
  };

  const noRealDb = (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");
  const E2E = process.env.E2E_TEST === "1" || noRealDb;

  const [listings, total] = E2E ? [[], 0] : await Promise.all([
    prisma.serviceListing.findMany({
      where,
      include: {
        user:   { select: { id: true, name: true, phone: true, kycTier: true } },
        _count: { select: { orders: true, ratings: true } },
      },
      orderBy: { createdAt: "desc" },
      skip:  (page - 1) * PAGE_SIZE,
      take:  PAGE_SIZE,
    }),
    prisma.serviceListing.count({ where }),
  ]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Peer Role Approvals"
        description="Activate or suspend peer service listings."
      />
      <Suspense>
        <AdminPeerRolesTable listings={listings as never} total={total} page={page} pages={Math.ceil(total / PAGE_SIZE)} status={status} category={category} />
      </Suspense>
    </div>
  );
}
