import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import AdminGroupBuysTable from "@/components/admin/AdminGroupBuysTable";
import { Suspense } from "react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Group Buys | Lokul Admin" };

export default async function AdminGroupBuysPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if ((session?.user as { role?: string } | undefined)?.role !== "admin") redirect("/admin/login");

  const sp     = await searchParams;
  const page   = Math.max(1, parseInt(sp.page ?? "1", 10));
  const status = sp.status ?? "";
  const PAGE_SIZE = 30;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = status ? { status } : {};

  const noRealDb = (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");
  const E2E = process.env.E2E_TEST === "1" || noRealDb;

  const [buys, total] = E2E ? [[], 0] : await Promise.all([
    prisma.groupBuy.findMany({
      where,
      include: {
        organizer: { select: { id: true, name: true, phone: true } },
        _count:    { select: { commits: true } },
      },
      orderBy: { createdAt: "desc" },
      skip:  (page - 1) * PAGE_SIZE,
      take:  PAGE_SIZE,
    }),
    prisma.groupBuy.count({ where }),
  ]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Group Buys"
        description="Community group purchasing events — track commitments and distribution."
      />
      <Suspense>
        <AdminGroupBuysTable buys={buys as never} total={total} page={page} pages={Math.ceil(total / PAGE_SIZE)} status={status} />
      </Suspense>
    </div>
  );
}
