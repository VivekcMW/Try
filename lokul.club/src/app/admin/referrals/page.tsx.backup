import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import AdminReferralsTable from "@/components/admin/AdminReferralsTable";
import { Suspense } from "react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Referrals | Lokul Admin" };

export default async function AdminReferralsPage({
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

  const where = search
    ? {
        OR: [
          { referrer: { name: { contains: search, mode: "insensitive" as const } } },
          { referee:  { name: { contains: search, mode: "insensitive" as const } } },
          { refereePhone: { contains: search } },
        ],
      }
    : {};

  const noRealDb = (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");
  const E2E = process.env.E2E_TEST === "1" || noRealDb;

  const [records, total] = E2E ? [[], 0] : await Promise.all([
    prisma.referralRecord.findMany({
      where,
      include: {
        referrer: { select: { id: true, name: true } },
        referee:  { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip:  (page - 1) * PAGE_SIZE,
      take:  PAGE_SIZE,
    }),
    prisma.referralRecord.count({ where }),
  ]);

  const rows = records.map((r) => ({
    id:           r.id,
    referrerId:   r.referrerId,
    referrerName: r.referrer.name ?? "—",
    refereeId:    r.refereeId,
    refereeName:  r.referee?.name ?? null,
    refereePhone: r.refereePhone,
    creditPaise:  r.creditPaise,
    creditedAt:   r.creditedAt?.toISOString() ?? null,
    createdAt:    r.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-4">
      <PageHeader
        title="Referrals"
        description="Track user referrals and wallet credit payouts."
      />
      <Suspense>
        <AdminReferralsTable
          referrals={rows}
          total={total}
          pages={Math.ceil(total / PAGE_SIZE)}
          page={page}
          search={search}
        />
      </Suspense>
    </div>
  );
}
