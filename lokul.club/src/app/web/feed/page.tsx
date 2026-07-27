"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bookmark,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Pin,
  Send,
  Sparkles,
} from "lucide-react";

const API_BASE = "";

type FeedPost = {
  id: string;
  type: string;
  body: string;
  pinned: boolean;
  createdAt: string;
  reactionCount: number;
  commentCount: number;
  author: { id: string; name: string; avatarUrl: string | null; kycTier: string };
  media: { kind: string; url: string }[];
  tags: string[];
};

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  update:     { label: "Update",       color: "var(--color-brand-600)" },
  safety:     { label: "Safety",       color: "var(--color-danger)"    },
  lost:       { label: "Lost & Found", color: "var(--color-accent-600)"},
  event:      { label: "Event",        color: "var(--color-success)"   },
  poll:       { label: "Poll",         color: "var(--color-brand-500)" },
  sell:       { label: "For Sale",     color: "var(--color-accent-500)"},
  rwa_notice: { label: "RWA Notice",   color: "var(--color-gray-700)"  },
  sos:        { label: "SOS",          color: "var(--color-danger)"    },
};

function relativeTime(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 60_000;
  if (diff < 1)  return "just now";
  if (diff < 60) return `${Math.floor(diff)}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

function Avatar({ name }: { readonly name: string }) {
  return (
    <div
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
      style={{ background: "var(--color-brand-600)" }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function PostCard({ post }: { readonly post: FeedPost }) {
  const router = useRouter();
  const [liked,  setLiked]  = useState(false);
  const [saved,  setSaved]  = useState(false);
  const typeMeta = TYPE_LABELS[post.type] ?? { label: post.type, color: "var(--color-gray-600)" };

  return (
    <article
      className="rounded-xl border p-4"
      style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
    >
      {/* Pinned badge */}
      {post.pinned && (
        <div className="mb-2 flex items-center gap-1 text-xs font-semibold" style={{ color: "var(--color-brand-600)" }}>
          <Pin size={11} /> PINNED
        </div>
      )}

      {/* Author row */}
      <div className="mb-3 flex items-center gap-2.5">
        <Avatar name={post.author.name} />
        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold" style={{ color: "var(--color-heading)" }}>
              {post.author.name}
            </span>
            {post.author.kycTier !== "bronze" && (
              <span
                className="rounded px-1 py-0.5 text-[9px] font-bold uppercase"
                style={{ background: post.author.kycTier === "gold" ? "#FEF3C7" : "var(--color-brand-50)", color: post.author.kycTier === "gold" ? "#92400E" : "var(--color-brand-700)" }}
              >
                {post.author.kycTier}
              </span>
            )}
          </div>
          <div className="text-[11px]" style={{ color: "var(--color-text-secondary)" }}>
            {relativeTime(post.createdAt)}
          </div>
        </div>
        <button type="button" className="rounded p-1" style={{ color: "var(--color-text-secondary)" }}>
          <MoreHorizontal size={18} />
        </button>
      </div>

      {/* Type badge */}
      <span
        className="mb-2 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold"
        style={{ background: `color-mix(in srgb, ${typeMeta.color} 12%, transparent)`, color: typeMeta.color }}
      >
        {typeMeta.label}
      </span>

      {/* Body */}
      <p className="mb-3 text-sm leading-relaxed" style={{ color: "var(--color-text)" }}>
        {post.body}
      </p>

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {post.tags.map((t) => (
            <span key={t} className="text-xs font-medium" style={{ color: "var(--color-brand-600)" }}>
              #{t}
            </span>
          ))}
        </div>
      )}

      <hr style={{ borderColor: "var(--color-border)" }} className="mb-3" />

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors hover:bg-[color:var(--color-gray-100)]"
          style={{ color: liked ? "var(--color-danger)" : "var(--color-text-secondary)" }}
          onClick={() => setLiked((v) => !v)}
        >
          <Heart size={15} fill={liked ? "var(--color-danger)" : "none"} />
          {post.reactionCount + (liked ? 1 : 0)}
        </button>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors hover:bg-[color:var(--color-gray-100)]"
          style={{ color: "var(--color-text-secondary)" }}
          onClick={() => router.push(`/web/post/${post.id}`)}
        >
          <MessageCircle size={15} />
          {post.commentCount}
        </button>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors hover:bg-[color:var(--color-gray-100)]"
          style={{ color: "var(--color-text-secondary)" }}
        >
          <Send size={15} />
        </button>
        <div className="flex-1" />
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors hover:bg-[color:var(--color-gray-100)]"
          style={{ color: saved ? "var(--color-brand-600)" : "var(--color-text-secondary)" }}
          onClick={() => setSaved((v) => !v)}
        >
          <Bookmark size={15} fill={saved ? "var(--color-brand-600)" : "none"} />
        </button>
      </div>
    </article>
  );
}

const FILTER_TABS = [
  { id: "all",        label: "All" },
  { id: "update",     label: "Updates" },
  { id: "safety",     label: "Safety" },
  { id: "event",      label: "Events" },
  { id: "sell",       label: "For Sale" },
  { id: "rwa_notice", label: "Notices" },
];

export default function WebFeedPage() {
  const [pinCode,      setPinCode]      = useState("");
  const [submittedPin, setSubmittedPin] = useState("");
  const [posts,        setPosts]        = useState<FeedPost[]>([]);
  const [loading,      setLoading]      = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");

  // Persist pinCode in sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem("lokul_web_pin");
    if (saved) { setPinCode(saved); setSubmittedPin(saved); }
  }, []);

  const loadFeed = useCallback(async (pin: string, type: string) => {
    if (!pin) return;
    setLoading(true);
    try {
      const typeParam = type !== "all" ? `&type=${type}` : "";
      const res  = await fetch(`${API_BASE}/api/mobile/feed?pinCode=${pin}${typeParam}`);
      const data = await res.json();
      setPosts(data.posts ?? []);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (submittedPin) loadFeed(submittedPin, activeFilter);
  }, [submittedPin, activeFilter, loadFeed]);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(pinCode)) return;
    sessionStorage.setItem("lokul_web_pin", pinCode);
    setSubmittedPin(pinCode);
  };

  // ── No pin entered yet ────────────────────────────────────────────────────
  if (!submittedPin) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-6 pt-16 text-center">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold text-white"
          style={{ background: "linear-gradient(135deg, var(--color-brand-500), var(--color-brand-700))" }}
        >
          L
        </div>
        <div>
          <h1 className="mb-1 text-xl font-bold" style={{ color: "var(--color-heading)" }}>
            Your neighbourhood feed
          </h1>
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Enter your 6-digit PIN code to see posts from your locality.
          </p>
        </div>
        <form onSubmit={handlePinSubmit} className="flex w-full max-w-xs gap-2">
          <input
            type="text"
            inputMode="numeric"
            pattern="\d{6}"
            maxLength={6}
            placeholder="411028"
            value={pinCode}
            onChange={(e) => setPinCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
            style={{ borderColor: "var(--color-border)", background: "var(--color-surface)", color: "var(--color-text)" }}
          />
          <button
            type="submit"
            disabled={pinCode.length !== 6}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: "var(--color-brand-600)" }}
          >
            Go
          </button>
        </form>
        <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
          No account required · read-only view
        </p>
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      {/* Main column */}
      <div className="flex-1">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold" style={{ color: "var(--color-heading)" }}>
              Local feed
            </h1>
            <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
              PIN {submittedPin}
              <button
                type="button"
                onClick={() => { setSubmittedPin(""); setPinCode(""); sessionStorage.removeItem("lokul_web_pin"); }}
                className="ml-2 underline"
                style={{ color: "var(--color-brand-600)" }}
              >
                change
              </button>
            </p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="mb-4 flex gap-1 overflow-x-auto pb-1">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id)}
              className="shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors"
              style={
                activeFilter === tab.id
                  ? { background: "var(--color-brand-600)", color: "#fff" }
                  : { background: "var(--color-gray-100)", color: "var(--color-text-secondary)" }
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Posts */}
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-xl"
                style={{ background: "var(--color-gray-100)" }}
              />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div
            className="rounded-xl border p-12 text-center text-sm"
            style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
          >
            No posts in this area yet.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {posts.map((p) => <PostCard key={p.id} post={p} />)}
          </div>
        )}
      </div>

      {/* Sidebar (desktop) */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <div
          className="rounded-xl border p-4"
          style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
        >
          <div className="mb-3 flex items-center gap-2">
            <Sparkles size={16} style={{ color: "var(--color-brand-600)" }} />
            <span className="text-sm font-semibold" style={{ color: "var(--color-heading)" }}>
              AI Digest
            </span>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
            Tap the Lokul app for personalised AI summaries of your neighbourhood — meetings, alerts, deals and more.
          </p>
          <a
            href="/#waitlist"
            className="mt-3 block rounded-lg py-2 text-center text-xs font-semibold text-white"
            style={{ background: "var(--color-brand-600)" }}
          >
            Get the app
          </a>
        </div>
      </aside>
    </div>
  );
}
