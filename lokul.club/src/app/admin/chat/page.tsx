import { getServerUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import AdminChatTable from "@/components/admin/AdminChatTable";
import { Suspense } from "react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Chat | Lokul Admin" };

export default async function AdminChatPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; type?: string; search?: string }>;
}) {
  const user = await getServerUser();
  // Bypass auth in development
  if (process.env.NODE_ENV !== "development" && user && (user as any)?.role !== "admin") redirect("/admin/login");

  const sp     = await searchParams;
  const page   = Math.max(1, parseInt(sp.page ?? "1", 10));
  const VALID_TYPES = ["dm", "society_main", "tower", "topic", "community"];
  const type   = VALID_TYPES.includes(sp.type ?? "") ? sp.type! : "";
  const search = sp.search ?? "";
  const PAGE_SIZE = 30;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    ...(type ? { type } : {}),
    ...(search
      ? {
          OR: [
            { name:    { contains: search, mode: "insensitive" as const } },
            { creator: { name: { contains: search, mode: "insensitive" as const } } },
          ],
        }
      : {}),
  };

  const noRealDb = (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");
  const E2E = process.env.E2E_TEST === "1" || noRealDb;

  const [threads, total] = E2E ? [[], 0] : await Promise.all([
    prisma.chatThread.findMany({
      where,
      include: {
        creator:    { select: { id: true, name: true } },
        _count:     { select: { memberships: true, messages: true } },
      },
      orderBy: { lastMessageAt: "desc" },
      skip:  (page - 1) * PAGE_SIZE,
      take:  PAGE_SIZE,
    }),
    prisma.chatThread.count({ where }),
  ]);

  const rows = threads.map((t) => ({
    id:            t.id,
    type:          t.type,
    name:          t.name,
    memberCount:   t._count.memberships,
    messageCount:  t._count.messages,
    lastMessageAt: t.lastMessageAt?.toISOString() ?? null,
    createdAt:     t.createdAt.toISOString(),
    creator:       t.creator,
  }));

  return (
    <div className="space-y-4">
      <PageHeader
        title="Chat Threads"
        description="Monitor all chat threads: direct messages, group chats, and community channels."
      />
      <Suspense>
        <AdminChatTable
          threads={rows}
          total={total}
          pages={Math.ceil(total / PAGE_SIZE)}
          page={page}
          type={type}
          search={search}
        />
      </Suspense>
    </div>
  );
}
