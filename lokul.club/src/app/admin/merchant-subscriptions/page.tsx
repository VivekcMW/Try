import { getServerUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getMerchantSubscriptions } from "@/lib/admin-platform";
import MerchantSubscriptionsTable from "@/components/admin/MerchantSubscriptionsTable";
import { PageHeader } from "@/components/ui";
import { Suspense } from "react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Merchant Subscriptions | Lokul Admin" };

export default async function MerchantSubscriptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; status?: string }>;
}) {
  const user = await getServerUser();
  if (process.env.NODE_ENV !== "development" && user && (user as any)?.role !== "admin") redirect("/admin/login");

  const sp     = await searchParams;
  const page   = Math.max(1, Number.parseInt(sp.page ?? "1", 10));
  const search = sp.search ?? "";
  const status = sp.status ?? "";

  const { subscriptions, total, pages } = await getMerchantSubscriptions({ page, search, status, pageSize: 30 });
  const rows = subscriptions.map((s) => ({
    ...s,
    startDate: s.startDate.toISOString(),
    createdAt: s.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-4">
      <PageHeader
        title="Merchant Subscriptions"
        description="Recurring subscription plans customers have subscribed to (e.g. daily milk/tiffin)."
      />
      <Suspense>
        <MerchantSubscriptionsTable subscriptions={rows} total={total} pages={pages} page={page} search={search} status={status} />
      </Suspense>
    </div>
  );
}
