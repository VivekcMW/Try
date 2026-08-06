import { getServerUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getSocieties } from "@/lib/admin-platform";
import SocietiesTable from "@/components/admin/SocietiesTable";
import { Suspense } from "react";
import { PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Societies | Lokul Admin" };

export default async function SocietiesPage({
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

  const { societies, total, pages } = await getSocieties({ page, search, status });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Societies"
        description="Review and approve RWA / society registrations."
      />
      <Suspense>
        <SocietiesTable
          societies={societies}
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
