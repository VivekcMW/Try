import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getQuotes } from "@/lib/admin-platform";
import AdminQuotesTable from "@/components/admin/AdminQuotesTable";
import { PageHeader } from "@/components/ui";
import { Suspense } from "react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Quotes | Lokul Admin" };

export default async function AdminQuotesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; status?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if ((session?.user as { role?: string } | undefined)?.role !== "admin") redirect("/admin/login");

  const sp     = await searchParams;
  const page   = Math.max(1, parseInt(sp.page ?? "1", 10));
  const search = sp.search ?? "";
  const VALID_STATUSES = ["open", "quoted", "accepted", "declined"];
  const status = VALID_STATUSES.includes(sp.status ?? "") ? sp.status! : "";

  const { quotes, total, pages } = await getQuotes({ page, search, status, pageSize: 30 });

  const rows = quotes.map((q) => ({
    ...q,
    createdAt: q.createdAt instanceof Date ? q.createdAt.toISOString() : String(q.createdAt),
  }));

  return (
    <div className="space-y-4">
      <PageHeader
        title="Quote Requests"
        description="Service quote requests submitted by residents to merchants."
      />
      <Suspense>
        <AdminQuotesTable
          quotes={rows}
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
