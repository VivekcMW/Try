import { getServerSession } from "@/lib/supabase/server";
import AdminShell from "@/components/admin/AdminShell";

export const metadata = { title: "Admin | Lokul.club" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  // Middleware handles auth protection, so we just pass session to shell
  return <AdminShell session={session}>{children}</AdminShell>;
}
