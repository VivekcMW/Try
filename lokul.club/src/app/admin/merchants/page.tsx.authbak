import { getServerUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getMerchants } from "@/lib/admin-platform";
import MerchantsTable from "@/components/admin/MerchantsTable";
import { Suspense } from "react";
import { PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Merchants | Lokul Admin" };

export default async function MerchantsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; status?: string }>;
}) {
  const user = await getServerUser();
  if ((session?.user as { role?: string } | undefined)?.role !== "admin") redirect("/admin/login");

  const sp     = await searchParams;
  const page   = Math.max(1, parseInt(sp.page ?? "1", 10));
  const search = sp.search ?? "";
  const status = sp.status ?? "";

  const { merchants, total, pages } = await getMerchants({ page, search, status });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Merchants"
        description="Verify new merchant registrations and manage active listings."
      />
      <Suspense>
        <MerchantsTable
          merchants={merchants}
          total={total}
          pages={pages}
          page={page}
          search={search}
          status={status}
        />
      </Suspense>
    </div>
  );
}
