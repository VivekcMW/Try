/**
 * GET /api/admin/reconciliation — payments reconciliation report
 *
 * Compares RazorpayOrder (gateway truth as mirrored in our DB) against
 * WalletEntry (ledger truth). Surfaces:
 *   1. paid orders with NO matching topup WalletEntry  → user paid, not credited (CRITICAL)
 *   2. topup WalletEntries with NO matching paid order → credited without payment (CRITICAL)
 *   3. orders stuck in "created" for > 24h             → abandoned or webhook missed
 *   4. daily totals: sum(paid orders) vs sum(topup entries)
 *
 * Query params:
 *   from=YYYY-MM-DD  (default: 7 days ago)
 *   to=YYYY-MM-DD    (default: now, exclusive upper bound = to + 1 day)
 *   format=json|csv  (default: json)
 *
 * Auth: admin session (same guard as /api/admin/export).
 */
import { getServerUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const noRealDb = (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");
const E2E = process.env.E2E_TEST === "1" || noRealDb;

const DAY_MS = 24 * 60 * 60 * 1000;

function parseDate(value: string | null, fallback: Date): Date {
  if (!value) return fallback;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? fallback : d;
}

export async function GET(req: NextRequest) {
  const user = await getServerUser();
  if ((user as { role?: string } | null)?.role !== "admin") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const now  = new Date();
  const from = parseDate(searchParams.get("from"), new Date(now.getTime() - 7 * DAY_MS));
  const toRaw = parseDate(searchParams.get("to"), now);
  const to   = new Date(toRaw.getTime() + DAY_MS); // exclusive upper bound
  const format = searchParams.get("format") ?? "json";

  if (E2E) {
    return NextResponse.json({
      range: { from: from.toISOString(), to: to.toISOString() },
      summary: { paidOrders: 0, paidOrderPaise: 0, topupEntries: 0, topupPaise: 0, driftPaise: 0 },
      paidOrdersWithoutLedgerEntry: [],
      ledgerEntriesWithoutPaidOrder: [],
      staleCreatedOrders: [],
      isStub: true,
    });
  }

  const createdAt = { gte: from, lt: to };

  const [paidOrders, topupEntries, staleCreated] = await Promise.all([
    prisma.razorpayOrder.findMany({
      where: { status: "paid", createdAt },
      select: {
        razorpayOrderId: true, razorpayPaymentId: true, userId: true,
        amountPaise: true, purpose: true, createdAt: true, updatedAt: true,
      },
    }),
    prisma.walletEntry.findMany({
      where: { type: "topup", status: "completed", createdAt },
      select: {
        id: true, userId: true, amountPaise: true, reference: true,
        description: true, createdAt: true,
      },
    }),
    prisma.razorpayOrder.findMany({
      where: {
        status: "created",
        createdAt: { gte: from, lt: new Date(now.getTime() - DAY_MS) },
      },
      select: {
        razorpayOrderId: true, userId: true, amountPaise: true,
        purpose: true, createdAt: true,
      },
      orderBy: { createdAt: "asc" },
      take: 200,
    }),
  ]);

  // Match by payment id (WalletEntry.reference stores razorpayPaymentId for topups)
  const entryRefs = new Set(topupEntries.map((e) => e.reference).filter(Boolean));
  const paymentIds = new Set(
    paidOrders.map((o) => o.razorpayPaymentId).filter(Boolean)
  );

  const paidOrdersWithoutLedgerEntry = paidOrders.filter(
    (o) => !o.razorpayPaymentId || !entryRefs.has(o.razorpayPaymentId)
  );
  const ledgerEntriesWithoutPaidOrder = topupEntries.filter(
    (e) => !e.reference || !paymentIds.has(e.reference)
  );

  const paidOrderPaise = paidOrders.reduce((s, o) => s + o.amountPaise, 0);
  const topupPaise     = topupEntries.reduce((s, e) => s + e.amountPaise, 0);

  const report = {
    range: { from: from.toISOString(), to: to.toISOString() },
    summary: {
      paidOrders:     paidOrders.length,
      paidOrderPaise,
      topupEntries:   topupEntries.length,
      topupPaise,
      driftPaise:     paidOrderPaise - topupPaise, // 0 = fully reconciled
      mismatchCount:
        paidOrdersWithoutLedgerEntry.length + ledgerEntriesWithoutPaidOrder.length,
      staleCreatedCount: staleCreated.length,
    },
    paidOrdersWithoutLedgerEntry,
    ledgerEntriesWithoutPaidOrder,
    staleCreatedOrders: staleCreated,
  };

  if (format === "csv") {
    const lines = [
      "kind,orderId,paymentIdOrRef,userId,amountPaise,purposeOrDesc,createdAt",
      ...paidOrdersWithoutLedgerEntry.map((o) =>
        ["paid_order_no_ledger", o.razorpayOrderId, o.razorpayPaymentId ?? "", o.userId, o.amountPaise, o.purpose, o.createdAt.toISOString()].join(",")
      ),
      ...ledgerEntriesWithoutPaidOrder.map((e) =>
        ["ledger_no_paid_order", "", e.reference ?? "", e.userId, e.amountPaise, `"${e.description.replaceAll('"', '""')}"`, e.createdAt.toISOString()].join(",")
      ),
      ...staleCreated.map((o) =>
        ["stale_created_order", o.razorpayOrderId, "", o.userId, o.amountPaise, o.purpose, o.createdAt.toISOString()].join(",")
      ),
    ];
    return new NextResponse(lines.join("\n"), {
      headers: {
        "Content-Type":        "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="lokul-reconciliation-${from.toISOString().slice(0, 10)}_${toRaw.toISOString().slice(0, 10)}.csv"`,
      },
    });
  }

  return NextResponse.json(report);
}
