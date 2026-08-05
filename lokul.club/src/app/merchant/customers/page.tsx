"use client";

import { useEffect, useState } from "react";
import { Search, Users, Phone } from "lucide-react";

type Customer = {
  id: string;
  name: string;
  phone: string;
  avatarUrl: string | null;
  kycTier: string;
  orderCount: number;
  totalSpentPaise: number;
  lastOrderAt: string;
  firstOrderAt: string;
};

function formatRupees(paise: number): string {
  const rupees = paise / 100;
  if (rupees >= 100000) return `₹${(rupees / 100000).toFixed(1)}L`;
  if (rupees >= 1000) return `₹${(rupees / 1000).toFixed(1)}K`;
  return `₹${Math.round(rupees)}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getLoyaltyTier(orderCount: number): { label: string; className: string } {
  if (orderCount >= 5) {
    return { label: "VIP", className: "bg-yellow-100 text-yellow-800 border border-yellow-300" };
  }
  if (orderCount >= 2) {
    return { label: "Regular", className: "bg-blue-100 text-blue-800 border border-blue-300" };
  }
  return { label: "New", className: "bg-gray-100 text-gray-700 border border-gray-300" };
}

function getInitial(name: string): string {
  return (name ?? "?").charAt(0).toUpperCase();
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/merchant/customers");
        if (res.ok) {
          const data = await res.json();
          setCustomers(data.customers ?? []);
        }
      } catch (err) {
        console.error("Failed to load customers:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) || c.phone.includes(q)
    );
  });

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-brand-600" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
            <p className="mt-1 text-sm text-gray-600">Loyalty tracking and customer insights</p>
          </div>
          {customers.length > 0 && (
            <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
              {customers.length}
            </span>
          )}
        </div>

        {/* Search */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {/* Tier Legend */}
      <div className="mb-6 flex flex-wrap gap-3">
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-semibold text-yellow-800 border border-yellow-300">
            VIP
          </span>
          <span className="text-xs text-gray-500">5+ orders</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800 border border-blue-300">
            Regular
          </span>
          <span className="text-xs text-gray-500">2–4 orders</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-700 border border-gray-300">
            New
          </span>
          <span className="text-xs text-gray-500">1 order</span>
        </div>
      </div>

      {/* Customer List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 bg-gray-50 py-16">
          <Users className="h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            {search ? "No customers match your search" : "No customers yet"}
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            {search
              ? "Try a different name or phone number."
              : "Orders will appear here once customers start buying."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((customer) => {
            const tier = getLoyaltyTier(customer.orderCount);
            return (
              <div
                key={customer.id}
                className="flex items-center gap-4 rounded-md border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
              >
                {/* Avatar */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100 text-lg font-bold text-brand-700">
                  {getInitial(customer.name)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base font-semibold text-gray-900 truncate">
                      {customer.name}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${tier.className}`}
                    >
                      {tier.label}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                    <Phone className="h-3.5 w-3.5" />
                    <span>{customer.phone}</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-400">
                    Last order: {formatDate(customer.lastOrderAt)}
                  </p>
                </div>

                {/* Stats */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700">
                      {customer.orderCount} {customer.orderCount === 1 ? "order" : "orders"}
                    </span>
                  </div>
                  <span className="text-base font-bold text-gray-900">
                    {formatRupees(customer.totalSpentPaise)}
                  </span>
                  <span className="text-xs text-gray-400">total spent</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
