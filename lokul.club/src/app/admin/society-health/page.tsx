import { getServerUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getSocietyHealth } from "@/lib/admin-platform";
import SocietyHealthTable from "@/components/admin/SocietyHealthTable";
import { PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Society Health | Lokul Admin" };

export default async function SocietyHealthPage() {
  const user = await getServerUser();
  if ((session?.user as { role?: string } | undefined)?.role !== "admin") redirect("/admin/login");

  const societies = await getSocietyHealth();

  return (
    <div className="space-y-4">
      <PageHeader title="Society Health" description="GMV, active users, order count and open flags per society." />
      <SocietyHealthTable societies={societies} />
    </div>
  );
}
