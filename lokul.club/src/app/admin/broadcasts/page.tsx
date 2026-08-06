import { getServerUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getBroadcasts } from "@/lib/admin-platform";
import BroadcastsTable from "@/components/admin/BroadcastsTable";
import { Suspense } from "react";
import { PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Broadcasts | Lokul Admin" };

export default async function BroadcastsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const user = await getServerUser();
  // Bypass auth in development
  if (process.env.NODE_ENV !== "development" && user && (user as any)?.role !== "admin") redirect("/admin/login");

  const sp     = await searchParams;
  const page   = Math.max(1, parseInt(sp.page ?? "1", 10));
  const status = sp.status ?? "";

  const { broadcasts, total, pages } = await getBroadcasts({ page, status });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Broadcasts"
        description="Send push notifications to users by scope."
      />
      <Suspense>
        <BroadcastsTable
          broadcasts={broadcasts}
          total={total}
          pages={pages}
          page={page}
          status={status}
        />
      </Suspense>
    </div>
  );
}
