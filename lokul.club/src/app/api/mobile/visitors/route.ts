/**
 * GET  /api/mobile/visitors  — list visitor logs for a society (today)
 * POST /api/mobile/visitors  — log a visitor entry or exit
 * PATCH /api/mobile/visitors — approve / deny a visitor
 */
import { NextRequest, NextResponse } from "next/server";

// In-memory store for visitor log entries (in prod: DB table VisitorLog)
type VisitorLog = {
  id:        string;
  name:      string;
  phone:     string;
  purpose:   string;
  flat:      string;
  societyId: string;
  status:    "pending" | "approved" | "denied";
  entryTime: string | null;
  exitTime:  string | null;
  createdAt: string;
};

const logs: VisitorLog[] = [
  {
    id: "vl-001", name: "Ramesh Kumar",   phone: "9876543210", purpose: "Delivery",   flat: "B-204",
    societyId: "soc-001", status: "approved", entryTime: new Date(Date.now() - 3600_000).toISOString(),
    exitTime: null, createdAt: new Date(Date.now() - 3600_000).toISOString(),
  },
  {
    id: "vl-002", name: "Priya Sharma",   phone: "9823456789", purpose: "Guest",      flat: "A-101",
    societyId: "soc-001", status: "approved", entryTime: new Date(Date.now() - 7200_000).toISOString(),
    exitTime: new Date(Date.now() - 5400_000).toISOString(), createdAt: new Date(Date.now() - 7200_000).toISOString(),
  },
  {
    id: "vl-003", name: "Delivery Agent", phone: "9011234567", purpose: "Food Delivery", flat: "C-302",
    societyId: "soc-001", status: "pending", entryTime: null,
    exitTime: null, createdAt: new Date().toISOString(),
  },
];

function uid() {
  return `vl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export async function GET(req: NextRequest) {
  const societyId = req.nextUrl.searchParams.get("societyId");
  if (!societyId) return NextResponse.json({ error: "societyId required" }, { status: 400 });

  const today = new Date().toDateString();
  const items = logs.filter(
    (l) => l.societyId === societyId && new Date(l.createdAt).toDateString() === today
  );
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  try {
    const { name, phone, purpose, flat, societyId } = await req.json();
    if (!name || !societyId || !flat) {
      return NextResponse.json({ error: "name, flat, societyId required" }, { status: 400 });
    }
    const entry: VisitorLog = {
      id: uid(), name, phone: phone ?? "", purpose: purpose ?? "", flat, societyId,
      status: "pending", entryTime: null, exitTime: null, createdAt: new Date().toISOString(),
    };
    logs.push(entry);
    return NextResponse.json(entry, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, action } = await req.json();
    // action: 'approve' | 'deny' | 'entry' | 'exit'
    const log = logs.find((l) => l.id === id);
    if (!log) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (action === "approve") { log.status = "approved"; log.entryTime = new Date().toISOString(); }
    else if (action === "deny")  { log.status = "denied"; }
    else if (action === "entry") { log.entryTime = new Date().toISOString(); log.status = "approved"; }
    else if (action === "exit")  { log.exitTime  = new Date().toISOString(); }
    else return NextResponse.json({ error: "invalid action" }, { status: 400 });

    return NextResponse.json(log);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
