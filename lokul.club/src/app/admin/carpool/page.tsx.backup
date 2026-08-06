import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import AdminCarpoolTable from "@/components/admin/AdminCarpoolTable";
import { Suspense } from "react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Carpool | Lokul Admin" };

export default async function AdminCarpoolPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; search?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if ((session?.user as { role?: string } | undefined)?.role !== "admin") redirect("/admin/login");

  const sp     = await searchParams;
  const page   = Math.max(1, parseInt(sp.page ?? "1", 10));
  const status = sp.status ?? "";
  const search = sp.search ?? "";
  const PAGE_SIZE = 30;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    ...(status ? { status } : {}),
    ...(search
      ? {
          OR: [
            { driver:    { name: { contains: search, mode: "insensitive" as const } } },
            { fromLabel: { contains: search, mode: "insensitive" as const } },
            { toLabel:   { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const noRealDb = (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");
  const E2E = process.env.E2E_TEST === "1" || noRealDb;

  const [trips, total] = E2E ? [[], 0] : await Promise.all([
    prisma.carpoolTrip.findMany({
      where,
      include: {
        driver: { select: { id: true, name: true } },
        _count: { select: { joins: true } },
      },
      orderBy: { departureAt: "desc" },
      skip:  (page - 1) * PAGE_SIZE,
      take:  PAGE_SIZE,
    }),
    prisma.carpoolTrip.count({ where }),
  ]);

  const rows = trips.map((t) => ({
    id:          t.id,
    fromLabel:   t.fromLabel,
    toLabel:     t.toLabel,
    departureAt: t.departureAt.toISOString(),
    seatsTotal:  t.seatsTotal,
    seatsLeft:   t.seatsLeft,
    pricePaise:  t.pricePaise,
    status:      t.status,
    pinCode:     t.pinCode,
    createdAt:   t.createdAt.toISOString(),
    driver:      t.driver,
    joinCount:   t._count.joins,
  }));

  return (
    <div className="space-y-4">
      <PageHeader
        title="Carpool Trips"
        description="All resident carpool trips with seat availability and join counts."
      />
      <Suspense>
        <AdminCarpoolTable
          trips={rows}
          total={total}
          pages={Math.ceil(total / PAGE_SIZE)}
          page={page}
          status={status}
          search={search}
        />
      </Suspense>
    </div>
  );
}
