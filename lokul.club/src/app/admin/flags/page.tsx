import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getFeatureFlags } from "@/lib/admin-platform";
import FlagsTable from "@/components/admin/FlagsTable";
import { PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Feature Flags | Lokul Admin" };

export default async function FlagsPage() {
  const session = await getServerSession(authOptions);
  if ((session?.user as { role?: string } | undefined)?.role !== "admin") redirect("/admin/login");

  const { flags } = await getFeatureFlags();

  return (
    <div className="space-y-4">
      <PageHeader
        title="Feature Flags"
        description="Toggle feature availability by scope — global, society, city, or user."
      />
      <FlagsTable flags={flags} />
    </div>
  );
}
