import { getServerUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getMedicalProfiles } from "@/lib/admin-platform";
import MedicalProfilesTable from "@/components/admin/MedicalProfilesTable";
import { PageHeader } from "@/components/ui";
import { Suspense } from "react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Medical Profiles | Lokul Admin" };

export default async function MedicalProfilesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const user = await getServerUser();
  if ((session?.user as { role?: string } | undefined)?.role !== "admin") redirect("/admin/login");

  const sp     = await searchParams;
  const page   = Math.max(1, parseInt(sp.page ?? "1", 10));
  const search = sp.search ?? "";

  const { profiles, total, pages } = await getMedicalProfiles({ page, search });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Medical Profiles"
        description="Emergency medical information stored by users (blood group, allergies, conditions)."
      />
      <Suspense>
        <MedicalProfilesTable
          profiles={profiles.map(m => ({ ...m, updatedAt: m.updatedAt instanceof Date ? m.updatedAt : new Date(m.updatedAt) }))}
          total={total}
          pages={pages}
          page={page}
          search={search}
        />
      </Suspense>
    </div>
  );
}
