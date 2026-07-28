"use client";

import { useEffect, useState } from "react";
import { Settings as SettingsIcon, User, Phone, MapPin, Clock, Store, AlertTriangle, XCircle, CheckCircle } from "lucide-react";

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
  acceptingOrders?: boolean;
  closedReason?: string | null;
  closedUntil?: string | null;
  owner: {
    name: string;
    phone: string;
  };
};

export default function SettingsPage() {
  const [merchant, setMerchant] = useState<MerchantProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [acceptingOrders, setAcceptingOrders] = useState(true);
  const [closedReason, setClosedReason] = useState("");
  const [autoReopen, setAutoReopen] = useState(false);
  const [closedUntil, setClosedUntil] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/merchant/auth/session");
        const data = await res.json();
        
        if (!data.authenticated) return;

        const merchantData = {
          ...data.merchant,
          owner: data.user,
        };

        setMerchant(merchantData);
        setAcceptingOrders(merchantData.acceptingOrders ?? true);
        setClosedReason(merchantData.closedReason || "");
        if (merchantData.closedUntil) {
          setAutoReopen(true);
          setClosedUntil(new Date(merchantData.closedUntil).toISOString().slice(0, 16));
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  async function handleToggleOrders(enabled: boolean) {
    setUpdating(true);
    try {
      const res = await fetch("/api/merchant/settings/accepting-orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          acceptingOrders: enabled,
          closedReason: enabled ? null : closedReason || null,
          closedUntil: enabled ? null : autoReopen && closedUntil ? new Date(closedUntil).toISOString() : null,
        }),
      });

      const data = await res.json();
      
      if (res.ok) {
        setAcceptingOrders(enabled);
        if (enabled) {
          setClosedReason("");
          setAutoReopen(false);
          setClosedUntil("");
        }
        alert(data.message);
      } else {
        alert(data.error || "Failed to update settings");
      }
    } catch (error) {
      console.error("Failed to update accepting orders:", error);
      alert("Failed to update settings");
    } finally {
      setUpdating(false);
    }
  }

  async function handleSaveClosedSettings() {
    setUpdating(true);
    try {
      const res = await fetch("/api/merchant/settings/accepting-orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          acceptingOrders: false,
          closedReason: closedReason || null,
          closedUntil: autoReopen && closedUntil ? new Date(closedUntil).toISOString() : null,
        }),
      });

      const data = await res.json();
      
      if (res.ok) {
        alert("Settings updated successfully");
      } else {
        alert(data.error || "Failed to update settings");
      }
    } catch (error) {
      console.error("Failed to update closed settings:", error);
      alert("Failed to update settings");
    } finally {
      setUpdating(false);
    }
  }

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

        {/* Business Operations Card */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
              <Store className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Business Operations</h2>
              <p className="text-sm text-gray-600">Control order acceptance</p>
            </div>
          </div>

          {/* Accept Orders Toggle */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">Accept Orders</h3>
              <p className="text-sm text-gray-600 mt-1">
                {acceptingOrders 
                  ? "Your business is currently accepting orders from customers" 
                  : "Your business is paused. Customers cannot place new orders"}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-4">
              <input 
                type="checkbox" 
                checked={acceptingOrders}
                onChange={(e) => handleToggleOrders(e.target.checked)}
                disabled={updating}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          {/* Closed Settings (shown when disabled) */}
          {!acceptingOrders && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for closing (visible to customers)
                </label>
                <select 
                  value={closedReason}
                  onChange={(e) => setClosedReason(e.target.value)}
                  disabled={updating}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">No reason specified</option>
                  <option value="On vacation">On vacation</option>
                  <option value="Out of stock">Out of stock</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="High demand">High demand - temporarily paused</option>
                  <option value="Holiday">Holiday</option>
                  <option value="Personal reasons">Personal reasons</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              {/* Optional: Auto-reopen */}
              <div>
                <label className="flex items-center gap-2 mb-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={autoReopen}
                    onChange={(e) => setAutoReopen(e.target.checked)}
                    disabled={updating}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Auto-reopen at specific time</span>
                </label>
                {autoReopen && (
                  <input 
                    type="datetime-local"
                    value={closedUntil}
                    onChange={(e) => setClosedUntil(e.target.value)}
                    disabled={updating}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min={new Date().toISOString().slice(0, 16)}
                  />
                )}
              </div>
              
              <button 
                onClick={handleSaveClosedSettings}
                disabled={updating}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {updating ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
          
          {/* Warning message when orders are disabled */}
          {!acceptingOrders && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-900 mb-1">Orders Paused</p>
                <p className="text-sm text-yellow-800">
                  Customers cannot place new orders while your business is paused. Existing orders can still be managed normally.
                </p>
              </div>
            </div>
          )}
          
          {/* Success message when orders are enabled */}
          {acceptingOrders && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-900 mb-1">Accepting Orders</p>
                <p className="text-sm text-green-800">
                  Your business is live and customers can place orders normally.
                </p>
              </div>
            </div>
          )}
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
