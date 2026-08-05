"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Package,
  Clock,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  ChevronRight,
  AlertTriangle,
  Calendar,
  Download,
  UtensilsCrossed,
} from "lucide-react";
import { useMerchantProfile, useProfileLabels } from "@/lib/merchant-profile-context";

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  totalPaise: number;
  createdAt: string;
  scheduledAt?: string | null;
  deliveryMode?: string | null;
  customer: {
    id: string;
    name: string;
    phone: string;
    avatarUrl?: string;
    kycTier: string;
  };
  orderItems: Array<{
    id: string;
    name: string;
    quantity: number;
  }>;
};

type Stats = {
  today: { orders: number; revenuePaise: number };
  pending: number;
  inProgress: number;
  completionRate: number;
};

const STATUS_FILTERS = [
  { value: "all", label: "All Orders", color: "gray" },
  { value: "pending", label: "Pending", color: "yellow" },
  { value: "confirmed", label: "Confirmed", color: "blue" },
  { value: "in_progress", label: "In Progress", color: "purple" },
  { value: "completed", label: "Completed", color: "green" },
  { value: "cancelled", label: "Cancelled", color: "red" },
  { value: "scheduled", label: "Scheduled", color: "indigo" },
];

export default function OrdersPage() {
  const profile = useMerchantProfile();
  const labels = useProfileLabels();
  const isFood = profile === "food";

  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [acceptingOrders, setAcceptingOrders] = useState(true);
  const [kitchenView, setKitchenView] = useState(false);

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch("/api/merchant/orders/stats");
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  }, []);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter === "scheduled") {
        params.set("scheduled", "1");
      } else if (statusFilter && statusFilter !== "all") {
        params.set("status", statusFilter);
      }
      if (searchQuery) params.set("search", searchQuery);
      if (fromDate) params.set("from_date", fromDate);
      if (toDate) params.set("to_date", toDate);

      const res = await fetch(`/api/merchant/orders?${params.toString()}`);
      const data = await res.json();
      setOrders(data.orders || []);
      // Clear selection whenever orders reload
      setSelectedIds(new Set());
    } catch (error) {
      console.error("Failed to load orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery, fromDate, toDate]);

  useEffect(() => {
    loadStats();
    loadOrders();
  }, [loadStats, loadOrders]);

  useEffect(() => {
    async function checkAcceptingOrders() {
      try {
        const res = await fetch("/api/merchant/settings/accepting-orders");
        const data = await res.json();
        setAcceptingOrders(data.acceptingOrders ?? true);
      } catch (error) {
        console.error("Failed to check accepting orders:", error);
      }
    }
    checkAcceptingOrders();
  }, []);

  // --- Bulk selection helpers ---
  const allVisibleIds = orders.map((o) => o.id);
  const allSelected =
    allVisibleIds.length > 0 && allVisibleIds.every((id) => selectedIds.has(id));
  const someSelected = allVisibleIds.some((id) => selectedIds.has(id));

  function toggleSelectAll() {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(allVisibleIds));
    }
  }

  function toggleSelectOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  // --- Bulk actions ---
  async function handleBulkAction(action: "confirm" | "cancel") {
    if (action === "cancel") {
      const ok = window.confirm(
        `Cancel ${selectedIds.size} selected order(s)? This cannot be undone.`
      );
      if (!ok) return;
    }

    setBulkLoading(true);
    try {
      await Promise.all(
        Array.from(selectedIds).map((id) =>
          fetch(`/api/merchant/orders/${id}/status`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action }),
          })
        )
      );
    } catch (error) {
      console.error("Bulk action failed:", error);
    } finally {
      setBulkLoading(false);
      setSelectedIds(new Set());
      loadOrders();
    }
  }

  // --- Export CSV ---
  function handleExportCSV() {
    const header = "Order #,Status,Customer,Phone,Total (₹),Date";
    const rows = orders.map((order) => {
      const dateStr = new Date(order.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
      const total = (order.totalPaise / 100).toFixed(2);
      // Escape fields that may contain commas
      const escape = (v: string) => (v.includes(",") ? `"${v}"` : v);
      return [
        escape(order.orderNumber),
        escape(order.status),
        escape(order.customer.name),
        escape(order.customer.phone),
        total,
        escape(dateStr),
      ].join(",");
    });

    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lokul-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
      confirmed: { label: "Confirmed", className: "bg-blue-100 text-blue-800" },
      in_progress: { label: "In Progress", className: "bg-purple-100 text-purple-800" },
      completed: { label: "Completed", className: "bg-green-100 text-green-800" },
      cancelled: { label: "Cancelled", className: "bg-red-100 text-red-800" },
    };
    const badge = badges[status] || { label: status, className: "bg-gray-100 text-gray-800" };
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{labels.orders}</h1>
          <p className="mt-1 text-sm text-gray-600">
            View and manage customer orders
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isFood && (
            <button
              onClick={() => setKitchenView((v) => !v)}
              className={`inline-flex items-center gap-2 rounded-[6px] border px-4 py-2 text-sm font-medium transition ${
                kitchenView
                  ? "border-orange-500 bg-orange-500 text-white hover:bg-orange-600"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <UtensilsCrossed className="h-4 w-4" />
              Kitchen View
            </button>
          )}
          <button
            onClick={handleExportCSV}
            disabled={orders.length === 0}
            className="inline-flex items-center gap-2 rounded-[6px] border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Alert Banner - Orders Paused */}
      {!acceptingOrders && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-[6px] p-4 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-900 mb-1">Orders Are Currently Paused</p>
            <p className="text-sm text-red-800 mb-3">
              Your business is not accepting new orders. Customers will see that you're temporarily unavailable.
            </p>
            <Link
              href="/merchant/settings"
              className="inline-flex items-center gap-2 bg-red-600 text-white text-sm px-4 py-2 rounded-[6px] hover:bg-red-700 transition-colors"
            >
              Go to Settings to Resume Orders
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Stats Dashboard */}
      {stats && (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-[6px] border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-blue-100">
                <ShoppingCart className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Today's Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.today.orders}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[6px] border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-yellow-100">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending Actions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[6px] border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-purple-100">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[6px] border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-green-100">
                <Package className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Today's Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{(stats.today.revenuePaise / 100).toFixed(0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4">
        {/* Row 1: Select All + Status Tabs + Search */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Select All checkbox */}
            <label className="flex items-center gap-2 cursor-pointer select-none" title="Select all visible orders">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(el) => {
                  if (el) el.indeterminate = someSelected && !allSelected;
                }}
                onChange={toggleSelectAll}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">Select All</span>
            </label>

            {/* Status Tabs */}
            <div className="flex flex-wrap gap-2">
              {STATUS_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setStatusFilter(filter.value)}
                  className={`rounded-[6px] px-4 py-2 text-sm font-medium transition ${
                    statusFilter === filter.value
                      ? "bg-blue-600 text-white"
                      : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order # or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-[6px] border border-gray-300 py-2 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* Row 2: Date Range */}
        <div className="flex flex-wrap items-center gap-3">
          {/* From date */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <label className="sr-only" htmlFor="from-date">From</label>
            <input
              id="from-date"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="rounded-[6px] border border-gray-300 py-2 pl-10 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              aria-label="From date"
            />
            <span className="pointer-events-none absolute -top-2 left-3 bg-white px-1 text-xs text-gray-500">From</span>
          </div>

          {/* To date */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <label className="sr-only" htmlFor="to-date">To</label>
            <input
              id="to-date"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="rounded-[6px] border border-gray-300 py-2 pl-10 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              aria-label="To date"
            />
            <span className="pointer-events-none absolute -top-2 left-3 bg-white px-1 text-xs text-gray-500">To</span>
          </div>

          {/* Clear button — only visible when a date is set */}
          {(fromDate || toDate) && (
            <button
              onClick={() => { setFromDate(""); setToDate(""); }}
              className="rounded-[6px] border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="mb-4 flex items-center gap-4 rounded-[6px] border border-blue-200 bg-blue-50 px-4 py-3">
          <span className="flex-1 text-sm font-medium text-blue-900">
            {selectedIds.size} order{selectedIds.size !== 1 ? "s" : ""} selected
          </span>
          <button
            onClick={() => handleBulkAction("confirm")}
            disabled={bulkLoading}
            className="inline-flex items-center gap-2 rounded-[6px] bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {bulkLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
            Confirm All
          </button>
          <button
            onClick={() => handleBulkAction("cancel")}
            disabled={bulkLoading}
            className="inline-flex items-center gap-2 rounded-[6px] bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {bulkLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
            Cancel All
          </button>
        </div>
      )}

      {/* Orders List */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[6px] border-2 border-dashed border-gray-300 bg-gray-50 py-16">
          <Package className="h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">No orders yet</h3>
          <p className="mt-2 text-sm text-gray-600">
            {statusFilter === "all"
              ? "Your orders will appear here once customers start ordering"
              : statusFilter === "scheduled"
              ? "No scheduled orders found"
              : `No ${statusFilter} orders found`}
          </p>
        </div>
      ) : isFood && kitchenView ? (
        <div>
          {/* Kitchen View: Confirm All Pending */}
          {orders.some((o) => o.status === "pending") && (
            <div className="mb-4">
              <button
                onClick={() => {
                  const pendingIds = orders.filter((o) => o.status === "pending").map((o) => o.id);
                  setBulkLoading(true);
                  Promise.all(
                    pendingIds.map((id) =>
                      fetch(`/api/merchant/orders/${id}/status`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ action: "confirm" }),
                      })
                    )
                  ).finally(() => {
                    setBulkLoading(false);
                    loadOrders();
                  });
                }}
                disabled={bulkLoading}
                className="inline-flex items-center gap-2 rounded-[6px] bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
              >
                {bulkLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                Confirm All Pending
              </button>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            {orders.map((order) => {
              const placedMins = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000);
              const timeAgo = placedMins < 60 ? `${placedMins}m ago` : `${Math.floor(placedMins / 60)}h ago`;
              return (
                <div
                  key={order.id}
                  className="rounded-[6px] border border-gray-200 bg-white p-3 shadow-sm"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-gray-900 truncate">{order.orderNumber}</span>
                    {getStatusBadge(order.status)}
                  </div>
                  <ul className="mb-2 space-y-0.5">
                    {order.orderItems.map((item) => (
                      <li key={item.id} className="text-xs text-gray-700">
                        {item.quantity}× {item.name}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-gray-400">{timeAgo}</p>
                  {order.status === "confirmed" && (
                    <button
                      onClick={() =>
                        fetch(`/api/merchant/orders/${order.id}/status`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ action: "ready" }),
                        }).then(() => loadOrders())
                      }
                      className="mt-2 w-full rounded-[6px] bg-green-600 py-1.5 text-xs font-medium text-white transition hover:bg-green-700"
                    >
                      Mark Ready
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="flex items-start gap-3">
              {/* Row checkbox */}
              <div className="flex items-center pt-5">
                <input
                  type="checkbox"
                  checked={selectedIds.has(order.id)}
                  onChange={() => toggleSelectOne(order.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>

              <Link
                href={`/merchant/orders/${order.id}`}
                className="block flex-1 rounded-[6px] border border-gray-200 bg-white p-4 transition hover:border-blue-300 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  {/* Left: Order Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-lg font-bold text-gray-900">{order.orderNumber}</span>
                      {getStatusBadge(order.status)}
                      {order.deliveryMode && (
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          order.deliveryMode === "home_delivery"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                        }`}>
                          {order.deliveryMode === "home_delivery" ? "Delivery" : "Pickup"}
                        </span>
                      )}
                      {order.scheduledAt && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                          📅 Scheduled:{" "}
                          {new Date(order.scheduledAt).toLocaleString("en-IN", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      )}
                    </div>

                    {/* Customer Info */}
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-600">
                        {order.customer.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{order.customer.name}</p>
                        <p className="text-xs text-gray-600">{order.customer.phone}</p>
                      </div>
                    </div>

                    {/* Items Summary */}
                    <div className="mt-3 text-sm text-gray-600">
                      {order.orderItems.length === 1 ? (
                        <span>1 item: {order.orderItems[0].name}</span>
                      ) : (
                        <span>
                          {order.orderItems.length} items: {order.orderItems[0].name}
                          {order.orderItems.length > 1 && ` +${order.orderItems.length - 1} more`}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Amount & Time */}
                  <div className="ml-4 text-right">
                    <p className="text-lg font-bold text-gray-900">
                      ₹{(order.totalPaise / 100).toFixed(2)}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <ChevronRight className="ml-auto mt-2 h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
