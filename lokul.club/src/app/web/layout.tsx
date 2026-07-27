"use client";

import type { ReactNode } from "react";
import { Bell, Compass, Home, MessageCircle, User } from "lucide-react";
import Link from "next/link";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";

export default function WebLayout({ children }: { readonly children: ReactNode }) {
  const { isEnabled } = useFeatureFlags();
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-bg)", color: "var(--color-text)" }}>
      {/* Top nav */}
      <header
        className="sticky top-0 z-40 border-b backdrop-blur-xl"
        style={{ borderColor: "var(--color-border)", background: "rgba(255,255,255,0.85)" }}
      >
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          {/* Logo */}
          <Link href="/(web)/feed" className="flex items-center gap-2">
            <span
              className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-white"
              style={{ background: "linear-gradient(135deg, var(--color-brand-500), var(--color-brand-700))" }}
            >
              L
            </span>
            <span className="text-sm font-bold tracking-tight" style={{ color: "var(--color-heading)" }}>
              lokul<span style={{ color: "var(--color-brand-600)" }}>.club</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 sm:flex">
            <NavLink href="/web/feed"        icon={<Home size={16} />}        label="Feed" />
            {isEnabled('services') && (
              <NavLink href="/web/marketplace" icon={<Compass size={16} />}     label="Marketplace" />
            )}
            <NavLink href="/web/profile"     icon={<User size={16} />}        label="Profile" />
          </nav>

          {/* Bell */}
          <button
            type="button"
            className="relative flex h-9 w-9 items-center justify-center rounded-full"
            style={{ background: "var(--color-gray-100)" }}
            aria-label="Notifications"
          >
            <Bell size={17} style={{ color: "var(--color-gray-600)" }} />
            <span
              className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full"
              style={{ background: "var(--color-brand-600)" }}
            />
          </button>
        </div>
      </header>

      {/* Page content */}
      <main className="mx-auto max-w-4xl px-4 py-6">{children}</main>

      {/* Mobile bottom nav */}
      <nav
        className="fixed bottom-0 left-0 right-0 flex items-center justify-around border-t sm:hidden"
        style={{ background: "var(--color-surface)", borderColor: "var(--color-border)", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <MobileNavLink href="/web/feed"        icon={<Home size={22} />}          label="Feed" />
        {isEnabled('services') && (
          <MobileNavLink href="/web/marketplace" icon={<Compass size={22} />}       label="Explore" />
        )}
        <MobileNavLink href="/web/profile"     icon={<MessageCircle size={22} />} label="Chats" />
        <MobileNavLink href="/web/profile"     icon={<User size={22} />}          label="You" />
      </nav>
    </div>
  );
}

function NavLink({ href, icon, label }: { readonly href: string; readonly icon: ReactNode; readonly label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
      style={{ color: "var(--color-text-secondary)" }}
    >
      {icon}
      {label}
    </Link>
  );
}

function MobileNavLink({ href, icon, label }: { readonly href: string; readonly icon: ReactNode; readonly label: string }) {
  return (
    <Link href={href} className="flex flex-col items-center gap-0.5 px-3 py-2 text-[10px] font-medium"
      style={{ color: "var(--color-text-secondary)" }}
    >
      {icon}
      {label}
    </Link>
  );
}
