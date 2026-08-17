"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, ShoppingCart, DollarSign, BarChart2, AlertCircle, RefreshCcw } from "lucide-react";

type DayPoint = {
  date: string;
  revenuePaise: number;
  orders: number;
};

type TopItem = {
  name: string;
  quantity: number;
  revenuePaise: number;
};

type EarningsData = {
  thisMonth: { revenuePaise: number; orders: number; avgOrderPaise: number };
  lastMonth: { revenuePaise: number; orders: number };
  last30Days: DayPoint[];
  topItems: TopItem[];
};

function formatRupees(paise: number): string {
  const rupees = paise / 100;
  if (rupees >= 100000) return `₹${(rupees / 100000).toFixed(1)}L`;
  if (rupees >= 1000) return `₹${(rupees / 1000).toFixed(1)}K`;
  return `₹${Math.round(rupees)}`;
}

function formatDateLabel(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function calcPctChange(current: number, prev: number): { value: number; up: boolean } | null {
  if (prev === 0) return null;
  const change = ((current - prev) / prev) * 100;
  return { value: Math.abs(Math.round(change)), up: change >= 0 };
}

export default function EarningsPage() {
  const [data, setData] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/merchant/earnings");
      if (!res.ok) {
        throw new Error("Unable to load earnings");
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Failed to load earnings:", err);
      setError("We couldn’t load your earnings right now. Please refresh or try again later.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-brand-600" />
      </div>
    );
  }

  const thisMonth = data?.thisMonth ?? { revenuePaise: 0, orders: 0, avgOrderPaise: 0 };
  const lastMonth = data?.lastMonth ?? { revenuePaise: 0, orders: 0 };
  const last30Days = data?.last30Days ?? [];
  const topItems = data?.topItems ?? [];

  if (error && !loading) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="w-full max-w-md rounded-md border border-red-200 bg-red-50 p-6 text-center shadow-sm">
          <AlertCircle className="mx-auto mb-3 h-8 w-8 text-red-500" />
          <h2 className="text-lg font-semibold text-red-900">Earnings unavailable</h2>
          <p className="mt-2 text-sm text-red-700">{error}</p>
          <button
            onClick={load}
            className="mt-4 inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            <RefreshCcw className="h-4 w-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  const revenueChange = calcPctChange(thisMonth.revenuePaise, lastMonth.revenuePaise);
  const ordersChange = calcPctChange(thisMonth.orders, lastMonth.orders);

  const maxRevenue = Math.max(...last30Days.map((d) => d.revenuePaise), 1);
  const BAR_MAX_HEIGHT = 80;

  const summaryCards = [
    {
      icon: DollarSign,
      label: "This Month Revenue",
      value: formatRupees(thisMonth.revenuePaise),
      change: revenueChange,
      color: "bg-green-50 text-green-600",
    },
    {
      icon: ShoppingCart,
      label: "This Month Orders",
      value: thisMonth.orders.toLocaleString(),
      change: ordersChange,
      color: "bg-blue-50 text-blue-600",
    },
    {
      icon: BarChart2,
      label: "Avg Order Value",
      value: formatRupees(thisMonth.avgOrderPaise),
      change: null,
      color: "bg-purple-50 text-purple-600",
    },
  ];

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Earnings</h1>
        <p className="mt-1 text-sm text-gray-600">Revenue and sales performance overview</p>
      </div>

      {/* Summary Cards */}
      <div className="mb-8 grid gap-6 sm:grid-cols-3">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-md border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">{card.label}</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{card.value}</p>
                  {card.change !== null ? (
                    <div className="mt-2 flex items-center gap-1">
                      {card.change ? (
                        <>
                          {card.change.up ? (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                          )}
                          <span
                            className={`text-xs font-semibold ${
                              card.change.up ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {card.change.up ? "+" : "-"}{card.change.value}% vs last month
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400">No data last month</span>
                      )}
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-gray-400">this month so far</p>
                  )}
                </div>
                <div className={`rounded-md p-3 ${card.color}`}>
                  <Icon size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Last Month Comparison */}
      <div className="mb-8 rounded-md border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Month Comparison</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-md bg-gray-50 p-4">
            <p className="text-sm font-medium text-gray-500">Last Month Revenue</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {formatRupees(lastMonth.revenuePaise)}
            </p>
            <p className="mt-0.5 text-xs text-gray-400">{lastMonth.orders} completed orders</p>
          </div>
          <div className="rounded-md bg-blue-50 p-4">
            <p className="text-sm font-medium text-blue-600">This Month Revenue</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {formatRupees(thisMonth.revenuePaise)}
            </p>
            <p className="mt-0.5 text-xs text-gray-400">{thisMonth.orders} completed orders</p>
          </div>
        </div>
      </div>

      {/* 30-Day Bar Chart */}
      <div className="mb-8 rounded-md border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-semibold text-gray-900">Revenue — Last 30 Days</h2>

        {last30Days.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-sm text-gray-400">
            No data for the last 30 days
          </div>
        ) : (
          <div className="overflow-x-auto pb-2">
            <div
              className="flex items-end gap-1"
              style={{ minWidth: `${last30Days.length * 24}px` }}
            >
              {last30Days.map((point) => {
                const heightPx =
                  point.revenuePaise > 0
                    ? Math.max(4, Math.round((point.revenuePaise / maxRevenue) * BAR_MAX_HEIGHT))
                    : 2;
                const isZero = point.revenuePaise === 0;
                return (
                  <div
                    key={point.date}
                    className="flex flex-1 min-w-[18px] flex-col items-center gap-0.5"
                    title={`${formatDateLabel(point.date)}: ${formatRupees(point.revenuePaise)} (${point.orders} orders)`}
                  >
                    <div
                      className={`w-full rounded-t-sm transition-all ${
                        isZero ? "bg-gray-200" : "bg-brand-500"
                      }`}
                      style={{ height: `${heightPx}px` }}
                    />
                    {/* Only show label every 5 days to avoid crowding */}
                    {last30Days.indexOf(point) % 5 === 0 && (
                      <span className="text-[9px] text-gray-400 whitespace-nowrap">
                        {formatDateLabel(point.date)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Chart legend */}
        <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-sm bg-brand-500" />
            <span>Revenue</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-sm bg-gray-200" />
            <span>No orders</span>
          </div>
        </div>
      </div>

      {/* Top Items Table */}
      <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Top Items This Month</h2>

        {topItems.length === 0 ? (
          <p className="text-sm text-gray-400">No completed orders this month yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Item
                  </th>
                  <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Qty Sold
                  </th>
                  <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {topItems.map((item, idx) => (
                  <tr key={`${item.name}-${idx}`} className="hover:bg-gray-50">
                    <td className="py-3 font-medium text-gray-900">{item.name}</td>
                    <td className="py-3 text-right text-gray-700">{item.quantity}</td>
                    <td className="py-3 text-right font-semibold text-gray-900">
                      {formatRupees(item.revenuePaise)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
