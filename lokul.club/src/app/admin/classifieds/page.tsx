import { getServerUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getClassifieds } from "@/lib/admin-platform";
import ClassifiedsTable from "@/components/admin/ClassifiedsTable";
import { Suspense } from "react";
import { PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Classifieds | Lokul Admin" };

export default async function ClassifiedsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; status?: string; category?: string }>;
}) {
  const user = await getServerUser();
  if ((session?.user as { role?: string } | undefined)?.role !== "admin") redirect("/admin/login");

  const sp       = await searchParams;
  const page     = Math.max(1, parseInt(sp.page ?? "1", 10));
  const search   = sp.search   ?? "";
  const VALID_STATUSES = ["active", "reserved", "sold", "expired", "removed"];
  const status   = VALID_STATUSES.includes(sp.status ?? "") ? sp.status! : "";
  const category = sp.category ?? "";

  const { classifieds, total, pages } = await getClassifieds({ page, search, status, category });

  return (
    <div className="space-y-4">
      <PageHeader title="Classifieds" description="All marketplace listings across societies." />
      <Suspense>
        <ClassifiedsTable
          classifieds={classifieds}
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
