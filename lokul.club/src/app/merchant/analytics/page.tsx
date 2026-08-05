"use client";

import { useEffect, useState } from "react";
import { ShoppingCart, TrendingUp, BarChart2, CheckCircle } from "lucide-react";

type Summary = {
  totalOrders: number;
  completedOrders: number;
  totalRevenuePaise: number;
  avgOrderValuePaise: number;
  completionRate: number;
};

type WeeklyPoint = {
  day: string;
  orders: number;
  revenuePaise: number;
};

type MonthlyPoint = {
  week: string;
  orders: number;
  revenuePaise: number;
};

type Funnel = {
  views: number;
  clicks: number;
  orders: number;
  completions: number;
};

type AnalyticsData = {
  summary: Summary;
  weekly: WeeklyPoint[];
  monthly: MonthlyPoint[];
  funnel: Funnel;
};

type Period = "weekly" | "monthly";

function formatRupees(paise: number): string {
  const rupees = paise / 100;
  if (rupees >= 100000) return `₹${(rupees / 100000).toFixed(1)}L`;
  if (rupees >= 1000) return `₹${(rupees / 1000).toFixed(1)}K`;
  return `₹${Math.round(rupees)}`;
}

function pct(num: number, denom: number): string {
  if (!denom) return "0%";
  return `${Math.round((num / denom) * 100)}%`;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("weekly");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/merchant/analytics");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Failed to load analytics:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-brand-600" />
      </div>
    );
  }

  const summary = data?.summary ?? {
    totalOrders: 0,
    completedOrders: 0,
    totalRevenuePaise: 0,
    avgOrderValuePaise: 0,
    completionRate: 0,
  };

  const chartPoints: { label: string; orders: number }[] =
    period === "weekly"
      ? (data?.weekly ?? []).map((p) => ({ label: p.day, orders: p.orders }))
      : (data?.monthly ?? []).map((p) => ({ label: p.week, orders: p.orders }));

  const maxOrders = Math.max(...chartPoints.map((p) => p.orders), 1);

  const funnel = data?.funnel ?? { views: 0, clicks: 0, orders: 0, completions: 0 };

  const funnelSteps = [
    { label: "Views", count: funnel.views, color: "bg-blue-500" },
    { label: "Clicks", count: funnel.clicks, color: "bg-indigo-500" },
    { label: "Orders", count: funnel.orders, color: "bg-purple-500" },
    { label: "Completions", count: funnel.completions, color: "bg-green-500" },
  ];

  const summaryCards = [
    {
      icon: ShoppingCart,
      label: "Total Orders",
      value: summary.totalOrders.toLocaleString(),
      color: "bg-blue-50 text-blue-600",
    },
    {
      icon: TrendingUp,
      label: "Revenue",
      value: formatRupees(summary.totalRevenuePaise),
      color: "bg-green-50 text-green-600",
    },
    {
      icon: BarChart2,
      label: "Avg Order Value",
      value: formatRupees(summary.avgOrderValuePaise),
      color: "bg-purple-50 text-purple-600",
    },
    {
      icon: CheckCircle,
      label: "Completion Rate",
      value: `${Math.round(summary.completionRate)}%`,
      color: "bg-orange-50 text-orange-600",
    },
  ];

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-1 text-sm text-gray-600">Track your business performance over time</p>
        </div>
        <div className="flex rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
          <button
            onClick={() => setPeriod("weekly")}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
              period === "weekly"
                ? "bg-brand-600 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setPeriod("monthly")}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
              period === "monthly"
                ? "bg-brand-600 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">{card.label}</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{card.value}</p>
                </div>
                <div className={`rounded-lg p-3 ${card.color}`}>
                  <Icon size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bar Chart */}
      <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-semibold text-gray-900">Orders Over Time</h2>

        {chartPoints.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-sm text-gray-400">
            No data available for this period
          </div>
        ) : (
          <div className="flex items-end gap-3 overflow-x-auto pb-2">
            {chartPoints.map((point) => {
              const heightPx = Math.max(4, Math.round((point.orders / maxOrders) * 120));
              return (
                <div
                  key={point.label}
                  className="flex min-w-[2.5rem] flex-1 flex-col items-center gap-1"
                >
                  <span className="text-xs font-semibold text-gray-700">
                    {point.orders > 0 ? point.orders : ""}
                  </span>
                  <div
                    className="w-full rounded-t-md bg-brand-500 transition-all"
                    style={{ height: `${heightPx}px` }}
                    title={`${point.label}: ${point.orders} orders`}
                  />
                  <span className="text-xs text-gray-500">{point.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Conversion Funnel */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-semibold text-gray-900">Conversion Funnel</h2>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
          {funnelSteps.map((step, idx) => {
            const prevCount = idx === 0 ? step.count : funnelSteps[idx - 1].count;
            const conversionFromPrev = idx === 0 ? null : pct(step.count, prevCount);
            const widthPct = funnelSteps[0].count
              ? Math.max(20, Math.round((step.count / funnelSteps[0].count) * 100))
              : 100;

            return (
              <div key={step.label} className="flex flex-1 flex-col items-center gap-2">
                {conversionFromPrev && (
                  <div className="hidden items-center sm:flex">
                    <span className="text-xs font-medium text-gray-400">{conversionFromPrev}</span>
                    <span className="ml-1 text-gray-300">→</span>
                  </div>
                )}
                <div
                  className={`${step.color} flex flex-col items-center justify-center rounded-lg p-4 text-white`}
                  style={{
                    width: `${widthPct}%`,
                    minWidth: "80px",
                    alignSelf: "center",
                  }}
                >
                  <span className="text-xl font-bold">{step.count.toLocaleString()}</span>
                  <span className="mt-0.5 text-xs font-medium opacity-90">{step.label}</span>
                </div>
                {conversionFromPrev && (
                  <span className="text-xs font-medium text-gray-500 sm:hidden">
                    {conversionFromPrev} from {funnelSteps[idx - 1].label}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Funnel conversion summary */}
        <div className="mt-6 grid grid-cols-3 gap-4 rounded-lg bg-gray-50 p-4">
          <div className="text-center">
            <p className="text-xs text-gray-500">Click Rate</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">
              {pct(funnel.clicks, funnel.views)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Order Rate</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">
              {pct(funnel.orders, funnel.clicks)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Completion Rate</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">
              {pct(funnel.completions, funnel.orders)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
