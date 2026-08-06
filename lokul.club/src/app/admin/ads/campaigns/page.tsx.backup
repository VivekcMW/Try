import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import AdCampaignsTable from "@/components/admin/AdCampaignsTable";
import { getAdCampaigns, AD_CAMPAIGN_STATUSES } from "@/lib/admin-ads";

export const dynamic = "force-dynamic";

export default async function AdCampaignsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; search?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if ((session?.user as { role?: string } | undefined)?.role !== "admin") redirect("/admin/login");

  const sp     = await searchParams;
  const page   = Math.max(1, parseInt(sp.page ?? "1", 10));
  const status = (AD_CAMPAIGN_STATUSES as readonly string[]).includes(sp.status ?? "") ? sp.status! : "";
  const search = sp.search ?? "";

  const { campaigns, total, pages } = await getAdCampaigns({ page, status, search });

  return (
    <div className="space-y-4">
      <PageHeader title="Ad Campaigns" description="Approve, pause and monitor campaign delivery." />
      <Suspense>
        <AdCampaignsTable campaigns={campaigns} total={total} pages={pages} page={page} status={status} search={search} />
      </Suspense>
    </div>
  );
}
