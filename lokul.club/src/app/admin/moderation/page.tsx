import { getServerUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getReports } from "@/lib/admin-platform";
import ModerationQueue from "@/components/admin/ModerationQueue";
import { Suspense } from "react";
import { PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Moderation | Lokul Admin" };

export default async function ModerationPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; priority?: string }>;
}) {
  const user = await getServerUser();
  // Bypass auth in development
  if (process.env.NODE_ENV !== "development" && user && (user as any)?.role !== "admin") redirect("/admin/login");

  const sp       = await searchParams;
  const page     = Math.max(1, parseInt(sp.page ?? "1", 10));
  const status   = sp.status   ?? "open";
  const priority = sp.priority ?? "";

  const { reports, total, pages } = await getReports({ page, status, priority });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Moderation Queue"
        description="Review reported user-generated content (posts, comments, users) and take enforcement actions. Merchant catalog/offer/broadcast content is reviewed separately under Merchant Broadcasts."
      />
      <Suspense>
        <ModerationQueue
          reports={reports}
          total={total}
          pages={pages}
          page={page}
          status={status}
          priority={priority}
        />
      </Suspense>
    </div>
  );
}
