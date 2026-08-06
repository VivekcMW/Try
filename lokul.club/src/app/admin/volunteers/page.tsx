import { getServerUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getVolunteers } from "@/lib/admin-platform";
import VolunteersTable from "@/components/admin/VolunteersTable";
import { PageHeader } from "@/components/ui";
import { Suspense } from "react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Volunteers | Lokul Admin" };

export default async function VolunteersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; active?: string }>;
}) {
  const user = await getServerUser();
  // Bypass auth in development
  if (process.env.NODE_ENV !== "development" && user && (user as any)?.role !== "admin") redirect("/admin/login");

  const sp     = await searchParams;
  const page   = Math.max(1, parseInt(sp.page ?? "1", 10));
  const search = sp.search ?? "";
  const active = sp.active ?? "";

  const { volunteers, total, pages } = await getVolunteers({ page, search, active });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Volunteers"
        description="Users who have signed up as neighbourhood safety volunteers."
      />
      <Suspense>
        <VolunteersTable
          volunteers={volunteers.map(v => ({ ...v, updatedAt: v.updatedAt instanceof Date ? v.updatedAt : new Date(v.updatedAt) }))}
          total={total}
          pages={pages}
          page={page}
          search={search}
          active={active}
        />
      </Suspense>
    </div>
  );
}
