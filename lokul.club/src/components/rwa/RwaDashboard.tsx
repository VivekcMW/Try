"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle,
  ChevronRight,
  Clock,
  LayoutDashboard,
  Loader2,
  MapPin,
  PieChart,
  Pin,
  Plus,
  Shield,
  Users,
  Vote,
  XCircle,
} from "lucide-react";

/* ────────────────────────────────────────────────────────── */
/* Types                                                      */
/* ────────────────────────────────────────────────────────── */

interface Society {
  id: string; name: string; address: string; city: string; pinCode: string;
  memberCount: number; postCount: number; status: string;
}
interface Stats {
  totalMembers: number; activeThisWeek: number; openNotices: number;
  pendingVisitors: number; openPolls: number; pendingKyc: number;
}
interface Notice { id: string; body: string; createdAt: string; pinned: boolean; }
interface Visitor { id: string; name: string; purpose: string; hostFlat: string; arrivalTime: string; }
interface Poll { id: string; question: string; totalVotes: number; yesCount: number; noCount: number; closesAt: string; }
interface Member { id: string; name: string; flat: string; kycTier: string; joinedAt: string; }

interface DashData {
  society: Society;
  stats: Stats;
  recentNotices: Notice[];
  pendingVisitors: Visitor[];
  polls: Poll[];
  recentMembers: Member[];
}

/* ────────────────────────────────────────────────────────── */
/* Helpers                                                    */
/* ────────────────────────────────────────────────────────── */

function relTime(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 60_000;
  if (diff < 1) return "just now";
  if (diff < 60) return `${Math.floor(diff)}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

function futureTime(iso: string) {
  const diff = (new Date(iso).getTime() - Date.now()) / 60_000;
  if (diff <= 0) return "now";
  if (diff < 60) return `in ${Math.floor(diff)}m`;
  return `in ${Math.floor(diff / 60)}h`;
}

const KYC_META: Record<string, { label: string; color: string; bg: string }> = {
  bronze: { label: "Bronze", color: "#92400e", bg: "#fef3c7" },
  silver: { label: "Silver", color: "#334155", bg: "#f1f5f9" },
  gold:   { label: "Gold",   color: "#713f12", bg: "#fef9c3" },
};

/* ────────────────────────────────────────────────────────── */
/* Sub-components                                             */
/* ────────────────────────────────────────────────────────── */

function StatCard({
  icon, label, value, accent, sub,
}: {
  readonly icon: React.ReactNode;
  readonly label: string;
  readonly value: number | string;
  readonly accent?: string;
  readonly sub?: string;
}) {
  return (
    <div
      className="flex flex-col gap-1 rounded-2xl border p-4"
      style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
    >
      <div className="flex items-center justify-between">
        <div style={{ color: accent ?? "var(--color-brand-600)" }}>{icon}</div>
      </div>
      <span className="text-2xl font-bold" style={{ color: "var(--color-heading)" }}>{value}</span>
      <span className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>{label}</span>
      {sub && <span className="text-[10px]" style={{ color: "var(--color-text-secondary)" }}>{sub}</span>}
    </div>
  );
}

function SectionCard({
  title,
  icon,
  action,
  children,
}: {
  readonly title: string;
  readonly icon: React.ReactNode;
  readonly action?: React.ReactNode;
  readonly children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
    >
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div className="flex items-center gap-2">
          <div style={{ color: "var(--color-brand-600)" }}>{icon}</div>
          <span className="text-sm font-bold" style={{ color: "var(--color-heading)" }}>{title}</span>
        </div>
        {action}
      </div>
      <div>{children}</div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────── */
/* Main component (client — societyId from prop)             */
/* ────────────────────────────────────────────────────────── */

export default function RwaDashboard({ societyId }: { readonly societyId: string }) {
  const [data, setData] = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"overview" | "notices" | "visitors" | "polls" | "members">("overview");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/web/rwa/${societyId}`);
      if (!res.ok) { setError("Could not load dashboard."); return; }
      setData(await res.json());
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }, [societyId]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 size={32} className="animate-spin" style={{ color: "var(--color-brand-600)" }} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
        <p className="text-sm" style={{ color: "var(--color-danger)" }}>{error || "No data"}</p>
        <button
          type="button"
          onClick={load}
          className="rounded-lg px-4 py-2 text-sm font-medium text-white"
          style={{ background: "var(--color-brand-600)" }}
        >
          Retry
        </button>
      </div>
    );
  }

  const { society, stats, recentNotices, pendingVisitors, polls, recentMembers } = data;

  /* ── tab nav ── */
  const tabs = [
    { id: "overview",  label: "Overview",  icon: <LayoutDashboard size={15} /> },
    { id: "notices",   label: "Notices",   icon: <Bell size={15} />, badge: stats.openNotices },
    { id: "visitors",  label: "Visitors",  icon: <Users size={15} />, badge: stats.pendingVisitors },
    { id: "polls",     label: "Polls",     icon: <Vote size={15} />, badge: stats.openPolls },
    { id: "members",   label: "Members",   icon: <Shield size={15} /> },
  ] as const;

  return (
    <div style={{ background: "var(--color-background)", minHeight: "100vh" }}>

      {/* Header */}
      <header
        className="sticky top-0 z-20 border-b"
        style={{ borderColor: "var(--color-border)", background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)" }}
      >
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <span
                className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-white"
                style={{ background: "linear-gradient(135deg, var(--color-brand-500), var(--color-brand-700))" }}
              >L</span>
            </Link>
            <div>
              <p className="text-sm font-bold leading-tight" style={{ color: "var(--color-heading)" }}>
                {society.name}
              </p>
              <p className="flex items-center gap-1 text-[11px]" style={{ color: "var(--color-text-secondary)" }}>
                <MapPin size={10} /> {society.city} · {society.pinCode}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="hidden rounded-full px-2 py-0.5 text-xs font-semibold sm:inline-block"
              style={{ background: "var(--color-brand-50)", color: "var(--color-brand-700)" }}
            >
              RWA Admin
            </span>
            <Link
              href={`/n/${society.pinCode}`}
              className="text-xs hover:underline"
              style={{ color: "var(--color-brand-600)" }}
            >
              Public page →
            </Link>
          </div>
        </div>

        {/* Tab nav */}
        <div className="mx-auto max-w-5xl overflow-x-auto px-4">
          <div className="flex gap-1 pb-0">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className="relative flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2.5 text-xs font-medium transition"
                style={{
                  borderColor: tab === t.id ? "var(--color-brand-600)" : "transparent",
                  color: tab === t.id ? "var(--color-brand-600)" : "var(--color-text-secondary)",
                }}
              >
                {t.icon}
                {t.label}
                {"badge" in t && t.badge > 0 && (
                  <span
                    className="ml-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold text-white"
                    style={{ background: "var(--color-brand-600)" }}
                  >
                    {t.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 space-y-6">

        {/* ── OVERVIEW ── */}
        {tab === "overview" && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <StatCard icon={<Users size={18} />}         label="Members"         value={stats.totalMembers} />
              <StatCard icon={<Clock size={18} />}         label="Active this week" value={stats.activeThisWeek} accent="var(--color-success)" />
              <StatCard icon={<Bell size={18} />}          label="Open notices"     value={stats.openNotices}   accent="var(--color-info)" />
              <StatCard icon={<Shield size={18} />}        label="Pending visitors" value={stats.pendingVisitors} accent="var(--color-warning)" />
              <StatCard icon={<Vote size={18} />}          label="Active polls"     value={stats.openPolls}     accent="var(--color-brand-600)" />
              <StatCard icon={<PieChart size={18} />}      label="Pending KYC"      value={stats.pendingKyc}    accent="var(--color-accent-600)" />
            </div>

            {/* Two-col layout on desktop */}
            <div className="grid gap-6 lg:grid-cols-2">

              {/* Notices */}
              <SectionCard
                title="Recent Notices"
                icon={<Bell size={16} />}
                action={
                  <button
                    type="button"
                    onClick={() => setTab("notices")}
                    className="flex items-center gap-1 text-xs hover:underline"
                    style={{ color: "var(--color-brand-600)" }}
                  >
                    View all <ChevronRight size={12} />
                  </button>
                }
              >
                {recentNotices.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm" style={{ color: "var(--color-text-secondary)" }}>
                    No notices yet
                  </p>
                ) : (
                  recentNotices.slice(0, 3).map((n) => (
                    <div
                      key={n.id}
                      className="flex items-start gap-3 border-b px-4 py-3 last:border-b-0"
                      style={{ borderColor: "var(--color-border)" }}
                    >
                      {n.pinned && <Pin size={12} style={{ color: "var(--color-brand-600)", flexShrink: 0, marginTop: 2 }} />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm line-clamp-2" style={{ color: "var(--color-heading)" }}>{n.body}</p>
                        <p className="mt-0.5 text-xs" style={{ color: "var(--color-text-secondary)" }}>
                          {relTime(n.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </SectionCard>

              {/* Visitors */}
              <SectionCard
                title="Upcoming Visitors"
                icon={<Shield size={16} />}
                action={
                  <button
                    type="button"
                    onClick={() => setTab("visitors")}
                    className="flex items-center gap-1 text-xs hover:underline"
                    style={{ color: "var(--color-brand-600)" }}
                  >
                    View all <ChevronRight size={12} />
                  </button>
                }
              >
                {pendingVisitors.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm" style={{ color: "var(--color-text-secondary)" }}>
                    No pending visitors
                  </p>
                ) : (
                  pendingVisitors.slice(0, 3).map((v) => (
                    <div
                      key={v.id}
                      className="flex items-center justify-between border-b px-4 py-3 last:border-b-0"
                      style={{ borderColor: "var(--color-border)" }}
                    >
                      <div>
                        <p className="text-sm font-medium" style={{ color: "var(--color-heading)" }}>
                          {v.name}
                        </p>
                        <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                          {v.purpose} · Flat {v.hostFlat}
                        </p>
                      </div>
                      <span
                        className="rounded-full px-2 py-0.5 text-xs font-medium"
                        style={{ background: "var(--color-brand-50)", color: "var(--color-brand-700)" }}
                      >
                        {futureTime(v.arrivalTime)}
                      </span>
                    </div>
                  ))
                )}
              </SectionCard>

              {/* Polls */}
              <SectionCard title="Active Polls" icon={<Vote size={16} />}>
                {polls.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm" style={{ color: "var(--color-text-secondary)" }}>
                    No active polls
                  </p>
                ) : (
                  polls.map((poll) => {
                    const yesPct = poll.totalVotes > 0
                      ? Math.round((poll.yesCount / poll.totalVotes) * 100)
                      : 0;
                    return (
                      <div
                        key={poll.id}
                        className="border-b px-4 py-3 last:border-b-0"
                        style={{ borderColor: "var(--color-border)" }}
                      >
                        <p className="text-sm font-medium" style={{ color: "var(--color-heading)" }}>
                          {poll.question}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="h-2 flex-1 overflow-hidden rounded-full" style={{ background: "var(--color-gray-200)" }}>
                            <div
                              className="h-2 rounded-full transition-all"
                              style={{ width: `${yesPct}%`, background: "var(--color-success)" }}
                            />
                          </div>
                          <span className="text-xs font-semibold" style={{ color: "var(--color-success)" }}>
                            {yesPct}% Yes
                          </span>
                          <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                            {poll.totalVotes} votes
                          </span>
                        </div>
                        <p className="mt-1 text-[11px]" style={{ color: "var(--color-text-secondary)" }}>
                          Closes {relTime(poll.closesAt).replace("ago", "remaining")}
                        </p>
                      </div>
                    );
                  })
                )}
              </SectionCard>

              {/* Recent members */}
              <SectionCard title="Recent Members" icon={<Users size={16} />}>
                {recentMembers.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm" style={{ color: "var(--color-text-secondary)" }}>
                    No members yet
                  </p>
                ) : (
                  recentMembers.map((m) => {
                    const kyc = KYC_META[m.kycTier] ?? KYC_META.bronze;
                    return (
                      <div
                        key={m.id}
                        className="flex items-center justify-between border-b px-4 py-3 last:border-b-0"
                        style={{ borderColor: "var(--color-border)" }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white"
                            style={{ background: "var(--color-brand-600)" }}
                          >
                            {m.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium" style={{ color: "var(--color-heading)" }}>
                              {m.name}
                            </p>
                            <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                              Flat {m.flat}
                            </p>
                          </div>
                        </div>
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                          style={{ background: kyc.bg, color: kyc.color }}
                        >
                          {kyc.label}
                        </span>
                      </div>
                    );
                  })
                )}
              </SectionCard>
            </div>
          </>
        )}

        {/* ── NOTICES TAB ── */}
        {tab === "notices" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold" style={{ color: "var(--color-heading)" }}>Notices</h2>
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white"
                style={{ background: "var(--color-brand-600)" }}
              >
                <Plus size={14} /> New Notice
              </button>
            </div>
            {recentNotices.map((n) => (
              <div
                key={n.id}
                className="rounded-2xl border p-4"
                style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
              >
                {n.pinned && (
                  <div className="mb-2 flex items-center gap-1 text-xs font-semibold" style={{ color: "var(--color-brand-600)" }}>
                    <Pin size={11} /> PINNED
                  </div>
                )}
                <p className="text-sm" style={{ color: "var(--color-heading)" }}>{n.body}</p>
                <p className="mt-2 text-xs" style={{ color: "var(--color-text-secondary)" }}>{relTime(n.createdAt)}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── VISITORS TAB ── */}
        {tab === "visitors" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold" style={{ color: "var(--color-heading)" }}>Visitor Log</h2>
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white"
                style={{ background: "var(--color-brand-600)" }}
              >
                <Plus size={14} /> Add Visitor
              </button>
            </div>
            {pendingVisitors.map((v) => (
              <div
                key={v.id}
                className="flex items-center justify-between rounded-2xl border p-4"
                style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
              >
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--color-heading)" }}>{v.name}</p>
                  <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                    {v.purpose} · Flat {v.hostFlat} · {futureTime(v.arrivalTime)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button type="button" aria-label="Approve">
                    <CheckCircle size={22} style={{ color: "var(--color-success)" }} />
                  </button>
                  <button type="button" aria-label="Deny">
                    <XCircle size={22} style={{ color: "var(--color-danger)" }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── POLLS TAB ── */}
        {tab === "polls" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold" style={{ color: "var(--color-heading)" }}>Polls</h2>
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white"
                style={{ background: "var(--color-brand-600)" }}
              >
                <Plus size={14} /> New Poll
              </button>
            </div>
            {polls.map((poll) => {
              const yesPct = poll.totalVotes > 0 ? Math.round((poll.yesCount / poll.totalVotes) * 100) : 0;
              return (
                <div
                  key={poll.id}
                  className="rounded-2xl border p-4"
                  style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
                >
                  <p className="text-sm font-semibold" style={{ color: "var(--color-heading)" }}>{poll.question}</p>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-8 text-right text-xs font-medium" style={{ color: "var(--color-success)" }}>Yes</span>
                      <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: "var(--color-gray-200)" }}>
                        <div className="h-3 rounded-full" style={{ width: `${yesPct}%`, background: "var(--color-success)" }} />
                      </div>
                      <span className="text-xs font-bold w-8" style={{ color: "var(--color-success)" }}>{yesPct}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-8 text-right text-xs font-medium" style={{ color: "var(--color-danger)" }}>No</span>
                      <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: "var(--color-gray-200)" }}>
                        <div className="h-3 rounded-full" style={{ width: `${100 - yesPct}%`, background: "var(--color-danger)" }} />
                      </div>
                      <span className="text-xs font-bold w-8" style={{ color: "var(--color-danger)" }}>{100 - yesPct}%</span>
                    </div>
                  </div>
                  <p className="mt-2 text-xs" style={{ color: "var(--color-text-secondary)" }}>
                    {poll.totalVotes} total votes · closes {relTime(poll.closesAt)}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* ── MEMBERS TAB ── */}
        {tab === "members" && (
          <div className="space-y-4">
            <h2 className="text-base font-bold" style={{ color: "var(--color-heading)" }}>
              Members ({stats.totalMembers})
            </h2>
            <div className="space-y-2">
              {recentMembers.map((m) => {
                const kyc = KYC_META[m.kycTier] ?? KYC_META.bronze;
                return (
                  <div
                    key={m.id}
                    className="flex items-center justify-between rounded-2xl border p-3"
                    style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-full font-bold text-white text-sm"
                        style={{ background: "var(--color-brand-600)" }}
                      >
                        {m.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: "var(--color-heading)" }}>{m.name}</p>
                        <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                          Flat {m.flat} · joined {relTime(m.joinedAt)}
                        </p>
                      </div>
                    </div>
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                      style={{ background: kyc.bg, color: kyc.color }}
                    >
                      {kyc.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
