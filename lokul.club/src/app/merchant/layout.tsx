"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Store, LogOut, Menu, XCircle, ChevronLeft, ChevronRight, Settings, Globe } from "lucide-react";
import {
  PROFILE_NAV,
  getProfileFromCategory,
  type NavItem,
  type WorkflowProfile,
} from "@/lib/merchant-profiles";
import { MerchantProfileProvider } from "@/lib/merchant-profile-context";
import { CategoryBadge } from "@/components/merchant/CategoryBadge";
import type { MerchantCategory } from "@/types/merchant-categories";
import { useToast } from "@/components/ui";
import { MerchantNotificationProvider, MerchantBanners } from "@/lib/merchant-notifications";
import { LOCALES, useI18n } from "@/lib/i18n";
import type { Locale } from "@/i18n";

type MerchantData = {
  id: string;
  name: string;
  category: string;
  avatarUrl?: string | null;
  acceptingOrders?: boolean;
  workflowProfile?: WorkflowProfile;
  status?: string;
};

function SidebarNav({
  navItems,
  pathname,
  collapsed,
  setSidebarOpen,
}: Readonly<{
  navItems: NavItem[];
  pathname: string;
  collapsed?: boolean;
  setSidebarOpen: (value: boolean) => void;
}>) {
  return (
    <nav className="flex-1 space-y-1 overflow-y-auto p-4">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition ${
              collapsed ? "justify-center" : "gap-3"
            }`}
            style={{
              background: isActive ? "var(--color-brand-50)" : "transparent",
              color: isActive ? "var(--color-brand-700)" : "var(--color-foreground)",
            }}
            title={collapsed ? item.label : undefined}
          >
            <Icon size={18} />
            {!collapsed && item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function MerchantLanguageSwitcher(): React.JSX.Element {
  const { locale, setLocale } = useI18n();

  return (
    <label
      className="relative flex items-center gap-1.5 rounded-md border px-2.5 py-2 text-xs font-semibold"
      style={{ borderColor: "var(--color-border)", background: "var(--color-surface-muted)", color: "var(--color-text-secondary)" }}
    >
      <Globe size={15} aria-hidden />
      <select
        aria-label="Language"
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        className="cursor-pointer appearance-none bg-transparent pr-4 text-xs font-semibold outline-none"
        style={{ color: "var(--color-foreground)" }}
      >
        {LOCALES.map((language) => (
          <option key={language.code} value={language.code}>
            {language.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-2 text-[9px]" aria-hidden>
        ▾
      </span>
    </label>
  );
}

export default function MerchantLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();
  const [merchant, setMerchant] = useState<MerchantData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [enabledFlags, setEnabledFlags] = useState<string[]>([
    "merchant_broadcasts", "merchant_coupons", "merchant_branches", "merchant_subscriptions",
  ]);

  useEffect(() => {
    fetch("/api/features")
      .then((res) => res.json())
      .then((data) => setEnabledFlags(data.enabled ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/merchant/auth/session");
        const data = await res.json();

        if (!data.authenticated) {
          router.push("/merchant/login");
          return;
        }

        setMerchant(data.merchant);
      } catch {
        router.push("/merchant/login");
      } finally {
        setLoading(false);
      }
    }

    if (pathname?.includes("/login")) {
      setLoading(false);
      return;
    }

    checkAuth();
  }, [pathname, router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/merchant/auth/logout", { method: "POST" });
      toast.success("Logged out");
    } catch {
      toast.error("Logout failed", "Please try again");
      return;
    }
    router.push("/merchant/login");
  };

  if (loading || !merchant) {
    if (pathname?.includes("/login")) {
      return <>{children}</>;
    }
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-brand-600" />
      </div>
    );
  }

  const profile: WorkflowProfile =
    merchant.workflowProfile ?? getProfileFromCategory(merchant.category);
  const NAV_FLAG_BY_HREF: Record<string, string> = {
    "/merchant/broadcast": "merchant_broadcasts",
    "/merchant/coupons": "merchant_coupons",
    "/merchant/branches": "merchant_branches",
    "/merchant/plans": "merchant_subscriptions",
    "/merchant/subscribers": "merchant_subscriptions",
  };
  const navItems = PROFILE_NAV[profile].filter((item) => {
    const flag = NAV_FLAG_BY_HREF[item.href];
    return !flag || enabledFlags.includes(flag);
  });

  return (
    <MerchantProfileProvider value={profile}>
      <MerchantNotificationProvider merchantStatus={merchant.status ?? null}>
      <div className="flex h-screen flex-col overflow-hidden" style={{ background: "var(--color-surface-muted)" }}>
        {/* Top navbar (full width) */}
        <header
          className="flex h-16 w-full items-center gap-3 px-4 lg:px-6"
          style={{
            background: "var(--color-surface)",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="transition lg:hidden"
            style={{ color: "var(--color-text-secondary)" }}
            aria-label="Open sidebar"
          >
            <Menu size={24} />
          </button>

          <Link href="/merchant" className="flex min-w-0 items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-white"
              style={{ background: "var(--color-brand-600)" }}
            >
              <Store className="h-5 w-5" />
            </div>
            <div className="min-w-0 hidden sm:block">
              <h1 className="truncate text-sm font-bold" style={{ color: "var(--color-heading)" }}>
                {merchant.name}
              </h1>
              <div className="mt-0.5 flex items-center gap-2">
                <CategoryBadge category={merchant.category as MerchantCategory} size="sm" />
                {merchant.acceptingOrders === false && (
                  <span className="flex items-center gap-1 text-xs" style={{ color: "var(--color-danger)" }}>
                    <XCircle className="w-3 h-3" />
                    Orders Paused
                  </span>
                )}
              </div>
            </div>
          </Link>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <MerchantLanguageSwitcher />
            <Link
              href="/merchant/settings"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition hover:bg-surface-muted"
              style={{ color: "var(--color-foreground)" }}
              title="Settings"
            >
              <Settings size={18} />
              <span className="hidden sm:inline">Settings</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition hover:bg-surface-muted"
              style={{ color: "var(--color-danger)" }}
              title="Logout"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        <MerchantBanners />

        <div className="flex flex-1 overflow-hidden">
          {/* Desktop sidebar */}
          <aside
            className={`hidden flex-col lg:flex transition-all duration-300 ${
              sidebarCollapsed ? "w-16" : "w-64"
            }`}
            style={{
              background: "var(--color-surface)",
              borderRight: "1px solid var(--color-border)",
            }}
          >
            <SidebarNav navItems={navItems} pathname={pathname} collapsed={sidebarCollapsed} setSidebarOpen={setSidebarOpen} />
            <div className="p-2" style={{ borderTop: "1px solid var(--color-border)" }}>
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="flex w-full items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition"
                style={{ color: "var(--color-text-secondary)" }}
                title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
              </button>
            </div>
          </aside>

          {/* Mobile overlay */}
          {sidebarOpen && (
            <button
              type="button"
              className="fixed inset-0 top-16 z-40 bg-black/50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setSidebarOpen(false);
                }
              }}
              aria-label="Close sidebar"
            />
          )}

          {/* Mobile sidebar */}
          <aside
            className={`fixed inset-y-0 left-0 top-16 z-50 flex w-64 flex-col transition-transform lg:hidden ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
            style={{
              background: "var(--color-surface)",
              borderRight: "1px solid var(--color-border)",
            }}
          >
            <SidebarNav navItems={navItems} pathname={pathname} setSidebarOpen={setSidebarOpen} />
          </aside>

          {/* Main content */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
      </MerchantNotificationProvider>
    </MerchantProfileProvider>
  );
}
