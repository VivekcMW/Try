import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

// ── E2E / fixture mode ────────────────────────────────────────────────────────
const noRealDb = (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");
const E2E = process.env.E2E_TEST === "1" || noRealDb;

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type AdminUser = {
  id: string;
  phone: string | null;
  name: string;
  role: string;
  status: string;
  kycTier: string;
  trustScore: number;
  strikeCount: number;
  createdAt: Date;
};

export type AdminReport = {
  id: string;
  reporterId: string;
  reporterName: string;
  targetKind: string;
  targetId: string;
  reason: string;
  status: string;
  priority: string;
  routedTo: string;
  createdAt: Date;
};

export type AdminSociety = {
  id: string;
  name: string;
  address: string;
  pinCode: string;
  city: string;
  state: string;
  status: string;
  memberCount: number;
  createdAt: Date;
};

export type AdminMerchant = {
  id: string;
  ownerId: string;
  ownerName: string;
  name: string;
  category: string;
  city: string;
  pinCode: string;
  status: string;
  isEndorsed: boolean;
  isBlacklisted: boolean;
  createdAt: Date;
};

export type AdminBroadcast = {
  id: string;
  title: string;
  body: string;
  targetScope: string;
  status: string;
  recipientCount: number;
  sentAt: Date | null;
  createdAt: Date;
};

export type AdminFlag = {
  id: string;
  key: string;
  enabled: boolean;
  scope: string;
  scopeValue: string | null;
  description: string | null;
  updatedAt: Date;
};

export type AdminAuditLog = {
  id: string;
  actorId: string | null;
  actorKind: string;
  action: string;
  targetKind: string | null;
  targetId: string | null;
  ipAddress: string | null;
  createdAt: Date;
};

// ─────────────────────────────────────────────────────────────────────────────
// FIXTURES
// ─────────────────────────────────────────────────────────────────────────────

const now = new Date("2026-05-28T10:00:00Z");
const days = (n: number) => new Date(now.getTime() - n * 86_400_000);

const FIXTURE_USERS: AdminUser[] = [
  { id: "u1", phone: "+919876543210", name: "Priya Sharma",    role: "resident",  status: "active",    kycTier: "silver", trustScore: 72, strikeCount: 0,   createdAt: days(10) },
  { id: "u2", phone: "+919876543211", name: "Rahul Mehta",     role: "merchant",  status: "active",    kycTier: "bronze", trustScore: 55, strikeCount: 0.5, createdAt: days(8)  },
  { id: "u3", phone: "+919876543212", name: "Sunita Patel",    role: "rwa_admin", status: "active",    kycTier: "gold",   trustScore: 90, strikeCount: 0,   createdAt: days(20) },
  { id: "u4", phone: "+919876543213", name: "Amit Kumar",      role: "resident",  status: "warned",    kycTier: "bronze", trustScore: 35, strikeCount: 1,   createdAt: days(5)  },
  { id: "u5", phone: "+919876543214", name: "Deepa Nair",      role: "resident",  status: "suspended", kycTier: "bronze", trustScore: 10, strikeCount: 2.5, createdAt: days(3)  },
  { id: "u6", phone: "+919876543215", name: "Vikram Singh",    role: "resident",  status: "active",    kycTier: "silver", trustScore: 68, strikeCount: 0,   createdAt: days(15) },
];

const FIXTURE_REPORTS: AdminReport[] = [
  { id: "r1", reporterId: "u1", reporterName: "Priya Sharma",  targetKind: "post",    targetId: "p1", reason: "misinformation", status: "open",      priority: "high",   routedTo: "lokul", createdAt: days(1)  },
  { id: "r2", reporterId: "u6", reporterName: "Vikram Singh",  targetKind: "user",    targetId: "u4", reason: "harassment",     status: "in_review", priority: "high",   routedTo: "lokul", createdAt: days(2)  },
  { id: "r3", reporterId: "u3", reporterName: "Sunita Patel",  targetKind: "comment", targetId: "c1", reason: "spam",           status: "open",      priority: "normal", routedTo: "rwa",   createdAt: days(0)  },
  { id: "r4", reporterId: "u2", reporterName: "Rahul Mehta",   targetKind: "post",    targetId: "p2", reason: "hate_speech",    status: "open",      priority: "critical", routedTo: "lokul", createdAt: days(0) },
];

const FIXTURE_SOCIETIES: AdminSociety[] = [
  { id: "s1", name: "Green Valley Apartments",  address: "12, MG Road",        pinCode: "560001", city: "Bengaluru", state: "Karnataka",   status: "pending",  memberCount: 0,  createdAt: days(2)  },
  { id: "s2", name: "Sunshine Heights",         address: "45, Andheri West",   pinCode: "400053", city: "Mumbai",    state: "Maharashtra", status: "approved", memberCount: 128, createdAt: days(30) },
  { id: "s3", name: "Palm Grove Residency",     address: "7, Jubilee Hills",   pinCode: "500033", city: "Hyderabad", state: "Telangana",   status: "pending",  memberCount: 0,  createdAt: days(1)  },
  { id: "s4", name: "Silver Oak Society",       address: "3, Koramangala",     pinCode: "560034", city: "Bengaluru", state: "Karnataka",   status: "approved", memberCount: 56, createdAt: days(20) },
  { id: "s5", name: "Lotus Petal Cooperative",  address: "90, Vastrapur",      pinCode: "380015", city: "Ahmedabad", state: "Gujarat",     status: "rejected", memberCount: 0,  createdAt: days(5)  },
];

const FIXTURE_MERCHANTS: AdminMerchant[] = [
  { id: "m1", ownerId: "u2", ownerName: "Rahul Mehta",   name: "Rahul's Grocery",     category: "grocery",   city: "Bengaluru", pinCode: "560001", status: "pending_verification", isEndorsed: false, isBlacklisted: false, createdAt: days(3)  },
  { id: "m2", ownerId: "u6", ownerName: "Vikram Singh",  name: "Vikram Electricals",  category: "services",  city: "Mumbai",    pinCode: "400053", status: "active",               isEndorsed: true,  isBlacklisted: false, createdAt: days(25) },
  { id: "m3", ownerId: "u4", ownerName: "Amit Kumar",    name: "Amit Fast Food",      category: "food",      city: "Bengaluru", pinCode: "560034", status: "suspended",            isEndorsed: false, isBlacklisted: false, createdAt: days(10) },
  { id: "m4", ownerId: "u1", ownerName: "Priya Sharma",  name: "Priya Boutique",      category: "fashion",   city: "Hyderabad", pinCode: "500033", status: "pending_verification", isEndorsed: false, isBlacklisted: false, createdAt: days(1)  },
];

const FIXTURE_BROADCASTS: AdminBroadcast[] = [
  { id: "b1", title: "Welcome to Lokul!",           body: "We're live in your area.",  targetScope: "all",          status: "sent",   recipientCount: 540, sentAt: days(5),  createdAt: days(6)  },
  { id: "b2", title: "New feature: Classifieds",    body: "Buy & sell in your society.", targetScope: "all",        status: "sent",   recipientCount: 540, sentAt: days(2),  createdAt: days(3)  },
  { id: "b3", title: "Scheduled maintenance",       body: "Downtime at 2 AM Saturday.",  targetScope: "all",        status: "draft",  recipientCount: 0,   sentAt: null,     createdAt: days(0)  },
  { id: "b4", title: "Safety alert — 560001",       body: "Stay alert tonight.",          targetScope: "pincode:560001", status: "sent", recipientCount: 80, sentAt: days(1), createdAt: days(1) },
];

const FIXTURE_FLAGS: AdminFlag[] = [
  { id: "f1", key: "classifieds",      enabled: true,  scope: "global",  scopeValue: null,    description: "Classifieds / marketplace feature", updatedAt: days(10) },
  { id: "f2", key: "merchant_pages",   enabled: true,  scope: "global",  scopeValue: null,    description: "Merchant storefronts",              updatedAt: days(10) },
  { id: "f3", key: "sos_broadcast",    enabled: false, scope: "global",  scopeValue: null,    description: "SOS post type in feed",             updatedAt: days(3)  },
  { id: "f4", key: "kyc_gold_tier",    enabled: false, scope: "global",  scopeValue: null,    description: "Gold KYC tier verification flow",   updatedAt: days(2)  },
  { id: "f5", key: "classifieds",      enabled: true,  scope: "society", scopeValue: "s2",    description: null,                                updatedAt: days(5)  },
];

const FIXTURE_AUDIT: AdminAuditLog[] = [
  { id: "a1", actorId: "admin-1", actorKind: "user",   action: "society.approved",  targetKind: "society",  targetId: "s2",  ipAddress: "10.0.0.1", createdAt: days(20) },
  { id: "a2", actorId: "admin-1", actorKind: "user",   action: "merchant.approved", targetKind: "merchant", targetId: "m2",  ipAddress: "10.0.0.1", createdAt: days(25) },
  { id: "a3", actorId: "admin-1", actorKind: "user",   action: "report.dismissed",  targetKind: "report",   targetId: "r3",  ipAddress: "10.0.0.1", createdAt: days(1)  },
  { id: "a4", actorId: null,      actorKind: "system", action: "classified.expired",targetKind: "classified",targetId: "cl1", ipAddress: null,       createdAt: days(0)  },
  { id: "a5", actorId: "admin-1", actorKind: "user",   action: "user.suspended",    targetKind: "user",     targetId: "u5",  ipAddress: "10.0.0.1", createdAt: days(3)  },
];

// ─────────────────────────────────────────────────────────────────────────────
// PLATFORM DASHBOARD STATS
// ─────────────────────────────────────────────────────────────────────────────

export async function getPlatformStats() {
  if (E2E) {
    return {
      totalUsers:           FIXTURE_USERS.length,
      activeUsers:          FIXTURE_USERS.filter(u => u.status === "active").length,
      postsToday:           14,
      openReports:          FIXTURE_REPORTS.filter(r => r.status === "open").length,
      criticalReports:      FIXTURE_REPORTS.filter(r => r.priority === "critical").length,
      pendingSocieties:     FIXTURE_SOCIETIES.filter(s => s.status === "pending").length,
      pendingMerchants:     FIXTURE_MERCHANTS.filter(m => m.status === "pending_verification").length,
      totalSocieties:       FIXTURE_SOCIETIES.filter(s => s.status === "approved").length,
      totalMerchants:       FIXTURE_MERCHANTS.filter(m => m.status === "active").length,
      totalAppointments:    12,
      pendingAppointments:  4,
      totalQuotes:          8,
      pendingQuotes:        3,
      openSosIncidents:     2,
      activePeerRoles:      40,
      // Safety services
      totalSafetyContacts:  18,
      activeJourneys:       5,
      overdueJourneys:      2,
      activeVolunteers:     31,
      totalMedicalProfiles: 24,
      pendingIncidents:     7,
      totalIncidents:       43,
    };
  }

  const weekStart = new Date(Date.now() - 7 * 86_400_000);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // Core tables are always present; optional tables (Appointment, QuoteRequest,
  // SosIncident) may not exist yet if migrations haven't been run — fall back to 0.
  const safe = (p: Promise<number>) => p.catch(() => 0);

  const [
    totalUsers, activeUsers, postsToday, openReports, criticalReports,
    pendingSocieties, pendingMerchants, totalSocieties, totalMerchants,
    totalAppointments, pendingAppointments, totalQuotes, pendingQuotes, openSosIncidents,
    totalSafetyContacts, activeJourneys, overdueJourneys, activeVolunteers,
    totalMedicalProfiles, pendingIncidents, totalIncidents,
  ] = await Promise.all([
    safe(prisma.user.count()),
    safe(prisma.user.count({ where: { status: "active" } })),
    safe(prisma.post.count({ where: { createdAt: { gte: todayStart } } })),
    safe(prisma.report.count({ where: { status: "open" } })),
    safe(prisma.report.count({ where: { status: "open", priority: "critical" } })),
    safe(prisma.society.count({ where: { status: "pending" } })),
    safe(prisma.merchant.count({ where: { status: "pending_verification" } })),
    safe(prisma.society.count({ where: { status: "approved" } })),
    safe(prisma.merchant.count({ where: { status: "active" } })),
    safe(prisma.appointment.count()),
    safe(prisma.appointment.count({ where: { status: "pending" } })),
    safe(prisma.quoteRequest.count()),
    safe(prisma.quoteRequest.count({ where: { status: "open" } })),
    safe(prisma.sosIncident.count({ where: { status: "open" } })),
    safe(prisma.safetyContact.count()),
    safe(prisma.safetyJourney.count({ where: { status: "active" } })),
    safe(prisma.safetyJourney.count({ where: { status: "overdue" } })),
    safe(prisma.volunteer.count({ where: { active: true } })),
    safe(prisma.medicalProfile.count()),
    safe(prisma.incidentReport.count({ where: { status: "pending" } })),
    safe(prisma.incidentReport.count()),
  ]);

  return {
    totalUsers, activeUsers, postsToday, openReports, criticalReports,
    pendingSocieties, pendingMerchants, totalSocieties, totalMerchants,
    totalAppointments, pendingAppointments, totalQuotes, pendingQuotes, openSosIncidents,
    activePeerRoles: 40,
    totalSafetyContacts, activeJourneys, overdueJourneys, activeVolunteers,
    totalMedicalProfiles, pendingIncidents, totalIncidents,
  };
}

export type PlatformStats = Awaited<ReturnType<typeof getPlatformStats>>;

// ─────────────────────────────────────────────────────────────────────────────
// USERS
// ─────────────────────────────────────────────────────────────────────────────

export async function getUsers({
  page = 1, pageSize = 50, search = "", role = "", status = "",
}: { page?: number; pageSize?: number; search?: string; role?: string; status?: string }) {
  if (E2E) {
    let list = [...FIXTURE_USERS];
    if (role)   list = list.filter(u => u.role === role);
    if (status) list = list.filter(u => u.status === status);
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(u => u.name.toLowerCase().includes(s) || u.phone?.includes(s));
    }
    const start = (page - 1) * pageSize;
    return { users: list.slice(start, start + pageSize), total: list.length, pages: Math.max(1, Math.ceil(list.length / pageSize)) };
  }

  const where: Prisma.UserWhereInput = {
    ...(role   ? { role:   role   as Prisma.EnumUserRoleFilter } : {}),
    ...(status ? { status: status as Prisma.EnumUserStatusFilter } : {}),
    ...(search ? { OR: [{ name: { contains: search, mode: "insensitive" as const } }, { phone: { contains: search } }] } : {}),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize,
      select: { id: true, phone: true, name: true, role: true, status: true, kycTier: true, trustScore: true, strikeCount: true, createdAt: true } }),
    prisma.user.count({ where }),
  ]);

  return { users, total, pages: Math.ceil(total / pageSize) };
}

// ─────────────────────────────────────────────────────────────────────────────
// REPORTS
// ─────────────────────────────────────────────────────────────────────────────

export async function getReports({
  page = 1, pageSize = 50, status = "", priority = "",
}: { page?: number; pageSize?: number; status?: string; priority?: string }) {
  if (E2E) {
    let list = [...FIXTURE_REPORTS];
    if (status)   list = list.filter(r => r.status === status);
    if (priority) list = list.filter(r => r.priority === priority);
    const start = (page - 1) * pageSize;
    return { reports: list.slice(start, start + pageSize), total: list.length, pages: Math.max(1, Math.ceil(list.length / pageSize)) };
  }

  const where: Prisma.ReportWhereInput = {
    ...(status   ? { status:   status   as Prisma.EnumReportStatusFilter } : {}),
    ...(priority ? { priority: priority as Prisma.EnumReportPriorityFilter } : {}),
  };

  const [raw, total] = await Promise.all([
    prisma.report.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize,
      include: { reporter: { select: { name: true } } } }),
    prisma.report.count({ where }),
  ]);

  const reports: AdminReport[] = raw.map(r => ({
    id: r.id, reporterId: r.reporterId, reporterName: r.reporter.name,
    targetKind: r.targetKind, targetId: r.targetId, reason: r.reason,
    status: r.status, priority: r.priority, routedTo: r.routedTo, createdAt: r.createdAt,
  }));

  return { reports, total, pages: Math.ceil(total / pageSize) };
}

// ─────────────────────────────────────────────────────────────────────────────
// SOCIETIES
// ─────────────────────────────────────────────────────────────────────────────

export async function getSocieties({
  page = 1, pageSize = 50, search = "", status = "",
}: { page?: number; pageSize?: number; search?: string; status?: string }) {
  if (E2E) {
    let list = [...FIXTURE_SOCIETIES];
    if (status) list = list.filter(s => s.status === status);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s => s.name.toLowerCase().includes(q) || s.pinCode.includes(q) || s.city.toLowerCase().includes(q));
    }
    const start = (page - 1) * pageSize;
    return { societies: list.slice(start, start + pageSize), total: list.length, pages: Math.max(1, Math.ceil(list.length / pageSize)) };
  }

  const where: Prisma.SocietyWhereInput = {
    ...(status ? { status: status as Prisma.EnumSocietyStatusFilter } : {}),
    ...(search ? { OR: [{ name: { contains: search, mode: "insensitive" as const } }, { pinCode: { contains: search } }, { city: { contains: search, mode: "insensitive" as const } }] } : {}),
  };

  const [societies, total] = await Promise.all([
    prisma.society.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize,
      select: { id: true, name: true, address: true, pinCode: true, city: true, state: true, status: true, memberCount: true, createdAt: true } }),
    prisma.society.count({ where }),
  ]);

  return { societies, total, pages: Math.ceil(total / pageSize) };
}

// ─────────────────────────────────────────────────────────────────────────────
// MERCHANTS
// ─────────────────────────────────────────────────────────────────────────────

export async function getMerchants({
  page = 1, pageSize = 50, search = "", status = "",
}: { page?: number; pageSize?: number; search?: string; status?: string }) {
  if (E2E) {
    let list = [...FIXTURE_MERCHANTS];
    if (status) list = list.filter(m => m.status === status);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(m => m.name.toLowerCase().includes(q) || m.city.toLowerCase().includes(q) || m.pinCode.includes(q));
    }
    const start = (page - 1) * pageSize;
    return { merchants: list.slice(start, start + pageSize), total: list.length, pages: Math.max(1, Math.ceil(list.length / pageSize)) };
  }

  const where: Prisma.MerchantWhereInput = {
    ...(status ? { status: status as Prisma.EnumMerchantStatusFilter } : {}),
    ...(search ? { OR: [{ name: { contains: search, mode: "insensitive" as const } }, { city: { contains: search, mode: "insensitive" as const } }, { pinCode: { contains: search } }] } : {}),
  };

  const [raw, total] = await Promise.all([
    prisma.merchant.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize,
      include: { owner: { select: { name: true } } } }),
    prisma.merchant.count({ where }),
  ]);

  const merchants: AdminMerchant[] = raw.map(m => ({
    id: m.id, ownerId: m.ownerId, ownerName: m.owner.name,
    name: m.name, category: m.category, city: m.city, pinCode: m.pinCode,
    status: m.status, isEndorsed: m.isEndorsed, isBlacklisted: m.isBlacklisted, createdAt: m.createdAt,
  }));

  return { merchants, total, pages: Math.ceil(total / pageSize) };
}

// ─────────────────────────────────────────────────────────────────────────────
// BROADCASTS
// ─────────────────────────────────────────────────────────────────────────────

export async function getBroadcasts({
  page = 1, pageSize = 50, status = "",
}: { page?: number; pageSize?: number; status?: string }) {
  if (E2E) {
    let list = [...FIXTURE_BROADCASTS];
    if (status) list = list.filter(b => b.status === status);
    const start = (page - 1) * pageSize;
    return { broadcasts: list.slice(start, start + pageSize), total: list.length, pages: Math.max(1, Math.ceil(list.length / pageSize)) };
  }

  const where: Prisma.BroadcastWhereInput = status ? { status: status as Prisma.EnumBroadcastStatusFilter } : {};

  const [broadcasts, total] = await Promise.all([
    prisma.broadcast.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
    prisma.broadcast.count({ where }),
  ]);

  return { broadcasts, total, pages: Math.ceil(total / pageSize) };
}

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE FLAGS
// ─────────────────────────────────────────────────────────────────────────────

export async function getFeatureFlags() {
  if (E2E) return { flags: FIXTURE_FLAGS };

  const flags = await prisma.featureFlag.findMany({ orderBy: [{ key: "asc" }, { scope: "asc" }] });
  return { flags: flags.map(f => ({ ...f, description: f.description ?? null })) };
}

// ─────────────────────────────────────────────────────────────────────────────
// AUDIT LOG
// ─────────────────────────────────────────────────────────────────────────────

export async function getAuditLogs({
  page = 1, pageSize = 50, action = "",
}: { page?: number; pageSize?: number; action?: string }) {
  if (E2E) {
    let list = [...FIXTURE_AUDIT];
    if (action) list = list.filter(a => a.action.includes(action));
    const start = (page - 1) * pageSize;
    return { logs: list.slice(start, start + pageSize), total: list.length, pages: Math.max(1, Math.ceil(list.length / pageSize)) };
  }

  const where: Prisma.AuditLogWhereInput = action ? { action: { contains: action, mode: "insensitive" as const } } : {};

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
    prisma.auditLog.count({ where }),
  ]);

  return { logs, total, pages: Math.ceil(total / pageSize) };
}

// ─────────────────────────────────────────────────────────────────────────────
// CLASSIFIEDS
// ─────────────────────────────────────────────────────────────────────────────

export type AdminClassified = {
  id: string; title: string; category: string; price: number | null;
  status: string; sellerName: string; sellerId: string;
  pinCode: string; city: string; createdAt: Date;
};

const FIXTURE_CLASSIFIEDS: AdminClassified[] = [
  { id: "cl1", title: "Used sofa for sale", category: "furniture", price: 3500, status: "active",  sellerName: "Priya Sharma",  sellerId: "u1", pinCode: "560001", city: "Bengaluru", createdAt: days(2)  },
  { id: "cl2", title: "iPhone 14 128GB",    category: "electronics", price: 52000, status: "active", sellerName: "Vikram Singh", sellerId: "u6", pinCode: "400053", city: "Mumbai",    createdAt: days(1)  },
  { id: "cl3", title: "Maid wanted",        category: "services",  price: null,  status: "flagged", sellerName: "Amit Kumar",    sellerId: "u4", pinCode: "560034", city: "Bengaluru", createdAt: days(0)  },
  { id: "cl4", title: "Baby stroller",      category: "kids",      price: 1200, status: "expired",  sellerName: "Deepa Nair",   sellerId: "u5", pinCode: "500033", city: "Hyderabad", createdAt: days(10) },
];

export async function getClassifieds({
  page = 1, pageSize = 50, search = "", status = "", category = "",
}: { page?: number; pageSize?: number; search?: string; status?: string; category?: string }) {
  if (E2E) {
    let list = [...FIXTURE_CLASSIFIEDS];
    if (status)   list = list.filter(c => c.status === status);
    if (category) list = list.filter(c => c.category === category);
    if (search)   { const q = search.toLowerCase(); list = list.filter(c => c.title.toLowerCase().includes(q) || c.sellerName.toLowerCase().includes(q)); }
    const start = (page - 1) * pageSize;
    return { classifieds: list.slice(start, start + pageSize), total: list.length, pages: Math.max(1, Math.ceil(list.length / pageSize)) };
  }
  const where: Prisma.ClassifiedWhereInput = {
    ...(status   ? { status: status as never } : {}),
    ...(category ? { category } : {}),
    ...(search   ? { OR: [{ title: { contains: search, mode: "insensitive" as const } }, { seller: { name: { contains: search, mode: "insensitive" as const } } }] } : {}),
  };
  const [raw, total] = await Promise.all([
    prisma.classified.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page-1)*pageSize, take: pageSize,
      include: { seller: { select: { id: true, name: true } } } }),
    prisma.classified.count({ where }),
  ]);
  const classifieds: AdminClassified[] = raw.map(c => ({
    id: c.id, title: c.title, category: c.category, price: c.pricePaise,
    status: c.status, sellerName: c.seller.name, sellerId: c.seller.id,
    pinCode: c.pinCode ?? "", city: c.pinCode ?? "", createdAt: c.createdAt,
  }));
  return { classifieds, total, pages: Math.ceil(total / pageSize) };
}

// ─────────────────────────────────────────────────────────────────────────────
// WALLET / TRANSACTIONS
// ─────────────────────────────────────────────────────────────────────────────

export type AdminWalletEntry = {
  id: string; userId: string; userName: string; type: string;
  amountPaise: number; description: string; status: string;
  reference: string | null; createdAt: Date;
};

const FIXTURE_WALLET: AdminWalletEntry[] = [
  { id: "w1", userId: "u1", userName: "Priya Sharma",  type: "topup",  amountPaise: 50000, description: "Wallet top-up via UPI",      status: "completed", reference: "UPI123", createdAt: days(5)  },
  { id: "w2", userId: "u1", userName: "Priya Sharma",  type: "spend",  amountPaise: -20000, description: "Order #ord1",               status: "completed", reference: "ord1",   createdAt: days(4)  },
  { id: "w3", userId: "u6", userName: "Vikram Singh",  type: "earn",   amountPaise: 20000, description: "Order #ord1 completed",      status: "completed", reference: "ord1",   createdAt: days(3)  },
  { id: "w4", userId: "u2", userName: "Rahul Mehta",   type: "payout", amountPaise: -15000, description: "Bank payout request",       status: "pending",   reference: null,     createdAt: days(1)  },
  { id: "w5", userId: "u4", userName: "Amit Kumar",    type: "hold",   amountPaise: 10000, description: "Escrow hold for order #ord2",status: "held",      reference: "ord2",   createdAt: days(0)  },
];

export async function getWalletEntries({
  page = 1, pageSize = 50, type = "", status = "", search = "",
}: { page?: number; pageSize?: number; type?: string; status?: string; search?: string }) {
  if (E2E) {
    let list = [...FIXTURE_WALLET];
    if (type)   list = list.filter(w => w.type === type);
    if (status) list = list.filter(w => w.status === status);
    if (search) { const q = search.toLowerCase(); list = list.filter(w => w.userName.toLowerCase().includes(q) || (w.reference ?? "").toLowerCase().includes(q)); }
    const start = (page - 1) * pageSize;
    return { entries: list.slice(start, start + pageSize), total: list.length, pages: Math.max(1, Math.ceil(list.length / pageSize)) };
  }
  const where: Prisma.WalletEntryWhereInput = {
    ...(type   ? { type: type as never } : {}),
    ...(status ? { status: status as never } : {}),
    ...(search ? { OR: [{ user: { name: { contains: search, mode: "insensitive" as const } } }, { reference: { contains: search } }] } : {}),
  };
  const [raw, total] = await Promise.all([
    prisma.walletEntry.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page-1)*pageSize, take: pageSize,
      include: { user: { select: { id: true, name: true } } } }),
    prisma.walletEntry.count({ where }),
  ]);
  const entries: AdminWalletEntry[] = raw.map(e => ({
    id: e.id, userId: e.user.id, userName: e.user.name, type: e.type,
    amountPaise: e.amountPaise, description: e.description, status: e.status,
    reference: e.reference ?? null, createdAt: e.createdAt,
  }));
  return { entries, total, pages: Math.ceil(total / pageSize) };
}

// ─────────────────────────────────────────────────────────────────────────────
// RATINGS
// ─────────────────────────────────────────────────────────────────────────────

export type AdminRating = {
  id: string; orderId: string; score: number; review: string | null;
  reviewerName: string; subjectName: string; isFlagged: boolean; createdAt: Date;
};

const FIXTURE_RATINGS: AdminRating[] = [
  { id: "rat1", orderId: "ord1", score: 5, review: "Excellent cook, very punctual!", reviewerName: "Priya Sharma", subjectName: "Vikram Singh", isFlagged: false, createdAt: days(3) },
  { id: "rat2", orderId: "ord2", score: 1, review: "Fake listing, scammer!!!",       reviewerName: "Amit Kumar",   subjectName: "Rahul Mehta",  isFlagged: true,  createdAt: days(1) },
  { id: "rat3", orderId: "ord3", score: 4, review: "Good tutor, a bit late.",         reviewerName: "Deepa Nair",   subjectName: "Priya Sharma", isFlagged: false, createdAt: days(2) },
];

export async function getRatings({
  page = 1, pageSize = 50, flagged = false, search = "",
}: { page?: number; pageSize?: number; flagged?: boolean; search?: string }) {
  if (E2E) {
    let list = [...FIXTURE_RATINGS];
    if (flagged) list = list.filter(r => r.isFlagged);
    if (search) { const q = search.toLowerCase(); list = list.filter(r => r.reviewerName.toLowerCase().includes(q) || r.subjectName.toLowerCase().includes(q) || (r.review ?? "").toLowerCase().includes(q)); }
    const start = (page - 1) * pageSize;
    return { ratings: list.slice(start, start + pageSize), total: list.length, pages: Math.max(1, Math.ceil(list.length / pageSize)) };
  }
  const where: Prisma.RatingWhereInput = {
    ...(search  ? { OR: [{ rater: { name: { contains: search, mode: "insensitive" as const } } }, { ratee: { name: { contains: search, mode: "insensitive" as const } } }] } : {}),
  };
  const [raw, total] = await Promise.all([
    prisma.rating.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page-1)*pageSize, take: pageSize,
      include: { rater: { select: { name: true } }, ratee: { select: { name: true } } } }),
    prisma.rating.count({ where }),
  ]);
  const ratings: AdminRating[] = raw.map(r => ({
    id: r.id, orderId: r.orderId, score: r.score, review: r.review ?? null,
    reviewerName: r.rater.name ?? "Unknown", subjectName: r.ratee.name ?? "Unknown",
    isFlagged: false, createdAt: r.createdAt,
  }));
  return { ratings, total, pages: Math.ceil(total / pageSize) };
}

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE LISTINGS
// ─────────────────────────────────────────────────────────────────────────────

export type AdminServiceListing = {
  id: string; title: string; category: string; pricePaise: number;
  isActive: boolean; providerName: string; providerId: string;
  pinCode: string; city: string; createdAt: Date;
};

const FIXTURE_SERVICE_LISTINGS: AdminServiceListing[] = [
  { id: "sl1", title: "Home Cook — North Indian", category: "cook",      pricePaise: 80000,  isActive: true,  providerName: "Vikram Singh",  providerId: "u6", pinCode: "400053", city: "Mumbai",    createdAt: days(15) },
  { id: "sl2", title: "Maths Tutor Grades 8-10",  category: "tutor",     pricePaise: 50000,  isActive: true,  providerName: "Priya Sharma",  providerId: "u1", pinCode: "560001", city: "Bengaluru", createdAt: days(10) },
  { id: "sl3", title: "Bike Rider for deliveries", category: "rider",    pricePaise: 20000,  isActive: false, providerName: "Amit Kumar",    providerId: "u4", pinCode: "560034", city: "Bengaluru", createdAt: days(8)  },
  { id: "sl4", title: "Plumbing & Electrical",     category: "handyman", pricePaise: 60000,  isActive: true,  providerName: "Rahul Mehta",   providerId: "u2", pinCode: "400053", city: "Mumbai",    createdAt: days(5)  },
];

export async function getServiceListings({
  page = 1, pageSize = 50, search = "", category = "", isActive,
}: { page?: number; pageSize?: number; search?: string; category?: string; isActive?: boolean }) {
  if (E2E) {
    let list = [...FIXTURE_SERVICE_LISTINGS];
    if (category)          list = list.filter(s => s.category === category);
    if (isActive !== undefined) list = list.filter(s => s.isActive === isActive);
    if (search) { const q = search.toLowerCase(); list = list.filter(s => s.title.toLowerCase().includes(q) || s.providerName.toLowerCase().includes(q)); }
    const start = (page - 1) * pageSize;
    return { listings: list.slice(start, start + pageSize), total: list.length, pages: Math.max(1, Math.ceil(list.length / pageSize)) };
  }
  const where: Prisma.ServiceListingWhereInput = {
    ...(category          ? { category: category as never } : {}),
    ...(isActive !== undefined ? { isActive } : {}),
    ...(search            ? { OR: [{ title: { contains: search, mode: "insensitive" as const } }, { user: { name: { contains: search, mode: "insensitive" as const } } }] } : {}),
  };
  const [raw, total] = await Promise.all([
    prisma.serviceListing.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page-1)*pageSize, take: pageSize,
      include: { user: { select: { id: true, name: true } } } }),
    prisma.serviceListing.count({ where }),
  ]);
  const listings: AdminServiceListing[] = raw.map(l => ({
    id: l.id, title: l.title, category: l.category, pricePaise: l.pricePaise,
    isActive: l.isActive, providerName: l.user.name ?? "Unknown", providerId: l.user.id,
    pinCode: l.pinCode ?? "", city: l.pinCode ?? "", createdAt: l.createdAt,
  }));
  return { listings, total, pages: Math.ceil(total / pageSize) };
}

// ─────────────────────────────────────────────────────────────────────────────
// VOUCHES
// ─────────────────────────────────────────────────────────────────────────────

export type AdminVouch = {
  id: string; voucherName: string; voucherId: string;
  subjectName: string; subjectId: string; note: string | null;
  isRevoked: boolean; createdAt: Date;
};

const FIXTURE_VOUCHES: AdminVouch[] = [
  { id: "v1", voucherId: "u3", voucherName: "Sunita Patel",  subjectId: "u1", subjectName: "Priya Sharma",  note: "Long-time neighbour", isRevoked: false, createdAt: days(20) },
  { id: "v2", voucherId: "u1", voucherName: "Priya Sharma",  subjectId: "u6", subjectName: "Vikram Singh",  note: null,                  isRevoked: false, createdAt: days(15) },
  { id: "v3", voucherId: "u4", voucherName: "Amit Kumar",    subjectId: "u2", subjectName: "Rahul Mehta",   note: "Business partner",    isRevoked: true,  createdAt: days(5)  },
];

export async function getVouches({
  page = 1, pageSize = 50, search = "", revoked,
}: { page?: number; pageSize?: number; search?: string; revoked?: boolean }) {
  if (E2E) {
    let list = [...FIXTURE_VOUCHES];
    if (revoked !== undefined) list = list.filter(v => v.isRevoked === revoked);
    if (search) { const q = search.toLowerCase(); list = list.filter(v => v.voucherName.toLowerCase().includes(q) || v.subjectName.toLowerCase().includes(q)); }
    const start = (page - 1) * pageSize;
    return { vouches: list.slice(start, start + pageSize), total: list.length, pages: Math.max(1, Math.ceil(list.length / pageSize)) };
  }
  const where: Prisma.VouchWhereInput = {
    ...(search ? { OR: [{ voucher: { name: { contains: search, mode: "insensitive" as const } } }, { vouchee: { name: { contains: search, mode: "insensitive" as const } } }] } : {}),
  };
  const [raw, total] = await Promise.all([
    prisma.vouch.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page-1)*pageSize, take: pageSize,
      include: { voucher: { select: { id: true, name: true } }, vouchee: { select: { id: true, name: true } } } }),
    prisma.vouch.count({ where }),
  ]);
  const vouches: AdminVouch[] = raw.map(v => ({
    id: v.id, voucherId: v.voucher.id, voucherName: v.voucher.name ?? "Unknown",
    subjectId: v.vouchee.id, subjectName: v.vouchee.name ?? "Unknown",
    note: null, isRevoked: false, createdAt: v.createdAt,
  }));
  return { vouches, total, pages: Math.ceil(total / pageSize) };
}

// ─────────────────────────────────────────────────────────────────────────────
// SOCIETY HEALTH
// ─────────────────────────────────────────────────────────────────────────────

export type SocietyHealth = AdminSociety & {
  orderCount: number; gmvPaise: number; activeUsers: number; openFlags: number;
};

export async function getSocietyHealth(): Promise<SocietyHealth[]> {
  if (E2E) {
    return FIXTURE_SOCIETIES.filter(s => s.status === "approved").map(s => ({
      ...s,
      orderCount: Math.floor(Math.random() * 20),
      gmvPaise:   Math.floor(Math.random() * 500000),
      activeUsers: Math.floor(s.memberCount * 0.6),
      openFlags:  Math.floor(Math.random() * 3),
    }));
  }
  const societies = await prisma.society.findMany({ where: { status: "approved" } });
  return societies.map(s => ({
    id: s.id, name: s.name, address: s.address ?? "", pinCode: s.pinCode,
    city: s.city, state: s.state, status: s.status,
    memberCount: s.memberCount, createdAt: s.createdAt,
    orderCount: 0, gmvPaise: 0, activeUsers: 0, openFlags: 0,
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// USER ACTIVITY (unified view)
// ─────────────────────────────────────────────────────────────────────────────

export type UserActivity = {
  orders: { id: string; status: string; pricePaise: number; createdAt: Date }[];
  walletEntries: { id: string; type: string; amountPaise: number; description: string; createdAt: Date }[];
  posts: { id: string; body: string; createdAt: Date }[];
  kycDocs: { id: string; docType: string; status: string; createdAt: Date }[];
  roles: { role: string; isActive: boolean; earningsPaise: number; completedOrders: number; rating: number }[];
};

export async function getUserActivity(userId: string): Promise<UserActivity> {
  if (E2E) return { orders: [], walletEntries: [], posts: [], kycDocs: [], roles: [] };
  const [orders, walletEntries, posts, kycDocs] = await Promise.all([
    prisma.order.findMany({ where: { OR: [{ buyerId: userId }, { sellerId: userId }] }, orderBy: { createdAt: "desc" }, take: 20,
      select: { id: true, status: true, pricePaise: true, createdAt: true } }),
    prisma.walletEntry.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 20,
      select: { id: true, type: true, amountPaise: true, description: true, createdAt: true } }),
    prisma.post.findMany({ where: { authorId: userId }, orderBy: { createdAt: "desc" }, take: 10,
      select: { id: true, body: true, createdAt: true } }),
    prisma.kycDocument.findMany({ where: { userId }, orderBy: { createdAt: "desc" },
      select: { id: true, type: true, status: true, createdAt: true } }),
  ]);
  return { orders, walletEntries, posts, kycDocs: kycDocs.map(k => ({ id: k.id, docType: k.type, status: k.status, createdAt: k.createdAt })), roles: [] };
}

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL SEARCH
// ─────────────────────────────────────────────────────────────────────────────

export type SearchResult = { kind: string; id: string; label: string; sub: string; href: string };

export async function globalAdminSearch(q: string): Promise<SearchResult[]> {
  if (!q || q.length < 2) return [];
  if (E2E) {
    const results: SearchResult[] = [];
    const lq = q.toLowerCase();
    FIXTURE_USERS.filter(u => u.name.toLowerCase().includes(lq) || u.phone?.includes(lq))
      .forEach(u => results.push({ kind: "User", id: u.id, label: u.name, sub: u.phone ?? "", href: `/admin/users?search=${encodeURIComponent(u.name)}` }));
    FIXTURE_SOCIETIES.filter(s => s.name.toLowerCase().includes(lq) || s.pinCode.includes(lq))
      .forEach(s => results.push({ kind: "Society", id: s.id, label: s.name, sub: s.city, href: `/admin/societies?search=${encodeURIComponent(s.name)}` }));
    FIXTURE_MERCHANTS.filter(m => m.name.toLowerCase().includes(lq))
      .forEach(m => results.push({ kind: "Merchant", id: m.id, label: m.name, sub: m.city, href: `/admin/merchants?search=${encodeURIComponent(m.name)}` }));
    return results.slice(0, 8);
  }
  const [users, societies, merchants] = await Promise.all([
    prisma.user.findMany({ where: { OR: [{ name: { contains: q, mode: "insensitive" } }, { phone: { contains: q } }] }, take: 4,
      select: { id: true, name: true, phone: true } }),
    prisma.society.findMany({ where: { OR: [{ name: { contains: q, mode: "insensitive" } }, { pinCode: { contains: q } }] }, take: 3,
      select: { id: true, name: true, city: true } }),
    prisma.merchant.findMany({ where: { name: { contains: q, mode: "insensitive" } }, take: 3,
      select: { id: true, name: true, city: true } }),
  ]);
  return [
    ...users.map(u => ({ kind: "User", id: u.id, label: u.name, sub: u.phone ?? "", href: `/admin/users?search=${encodeURIComponent(u.name)}` })),
    ...societies.map(s => ({ kind: "Society", id: s.id, label: s.name, sub: s.city, href: `/admin/societies?search=${encodeURIComponent(s.name)}` })),
    ...merchants.map(m => ({ kind: "Merchant", id: m.id, label: m.name, sub: m.city, href: `/admin/merchants?search=${encodeURIComponent(m.name)}` })),
  ].slice(0, 8);
}

// ─────────────────────────────────────────────────────────────────────────────
// APPOINTMENTS
// ─────────────────────────────────────────────────────────────────────────────

export type AdminAppointment = {
  id: string; status: string; serviceLabel: string; scheduledAt: Date; createdAt: Date;
  user: { id: string; name: string; phone: string | null };
  merchant: { id: string; name: string };
};

export async function getAppointments({
  page = 1, pageSize = 50, search = "", status = "",
}: { page?: number; pageSize?: number; search?: string; status?: string }) {
  if (E2E) {
    const stub: AdminAppointment[] = [
      { id: "apt1", status: "confirmed", serviceLabel: "Haircut", scheduledAt: new Date(), createdAt: new Date(), user: { id: "u1", name: "Priya Sharma", phone: "+91-9000000001" }, merchant: { id: "m1", name: "City Salon" } },
      { id: "apt2", status: "pending",   serviceLabel: "Plumbing repair", scheduledAt: new Date(), createdAt: new Date(), user: { id: "u2", name: "Ravi Kumar",  phone: "+91-9000000002" }, merchant: { id: "m2", name: "Quick Fix" } },
      { id: "apt3", status: "completed", serviceLabel: "Math tuition",    scheduledAt: new Date(), createdAt: new Date(), user: { id: "u3", name: "Anita Nair",  phone: "+91-9000000003" }, merchant: { id: "m3", name: "StudyPro" } },
    ];
    const filtered = status ? stub.filter(a => a.status === status) : stub;
    const q = search.toLowerCase();
    const result = q ? filtered.filter(a => a.user.name.toLowerCase().includes(q) || a.merchant.name.toLowerCase().includes(q)) : filtered;
    return { appointments: result.slice((page - 1) * pageSize, page * pageSize), total: result.length, pages: Math.ceil(result.length / pageSize) };
  }
  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (search) where.OR = [
    { user: { name: { contains: search, mode: "insensitive" } } },
    { merchant: { name: { contains: search, mode: "insensitive" } } },
    { serviceLabel: { contains: search, mode: "insensitive" } },
  ];
  const [total, appointments] = await Promise.all([
    prisma.appointment.count({ where }),
    prisma.appointment.findMany({
      where, orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize, take: pageSize,
      select: {
        id: true, status: true, serviceLabel: true, scheduledAt: true, createdAt: true,
        user: { select: { id: true, name: true, phone: true } },
        merchant: { select: { id: true, name: true } },
      },
    }),
  ]);
  return { appointments, total, pages: Math.ceil(total / pageSize) };
}

// ─────────────────────────────────────────────────────────────────────────────
// QUOTE REQUESTS
// ─────────────────────────────────────────────────────────────────────────────

export type AdminQuote = {
  id: string; status: string; serviceDescription: string; budgetPaise: number | null;
  quotedPaise: number | null; createdAt: Date;
  user: { id: string; name: string; phone: string | null };
  merchant: { id: string; name: string };
};

export async function getQuotes({
  page = 1, pageSize = 50, search = "", status = "",
}: { page?: number; pageSize?: number; search?: string; status?: string }) {
  if (E2E) {
    const stub: AdminQuote[] = [
      { id: "q1", status: "pending",  serviceDescription: "Deep cleaning",    budgetPaise: 200000, quotedPaise: null,   createdAt: new Date(), user: { id: "u1", name: "Priya Sharma", phone: "+91-9000000001" }, merchant: { id: "m1", name: "CleanPro" } },
      { id: "q2", status: "quoted",   serviceDescription: "Interior painting", budgetPaise: 500000, quotedPaise: 480000, createdAt: new Date(), user: { id: "u2", name: "Ravi Kumar",  phone: "+91-9000000002" }, merchant: { id: "m4", name: "PaintMaster" } },
      { id: "q3", status: "accepted", serviceDescription: "Pest control",      budgetPaise: 100000, quotedPaise: 95000,  createdAt: new Date(), user: { id: "u3", name: "Anita Nair",  phone: "+91-9000000003" }, merchant: { id: "m5", name: "BugBuster" } },
    ];
    const filtered = status ? stub.filter(q => q.status === status) : stub;
    const sq = search.toLowerCase();
    const result = sq ? filtered.filter(q => q.user.name.toLowerCase().includes(sq) || q.merchant.name.toLowerCase().includes(sq)) : filtered;
    return { quotes: result.slice((page - 1) * pageSize, page * pageSize), total: result.length, pages: Math.ceil(result.length / pageSize) };
  }
  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (search) where.OR = [
    { user: { name: { contains: search, mode: "insensitive" } } },
    { merchant: { name: { contains: search, mode: "insensitive" } } },
    { serviceDescription: { contains: search, mode: "insensitive" } },
  ];
  const [total, quotes] = await Promise.all([
    prisma.quoteRequest.count({ where }),
    prisma.quoteRequest.findMany({
      where, orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize, take: pageSize,
      select: {
        id: true, status: true, serviceDescription: true, budgetPaise: true,
        quotedPaise: true, createdAt: true,
        user: { select: { id: true, name: true, phone: true } },
        merchant: { select: { id: true, name: true } },
      },
    }),
  ]);
  return { quotes, total, pages: Math.ceil(total / pageSize) };
}

// ─────────────────────────────────────────────────────────────────────────────
// SOS INCIDENTS (admin view)
// ─────────────────────────────────────────────────────────────────────────────

export type AdminSosIncident = {
  id: string; category: string; severity: string; body: string; status: string;
  pinCode: string; createdAt: Date;
  author: { id: string; name: string };
  _count: { responders: number };
};

export async function getSosIncidents({
  page = 1, pageSize = 50, search = "", status = "",
}: { page?: number; pageSize?: number; search?: string; status?: string }) {
  if (E2E) {
    const stub: AdminSosIncident[] = [
      { id: "sos1", category: "medical",   severity: "high",   body: "Elderly person collapsed", status: "active",   pinCode: "400001", createdAt: new Date(), author: { id: "u1", name: "Priya Sharma" }, _count: { responders: 2 } },
      { id: "sos2", category: "fire",      severity: "critical", body: "Smoke from 3rd floor flat", status: "resolved", pinCode: "400001", createdAt: new Date(), author: { id: "u2", name: "Ravi Kumar" },  _count: { responders: 5 } },
      { id: "sos3", category: "security",  severity: "medium", body: "Unknown person in premises", status: "active",   pinCode: "400002", createdAt: new Date(), author: { id: "u3", name: "Anita Nair" },  _count: { responders: 1 } },
    ];
    const filtered = status ? stub.filter(s => s.status === status) : stub;
    const sq = search.toLowerCase();
    const result = sq ? filtered.filter(s => s.body.toLowerCase().includes(sq) || s.pinCode.includes(sq)) : filtered;
    return { incidents: result.slice((page - 1) * pageSize, page * pageSize), total: result.length, pages: Math.ceil(result.length / pageSize) };
  }
  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (search) where.OR = [
    { body: { contains: search, mode: "insensitive" } },
    { pinCode: { contains: search } },
    { category: { contains: search, mode: "insensitive" } },
  ];
  const [total, incidents] = await Promise.all([
    prisma.sosIncident.count({ where }),
    prisma.sosIncident.findMany({
      where, orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize, take: pageSize,
      select: {
        id: true, category: true, severity: true, body: true, status: true,
        pinCode: true, createdAt: true,
        author: { select: { id: true, name: true } },
        _count: { select: { responders: true } },
      },
    }),
  ]);
  return { incidents, total, pages: Math.ceil(total / pageSize) };
}

// ─────────────────────────────────────────────────────────────────────────────
// SAFETY CONTACTS (admin view)
// ─────────────────────────────────────────────────────────────────────────────

export type AdminSafetyContact = {
  id: string; name: string; phone: string; relation: string | null; createdAt: Date;
  user: { id: string; name: string; phone: string | null };
};

export async function getSafetyContacts({
  page = 1, pageSize = 50, search = "",
}: { page?: number; pageSize?: number; search?: string }) {
  if (E2E) {
    const stub: AdminSafetyContact[] = [
      { id: "sc1", name: "Meera Shah",  phone: "+919000000010", relation: "spouse",  createdAt: new Date(), user: { id: "u1", name: "Priya Sharma", phone: "+919000000001" } },
      { id: "sc2", name: "Rohan Gupta", phone: "+919000000011", relation: "parent",  createdAt: new Date(), user: { id: "u2", name: "Ravi Kumar",  phone: "+919000000002" } },
    ];
    const sq = search.toLowerCase();
    const result = sq ? stub.filter(c => c.name.toLowerCase().includes(sq) || c.user.name.toLowerCase().includes(sq)) : stub;
    return { contacts: result.slice((page - 1) * pageSize, page * pageSize), total: result.length, pages: Math.ceil(result.length / pageSize) };
  }
  const where: Prisma.SafetyContactWhereInput = search
    ? { OR: [{ name: { contains: search, mode: "insensitive" } }, { user: { name: { contains: search, mode: "insensitive" } } }, { phone: { contains: search } }] }
    : {};
  const [total, contacts] = await Promise.all([
    prisma.safetyContact.count({ where }),
    prisma.safetyContact.findMany({
      where, orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize, take: pageSize,
      select: { id: true, name: true, phone: true, relation: true, createdAt: true, user: { select: { id: true, name: true, phone: true } } },
    }),
  ]);
  return { contacts, total, pages: Math.ceil(total / pageSize) };
}

// ─────────────────────────────────────────────────────────────────────────────
// SAFETY JOURNEYS (admin view)
// ─────────────────────────────────────────────────────────────────────────────

export type AdminSafetyJourney = {
  id: string; destination: string; status: string; expectedArrival: Date;
  lastCheckInAt: Date | null; checkInIntervalMin: number; createdAt: Date;
  user: { id: string; name: string; phone: string | null };
};

export async function getSafetyJourneys({
  page = 1, pageSize = 50, search = "", status = "",
}: { page?: number; pageSize?: number; search?: string; status?: string }) {
  if (E2E) {
    const stub: AdminSafetyJourney[] = [
      { id: "sj1", destination: "Bandra West", status: "active",    expectedArrival: new Date(Date.now() + 3_600_000), lastCheckInAt: new Date(), checkInIntervalMin: 30, createdAt: new Date(), user: { id: "u1", name: "Priya Sharma", phone: "+919000000001" } },
      { id: "sj2", destination: "Andheri East", status: "completed", expectedArrival: new Date(Date.now() - 3_600_000), lastCheckInAt: new Date(), checkInIntervalMin: 15, createdAt: new Date(), user: { id: "u2", name: "Ravi Kumar",  phone: "+919000000002" } },
      { id: "sj3", destination: "Dadar",        status: "overdue",   expectedArrival: new Date(Date.now() - 7_200_000), lastCheckInAt: null,        checkInIntervalMin: 30, createdAt: new Date(), user: { id: "u3", name: "Anita Nair",  phone: "+919000000003" } },
    ];
    const filtered = status ? stub.filter(j => j.status === status) : stub;
    const sq = search.toLowerCase();
    const result = sq ? filtered.filter(j => j.destination.toLowerCase().includes(sq) || j.user.name.toLowerCase().includes(sq)) : filtered;
    return { journeys: result.slice((page - 1) * pageSize, page * pageSize), total: result.length, pages: Math.ceil(result.length / pageSize) };
  }
  const where: Prisma.SafetyJourneyWhereInput = {};
  if (status) where.status = status as "active" | "completed" | "overdue";
  if (search) where.OR = [
    { destination: { contains: search, mode: "insensitive" } },
    { user: { name: { contains: search, mode: "insensitive" } } },
  ];
  const [total, journeys] = await Promise.all([
    prisma.safetyJourney.count({ where }),
    prisma.safetyJourney.findMany({
      where, orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize, take: pageSize,
      select: { id: true, destination: true, status: true, expectedArrival: true, lastCheckInAt: true, checkInIntervalMin: true, createdAt: true, user: { select: { id: true, name: true, phone: true } } },
    }),
  ]);
  return { journeys, total, pages: Math.ceil(total / pageSize) };
}

// ─────────────────────────────────────────────────────────────────────────────
// VOLUNTEERS (admin view)
// ─────────────────────────────────────────────────────────────────────────────

export type AdminVolunteer = {
  id: string; skills: string[]; pinCode: string; active: boolean; updatedAt: Date;
  user: { id: string; name: string; phone: string | null };
};

export async function getVolunteers({
  page = 1, pageSize = 50, search = "", active = "",
}: { page?: number; pageSize?: number; search?: string; active?: string }) {
  if (E2E) {
    const stub: AdminVolunteer[] = [
      { id: "v1", skills: ["first-aid", "cpr"], pinCode: "400001", active: true,  updatedAt: new Date(), user: { id: "u1", name: "Priya Sharma", phone: "+919000000001" } },
      { id: "v2", skills: ["driving"],          pinCode: "400002", active: false, updatedAt: new Date(), user: { id: "u2", name: "Ravi Kumar",  phone: "+919000000002" } },
    ];
    const isActive = active === "1" ? true : active === "0" ? false : undefined;
    const filtered = isActive !== undefined ? stub.filter(v => v.active === isActive) : stub;
    const sq = search.toLowerCase();
    const result = sq ? filtered.filter(v => v.user.name.toLowerCase().includes(sq) || v.pinCode.includes(sq) || v.skills.some(s => s.includes(sq))) : filtered;
    return { volunteers: result.slice((page - 1) * pageSize, page * pageSize), total: result.length, pages: Math.ceil(result.length / pageSize) };
  }
  const where: Prisma.VolunteerWhereInput = {};
  if (active === "1") where.active = true;
  if (active === "0") where.active = false;
  if (search) where.OR = [
    { user: { name: { contains: search, mode: "insensitive" } } },
    { pinCode: { contains: search } },
  ];
  const [total, volunteers] = await Promise.all([
    prisma.volunteer.count({ where }),
    prisma.volunteer.findMany({
      where, orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize, take: pageSize,
      select: { id: true, skills: true, pinCode: true, active: true, updatedAt: true, user: { select: { id: true, name: true, phone: true } } },
    }),
  ]);
  return { volunteers, total, pages: Math.ceil(total / pageSize) };
}

// ─────────────────────────────────────────────────────────────────────────────
// MEDICAL PROFILES (admin view)
// ─────────────────────────────────────────────────────────────────────────────

export type AdminMedicalProfile = {
  id: string; bloodGroup: string | null; allergies: string[]; conditions: string[];
  medications: string[]; doctorPhone: string | null; updatedAt: Date;
  user: { id: string; name: string; phone: string | null };
};

export async function getMedicalProfiles({
  page = 1, pageSize = 50, search = "",
}: { page?: number; pageSize?: number; search?: string }) {
  if (E2E) {
    const stub: AdminMedicalProfile[] = [
      { id: "mp1", bloodGroup: "O+", allergies: ["penicillin"], conditions: ["hypertension"], medications: ["amlodipine"], doctorPhone: "+919000000090", updatedAt: new Date(), user: { id: "u1", name: "Priya Sharma", phone: "+919000000001" } },
      { id: "mp2", bloodGroup: "B+", allergies: [],            conditions: [],              medications: [],              doctorPhone: null,               updatedAt: new Date(), user: { id: "u2", name: "Ravi Kumar",  phone: "+919000000002" } },
    ];
    const sq = search.toLowerCase();
    const result = sq ? stub.filter(m => m.user.name.toLowerCase().includes(sq) || (m.bloodGroup ?? "").toLowerCase().includes(sq)) : stub;
    return { profiles: result.slice((page - 1) * pageSize, page * pageSize), total: result.length, pages: Math.ceil(result.length / pageSize) };
  }
  const where: Prisma.MedicalProfileWhereInput = search
    ? { OR: [{ user: { name: { contains: search, mode: "insensitive" } } }, { bloodGroup: { contains: search, mode: "insensitive" } }] }
    : {};
  const [total, profiles] = await Promise.all([
    prisma.medicalProfile.count({ where }),
    prisma.medicalProfile.findMany({
      where, orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize, take: pageSize,
      select: { id: true, bloodGroup: true, allergies: true, conditions: true, medications: true, doctorPhone: true, updatedAt: true, user: { select: { id: true, name: true, phone: true } } },
    }),
  ]);
  return { profiles, total, pages: Math.ceil(total / pageSize) };
}

// ─────────────────────────────────────────────────────────────────────────────
// INCIDENT REPORTS (admin view)
// ─────────────────────────────────────────────────────────────────────────────

export type AdminIncidentReport = {
  id: string; category: string; severity: string; title: string; body: string;
  pinCode: string; status: string; resolvedAt: Date | null; createdAt: Date;
  author: { id: string; name: string };
};

export async function getIncidentReports({
  page = 1, pageSize = 50, search = "", status = "", category = "",
}: { page?: number; pageSize?: number; search?: string; status?: string; category?: string }) {
  if (E2E) {
    const stub: AdminIncidentReport[] = [
      { id: "ir1", category: "noise",    severity: "low",    title: "Loud music at night",   body: "Party from flat 4B",     pinCode: "400001", status: "pending",  resolvedAt: null,        createdAt: new Date(), author: { id: "u1", name: "Priya Sharma" } },
      { id: "ir2", category: "theft",    severity: "high",   title: "Bike stolen",           body: "Black Honda Activa",     pinCode: "400001", status: "resolved", resolvedAt: new Date(),  createdAt: new Date(), author: { id: "u2", name: "Ravi Kumar" } },
      { id: "ir3", category: "vandalism",severity: "medium", title: "Wall graffiti",         body: "South entrance wall",    pinCode: "400002", status: "pending",  resolvedAt: null,        createdAt: new Date(), author: { id: "u3", name: "Anita Nair" } },
    ];
    const filtered = (status ? stub.filter(r => r.status === status) : stub).filter(r => category ? r.category === category : true);
    const sq = search.toLowerCase();
    const result = sq ? filtered.filter(r => r.title.toLowerCase().includes(sq) || r.author.name.toLowerCase().includes(sq) || r.pinCode.includes(sq)) : filtered;
    return { reports: result.slice((page - 1) * pageSize, page * pageSize), total: result.length, pages: Math.ceil(result.length / pageSize) };
  }
  const where: Prisma.IncidentReportWhereInput = {};
  if (status) where.status = status;
  if (category) where.category = category;
  if (search) where.OR = [
    { title: { contains: search, mode: "insensitive" } },
    { body: { contains: search, mode: "insensitive" } },
    { pinCode: { contains: search } },
    { author: { name: { contains: search, mode: "insensitive" } } },
  ];
  const [total, reports] = await Promise.all([
    prisma.incidentReport.count({ where }),
    prisma.incidentReport.findMany({
      where, orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize, take: pageSize,
      select: { id: true, category: true, severity: true, title: true, body: true, pinCode: true, status: true, resolvedAt: true, createdAt: true, author: { select: { id: true, name: true } } },
    }),
  ]);
  return { reports, total, pages: Math.ceil(total / pageSize) };
}
