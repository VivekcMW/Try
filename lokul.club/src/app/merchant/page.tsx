"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  TrendingUp, Package, Tag, ShoppingCart, Star, Eye,
  CalendarDays, Clock, Users, BookOpen, Briefcase,
  AlertTriangle, CheckCircle, BookMarked, X, ChevronRight,
} from "lucide-react";
import { useMerchantProfile, useProfileLabels } from "@/lib/merchant-profile-context";
import type { WorkflowProfile } from "@/lib/merchant-profiles";

type MerchantStats = {
  catalogItems: number;
  activeOffers: number;
  pendingOrders: number;
  rating: number;
  reviewCount: number;
  lowStockItems?: number;
};

type StatCard = {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: "blue" | "green" | "orange" | "yellow" | "red" | "purple";
  href?: string;
  subtitle?: string;
};

function getProfileCards(profile: WorkflowProfile, stats: MerchantStats, labels: ReturnType<typeof useProfileLabels>): StatCard[] {
  const common: StatCard[] = [
    {
      icon: Star,
      label: "Rating",
      value: stats.rating ? `${stats.rating.toFixed(1)} ★` : "New",
      color: "yellow",
      subtitle: `${stats.reviewCount} reviews`,
    },
  ];

  switch (profile) {
    case "food":
      return [
        { icon: ShoppingCart,  label: "Pending Orders",   value: stats.pendingOrders, color: "orange", href: "/merchant/orders" },
        { icon: BookOpen,      label: "Menu Items",        value: stats.catalogItems,  color: "blue",   href: "/merchant/catalog" },
        { icon: Tag,           label: "Active Offers",     value: stats.activeOffers,  color: "green",  href: "/merchant/offers" },
        ...common,
      ];

    case "appointments":
      return [
        { icon: CalendarDays,  label: "Pending Bookings",  value: stats.pendingOrders, color: "orange", href: "/merchant/orders" },
        { icon: Package,       label: "Services",           value: stats.catalogItems,  color: "blue",   href: "/merchant/catalog" },
        { icon: Tag,           label: "Active Offers",     value: stats.activeOffers,  color: "green",  href: "/merchant/offers" },
        ...common,
      ];

    case "home_services":
      return [
        { icon: Briefcase,     label: "Open Requests",     value: stats.pendingOrders, color: "orange", href: "/merchant/orders" },
        { icon: Package,       label: "Services Listed",   value: stats.catalogItems,  color: "blue",   href: "/merchant/catalog" },
        { icon: Tag,           label: "Active Offers",     value: stats.activeOffers,  color: "green",  href: "/merchant/offers" },
        ...common,
      ];

    case "subscriptions":
      return [
        { icon: Users,         label: "Active Subscribers",value: stats.pendingOrders, color: "purple", href: "/merchant/orders" },
        { icon: Package,       label: "Plans",              value: stats.catalogItems,  color: "blue",   href: "/merchant/catalog" },
        { icon: Tag,           label: "Active Offers",     value: stats.activeOffers,  color: "green",  href: "/merchant/offers" },
        ...common,
      ];

    case "events":
      return [
        { icon: BookMarked,    label: "Pending Enquiries", value: stats.pendingOrders, color: "orange", href: "/merchant/orders" },
        { icon: Package,       label: "Packages",           value: stats.catalogItems,  color: "blue",   href: "/merchant/catalog" },
        { icon: Tag,           label: "Active Offers",     value: stats.activeOffers,  color: "green",  href: "/merchant/offers" },
        ...common,
      ];

    default: // retail
      return [
        { icon: Package,       label: "Catalog Items",     value: stats.catalogItems,  color: "blue",   href: "/merchant/catalog" },
        { icon: Tag,           label: "Active Offers",     value: stats.activeOffers,  color: "green",  href: "/merchant/offers" },
        { icon: ShoppingCart,  label: "Pending Orders",    value: stats.pendingOrders, color: "orange", href: "/merchant/orders" },
        ...common,
        ...(stats.lowStockItems
          ? [{ icon: AlertTriangle, label: "Low Stock Items", value: stats.lowStockItems, color: "red" as const, href: "/merchant/catalog" }]
          : []),
      ];
  }
}

function getQuickActions(profile: WorkflowProfile, labels: ReturnType<typeof useProfileLabels>) {
  switch (profile) {
    case "food":
      return [
        { href: "/merchant/catalog", icon: BookOpen, title: "Update Menu", desc: "Add or edit menu items", color: "blue" },
        { href: "/merchant/offers",  icon: Tag,       title: "Create Offer",  desc: "Launch a promotion",     color: "green" },
        { href: "/merchant/orders",  icon: ShoppingCart, title: "View Orders", desc: "Process pending orders", color: "orange" },
      ];
    case "appointments":
      return [
        { href: "/merchant/slots",   icon: CalendarDays, title: "Manage Schedule", desc: "Add or edit slots",    color: "blue" },
        { href: "/merchant/catalog", icon: Package,      title: "Add Service",     desc: "New service type",    color: "green" },
        { href: "/merchant/orders",  icon: CheckCircle,  title: "View Bookings",   desc: "Confirm bookings",    color: "orange" },
      ];
    case "home_services":
      return [
        { href: "/merchant/catalog", icon: Package,   title: "Add Service",   desc: "List a new service",   color: "blue" },
        { href: "/merchant/orders",  icon: Briefcase, title: "View Requests", desc: "Respond to requests",  color: "orange" },
        { href: "/merchant/offers",  icon: Tag,       title: "Create Offer",  desc: "Attract more clients", color: "green" },
      ];
    default:
      return [
        { href: "/merchant/catalog", icon: Package,      title: `Add ${labels.catalogItem}`, desc: `Add to your ${labels.catalog.toLowerCase()}`, color: "blue" },
        { href: "/merchant/offers",  icon: Tag,           title: "Create Offer",              desc: "Launch a new promotion",   color: "green" },
        { href: "/merchant/orders",  icon: ShoppingCart,  title: `View ${labels.orders}`,     desc: "Process pending items",    color: "orange" },
      ];
  }
}

type ChecklistItem = {
  id: string;
  label: string;
  description: string;
  done: boolean;
  href: string;
  points: number;
};

type ChecklistData = {
  checks: ChecklistItem[];
  completionPct: number;
  totalPoints: number;
  earnedPoints: number;
};

const DISMISS_KEY = "lokul_onboarding_dismissed";

function OnboardingChecklist() {
  const [data, setData] = useState<ChecklistData | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem(DISMISS_KEY)) {
      setDismissed(true);
      return;
    }

    fetch("/api/merchant/onboarding/checklist")
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((d) => {
        if (d) setData(d);
      })
      .catch(() => {});
  }, []);

  function dismiss() {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  }

  if (dismissed || !data || data.completionPct >= 100) return null;

  const incompleteItems = data.checks.filter((c) => !c.done);

  return (
    <div className="mb-6 rounded-[6px] border border-amber-200 bg-amber-50 p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-amber-600" />
          <h3 className="font-semibold text-amber-900">Complete your profile</h3>
          <span className="rounded-full bg-amber-200 px-2 py-0.5 text-xs font-bold text-amber-800">
            {data.completionPct}%
          </span>
        </div>
        <button onClick={dismiss} className="text-amber-400 hover:text-amber-700">
          <X size={18} />
        </button>
      </div>

      <div className="mb-4 h-2 rounded-full bg-amber-200">
        <div
          className="h-2 rounded-full bg-amber-500 transition-all"
          style={{ width: `${data.completionPct}%` }}
        />
      </div>

      <div className="space-y-2">
        {incompleteItems.slice(0, 3).map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="flex items-start gap-3 rounded-[6px] bg-white p-3 hover:bg-amber-50"
          >
            <div className="mt-0.5 h-4 w-4 flex-shrink-0 rounded-full border-2 border-amber-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">{item.label}</p>
              <p className="text-xs text-gray-500">{item.description}</p>
            </div>
            <ChevronRight size={16} className="ml-auto flex-shrink-0 text-amber-400" />
          </Link>
        ))}
      </div>

      {incompleteItems.length > 3 && (
        <p className="mt-2 text-xs text-amber-700">+{incompleteItems.length - 3} more tasks</p>
      )}
    </div>
  );
}

const COLOR_MAP = {
  blue:   "bg-blue-50 text-blue-600",
  green:  "bg-green-50 text-green-600",
  orange: "bg-orange-50 text-orange-600",
  yellow: "bg-yellow-50 text-yellow-600",
  red:    "bg-red-50 text-red-600",
  purple: "bg-purple-50 text-purple-600",
};

export default function MerchantDashboardPage() {
  const profile = useMerchantProfile();
  const labels = useProfileLabels();
  const [stats, setStats] = useState<MerchantStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const sessionRes = await fetch("/api/merchant/auth/session");
        const sessionData = await sessionRes.json();

        if (!sessionData.authenticated) return;

        const merchantId = sessionData.merchant.id;

        const [catalogRes, offersRes, ordersRes] = await Promise.all([
          fetch(`/api/mobile/merchants/${merchantId}/catalog`),
          fetch(`/api/mobile/merchants/${merchantId}/offers?activeOnly=1`),
          fetch(`/api/merchant/orders?status=pending&limit=50`),
        ]);

        const catalogData = await catalogRes.json();
        const offersData  = await offersRes.json();
        const ordersData  = await ordersRes.json();

        const allItems: Array<{ stockCount?: number | null }> = catalogData.items ?? [];
        const lowStockItems = allItems.filter(
          (i) => i.stockCount !== null && i.stockCount !== undefined && i.stockCount < 5
        ).length;

        setStats({
          catalogItems:  allItems.length,
          activeOffers:  offersData.offers?.length ?? 0,
          pendingOrders: ordersData.orders?.length ?? 0,
          rating:        sessionData.merchant.ratingAvg ?? 0,
          reviewCount:   sessionData.merchant.ratingCount ?? 0,
          lowStockItems: lowStockItems || undefined,
        });
      } catch (error) {
        console.error("Failed to load stats:", error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-brand-600" />
      </div>
    );
  }

  const statCards = getProfileCards(profile, stats ?? {
    catalogItems: 0, activeOffers: 0, pendingOrders: 0, rating: 0, reviewCount: 0,
  }, labels);

  const quickActions = getQuickActions(profile, labels);

  const tipByProfile: Record<WorkflowProfile, string> = {
    retail:        "Add at least 10 catalog items and create a welcome offer. Businesses with active offers get 3× more visibility on the resident feed.",
    food:          "Keep your menu up-to-date daily. Toggle item availability each morning and add a happy-hour offer to drive repeat orders.",
    appointments:  "Keep your slots filled — add next 2 weeks of availability. Respond to booking requests within 30 minutes to maximise confirmations.",
    home_services: "Respond to quote requests within 1 hour. Add your service area and a profile photo to build trust with new customers.",
    subscriptions: "Make sure today's delivery list is confirmed by 8 AM. Pause inactive subscribers to keep your numbers accurate.",
    events:        "Reply to all enquiries within 4 hours. Add a portfolio photo to your catalog to stand out to event planners.",
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">Overview of your business performance</p>
      </div>

      <OnboardingChecklist />

      {/* Stats Grid */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          const colorClass = COLOR_MAP[card.color];
          return (
            <div
              key={card.label}
              className="rounded-[6px] border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">{card.label}</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{card.value}</p>
                  {card.subtitle && (
                    <p className="mt-1 text-xs text-gray-500">{card.subtitle}</p>
                  )}
                </div>
                <div className={`rounded-[6px] p-3 ${colorClass}`}>
                  <Icon size={24} />
                </div>
              </div>
              {card.href && (
                <Link
                  href={card.href}
                  className="mt-4 inline-flex text-sm font-medium text-brand-600 hover:text-brand-700"
                >
                  View all →
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="rounded-[6px] border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            const colorClass = COLOR_MAP[action.color as keyof typeof COLOR_MAP];
            return (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-3 rounded-[6px] border border-gray-200 p-4 transition hover:border-brand-300 hover:bg-brand-50"
              >
                <Icon className={`h-5 w-5 ${colorClass.split(" ")[1]}`} />
                <div>
                  <p className="font-medium text-gray-900">{action.title}</p>
                  <p className="text-xs text-gray-600">{action.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Tip */}
      <div className="mt-6 rounded-[6px] border border-blue-200 bg-blue-50 p-6">
        <div className="flex items-start gap-3">
          <Eye className="h-5 w-5 flex-shrink-0 text-blue-600" />
          <div>
            <h3 className="font-semibold text-blue-900">Pro Tip</h3>
            <p className="mt-1 text-sm text-blue-800">{tipByProfile[profile]}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
