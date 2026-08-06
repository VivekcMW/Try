import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import AdBookingsTable from "@/components/admin/AdBookingsTable";
import { getAdBookings, AD_BOOKING_STATUSES, AD_PLACEMENTS } from "@/lib/admin-ads";

export const dynamic = "force-dynamic";

export default async function AdBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; placement?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if ((session?.user as { role?: string } | undefined)?.role !== "admin") redirect("/admin/login");

  const sp        = await searchParams;
  const page      = Math.max(1, parseInt(sp.page ?? "1", 10));
  const status    = (AD_BOOKING_STATUSES as readonly string[]).includes(sp.status ?? "") ? sp.status! : "";
  const placement = (AD_PLACEMENTS as readonly string[]).includes(sp.placement ?? "") ? sp.placement! : "";

  const { bookings, total, pages } = await getAdBookings({ page, status, placement });

  return (
    <div className="space-y-4">
      <PageHeader title="Ad Bookings" description="Inventory reservations awaiting approval. Approval checks for placement × pincode date conflicts." />
      <Suspense>
        <AdBookingsTable bookings={bookings} total={total} pages={pages} page={page} status={status} placement={placement} />
      </Suspense>
    </div>
  );
}
