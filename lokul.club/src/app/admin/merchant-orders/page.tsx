import { getServerUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getMerchantOrders } from "@/lib/admin-platform";
import MerchantOrdersTable from "@/components/admin/MerchantOrdersTable";
import { PageHeader } from "@/components/ui";
import { Suspense } from "react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Merchant Orders | Lokul Admin" };

export default async function MerchantOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; status?: string }>;
}) {
  const user = await getServerUser();
  if (process.env.NODE_ENV !== "development" && user && (user as any)?.role !== "admin") redirect("/admin/login");

  const sp     = await searchParams;
  const page   = Math.max(1, parseInt(sp.page ?? "1", 10));
  const search = sp.search ?? "";
  const status = sp.status ?? "";

  const { orders, total, pages } = await getMerchantOrders({ page, search, status, pageSize: 30 });
  const rows = orders.map((o) => ({ ...o, createdAt: o.createdAt.toISOString() }));

  return (
    <div className="space-y-4">
      <PageHeader
        title="Merchant Orders"
        description="Orders placed through merchant catalogs/menus — distinct from the classifieds P2P Orders page."
      />
      <Suspense>
        <MerchantOrdersTable orders={rows} total={total} pages={pages} page={page} search={search} status={status} />
      </Suspense>
    </div>
  );
}
