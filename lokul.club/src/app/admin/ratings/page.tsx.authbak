import { getServerUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getRatings } from "@/lib/admin-platform";
import RatingsTable from "@/components/admin/RatingsTable";
import { Suspense } from "react";
import { PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Ratings | Lokul Admin" };

export default async function RatingsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; flagged?: string }>;
}) {
  const user = await getServerUser();
  if ((session?.user as { role?: string } | undefined)?.role !== "admin") redirect("/admin/login");

  const sp      = await searchParams;
  const page    = Math.max(1, parseInt(sp.page ?? "1", 10));
  const search  = sp.search  ?? "";
  const flagged = sp.flagged === "1";

  const { ratings, total, pages } = await getRatings({ page, search, flagged });

  return (
    <div className="space-y-4">
      <PageHeader title="Ratings & Reviews" description="All peer ratings — flag and remove abusive reviews." />
      <Suspense>
        <RatingsTable
          ratings={ratings}
          total={total}
          pages={pages}
          page={page}
          search={search}
          flagged={flagged}
        />
      </Suspense>
    </div>
  );
}
