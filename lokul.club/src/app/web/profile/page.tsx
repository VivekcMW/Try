"use client";

import { useEffect, useState } from "react";
import {
  Award,
  Camera,
  CheckCircle,
  LogOut,
  Settings,
  Shield,
  Star,
  User as UserIcon,
} from "lucide-react";

type WebUser = {
  id: string;
  name: string;
  phone: string;
  avatarUrl: string | null;
  kycTier: "bronze" | "silver" | "gold";
  trustScore: number;
  pinCode: string;
  societyName?: string;
  createdAt: string;
  roles: string[];
};

const TIER_META: Record<string, { label: string; bg: string; color: string; icon: string }> = {
  bronze: { label: "Bronze",  bg: "#FEF3C7", color: "#92400E", icon: "🥉" },
  silver: { label: "Silver",  bg: "#F1F5F9", color: "#334155", icon: "🥈" },
  gold:   { label: "Gold",    bg: "#FEF9C3", color: "#713F12", icon: "🥇" },
};

function StatChip({ label, value }: { readonly label: string; readonly value: string | number }) {
  return (
    <div
      className="flex flex-col items-center rounded-xl px-4 py-3"
      style={{ background: "var(--color-gray-100)" }}
    >
      <span className="text-lg font-bold" style={{ color: "var(--color-heading)" }}>
        {value}
      </span>
      <span className="mt-0.5 text-[11px]" style={{ color: "var(--color-text-secondary)" }}>
        {label}
      </span>
    </div>
  );
}

function Avatar({ name, size = 80 }: { readonly name: string; readonly size?: number }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-bold text-white"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, var(--color-brand-500), var(--color-brand-700))",
        fontSize: size / 2.5,
      }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

// ── Mock profile data (replace with real API call when auth is implemented) ──
const MOCK_USER: WebUser = {
  id: "demo-001",
  name: "Priya Sharma",
  phone: "+91 98765 43210",
  avatarUrl: null,
  kycTier: "silver",
  trustScore: 78,
  pinCode: "411028",
  societyName: "Aundh Residency",
  createdAt: "2024-01-15T00:00:00Z",
  roles: ["resident", "helper"],
};

const DEMO_ACTIVITY = [
  { id: "1", label: "Posted a water supply update",      time: "2h ago",  icon: "📢" },
  { id: "2", label: "Listed a maths tutoring service",   time: "1d ago",  icon: "📚" },
  { id: "3", label: "Verified identity — silver tier",   time: "2w ago",  icon: "✅" },
  { id: "4", label: "Joined Aundh Residency society",    time: "3mo ago", icon: "🏘️" },
];

export default function WebProfilePage() {
  const [user, setUser] = useState<WebUser | null>(null);
  const [tab,  setTab]  = useState<"activity" | "settings">("activity");

  // In production this would call /api/mobile/users/me with a session token
  useEffect(() => {
    const timer = setTimeout(() => setUser(MOCK_USER), 300);
    return () => clearTimeout(timer);
  }, []);

  if (!user) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
          style={{ borderColor: "var(--color-brand-300)", borderTopColor: "var(--color-brand-600)" }}
        />
      </div>
    );
  }

  const tier = TIER_META[user.kycTier];
  const joined = new Date(user.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" });

  return (
    <div className="mx-auto max-w-2xl">
      {/* Profile card */}
      <div
        className="relative mb-6 overflow-hidden rounded-2xl border"
        style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
      >
        {/* Cover gradient */}
        <div
          className="h-28"
          style={{ background: "linear-gradient(135deg, var(--color-brand-500) 0%, var(--color-brand-800) 100%)" }}
        />

        {/* Avatar + edit */}
        <div className="relative -mt-10 flex items-end gap-3 px-5 pb-5">
          <div className="relative">
            <Avatar name={user.name} size={80} />
            <button
              type="button"
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white"
              style={{ background: "var(--color-brand-600)" }}
              aria-label="Change photo"
            >
              <Camera size={13} color="#fff" />
            </button>
          </div>
          <div className="flex-1 pb-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold" style={{ color: "var(--color-heading)" }}>
                {user.name}
              </h2>
              {/* Tier badge */}
              <span
                className="flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-bold"
                style={{ background: tier.bg, color: tier.color }}
              >
                {tier.icon} {tier.label}
              </span>
            </div>
            <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
              {user.societyName ?? user.pinCode} · Joined {joined}
            </p>
          </div>

          <button
            type="button"
            className="self-start rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-[color:var(--color-gray-100)]"
            style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
          >
            Edit profile
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 border-t px-5 py-4" style={{ borderColor: "var(--color-border)" }}>
          <StatChip label="Trust score" value={user.trustScore} />
          <StatChip label="Roles" value={user.roles.length} />
          <StatChip label="Posts" value={12} />
        </div>
      </div>

      {/* Verification banner if not gold */}
      {user.kycTier !== "gold" && (
        <div
          className="mb-5 flex items-center gap-3 rounded-xl border p-4"
          style={{ borderColor: "var(--color-brand-200)", background: "var(--color-brand-50)" }}
        >
          <Shield size={20} style={{ color: "var(--color-brand-600)" }} />
          <div className="flex-1">
            <p className="text-sm font-semibold" style={{ color: "var(--color-brand-800)" }}>
              Upgrade to {user.kycTier === "bronze" ? "Silver" : "Gold"} verification
            </p>
            <p className="text-xs" style={{ color: "var(--color-brand-700)" }}>
              Higher trust score · more features · priority listings
            </p>
          </div>
          <button
            type="button"
            className="shrink-0 rounded-lg px-3 py-2 text-xs font-bold text-white"
            style={{ background: "var(--color-brand-600)" }}
          >
            Verify
          </button>
        </div>
      )}

      {/* Roles */}
      <div
        className="mb-5 rounded-xl border p-4"
        style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
      >
        <div className="mb-3 flex items-center gap-2">
          <Award size={16} style={{ color: "var(--color-brand-600)" }} />
          <span className="text-sm font-semibold" style={{ color: "var(--color-heading)" }}>
            My roles
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {user.roles.map((r) => (
            <span
              key={r}
              className="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold"
              style={{ background: "var(--color-brand-50)", color: "var(--color-brand-700)" }}
            >
              <CheckCircle size={11} />
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </span>
          ))}
          <button
            type="button"
            className="rounded-full px-3 py-1 text-xs font-semibold"
            style={{ background: "var(--color-gray-100)", color: "var(--color-text-secondary)" }}
          >
            + Add role
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-1 border-b" style={{ borderColor: "var(--color-border)" }}>
        {(["activity", "settings"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className="px-4 py-2 text-sm font-semibold capitalize transition-colors"
            style={
              tab === t
                ? { color: "var(--color-brand-600)", borderBottom: "2px solid var(--color-brand-600)" }
                : { color: "var(--color-text-secondary)", borderBottom: "2px solid transparent" }
            }
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab: Activity */}
      {tab === "activity" && (
        <div
          className="divide-y rounded-xl border"
          style={{ borderColor: "var(--color-border)" }}
        >
          {DEMO_ACTIVITY.map((a) => (
            <div key={a.id} className="flex items-center gap-3 px-4 py-3">
              <span className="text-lg">{a.icon}</span>
              <div className="flex-1">
                <p className="text-sm" style={{ color: "var(--color-text)" }}>
                  {a.label}
                </p>
              </div>
              <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                {a.time}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Settings */}
      {tab === "settings" && (
        <div
          className="divide-y rounded-xl border"
          style={{ borderColor: "var(--color-border)" }}
        >
          {[
            { icon: <UserIcon size={16} />,    label: "Personal details",    sub: "Name, phone, address" },
            { icon: <Shield size={16} />,       label: "Privacy & safety",    sub: "Visibility, blocked users" },
            { icon: <Star size={16} />,         label: "Reputation settings", sub: "Vouch requests, reviews" },
            { icon: <Settings size={16} />,     label: "Notifications",       sub: "Push, email, SMS" },
          ].map((row) => (
            <button
              key={row.label}
              type="button"
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[color:var(--color-gray-100)]"
            >
              <span style={{ color: "var(--color-brand-600)" }}>{row.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
                  {row.label}
                </p>
                <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                  {row.sub}
                </p>
              </div>
              <span style={{ color: "var(--color-text-secondary)" }}>›</span>
            </button>
          ))}

          {/* Sign out */}
          <button
            type="button"
            className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[color:var(--color-gray-100)]"
          >
            <LogOut size={16} style={{ color: "var(--color-danger)" }} />
            <span className="text-sm font-medium" style={{ color: "var(--color-danger)" }}>
              Sign out
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
