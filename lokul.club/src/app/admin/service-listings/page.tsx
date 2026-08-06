import { getServerUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getServiceListings } from "@/lib/admin-platform";
import ServiceListingsTable from "@/components/admin/ServiceListingsTable";
import { Suspense } from "react";
import { PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Service Listings | Lokul Admin" };

export default async function ServiceListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; category?: string; active?: string }>;
}) {
  const user = await getServerUser();
  // Bypass auth in development
  if (process.env.NODE_ENV !== "development" && user && (user as any)?.role !== "admin") redirect("/admin/login");

  const sp        = await searchParams;
  const page      = Math.max(1, parseInt(sp.page ?? "1", 10));
  const search    = sp.search   ?? "";
  const VALID_CATEGORIES = ["cook", "rider", "coach", "tutor", "beautician", "caretaker", "handyman", "reseller"];
  const category  = VALID_CATEGORIES.includes(sp.category ?? "") ? sp.category! : "";
  const isActive  = sp.active === "" ? undefined : sp.active === "1" ? true : sp.active === "0" ? false : undefined;

  const { listings, total, pages } = await getServiceListings({ page, search, category, isActive });

  return (
    <div className="space-y-4">
      <PageHeader title="Service Listings" description="Peer services listed on the platform." />
      <Suspense>
        <ServiceListingsTable
          listings={listings}
          total={total}
          pages={pages}
          page={page}
          search={search}
          category={category}
        />
      </Suspense>
    </div>
  );
}
