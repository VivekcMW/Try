"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Ticket, X, Loader2, Trash2 } from "lucide-react";

type Coupon = {
  id: string;
  code: string;
  description: string | null;
  discountType: "percent_off" | "flat_off";
  discountValue: number;
  minSpendPaise: number | null;
  maxUsesTotal: number | null;
  maxUsesPerUser: number;
  usedCount: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
};

type FormState = {
  code: string;
  discountType: "percent_off" | "flat_off";
  discountValue: string;
  minSpendRupees: string;
  maxUsesTotal: string;
  expiresAt: string;
  description: string;
};

const defaultForm: FormState = {
  code: "",
  discountType: "percent_off",
  discountValue: "",
  minSpendRupees: "",
  maxUsesTotal: "",
  expiresAt: "",
  description: "",
};

function formatDiscount(coupon: Coupon): string {
  if (coupon.discountType === "percent_off") {
    return `${coupon.discountValue}% off`;
  }
  return `₹${(coupon.discountValue / 100).toFixed(0)} off`;
}

function formatExpiry(dateStr: string | null): { text: string; expired: boolean } {
  if (!dateStr) return { text: "No expiry", expired: false };
  const date = new Date(dateStr);
  const expired = date < new Date();
  const text = `Expires ${date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}`;
  return { text, expired };
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [formError, setFormError] = useState<string>("");

  const loadCoupons = useCallback(async () => {
    try {
      const res = await fetch("/api/merchant/coupons");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setCoupons(data.coupons ?? []);
    } catch (err) {
      console.error("Failed to load coupons:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCoupons();
  }, [loadCoupons]);

  const handleCreate = async () => {
    setFormError("");

    const code = form.code.trim().toUpperCase();
    if (!code) {
      setFormError("Coupon code is required.");
      return;
    }
    if (!/^[A-Z0-9]{3,20}$/.test(code)) {
      setFormError("Code must be 3–20 alphanumeric characters (A-Z, 0-9).");
      return;
    }
    const dv = parseFloat(form.discountValue);
    if (!form.discountValue || isNaN(dv) || dv <= 0) {
      setFormError("Discount value must be greater than 0.");
      return;
    }
    if (form.discountType === "percent_off" && (dv <= 0 || dv >= 100)) {
      setFormError("Percentage discount must be between 1 and 99.");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/merchant/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          discountType: form.discountType,
          discountValue: dv,
          minSpendRupees: form.minSpendRupees ? parseFloat(form.minSpendRupees) : null,
          maxUsesTotal: form.maxUsesTotal ? parseInt(form.maxUsesTotal, 10) : null,
          expiresAt: form.expiresAt || null,
          description: form.description || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error ?? "Failed to create coupon.");
        return;
      }

      setForm(defaultForm);
      setShowCreateModal(false);
      await loadCoupons();
    } catch (err) {
      setFormError("Something went wrong. Please try again.");
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (coupon: Coupon) => {
    // Optimistic update
    setCoupons((prev) =>
      prev.map((c) => (c.id === coupon.id ? { ...c, isActive: !coupon.isActive } : c))
    );

    try {
      const res = await fetch(`/api/merchant/coupons/${coupon.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !coupon.isActive }),
      });
      if (!res.ok) throw new Error("Toggle failed");
    } catch (err) {
      // Revert
      setCoupons((prev) =>
        prev.map((c) => (c.id === coupon.id ? { ...c, isActive: coupon.isActive } : c))
      );
      console.error("Failed to toggle coupon:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this coupon? This cannot be undone.")) return;

    // Optimistic delete
    setCoupons((prev) => prev.filter((c) => c.id !== id));

    try {
      const res = await fetch(`/api/merchant/coupons/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
    } catch (err) {
      console.error("Failed to delete coupon:", err);
      await loadCoupons(); // Reload on failure
    }
  };

  const openModal = () => {
    setForm(defaultForm);
    setFormError("");
    setShowCreateModal(true);
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900">Discount Coupons</h1>
          <p className="mt-1 text-sm text-gray-600">
            Create and manage coupon codes to offer discounts to your customers
          </p>
        </div>
        <button
          onClick={openModal}
          className="flex flex-shrink-0 items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md active:scale-95"
        >
          <Plus size={18} />
          Create Coupon
        </button>
      </div>

      {/* Empty state */}
      {coupons.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 py-16">
          <Ticket className="h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">No coupons yet</h3>
          <p className="mt-2 max-w-sm text-center text-sm text-gray-600">
            Create your first discount code to attract customers.
          </p>
          <button
            onClick={openModal}
            className="mt-6 flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Plus size={18} />
            Create Coupon
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {coupons.map((coupon) => {
            const { text: expiryText, expired } = formatExpiry(coupon.expiresAt);

            return (
              <div
                key={coupon.id}
                className={`flex items-center gap-4 rounded-xl border bg-white p-4 shadow-sm transition hover:shadow-md ${
                  expired ? "border-red-200 bg-red-50/40" : "border-gray-200"
                }`}
              >
                {/* Icon */}
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50">
                  <Ticket className="h-6 w-6 text-blue-600" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-base font-bold text-gray-900">
                      {coupon.code}
                    </span>
                    <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                      {formatDiscount(coupon)}
                    </span>
                    {coupon.minSpendPaise != null && (
                      <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                        Min ₹{(coupon.minSpendPaise / 100).toFixed(0)}
                      </span>
                    )}
                    {expired && (
                      <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
                        Expired
                      </span>
                    )}
                  </div>

                  {coupon.description && (
                    <p className="mt-0.5 truncate text-sm text-gray-500">{coupon.description}</p>
                  )}

                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                    <span>
                      {coupon.maxUsesTotal != null
                        ? `${coupon.usedCount} / ${coupon.maxUsesTotal} used`
                        : `${coupon.usedCount} used`}
                    </span>
                    <span className={expired ? "text-red-500" : "text-gray-400"}>
                      {expiryText}
                    </span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex flex-shrink-0 items-center gap-3">
                  {/* Active toggle */}
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={coupon.isActive && !expired}
                      disabled={expired}
                      onChange={() => handleToggleActive(coupon)}
                      className="peer sr-only"
                    />
                    <div className="peer h-6 w-11 rounded-full bg-gray-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-green-600 peer-checked:after:translate-x-full peer-disabled:cursor-not-allowed peer-disabled:opacity-50" />
                  </label>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(coupon.id)}
                    className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                    title="Delete coupon"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Create Coupon</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Coupon Code */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Coupon Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. SAVE20"
                  value={form.code}
                  maxLength={20}
                  onChange={(e) =>
                    setForm({ ...form, code: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "") })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 font-mono text-base font-semibold uppercase tracking-wider outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <p className="mt-1 text-xs text-gray-400">3–20 characters, letters and numbers only</p>
              </div>

              {/* Discount Type toggle */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Discount Type <span className="text-red-500">*</span>
                </label>
                <div className="flex overflow-hidden rounded-lg border border-gray-300">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, discountType: "percent_off" })}
                    className={`flex-1 py-2.5 text-sm font-semibold transition ${
                      form.discountType === "percent_off"
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    % Off
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, discountType: "flat_off" })}
                    className={`flex-1 border-l border-gray-300 py-2.5 text-sm font-semibold transition ${
                      form.discountType === "flat_off"
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    ₹ Off
                  </button>
                </div>
              </div>

              {/* Discount Value */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  {form.discountType === "percent_off" ? "Discount (%)" : "Discount Amount (₹)"}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={form.discountType === "percent_off" ? 99 : undefined}
                  step={form.discountType === "percent_off" ? 1 : 0.01}
                  placeholder={form.discountType === "percent_off" ? "e.g. 20" : "e.g. 50"}
                  value={form.discountValue}
                  onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-base outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Min Spend + Max Uses (2 col) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Min Spend (₹) <span className="text-gray-400 font-normal">optional</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    placeholder="e.g. 200"
                    value={form.minSpendRupees}
                    onChange={(e) => setForm({ ...form, minSpendRupees: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-base outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Max Total Uses <span className="text-gray-400 font-normal">optional</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    placeholder="Unlimited"
                    value={form.maxUsesTotal}
                    onChange={(e) => setForm({ ...form, maxUsesTotal: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-base outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Expiry Date */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Expiry Date <span className="text-gray-400 font-normal">optional</span>
                </label>
                <input
                  type="date"
                  value={form.expiresAt}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-base outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Description <span className="text-gray-400 font-normal">optional</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Weekend special offer"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-base outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Error message */}
              {formError && (
                <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{formError}</p>
              )}
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={creating}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {creating && <Loader2 size={16} className="animate-spin" />}
                Create Coupon
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
