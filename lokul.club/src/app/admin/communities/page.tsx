import { getServerUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import AdminCommunitiesTable from "@/components/admin/AdminCommunitiesTable";
import { Suspense } from "react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Communities | Lokul Admin" };

export default async function AdminCommunitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; type?: string; search?: string }>;
}) {
  const user = await getServerUser();
  if ((session?.user as { role?: string } | undefined)?.role !== "admin") redirect("/admin/login");

  const sp     = await searchParams;
  const page   = Math.max(1, parseInt(sp.page ?? "1", 10));
  const type   = sp.type ?? "";
  const search = sp.search ?? "";
  const PAGE_SIZE = 30;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    ...(type ? { type } : {}),
    ...(search
      ? { name: { contains: search, mode: "insensitive" as const } }
      : {}),
  };

  const noRealDb = (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");
  const E2E = process.env.E2E_TEST === "1" || noRealDb;

  const [communities, total] = E2E ? [[], 0] : await Promise.all([
    prisma.community.findMany({
      where,
      include: {
        creator: { select: { id: true, name: true } },
        _count: { select: { members: true } },
      },
      orderBy: { createdAt: "desc" },
      skip:  (page - 1) * PAGE_SIZE,
      take:  PAGE_SIZE,
    }),
    prisma.community.count({ where }),
  ]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Communities"
        description="Locality groups created by residents. Manage visibility and membership."
      />
      <Suspense>
        <AdminCommunitiesTable communities={communities as never} total={total} page={page} pages={Math.ceil(total / PAGE_SIZE)} type={type} search={search} />
      </Suspense>
    </div>
  );
}
