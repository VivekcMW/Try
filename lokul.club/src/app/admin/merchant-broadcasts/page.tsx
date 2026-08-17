import { getServerUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getMerchantBroadcasts } from "@/lib/admin-platform";
import MerchantBroadcastsTable from "@/components/admin/MerchantBroadcastsTable";
import { PageHeader } from "@/components/ui";
import { Suspense } from "react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Merchant Broadcasts | Lokul Admin" };

export default async function MerchantBroadcastsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const user = await getServerUser();
  if (process.env.NODE_ENV !== "development" && user && (user as any)?.role !== "admin") redirect("/admin/login");

  const sp     = await searchParams;
  const page   = Math.max(1, parseInt(sp.page ?? "1", 10));
  const search = sp.search ?? "";

  const { broadcasts, total, pages } = await getMerchantBroadcasts({ page, search, pageSize: 30 });
  const rows = broadcasts.map((b) => ({ ...b, createdAt: b.createdAt.toISOString() }));

  return (
    <div className="space-y-4">
      <PageHeader
        title="Merchant Broadcasts"
        description="Push messages merchants have sent to their past customers. Disable the merchant_broadcasts flag in Feature Flags to pause this channel platform-wide."
      />
      <Suspense>
        <MerchantBroadcastsTable broadcasts={rows} total={total} pages={pages} page={page} search={search} />
      </Suspense>
    </div>
  );
}
