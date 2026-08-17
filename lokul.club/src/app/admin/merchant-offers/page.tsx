import { getServerUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getMerchantOffers } from "@/lib/admin-platform";
import MerchantOffersTable from "@/components/admin/MerchantOffersTable";
import { PageHeader } from "@/components/ui";
import { Suspense } from "react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Merchant Offers | Lokul Admin" };

export default async function MerchantOffersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; active?: string }>;
}) {
  const user = await getServerUser();
  if (process.env.NODE_ENV !== "development" && user && (user as any)?.role !== "admin") redirect("/admin/login");

  const sp     = await searchParams;
  const page   = Math.max(1, Number.parseInt(sp.page ?? "1", 10));
  const search = sp.search ?? "";
  const active = sp.active ?? "";

  const { offers, total, pages } = await getMerchantOffers({ page, search, active, pageSize: 30 });
  const rows = offers.map((o) => ({
    ...o,
    startsAt: o.startsAt.toISOString(),
    endsAt: o.endsAt.toISOString(),
    createdAt: o.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-4">
      <PageHeader
        title="Merchant Offers"
        description="Promotional offers (percent off, flat off, BOGO, free delivery) merchants have created."
      />
      <Suspense>
        <MerchantOffersTable offers={rows} total={total} pages={pages} page={page} search={search} active={active} />
      </Suspense>
    </div>
  );
}
