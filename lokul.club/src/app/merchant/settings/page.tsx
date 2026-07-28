"use client";

import { useEffect, useState } from "react";
import { Settings as SettingsIcon, User, Phone, MapPin, Clock, Store } from "lucide-react";

type MerchantProfile = {
  id: string;
  name: string;
  category: string;
  description?: string | null;
  address?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  status: string;
  ratingAvg?: number | null;
  ratingCount?: number | null;
  owner: {
    name: string;
    phone: string;
  };
};

export default function SettingsPage() {
  const [merchant, setMerchant] = useState<MerchantProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/merchant/auth/session");
        const data = await res.json();
        
        if (!data.authenticated) return;

        setMerchant({
          ...data.merchant,
          owner: data.user,
        });
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-mw-primary-600" />
      </div>
    );
  }

  if (!merchant) {
    return null;
  }

  const statusColor = {
    active: "bg-green-100 text-green-700",
    pending_verification: "bg-yellow-100 text-yellow-700",
    rejected: "bg-red-100 text-red-700",
    suspended: "bg-red-100 text-red-700",
  }[merchant.status] ?? "bg-gray-100 text-gray-700";

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your business profile and account settings
        </p>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* Business Profile Card */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-mw-primary-600">
              <Store className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Business Profile</h2>
              <p className="text-sm text-gray-600">Your business information</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Business Name</label>
                <p className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-base text-gray-900">
                  {merchant.name}
                </p>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
                <p className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-base text-gray-900">
                  {merchant.category}
                </p>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
              <p className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-base text-gray-900">
                {merchant.description || "No description added"}
              </p>
            </div>

            {merchant.address && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Address</label>
                <div className="flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5">
                  <MapPin size={18} className="mt-0.5 text-gray-500" />
                  <p className="flex-1 text-base text-gray-900">{merchant.address}</p>
                </div>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              {merchant.phone && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Business Phone</label>
                  <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5">
                    <Phone size={16} className="text-gray-500" />
                    <p className="text-base text-gray-900">{merchant.phone}</p>
                  </div>
                </div>
              )}
              {merchant.whatsapp && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">WhatsApp</label>
                  <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5">
                    <Phone size={16} className="text-gray-500" />
                    <p className="text-base text-gray-900">{merchant.whatsapp}</p>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Account Status</label>
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${statusColor}`}>
                {merchant.status.replace(/_/g, " ").toUpperCase()}
              </span>
            </div>

            {merchant.ratingAvg != null && merchant.ratingAvg > 0 && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-gray-900">{merchant.ratingAvg.toFixed(1)} ★</div>
                  <div className="text-sm text-gray-600">
                    ({merchant.ratingCount ?? 0} {merchant.ratingCount === 1 ? "review" : "reviews"})
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm text-blue-900">
              <strong>Need to update your profile?</strong> Contact support or use the mobile app to edit your business information.
            </p>
          </div>
        </div>

        {/* Owner Information Card */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-600">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Owner Information</h2>
              <p className="text-sm text-gray-600">Account owner details</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Owner Name</label>
              <p className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-base text-gray-900">
                {merchant.owner.name}
              </p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Owner Phone</label>
              <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5">
                <Phone size={16} className="text-gray-500" />
                <p className="text-base text-gray-900">{merchant.owner.phone}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Security Card */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-600">
              <SettingsIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Security</h2>
              <p className="text-sm text-gray-600">Account security settings</p>
            </div>
          </div>

          <p className="text-sm text-gray-600">
            Your account is secured with OTP-based authentication. Every login requires verification via OTP sent to your registered mobile number.
          </p>

          <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <p className="text-sm text-yellow-900">
              <strong>Keep your account safe:</strong> Never share your OTP with anyone. Lokul will never ask for your OTP over phone or email.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
