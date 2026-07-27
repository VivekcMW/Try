import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getEntries } from "@/lib/admin-stats";
import EntriesTable from "@/components/admin/EntriesTable";
import { Suspense } from "react";
import { PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Entries | Lokul Admin" };

export default async function EntriesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; role?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if ((session?.user as { role?: string } | undefined)?.role !== "admin") redirect("/admin/login");

  const sp     = await searchParams;
  const page   = Math.max(1, parseInt(sp.page ?? "1", 10));
  const search = sp.search ?? "";
  const role   = sp.role   ?? "";

  const { entries, total, pages } = await getEntries({ page, search, role });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Waitlist Entries"
        description="Search, filter and export all signups."
      />

      <Suspense>
        <EntriesTable
          entries={entries.map((e) => ({ ...e, createdAt: e.createdAt }))}
          total={total}
          pages={pages}
          page={page}
          search={search}
          role={role}
        />
      </Suspense>
    </div>
  );
}
