import { getServerUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getSafetyContacts } from "@/lib/admin-platform";
import SafetyContactsTable from "@/components/admin/SafetyContactsTable";
import { PageHeader } from "@/components/ui";
import { Suspense } from "react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Safety Contacts | Lokul Admin" };

export default async function SafetyContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const user = await getServerUser();
  // Bypass auth in development
  if (process.env.NODE_ENV !== "development" && user && (user as any)?.role !== "admin") redirect("/admin/login");

  const sp     = await searchParams;
  const page   = Math.max(1, parseInt(sp.page ?? "1", 10));
  const search = sp.search ?? "";

  const { contacts, total, pages } = await getSafetyContacts({ page, search });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Safety Contacts"
        description="Emergency contacts registered by users for safety features."
      />
      <Suspense>
        <SafetyContactsTable
          contacts={contacts.map(c => ({ ...c, createdAt: c.createdAt instanceof Date ? c.createdAt : new Date(c.createdAt) }))}
          total={total}
          pages={pages}
          page={page}
          search={search}
        />
      </Suspense>
    </div>
  );
}
