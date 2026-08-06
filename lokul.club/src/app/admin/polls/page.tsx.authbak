import { getServerUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PollsTable from "@/components/admin/PollsTable";
import { PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Polls | Lokul Admin" };

const noRealDb = (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");
const E2E = process.env.E2E_TEST === "1" || noRealDb;

const FIXTURE_POLLS = [
  { id: "pol1", question: "Should we allow pets in common areas?", authorName: "Sunita Patel", societyName: "Sunshine Heights",   votes: 45, createdAt: new Date("2026-05-25T10:00:00Z") },
  { id: "pol2", question: "New CCTV placement options?",            authorName: "Priya Sharma",  societyName: "Green Valley Apts",   votes: 12, createdAt: new Date("2026-05-26T15:00:00Z") },
];

export default async function PollsPage() {
  const user = await getServerUser();
  if ((session?.user as { role?: string } | undefined)?.role !== "admin") redirect("/admin/login");

  let polls = FIXTURE_POLLS as typeof FIXTURE_POLLS;
  if (!E2E) {
    const raw = await prisma.post.findMany({
      where: { type: "poll" as never },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { author: { select: { name: true } }, society: { select: { name: true } } },
    });
    polls = raw.map(p => ({
      id: p.id,
      question: p.body,
      authorName: p.author.name ?? "Unknown",
      societyName: p.society?.name ?? "—",
      votes: 0,
      createdAt: p.createdAt,
    }));
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Polls" description="Community polls created by society members." />
      <PollsTable polls={polls} />
    </div>
  );
}
