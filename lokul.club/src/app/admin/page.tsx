import { getServerUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminRoot() {
  const user = await getServerUser();
  if (!user) redirect("/admin/login");
  redirect("/admin/dashboard");
}
