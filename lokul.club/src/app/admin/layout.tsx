import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";

export const metadata = { title: "Admin | Lokul.club" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  // Login page doesn't need shell — let middleware handle protection for inner pages
  return <AdminShell session={session}>{children}</AdminShell>;
}
