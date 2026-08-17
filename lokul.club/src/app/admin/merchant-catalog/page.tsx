import { getServerUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getMerchantCatalogItems } from "@/lib/admin-platform";
import MerchantCatalogTable from "@/components/admin/MerchantCatalogTable";
import { PageHeader } from "@/components/ui";
import { Suspense } from "react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Merchant Catalog | Lokul Admin" };

export default async function MerchantCatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; kind?: string }>;
}) {
  const user = await getServerUser();
  if (process.env.NODE_ENV !== "development" && user && (user as any)?.role !== "admin") redirect("/admin/login");

  const sp     = await searchParams;
  const page   = Math.max(1, Number.parseInt(sp.page ?? "1", 10));
  const search = sp.search ?? "";
  const kind   = sp.kind ?? "";

  const { items, total, pages } = await getMerchantCatalogItems({ page, search, kind, pageSize: 30 });
  const rows = items.map((i) => ({ ...i, createdAt: i.createdAt.toISOString() }));

  return (
    <div className="space-y-4">
      <PageHeader
        title="Merchant Catalog"
        description="Products, menu items, services, consultations and class batches listed by merchants."
      />
      <Suspense>
        <MerchantCatalogTable items={rows} total={total} pages={pages} page={page} search={search} kind={kind} />
      </Suspense>
    </div>
  );
}
