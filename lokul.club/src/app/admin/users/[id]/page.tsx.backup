import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserActivity } from "@/lib/admin-platform";
import UserActivityView from "@/components/admin/UserActivityView";
import { PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "User Activity | Lokul Admin" };

export default async function UserActivityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if ((session?.user as { role?: string } | undefined)?.role !== "admin") redirect("/admin/login");

  const { id } = await params;
  const activity = await getUserActivity(id);

  return (
    <div className="space-y-4">
      <PageHeader title="User Activity" description={`Unified activity timeline for user ${id}`} />
      <UserActivityView userId={id} activity={activity} />
    </div>
  );
}
