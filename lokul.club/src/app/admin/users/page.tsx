import { getServerUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getUsers } from "@/lib/admin-platform";
import UsersTable from "@/components/admin/UsersTable";
import { Suspense } from "react";
import { PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Users | Lokul Admin" };

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; role?: string; status?: string }>;
}) {
  const user = await getServerUser();
  // Bypass auth in development
  if (process.env.NODE_ENV !== "development" && user && (user as any)?.role !== "admin") redirect("/admin/login");

  const sp     = await searchParams;
  const page   = Math.max(1, parseInt(sp.page ?? "1", 10));
  const search = sp.search ?? "";
  const role   = sp.role   ?? "";
  const status = sp.status ?? "";

  const { users, total, pages } = await getUsers({ page, search, role, status });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Users"
        description="All registered Lokul users with KYC tier and trust score."
      />
      <Suspense>
        <UsersTable
          users={users}
          total={total}
          pages={pages}
          page={page}
          search={search}
          role={role}
          status={status}
        />
      </Suspense>
    </div>
  );
}
