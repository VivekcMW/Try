import { getServerUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getSafetyJourneys } from "@/lib/admin-platform";
import SafetyJourneysTable from "@/components/admin/SafetyJourneysTable";
import { PageHeader } from "@/components/ui";
import { Suspense } from "react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Safety Journeys | Lokul Admin" };

export default async function SafetyJourneysPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; status?: string }>;
}) {
  const user = await getServerUser();
  if ((session?.user as { role?: string } | undefined)?.role !== "admin") redirect("/admin/login");

  const sp     = await searchParams;
  const page   = Math.max(1, parseInt(sp.page ?? "1", 10));
  const search = sp.search ?? "";
  const status = sp.status ?? "";

  const { journeys, total, pages } = await getSafetyJourneys({ page, search, status });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Safety Journeys"
        description="Active and historical journey check-ins for user safety tracking."
      />
      <Suspense>
        <SafetyJourneysTable
          journeys={journeys.map(j => ({
            ...j,
            expectedArrival: j.expectedArrival instanceof Date ? j.expectedArrival : new Date(j.expectedArrival),
            lastCheckInAt: j.lastCheckInAt ? (j.lastCheckInAt instanceof Date ? j.lastCheckInAt : new Date(j.lastCheckInAt)) : null,
            createdAt: j.createdAt instanceof Date ? j.createdAt : new Date(j.createdAt),
          }))}
          total={total}
          pages={pages}
          page={page}
          search={search}
          status={status}
        />
      </Suspense>
    </div>
  );
}
