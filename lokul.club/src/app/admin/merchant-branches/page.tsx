import { getServerUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getMerchantBranches } from "@/lib/admin-platform";
import MerchantBranchesTable from "@/components/admin/MerchantBranchesTable";
import { PageHeader } from "@/components/ui";
import { Suspense } from "react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Merchant Branches | Lokul Admin" };

export default async function MerchantBranchesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const user = await getServerUser();
  if (process.env.NODE_ENV !== "development" && user && (user as any)?.role !== "admin") redirect("/admin/login");

  const sp     = await searchParams;
  const page   = Math.max(1, parseInt(sp.page ?? "1", 10));
  const search = sp.search ?? "";

  const { branches, total, pages } = await getMerchantBranches({ page, search, pageSize: 30 });
  const rows = branches.map((b) => ({ ...b, createdAt: b.createdAt.toISOString() }));

  return (
    <div className="space-y-4">
      <PageHeader
        title="Merchant Branches"
        description="Multi-location branches merchants have added under their account."
      />
      <Suspense>
        <MerchantBranchesTable branches={rows} total={total} pages={pages} page={page} search={search} />
      </Suspense>
    </div>
  );
}
