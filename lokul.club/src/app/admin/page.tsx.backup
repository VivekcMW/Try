import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminRoot() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");
  redirect("/admin/dashboard");
}
