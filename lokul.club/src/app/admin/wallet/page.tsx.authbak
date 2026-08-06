import { getServerUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getWalletEntries } from "@/lib/admin-platform";
import WalletTable from "@/components/admin/WalletTable";
import { Suspense } from "react";
import { PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Wallet / Transactions | Lokul Admin" };

export default async function WalletPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; type?: string; status?: string }>;
}) {
  const user = await getServerUser();
  if ((session?.user as { role?: string } | undefined)?.role !== "admin") redirect("/admin/login");

  const sp     = await searchParams;
  const page   = Math.max(1, parseInt(sp.page ?? "1", 10));
  const search = sp.search ?? "";
  const VALID_TYPES    = ["topup", "spend", "earn", "payout", "refund", "hold", "release"];
  const VALID_STATUSES = ["pending", "completed", "failed", "reversed"];
  const type   = VALID_TYPES.includes(sp.type ?? "")      ? sp.type!   : "";
  const status = VALID_STATUSES.includes(sp.status ?? "") ? sp.status! : "";

  const { entries, total, pages } = await getWalletEntries({ page, search, type, status });

  return (
    <div className="space-y-4">
      <PageHeader title="Wallet / Transactions" description="All wallet entries, top-ups, payouts and escrow holds." />
      <Suspense>
        <WalletTable
          entries={entries}
          total={total}
          pages={pages}
          page={page}
          search={search}
          type={type}
          status={status}
        />
      </Suspense>
    </div>
  );
}
