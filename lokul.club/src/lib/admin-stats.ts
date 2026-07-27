import { prisma } from "@/lib/prisma";

// ── E2E fixture mode ───────────────────────────────────────────────
// When E2E_TEST=1 is set, OR when DATABASE_URL still has the placeholder
// credentials (no real DB configured), we short-circuit Prisma queries with
// deterministic in-memory fixtures so the admin pages render without a live
// Postgres connection. This is dev/test only — production is unaffected.
const noRealDb = (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");
const E2E = process.env.E2E_TEST === "1" || noRealDb;
if (E2E && process.env.NODE_ENV !== "production") {
  // eslint-disable-next-line no-console
  console.log("[admin-stats] E2E fixture mode ENABLED", noRealDb ? "(no real DB)" : "(E2E_TEST=1)");
}

const E2E_ENTRIES = [
  { id: "e2e-1",  name: "Alice Resident",  email: "alice@example.com",  pincode: "560001", role: "resident", notify: true,  createdAt: new Date("2026-05-26T10:00:00Z") },
  { id: "e2e-2",  name: "Bob Merchant",    email: "bob@example.com",    pincode: "560002", role: "merchant", notify: false, createdAt: new Date("2026-05-25T10:00:00Z") },
  { id: "e2e-3",  name: "Carol RWA",       email: "carol@example.com",  pincode: "560001", role: "rwa",      notify: true,  createdAt: new Date("2026-05-24T10:00:00Z") },
  { id: "e2e-4",  name: "Dave Resident",   email: "dave@example.com",   pincode: "110001", role: "resident", notify: false, createdAt: new Date("2026-05-23T10:00:00Z") },
  { id: "e2e-5",  name: "Eve Merchant",    email: "eve@example.com",    pincode: "110001", role: "merchant", notify: true,  createdAt: new Date("2026-05-22T10:00:00Z") },
];

export async function getAdminStats() {
  if (E2E) {
    return {
      total:       E2E_ENTRIES.length,
      today:       1,
      week:        E2E_ENTRIES.length,
      notifyCount: E2E_ENTRIES.filter((e) => e.notify).length,
      byRole: [
        { role: "resident", count: 2 },
        { role: "merchant", count: 2 },
        { role: "rwa",      count: 1 },
      ],
      topPincodes: [
        { pincode: "560001", count: 2 },
        { pincode: "110001", count: 2 },
        { pincode: "560002", count: 1 },
      ],
      daily: [
        { day: "2026-05-22", count: 1 },
        { day: "2026-05-23", count: 1 },
        { day: "2026-05-24", count: 1 },
        { day: "2026-05-25", count: 1 },
        { day: "2026-05-26", count: 1 },
      ],
    };
  }

  const now        = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart  = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [total, today, week, notifyCount, byRole, topPincodes, dailyRaw] =
    await Promise.all([
      prisma.waitlistEntry.count(),
      prisma.waitlistEntry.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.waitlistEntry.count({ where: { createdAt: { gte: weekStart } } }),
      prisma.waitlistEntry.count({ where: { notify: true } }),
      prisma.waitlistEntry.groupBy({
        by: ["role"],
        _count: { role: true },
        orderBy: { _count: { role: "desc" } },
      }),
      prisma.waitlistEntry.groupBy({
        by: ["pincode"],
        _count: { pincode: true },
        orderBy: { _count: { pincode: "desc" } },
        take: 10,
      }),
      // Last 30 days — raw query for daily aggregation
      prisma.$queryRaw<{ day: Date; count: bigint }[]>`
        SELECT DATE_TRUNC('day', "createdAt") AS day, COUNT(*) AS count
        FROM "WaitlistEntry"
        WHERE "createdAt" >= NOW() - INTERVAL '30 days'
        GROUP BY 1
        ORDER BY 1 ASC
      `,
    ]);

  const daily = dailyRaw.map((r) => ({
    day:   r.day.toISOString().slice(0, 10),
    count: Number(r.count),
  }));

  return {
    total,
    today,
    week,
    notifyCount,
    byRole: byRole.map((r) => ({ role: r.role, count: r._count.role })),
    topPincodes: topPincodes.map((r) => ({ pincode: r.pincode, count: r._count.pincode })),
    daily,
  };
}

export type AdminStats = Awaited<ReturnType<typeof getAdminStats>>;

export async function getEntries({
  page = 1,
  pageSize = 50,
  search = "",
  role = "",
}: {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: string;
}) {
  if (E2E) {
    const filtered = E2E_ENTRIES.filter((e) => {
      if (role && e.role !== role) return false;
      if (search) {
        const s = search.toLowerCase();
        return (
          e.name.toLowerCase().includes(s) ||
          e.email.toLowerCase().includes(s) ||
          e.pincode.includes(s)
        );
      }
      return true;
    });
    const start = (page - 1) * pageSize;
    return {
      entries: filtered.slice(start, start + pageSize),
      total:   filtered.length,
      pages:   Math.max(1, Math.ceil(filtered.length / pageSize)),
    };
  }

  const where = {
    ...(role ? { role } : {}),
    ...(search
      ? {
          OR: [
            { name:    { contains: search, mode: "insensitive" as const } },
            { email:   { contains: search, mode: "insensitive" as const } },
            { pincode: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [entries, total] = await Promise.all([
    prisma.waitlistEntry.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip:  (page - 1) * pageSize,
      take:  pageSize,
    }),
    prisma.waitlistEntry.count({ where }),
  ]);

  return { entries, total, pages: Math.ceil(total / pageSize) };
}
