import { getServerUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import AdminStoriesTable from "@/components/admin/AdminStoriesTable";
import { Suspense } from "react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Stories | Lokul Admin" };

export default async function AdminStoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const user = await getServerUser();
  // Bypass auth in development
  if (process.env.NODE_ENV !== "development" && user && (user as any)?.role !== "admin") redirect("/admin/login");

  const sp     = await searchParams;
  const page   = Math.max(1, parseInt(sp.page ?? "1", 10));
  const search = sp.search ?? "";
  const PAGE_SIZE = 30;

  const where = search
    ? { author: { name: { contains: search, mode: "insensitive" as const } } }
    : {};

  const noRealDb = (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");
  const E2E = process.env.E2E_TEST === "1" || noRealDb;

  const [stories, total] = E2E ? [[], 0] : await Promise.all([
    prisma.story.findMany({
      where,
      include: {
        author: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip:  (page - 1) * PAGE_SIZE,
      take:  PAGE_SIZE,
    }),
    prisma.story.count({ where }),
  ]);

  const rows = stories.map((s) => ({
    id:        s.id,
    kind:      s.kind,
    caption:   s.caption,
    pinCode:   s.pinCode,
    viewCount: s.viewCount,
    expiresAt: s.expiresAt.toISOString(),
    createdAt: s.createdAt.toISOString(),
    author:    s.author,
  }));

  return (
    <div className="space-y-4">
      <PageHeader
        title="Stories"
        description="24-hour stories posted by residents. Expired stories are kept for 7 days then pruned."
      />
      <Suspense>
        <AdminStoriesTable
          stories={rows}
          total={total}
          pages={Math.ceil(total / PAGE_SIZE)}
          page={page}
          search={search}
        />
      </Suspense>
    </div>
  );
}
