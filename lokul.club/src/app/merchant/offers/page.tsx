"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Tag, X, Loader2, Trash2, Calendar, Package } from "lucide-react";
import { useToast } from "@/components/ui";

type CatalogItem = {
  id: string;
  kind: string;
  name: string;
  pricePaise: number;
  unit?: string | null;
  isAvailable: boolean;
};

type Offer = {
  id: string;
  title: string;
  type: string;
  value: number;
  minSpendPaise?: number | null;
  startsAt?: string | null;
  endsAt?: string | null;
  isActive: boolean;
};

type NewOfferForm = {
  title: string;
  type: string;
  value: string;
  days: string;
  selectedItemIds: string[];
};

const OFFER_TYPES = [
  { value: "percent_off", label: "Percentage Discount" },
  { value: "flat_off", label: "Flat Amount Off" },
  { value: "bogo", label: "Buy One Get One" },
  { value: "free_delivery", label: "Free Delivery" },
];

export default function OffersPage() {
  const toast = useToast();
  const [merchantId, setMerchantId] = useState<string>("");
  const [offers, setOffers] = useState<Offer[]>([]);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newOffer, setNewOffer] = useState<NewOfferForm>({
    title: "",
    type: "percent_off",
    value: "",
    days: "7",
    selectedItemIds: [],
  });

  const loadOffers = useCallback(async () => {
    try {
      const sessionRes = await fetch("/api/merchant/auth/session");
      const sessionData = await sessionRes.json();
      
      if (!sessionData.authenticated) return;

      const id = sessionData.merchant.id;
      setMerchantId(id);

      // Load offers
      const res = await fetch(`/api/mobile/merchants/${id}/offers`);
      const data = await res.json();
      setOffers(data.offers ?? []);

      // Load catalog items
      const catalogRes = await fetch(`/api/mobile/merchants/${id}/catalog`);
      const catalogData = await catalogRes.json();
      setCatalogItems(catalogData.items ?? []);
    } catch (error) {
      console.error("Failed to load offers:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOffers();
  }, [loadOffers]);

  const handleAddOffer = async () => {
    if (!newOffer.title.trim() || !newOffer.value) return;

    setSaving(true);
    try {
      const endsAt = new Date();
      endsAt.setDate(endsAt.getDate() + parseInt(newOffer.days));

      const res = await fetch(`/api/mobile/merchants/${merchantId}/offers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newOffer.title.trim(),
          type: newOffer.type,
          value: parseFloat(newOffer.value),
          endsAt: endsAt.toISOString(),
        }),
      });

      if (!res.ok) throw new Error("Failed to add offer");

      setNewOffer({ title: "", type: "percent_off", value: "", days: "7", selectedItemIds: [] });
      setShowAddModal(false);
      await loadOffers();
    } catch (error) {
      toast.error("Failed to add offer", "Please try again");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (id: string, currentState: boolean) => {
    // Optimistic update
    setOffers((prev) =>
      prev.map((offer) =>
        offer.id === id ? { ...offer, isActive: !currentState } : offer
      )
    );

    try {
      await fetch(`/api/mobile/merchants/${merchantId}/offers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentState }),
      });
    } catch (error) {
      // Revert on error
      setOffers((prev) =>
        prev.map((offer) =>
          offer.id === id ? { ...offer, isActive: currentState } : offer
        )
      );
      console.error("Failed to toggle offer:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this offer?")) return;

    // Optimistic delete
    setOffers((prev) => prev.filter((offer) => offer.id !== id));

    try {
      await fetch(`/api/mobile/merchants/${merchantId}/offers/${id}`, {
        method: "DELETE",
      });
    } catch (error) {
      // Reload on error
      loadOffers();
      console.error("Failed to delete offer:", error);
    }
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "No expiry";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  const isExpired = (dateStr: string | null | undefined) => {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
  };

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
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900">Offers & Promotions</h1>
          <p className="mt-1 text-sm text-gray-600">
            Create and manage promotional offers for your customers
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex shrink-0 items-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md active:scale-95"
        >
          <Plus size={18} />
          Create Offer
        </button>
      </div>

      {/* Offers List */}
      {offers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 bg-gray-50 py-16">
          <Tag className="h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">No offers yet</h3>
          <p className="mt-2 text-sm text-gray-600">
            Create your first promotional offer to attract more customers
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-6 flex items-center gap-2 rounded-md bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
          >
            <Plus size={18} />
            Create Offer
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {offers.map((offer) => {
            const expired = isExpired(offer.endsAt);
            const typeLabel = OFFER_TYPES.find((t) => t.value === offer.type)?.label;
            
            return (
              <div
                key={offer.id}
                className={`flex items-center gap-4 rounded-md border bg-white p-4 shadow-sm transition hover:shadow-md ${
                  expired ? "border-red-200 bg-red-50/50" : "border-gray-200"
                }`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-green-100">
                  <Tag className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{offer.title}</h3>
                  <div className="mt-1 flex items-center gap-3 text-sm text-gray-600">
                    <span className="font-semibold text-green-600">
                      {offer.type === "percent_off" && `${offer.value}% OFF`}
                      {offer.type === "flat_off" && `₹${offer.value} OFF`}
                      {offer.type === "bogo" && "BOGO"}
                      {offer.type === "free_delivery" && "FREE DELIVERY"}
                    </span>
                    <span>· {typeLabel}</span>
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      Expires: {formatDate(offer.endsAt)}
                    </span>
                  </div>
                  {expired && (
                    <span className="mt-1 inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                      Expired
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={offer.isActive && !expired}
                      disabled={expired}
                      onChange={() => handleToggleActive(offer.id, offer.isActive)}
                      className="peer sr-only"
                    />
                    <div className="peer h-6 w-11 rounded-full bg-gray-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-green-600 peer-checked:after:translate-x-full peer-disabled:cursor-not-allowed peer-disabled:opacity-50" />
                  </label>
                  <button
                    onClick={() => handleDelete(offer.id)}
                    className="rounded-md p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}


      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-md bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Create New Offer</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Offer Type</label>
                <select
                  value={newOffer.type}
                  onChange={(e) => setNewOffer({ ...newOffer, type: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-base outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                >
                  {OFFER_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Offer Title *</label>
                <input
                  type="text"
                  placeholder="e.g., Weekend Special 20% Off"
                  value={newOffer.title}
                  onChange={(e) => setNewOffer({ ...newOffer, title: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-base outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    {newOffer.type === "percent_off" && "Discount (%)"}
                    {newOffer.type === "flat_off" && "Amount Off (₹)"}
                    {newOffer.type === "bogo" && "Value"}
                    {newOffer.type === "free_delivery" && "Value"}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder={newOffer.type === "percent_off" ? "20" : "100"}
                    value={newOffer.value}
                    onChange={(e) => setNewOffer({ ...newOffer, value: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-base outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Valid for (Days)</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="7"
                    value={newOffer.days}
                    onChange={(e) => setNewOffer({ ...newOffer, days: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-base outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  />
                </div>
              </div>

              {/* Item Selection */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Apply to Specific Items (Optional)
                </label>
                <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border border-gray-300 p-3">
                  {catalogItems.length === 0 ? (
                    <p className="text-sm text-gray-500">No catalog items available</p>
                  ) : (
                    <>
                      <label className="flex cursor-pointer items-center gap-3 rounded-md p-2 hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={newOffer.selectedItemIds.length === catalogItems.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewOffer({ ...newOffer, selectedItemIds: catalogItems.map(item => item.id) });
                            } else {
                              setNewOffer({ ...newOffer, selectedItemIds: [] });
                            }
                          }}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-sm font-semibold text-gray-700">Select All</span>
                      </label>
                      <div className="border-t border-gray-200 pt-2">
                        {catalogItems.map((item) => (
                          <label
                            key={item.id}
                            className="flex cursor-pointer items-center gap-3 rounded-md p-2 hover:bg-gray-50"
                          >
                            <input
                              type="checkbox"
                              checked={newOffer.selectedItemIds.includes(item.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNewOffer({
                                    ...newOffer,
                                    selectedItemIds: [...newOffer.selectedItemIds, item.id]
                                  });
                                } else {
                                  setNewOffer({
                                    ...newOffer,
                                    selectedItemIds: newOffer.selectedItemIds.filter(id => id !== item.id)
                                  });
                                }
                              }}
                              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                            />
                            <Package size={16} className="text-gray-400" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{item.name}</p>
                              <p className="text-xs text-gray-500">
                                ₹{(item.pricePaise / 100).toFixed(2)}
                                {item.unit && ` per ${item.unit}`}
                              </p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {newOffer.selectedItemIds.length === 0
                    ? "Offer will apply to all items if none selected"
                    : `Offer will apply to ${newOffer.selectedItemIds.length} selected item(s)`}
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 rounded-md border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddOffer}
                disabled={!newOffer.title.trim() || !newOffer.value || saving}
                className="flex flex-1 items-center justify-center gap-2 rounded-md bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving && <Loader2 size={16} className="animate-spin" />}
                Create Offer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
