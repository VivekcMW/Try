import { getServerUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import AdminPostsTable from "@/components/admin/AdminPostsTable";
import { Suspense } from "react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Posts | Lokul Admin" };

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; type?: string; search?: string }>;
}) {
  const user = await getServerUser();
  // Bypass auth in development
  if (process.env.NODE_ENV !== "development" && user && (user as any)?.role !== "admin") redirect("/admin/login");

  const sp     = await searchParams;
  const page   = Math.max(1, parseInt(sp.page ?? "1", 10));
  const PAGE_SIZE = 30;

  // Whitelist filter params against schema enums — arbitrary URL values must
  // degrade to "no filter" instead of crashing the Prisma query.
  const VALID_TYPES    = ["update", "safety", "lost", "event", "poll", "sell", "rwa_notice", "sos"];
  const VALID_STATUSES = ["active", "hidden", "removed", "deleted"];
  const status = VALID_STATUSES.includes(sp.status ?? "") ? sp.status! : "";
  const type   = VALID_TYPES.includes(sp.type ?? "")      ? sp.type!   : "";
  const search = sp.search ?? "";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    ...(status ? { status } : {}),
    ...(type   ? { type   } : {}),
    deletedAt: null,
    ...(search
      ? {
          OR: [
            { body:   { contains: search, mode: "insensitive" as const } },
            { author: { name: { contains: search, mode: "insensitive" as const } } },
          ],
        }
      : {}),
  };

  const noRealDb = (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");
  const E2E = process.env.E2E_TEST === "1" || noRealDb;

  const [posts, total] = E2E ? [[], 0] : await Promise.all([
    prisma.post.findMany({
      where,
      include: {
        author: { select: { id: true, name: true } },
        _count: { select: { reactions: true, comments: true } },
      },
      orderBy: { createdAt: "desc" },
      skip:  (page - 1) * PAGE_SIZE,
      take:  PAGE_SIZE,
    }),
    prisma.post.count({ where }),
  ]);

  const rows = posts.map((p) => ({
    id:            p.id,
    type:          p.type,
    body:          p.body,
    status:        p.status,
    pinCode:       p.pinCode,
    reactionCount: p.reactionCount,
    commentCount:  p.commentCount,
    viewCount:     p.viewCount,
    createdAt:     p.createdAt.toISOString(),
    author:        p.author,
    _count:        p._count,
  }));

  return (
    <div className="space-y-4">
      <PageHeader
        title="Feed Posts"
        description="All community posts across pin codes. Moderate content and view engagement."
      />
      <Suspense>
        <AdminPostsTable
          posts={rows}
          total={total}
          pages={Math.ceil(total / PAGE_SIZE)}
          page={page}
          status={status}
          type={type}
          search={search}
        />
      </Suspense>
    </div>
  );
}
