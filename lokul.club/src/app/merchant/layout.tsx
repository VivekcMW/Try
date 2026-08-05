"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Store, LogOut, Menu, X, XCircle } from "lucide-react";
import { PROFILE_NAV, getProfileFromCategory, type WorkflowProfile } from "@/lib/merchant-profiles";
import { MerchantProfileProvider } from "@/lib/merchant-profile-context";

type MerchantData = {
  id: string;
  name: string;
  category: string;
  avatarUrl?: string | null;
  acceptingOrders?: boolean;
  workflowProfile?: WorkflowProfile;
};

export default function MerchantLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [merchant, setMerchant] = useState<MerchantData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    await fetch("/api/merchant/auth/logout", { method: "POST" });
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
  const navItems = PROFILE_NAV[profile];

  const SidebarContent = () => (
    <>
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 rounded-[6px] px-3 py-2.5 text-sm font-medium transition"
              style={{
                background: isActive ? "var(--color-brand-50)" : "transparent",
                color: isActive ? "var(--color-brand-700)" : "var(--color-foreground)",
              }}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4" style={{ borderTop: "1px solid var(--color-border)" }}>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-[6px] px-3 py-2.5 text-sm font-medium transition"
          style={{ color: "var(--color-danger)" }}
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </>
  );

  const MerchantHeader = ({ showClose = false }: { showClose?: boolean }) => (
    <div
      className={`flex h-16 items-center px-6 ${showClose ? "justify-between" : ""}`}
      style={{ borderBottom: "1px solid var(--color-border)" }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-[6px] text-white"
          style={{ background: "var(--color-brand-600)" }}
        >
          <Store className="h-5 w-5" />
        </div>
        <div className="flex-1 overflow-hidden">
          <h1 className="truncate text-sm font-bold" style={{ color: "var(--color-heading)" }}>{merchant.name}</h1>
          <p className="truncate text-xs" style={{ color: "var(--color-text-secondary)" }}>{merchant.category}</p>
          {merchant.acceptingOrders === false && (
            <div className="mt-1 flex items-center gap-1 text-xs" style={{ color: "var(--color-danger)" }}>
              <XCircle className="w-3 h-3" />
              <span>Orders Paused</span>
            </div>
          )}
        </div>
      </div>
      {showClose && (
        <button onClick={() => setSidebarOpen(false)} className="text-gray-500 hover:text-gray-900">
          <X size={20} />
        </button>
      )}
    </div>
  );

  return (
    <MerchantProfileProvider value={profile}>
      <div className="flex h-screen overflow-hidden" style={{ background: "var(--color-surface-muted)" }}>
        {/* Desktop sidebar */}
        <aside
          className="hidden w-64 flex-col lg:flex"
          style={{
            background: "var(--color-surface)",
            borderRight: "1px solid var(--color-border)",
          }}
        >
          <MerchantHeader />
          <SidebarContent />
        </aside>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Mobile sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col transition-transform lg:hidden ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          style={{
            background: "var(--color-surface)",
            borderRight: "1px solid var(--color-border)",
          }}
        >
          <MerchantHeader showClose />
          <SidebarContent />
        </aside>

        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <header
            className="flex h-16 items-center justify-between px-4 lg:px-6"
            style={{
              background: "var(--color-surface)",
              borderBottom: "1px solid var(--color-border)",
            }}
          >
            <button
              onClick={() => setSidebarOpen(true)}
              className="transition lg:hidden"
              style={{ color: "var(--color-text-secondary)" }}
            >
              <Menu size={24} />
            </button>
            <div className="hidden lg:block" />
            <div className="ml-auto flex items-center gap-4">
              <Link
                href="/business"
                className="text-sm font-medium transition"
                style={{ color: "var(--color-text-secondary)" }}
              >
                View on App →
              </Link>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </MerchantProfileProvider>
  );
}
