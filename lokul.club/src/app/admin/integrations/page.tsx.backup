import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getIntegrations } from "@/lib/admin-integrations";
import IntegrationsPanel from "@/components/admin/IntegrationsPanel";
import { PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Integrations | Lokul Admin" };

export default async function IntegrationsPage() {
  const session = await getServerSession(authOptions);
  if ((session?.user as { role?: string } | undefined)?.role !== "admin") {
    redirect("/admin/login");
  }

  const integrations = await getIntegrations();

  return (
    <div className="space-y-4">
      <PageHeader
        title="Third-Party Integrations"
        description={`${integrations.length} providers across 6 categories — payment, messaging, maps, civic APIs, KYC, and AI.`}
      />
      <IntegrationsPanel integrations={integrations} />
    </div>
  );
}
