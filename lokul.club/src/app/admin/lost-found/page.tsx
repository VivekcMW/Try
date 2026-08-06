import { getServerUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import LostFoundTable from "@/components/admin/LostFoundTable";
import { PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Lost & Found | Lokul Admin" };

const noRealDb = (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");
const E2E = process.env.E2E_TEST === "1" || noRealDb;

const FIXTURE_LF = [
  { id: "lf1", authorName: "Priya Sharma", body: "Lost golden retriever near park", postTag: "lost",  pinCode: "560001", createdAt: new Date("2026-05-27T09:00:00Z") },
  { id: "lf2", authorName: "Vikram Singh", body: "Found keys near Block B entrance", postTag: "found", pinCode: "400053", createdAt: new Date("2026-05-26T14:00:00Z") },
];

export default async function LostFoundPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; tag?: string }>;
}) {
  const user = await getServerUser();
  // Bypass auth in development
  if (process.env.NODE_ENV !== "development" && user && (user as any)?.role !== "admin") redirect("/admin/login");

  const sp  = await searchParams;
  const tag = sp.tag ?? "";

  let items = FIXTURE_LF as typeof FIXTURE_LF;
  if (!E2E) {
    const raw = await prisma.post.findMany({
      where: { type: { in: ["lost" as never, "sell" as never] }, ...(tag ? { tags: { some: { tag } } } : {}) },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { author: { select: { name: true } }, tags: { take: 1 } },
    });
    items = raw.map(p => ({
      id: p.id,
      authorName: p.author.name ?? "Unknown",
      body: p.body,
      postTag: p.tags[0]?.tag ?? "",
      pinCode: p.pinCode ?? "",
      createdAt: p.createdAt,
    }));
  } else if (tag) {
    items = items.filter(i => i.postTag === tag);
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Lost & Found" description="Lost/found posts submitted by residents." />
      <LostFoundTable items={items} tag={tag} />
    </div>
  );
}
