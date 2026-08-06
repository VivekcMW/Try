import { getServerUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getAppointments } from "@/lib/admin-platform";
import AdminAppointmentsTable from "@/components/admin/AdminAppointmentsTable";
import { PageHeader } from "@/components/ui";
import { Suspense } from "react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Appointments | Lokul Admin" };

export default async function AdminAppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; status?: string }>;
}) {
  const user = await getServerUser();
  // Bypass auth in development
  if (process.env.NODE_ENV !== "development" && user && (user as any)?.role !== "admin") redirect("/admin/login");

  const sp     = await searchParams;
  const page   = Math.max(1, parseInt(sp.page ?? "1", 10));
  const search = sp.search ?? "";
  const status = sp.status ?? "";

  const { appointments, total, pages } = await getAppointments({ page, search, status, pageSize: 30 });

  const rows = appointments.map((a) => ({
    ...a,
    scheduledAt: a.scheduledAt instanceof Date ? a.scheduledAt.toISOString() : String(a.scheduledAt),
    createdAt:   a.createdAt instanceof Date   ? a.createdAt.toISOString()   : String(a.createdAt),
  }));

  return (
    <div className="space-y-4">
      <PageHeader
        title="Appointments"
        description="All service appointments booked through merchants."
      />
      <Suspense>
        <AdminAppointmentsTable
          appointments={rows}
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
