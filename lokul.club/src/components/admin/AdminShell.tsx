"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, Users, LogOut, Menu, X, ChevronDown, ChevronLeft,
  ShieldAlert, Building2, Store, Megaphone, Flag, ScrollText, ListChecks, Plug,
  ShoppingBag, UsersRound, Package, FileCheck, BadgeCheck,
  FileText, Clapperboard, CalendarDays, MessageSquare, Gift, Car,
  Tag, Wallet, Siren, MapPin, Vote, Star, Wrench,
  Activity, HeartHandshake, CalendarCheck, Receipt, TrendingUp,
  Phone, Route, UserCheck, Stethoscope, TriangleAlert, Presentation,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { Session } from "next-auth";
import { Button } from "@/components/ui";
import AdminGlobalSearch from "@/components/admin/AdminGlobalSearch";

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { href: "/admin/dashboard",       label: "Dashboard",      Icon: LayoutDashboard },
      { href: "/admin/society-health",  label: "Society Health", Icon: Activity        },
    ],
  },
  {
    label: "People",
    items: [
      { href: "/admin/entries",    label: "Entries",    Icon: ListChecks  },
      { href: "/admin/users",      label: "Users",      Icon: Users       },
      { href: "/admin/kyc",        label: "KYC Review", Icon: FileCheck   },
      { href: "/admin/moderation", label: "Moderation", Icon: ShieldAlert },
      { href: "/admin/vouches",    label: "Vouch Graph",Icon: HeartHandshake },
    ],
  },
  {
    label: "Economy",
    items: [
      { href: "/admin/merchants",        label: "Merchants",        Icon: Store       },
      { href: "/admin/orders",           label: "Orders",           Icon: ShoppingBag },
      { href: "/admin/appointments",     label: "Appointments",     Icon: CalendarCheck },
      { href: "/admin/quotes",           label: "Quotes",           Icon: Receipt     },
      { href: "/admin/peer-roles",       label: "Peer Roles",       Icon: BadgeCheck  },
      { href: "/admin/service-listings", label: "Service Listings", Icon: Wrench      },
      { href: "/admin/group-buys",       label: "Group Buys",       Icon: Package     },
      { href: "/admin/wallet",           label: "Wallet / Txns",    Icon: Wallet      },
      { href: "/admin/classifieds",      label: "Classifieds",      Icon: Tag         },
      { href: "/admin/ratings",          label: "Ratings",          Icon: Star        },
    ],
  },
  {
    label: "Community",
    items: [
      { href: "/admin/societies",        label: "Societies",        Icon: Building2  },
      { href: "/admin/communities",      label: "Communities",      Icon: UsersRound },
      { href: "/admin/safety",           label: "Safety / SOS",     Icon: Siren      },
      { href: "/admin/lost-found",       label: "Lost & Found",     Icon: MapPin     },
      { href: "/admin/polls",            label: "Polls",            Icon: Vote       },
    ],
  },
  {
    label: "Safety Services",
    items: [
      { href: "/admin/safety-contacts",  label: "Safety Contacts",  Icon: Phone          },
      { href: "/admin/safety-journeys",  label: "Safety Journeys",  Icon: Route          },
      { href: "/admin/volunteers",       label: "Volunteers",       Icon: UserCheck      },
      { href: "/admin/medical-profiles", label: "Medical Profiles", Icon: Stethoscope    },
      { href: "/admin/incidents",        label: "Incident Reports", Icon: TriangleAlert  },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/posts",    label: "Feed Posts", Icon: FileText      },
      { href: "/admin/stories",  label: "Stories",    Icon: Clapperboard  },
      { href: "/admin/events",   label: "Events",     Icon: CalendarDays  },
      { href: "/admin/chat",     label: "Chat",       Icon: MessageSquare },
      { href: "/admin/carpool",  label: "Carpool",    Icon: Car           },
      { href: "/admin/referrals",label: "Referrals",  Icon: Gift          },
    ],
  },
  {
    label: "Ads",
    items: [
      { href: "/admin/ads",             label: "Overview",        Icon: Presentation },
      { href: "/admin/ads/bookings",    label: "Bookings",        Icon: CalendarCheck },
      { href: "/admin/ads/creatives",   label: "Creative Review", Icon: Clapperboard },
      { href: "/admin/ads/campaigns",   label: "Campaigns",       Icon: Megaphone },
      { href: "/admin/ads/advertisers", label: "Advertisers",     Icon: Store },
      { href: "/admin/ads/reports",     label: "Reports",         Icon: TrendingUp },
    ],
  },
  {
    label: "Platform",
    items: [
      { href: "/admin/revenue",      label: "Revenue",       Icon: TrendingUp },
      { href: "/admin/broadcasts",   label: "Broadcasts",    Icon: Megaphone  },
      { href: "/admin/flags",        label: "Feature Flags", Icon: Flag       },
      { href: "/admin/integrations", label: "Integrations",  Icon: Plug       },
      { href: "/admin/audit-log",    label: "Audit Log",     Icon: ScrollText },
    ],
  },
];

// Flat list kept for breadcrumb lookup
const NAV = NAV_GROUPS.flatMap((g) => g.items);

export default function AdminShell({
  children,
  session,
}: {
  children: React.ReactNode;
  session:  Session | null;
}) {
  const path = usePathname();
  const [open, setOpen] = useState(false);           // mobile drawer
  const [collapsed, setCollapsed] = useState(false); // desktop collapse

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(NAV_GROUPS.map((g) => [g.label, true]))
  );

  useEffect(() => {
    const p = path ?? "";
    setOpenGroups((prev) => {
      const next = { ...prev };
      for (const g of NAV_GROUPS) {
        // Only auto-open groups that contain the active route; never auto-close
        if (!next[g.label] && g.items.some((item) => p.startsWith(item.href))) {
          next[g.label] = true;
        }
      }
      return next;
    });
  }, [path]);

  const toggleGroup = (label: string) =>
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));

  // Don't wrap login page in the shell
  if (path === "/admin/login") return <>{children}</>;

  return (
    <div className="flex min-h-screen bg-surface-muted text-foreground">

      {/* ── Mobile overlay ───────────────────────────────────────────── */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex flex-col border-r border-border bg-surface transition-all duration-200
          ${collapsed ? "md:w-14" : "md:w-60"}
          w-60
          ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        {/* Logo + desktop collapse toggle */}
        <div className={`flex h-14 shrink-0 items-center border-b border-border transition-all duration-200 ${collapsed ? "justify-center px-0" : "gap-2.5 px-4"}`}>
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] bg-linear-to-br from-brand-500 to-brand-700 text-xs font-bold text-white">L</span>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold leading-none text-gray-900">lokul.club</p>
              <p className="text-[10px] text-gray-400">Admin panel</p>
            </div>
          )}
          {/* Desktop collapse button */}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="hidden md:flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft size={14} className={`transition-transform duration-200 ${collapsed ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2">
          {NAV_GROUPS.map((group) => {
            const isGroupOpen = openGroups[group.label] ?? false;
            const hasActive = group.items.some((item) => path.startsWith(item.href));

            if (collapsed) {
              // Icon-only mode: show icons with tooltip titles
              return (
                <div key={group.label} className="mb-1">
                  {/* Group divider line */}
                  <div className="mx-1 my-1.5 h-px bg-gray-100" />
                  <div className="space-y-0.5">
                    {group.items.map(({ href, label, Icon }) => {
                      const active = path.startsWith(href);
                      return (
                        <Link
                          key={href}
                          href={href}
                          title={label}
                          onClick={() => setOpen(false)}
                          className={`flex h-8 w-full items-center justify-center rounded-[6px] transition-colors
                            ${active
                              ? "bg-brand-50 text-brand-700"
                              : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"}`}
                        >
                          <Icon size={16} />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            }

            return (
              <div key={group.label} className="mb-1">
                <button
                  onClick={() => toggleGroup(group.label)}
                  className={`flex w-full items-center justify-between rounded-[6px] px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition-colors
                    ${hasActive ? "text-brand-600" : "text-gray-400 hover:text-gray-600"}`}
                >
                  {group.label}
                  <ChevronDown
                    size={11}
                    className={`transition-transform duration-200 ${isGroupOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isGroupOpen && (
                  <div className="mt-0.5 space-y-0.5">
                    {group.items.map(({ href, label, Icon }) => {
                      const active = path.startsWith(href);
                      return (
                        <Link
                          key={href}
                          href={href}
                          onClick={() => setOpen(false)}
                          className={`flex items-center gap-2.5 rounded-[6px] px-2.5 py-1.5 text-[13px] font-medium transition-colors
                            ${active
                              ? "bg-brand-50 text-brand-700"
                              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"}`}
                        >
                          <Icon size={14} className="shrink-0" />
                          <span className="truncate">{label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User + logout */}
        {collapsed ? (
          <div className="border-t border-border p-2 flex justify-center">
            <button
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              title="Sign out"
              className="flex h-8 w-8 items-center justify-center rounded-[6px] text-gray-400 hover:bg-gray-100 hover:text-red-500 transition-colors"
            >
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          <div className="border-t border-border p-3">
            <p className="truncate text-[11px] text-gray-400">{session?.user?.email}</p>
            <Button
              variant="ghost"
              size="sm"
              fullWidth
              leftIcon={<LogOut size={13} />}
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="mt-1.5 justify-start text-gray-500 text-xs"
            >
              Sign out
            </Button>
          </div>
        )}
      </aside>

      {/* ── Main content ──────────────────────────────────────────────── */}
      <div className={`flex flex-1 flex-col transition-all duration-200 ${collapsed ? "md:pl-14" : "md:pl-60"}`}>
        {/* Top bar */}
        <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-border bg-surface px-4 md:px-6">
          {/* Mobile hamburger */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            className="md:hidden p-1.5"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </Button>
          {/* Global search */}
          <div className="hidden md:block w-64">
            <AdminGlobalSearch />
          </div>
          <span className="ml-auto text-xs text-gray-400">
            {session?.user?.name ?? "Admin"}
          </span>
        </header>

        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
