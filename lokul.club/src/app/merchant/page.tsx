"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Package, Tag, ShoppingCart, Star, Eye } from "lucide-react";

type MerchantStats = {
  catalogItems: number;
  activeOffers: number;
  pendingOrders: number;
  rating: number;
  reviewCount: number;
};

export default function MerchantDashboardPage() {
  const [stats, setStats] = useState<MerchantStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const sessionRes = await fetch("/api/merchant/auth/session");
        const sessionData = await sessionRes.json();
        
        if (!sessionData.authenticated) return;

        const merchantId = sessionData.merchant.id;

        // Load stats in parallel
        const [catalogRes, offersRes] = await Promise.all([
          fetch(`/api/mobile/merchants/${merchantId}/catalog`),
          fetch(`/api/mobile/merchants/${merchantId}/offers?activeOnly=1`),
        ]);

        const catalogData = await catalogRes.json();
        const offersData = await offersRes.json();

        setStats({
          catalogItems: catalogData.items?.length ?? 0,
          activeOffers: offersData.offers?.length ?? 0,
          pendingOrders: 0, // TODO: Wire to real orders API when built
          rating: sessionData.merchant.ratingAvg ?? 0,
          reviewCount: sessionData.merchant.ratingCount ?? 0,
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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-mw-primary-600" />
      </div>
    );
  }

  const statCards = [
    {
      icon: Package,
      label: "Catalog Items",
      value: stats?.catalogItems ?? 0,
      color: "blue",
      href: "/merchant/catalog",
    },
    {
      icon: Tag,
      label: "Active Offers",
      value: stats?.activeOffers ?? 0,
      color: "green",
      href: "/merchant/offers",
    },
    {
      icon: ShoppingCart,
      label: "Pending Orders",
      value: stats?.pendingOrders ?? 0,
      color: "orange",
      href: "/merchant/orders",
    },
    {
      icon: Star,
      label: "Rating",
      value: stats?.rating ? `${stats.rating.toFixed(1)} ★` : "New",
      color: "yellow",
      subtitle: `${stats?.reviewCount ?? 0} reviews`,
    },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Overview of your business performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          const colorClasses = {
            blue: "bg-blue-50 text-blue-600",
            green: "bg-green-50 text-green-600",
            orange: "bg-orange-50 text-orange-600",
            yellow: "bg-yellow-50 text-yellow-600",
          }[card.color];

          return (
            <div
              key={card.label}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">{card.label}</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{card.value}</p>
                  {card.subtitle && (
                    <p className="mt-1 text-xs text-gray-500">{card.subtitle}</p>
                  )}
                </div>
                <div className={`rounded-lg p-3 ${colorClasses}`}>
                  <Icon size={24} />
                </div>
              </div>
              {card.href && (
                <a
                  href={card.href}
                  className="mt-4 inline-flex text-sm font-medium text-mw-primary-600 hover:text-mw-primary-700"
                >
                  View all →
                </a>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <a
            href="/merchant/catalog"
            className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 transition hover:border-mw-primary-300 hover:bg-mw-primary-50"
          >
            <Package className="h-5 w-5 text-mw-primary-600" />
            <div>
              <p className="font-medium text-gray-900">Add Product</p>
              <p className="text-xs text-gray-600">Add new items to catalog</p>
            </div>
          </a>
          <a
            href="/merchant/offers"
            className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 transition hover:border-green-300 hover:bg-green-50"
          >
            <Tag className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium text-gray-900">Create Offer</p>
              <p className="text-xs text-gray-600">Launch a new promotion</p>
            </div>
          </a>
          <a
            href="/merchant/orders"
            className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 transition hover:border-orange-300 hover:bg-orange-50"
          >
            <ShoppingCart className="h-5 w-5 text-orange-600" />
            <div>
              <p className="font-medium text-gray-900">View Orders</p>
              <p className="text-xs text-gray-600">Process pending orders</p>
            </div>
          </a>
        </div>
      </div>

      {/* Tips */}
      <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-6">
        <div className="flex items-start gap-3">
          <Eye className="h-5 w-5 flex-shrink-0 text-blue-600" />
          <div>
            <h3 className="font-semibold text-blue-900">Pro Tip</h3>
            <p className="mt-1 text-sm text-blue-800">
              Add at least 10 catalog items and create a welcome offer to attract more customers. 
              Businesses with active offers get 3x more visibility on the resident feed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
