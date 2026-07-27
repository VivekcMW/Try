import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import AdvertisersTable from "@/components/admin/AdvertisersTable";
import { getAdvertisers, AD_ADVERTISER_STATUSES } from "@/lib/admin-ads";

export const dynamic = "force-dynamic";

export default async function AdvertisersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; search?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if ((session?.user as { role?: string } | undefined)?.role !== "admin") redirect("/admin/login");

  const sp     = await searchParams;
  const page   = Math.max(1, parseInt(sp.page ?? "1", 10));
  const status = (AD_ADVERTISER_STATUSES as readonly string[]).includes(sp.status ?? "") ? sp.status! : "";
  const search = sp.search ?? "";

  const { advertisers, total, pages } = await getAdvertisers({ page, status, search });

  return (
    <div className="space-y-4">
      <PageHeader title="Advertisers" description="Brands and merchants buying ad inventory." />
      <Suspense>
        <AdvertisersTable advertisers={advertisers} total={total} pages={pages} page={page} status={status} search={search} />
      </Suspense>
    </div>
  );
}
