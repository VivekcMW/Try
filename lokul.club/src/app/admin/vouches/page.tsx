import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getVouches } from "@/lib/admin-platform";
import VouchesTable from "@/components/admin/VouchesTable";
import { Suspense } from "react";
import { PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Vouch Graph | Lokul Admin" };

export default async function VouchesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; revoked?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if ((session?.user as { role?: string } | undefined)?.role !== "admin") redirect("/admin/login");

  const sp      = await searchParams;
  const page    = Math.max(1, parseInt(sp.page ?? "1", 10));
  const search  = sp.search ?? "";
  const revoked = sp.revoked === "1" ? true : sp.revoked === "0" ? false : undefined;

  const { vouches, total, pages } = await getVouches({ page, search, revoked });

  return (
    <div className="space-y-4">
      <PageHeader title="Vouch Graph" description="Trust vouch relationships between residents." />
      <Suspense>
        <VouchesTable
          vouches={vouches}
          total={total}
          pages={pages}
          page={page}
          search={search}
        />
      </Suspense>
    </div>
  );
}
