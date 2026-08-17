import { getServerUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getMerchantCoupons } from "@/lib/admin-platform";
import MerchantCouponsTable from "@/components/admin/MerchantCouponsTable";
import { PageHeader } from "@/components/ui";
import { Suspense } from "react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Merchant Coupons | Lokul Admin" };

export default async function MerchantCouponsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; active?: string }>;
}) {
  const user = await getServerUser();
  if (process.env.NODE_ENV !== "development" && user && (user as any)?.role !== "admin") redirect("/admin/login");

  const sp     = await searchParams;
  const page   = Math.max(1, parseInt(sp.page ?? "1", 10));
  const search = sp.search ?? "";
  const active = sp.active ?? "";

  const { coupons, total, pages } = await getMerchantCoupons({ page, search, active, pageSize: 30 });
  const rows = coupons.map((c) => ({
    ...c,
    expiresAt: c.expiresAt ? c.expiresAt.toISOString() : null,
    createdAt: c.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-4">
      <PageHeader
        title="Merchant Coupons"
        description="Discount codes merchants have created for their own customers."
      />
      <Suspense>
        <MerchantCouponsTable coupons={rows} total={total} pages={pages} page={page} search={search} active={active} />
      </Suspense>
    </div>
  );
}
