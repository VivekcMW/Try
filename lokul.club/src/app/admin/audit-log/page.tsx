import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAuditLogs } from "@/lib/admin-platform";
import AuditLogTable from "@/components/admin/AuditLogTable";
import { Suspense } from "react";
import { PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Audit Log | Lokul Admin" };

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; action?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if ((session?.user as { role?: string } | undefined)?.role !== "admin") redirect("/admin/login");

  const sp     = await searchParams;
  const page   = Math.max(1, parseInt(sp.page ?? "1", 10));
  const action = sp.action ?? "";

  const { logs, total, pages } = await getAuditLogs({ page, action });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Audit Log"
        description="Immutable record of all admin and system actions."
      />
      <Suspense>
        <AuditLogTable
          logs={logs}
          total={total}
          pages={pages}
          page={page}
          action={action}
        />
      </Suspense>
    </div>
  );
}
