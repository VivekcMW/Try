import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import AdCreativesTable from "@/components/admin/AdCreativesTable";
import { getAdCreatives, AD_CREATIVE_STATUSES, AD_PLACEMENTS } from "@/lib/admin-ads";

export const dynamic = "force-dynamic";

export default async function AdCreativesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; placement?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if ((session?.user as { role?: string } | undefined)?.role !== "admin") redirect("/admin/login");

  const sp        = await searchParams;
  const page      = Math.max(1, parseInt(sp.page ?? "1", 10));
  const status    = (AD_CREATIVE_STATUSES as readonly string[]).includes(sp.status ?? "") ? sp.status! : "";
  const placement = (AD_PLACEMENTS as readonly string[]).includes(sp.placement ?? "") ? sp.placement! : "";

  const { creatives, total, pages } = await getAdCreatives({ page, status, placement });

  return (
    <div className="space-y-4">
      <PageHeader title="Creative Review" description="Every creative must be approved before its campaign can go live. The Sponsored label is mandatory on all renders." />
      <Suspense>
        <AdCreativesTable creatives={creatives} total={total} pages={pages} page={page} status={status} placement={placement} />
      </Suspense>
    </div>
  );
}
