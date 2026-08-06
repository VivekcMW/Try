import { getServerUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import AdminKycTable from "@/components/admin/AdminKycTable";
import { Suspense } from "react";

export const dynamic = "force-dynamic";
export const metadata = { title: "KYC Review | Lokul Admin" };

export default async function AdminKycPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const user = await getServerUser();
  if ((session?.user as { role?: string } | undefined)?.role !== "admin") redirect("/admin/login");

  const sp     = await searchParams;
  const page   = Math.max(1, parseInt(sp.page ?? "1", 10));
  const status = sp.status ?? "pending";
  const PAGE_SIZE = 30;

  const noRealDb = (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");
  const E2E = process.env.E2E_TEST === "1" || noRealDb;

  const [docs, total] = E2E ? [[], 0] : await Promise.all([
    prisma.kycDocument.findMany({
      where: { status },
      include: {
        user: { select: { id: true, name: true, phone: true, kycTier: true } },
      },
      orderBy: { createdAt: "asc" },
      skip:  (page - 1) * PAGE_SIZE,
      take:  PAGE_SIZE,
    }),
    prisma.kycDocument.count({ where: { status } }),
  ]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="KYC Review"
        description="Review and verify identity documents submitted by users."
      />
      <Suspense>
        <AdminKycTable docs={docs as never} total={total} page={page} pages={Math.ceil(total / PAGE_SIZE)} status={status} />
      </Suspense>
    </div>
  );
}
