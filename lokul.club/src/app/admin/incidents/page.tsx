import { getServerUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getIncidentReports } from "@/lib/admin-platform";
import IncidentReportsTable from "@/components/admin/IncidentReportsTable";
import { PageHeader } from "@/components/ui";
import { Suspense } from "react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Incident Reports | Lokul Admin" };

export default async function IncidentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; status?: string; category?: string }>;
}) {
  const user = await getServerUser();
  // Bypass auth in development
  if (process.env.NODE_ENV !== "development" && user && (user as any)?.role !== "admin") redirect("/admin/login");

  const sp       = await searchParams;
  const page     = Math.max(1, parseInt(sp.page ?? "1", 10));
  const search   = sp.search   ?? "";
  const status   = sp.status   ?? "";
  const category = sp.category ?? "";

  const { reports, total, pages } = await getIncidentReports({ page, search, status, category });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Incident Reports"
        description="Community-reported incidents: noise, theft, vandalism, and more."
      />
      <Suspense>
        <IncidentReportsTable
          reports={reports.map(r => ({
            ...r,
            resolvedAt: r.resolvedAt ? (r.resolvedAt instanceof Date ? r.resolvedAt : new Date(r.resolvedAt)) : null,
            createdAt: r.createdAt instanceof Date ? r.createdAt : new Date(r.createdAt),
          }))}
          total={total}
          pages={pages}
          page={page}
          search={search}
          status={status}
          category={category}
        />
      </Suspense>
    </div>
  );
}
