"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Package, Edit2, Trash2, X, Loader2 } from "lucide-react";

type CatalogItem = {
  id: string;
  kind: string;
  name: string;
  pricePaise: number;
  unit?: string | null;
  durationMins?: number | null;
  isAvailable: boolean;
  description?: string | null;
};

type NewItemForm = {
  kind: string;
  name: string;
  price: string;
  unit: string;
  description: string;
};

const ITEM_KINDS = [
  { value: "product", label: "Product (Kirana/Retail)" },
  { value: "menu_item", label: "Menu Item (Food)" },
  { value: "service", label: "Service (Salon/Spa)" },
  { value: "consultation", label: "Consultation (Clinic)" },
  { value: "class_batch", label: "Class/Batch (Education)" },
];

export default function CatalogPage() {
  const [merchantId, setMerchantId] = useState<string>("");
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newItem, setNewItem] = useState<NewItemForm>({
    kind: "product",
    name: "",
    price: "",
    unit: "",
    description: "",
  });

  const loadItems = useCallback(async () => {
    try {
      const sessionRes = await fetch("/api/merchant/auth/session");
      const sessionData = await sessionRes.json();
      
      if (!sessionData.authenticated) return;

      const id = sessionData.merchant.id;
      setMerchantId(id);

      const res = await fetch(`/api/mobile/merchants/${id}/catalog`);
      const data = await res.json();
      setItems(data.items ?? []);
    } catch (error) {
      console.error("Failed to load catalog:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleAddItem = async () => {
    if (!newItem.name.trim() || !newItem.price) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/mobile/merchants/${merchantId}/catalog`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: newItem.kind,
          name: newItem.name.trim(),
          pricePaise: Math.round(parseFloat(newItem.price) * 100),
          unit: newItem.unit.trim() || undefined,
          description: newItem.description.trim() || undefined,
        }),
      });

      if (!res.ok) throw new Error("Failed to add item");

      setNewItem({ kind: "product", name: "", price: "", unit: "", description: "" });
      setShowAddModal(false);
      await loadItems();
    } catch (error) {
      alert("Failed to add item. Please try again.");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAvailability = async (id: string, currentState: boolean) => {
    // Optimistic update
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isAvailable: !currentState } : item
      )
    );

    try {
      await fetch(`/api/mobile/merchants/${merchantId}/catalog/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: !currentState }),
      });
    } catch (error) {
      // Revert on error
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, isAvailable: currentState } : item
        )
      );
      console.error("Failed to toggle availability:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    // Optimistic delete
    setItems((prev) => prev.filter((item) => item.id !== id));

    try {
      await fetch(`/api/mobile/merchants/${merchantId}/catalog/${id}`, {
        method: "DELETE",
      });
    } catch (error) {
      // Reload on error
      loadItems();
      console.error("Failed to delete item:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-mw-primary-600" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900">Catalog</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your products, menu items, and services
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex flex-shrink-0 items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md active:scale-95"
        >
          <Plus size={18} />
          Add Item
        </button>
      </div>

      {/* Items List */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 py-16">
          <Package className="h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">No catalog items yet</h3>
          <p className="mt-2 text-sm text-gray-600">
            Get started by adding your first product or service
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-6 flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Plus size={18} />
            Add Item
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
                <Package className="h-6 w-6 text-gray-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{item.name}</h3>
                <div className="mt-1 flex items-center gap-3 text-sm text-gray-600">
                  <span className="font-semibold text-mw-primary-600">
                    ₹{(item.pricePaise / 100).toFixed(2)}
                  </span>
                  {item.unit && <span>· {item.unit}</span>}
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                    {ITEM_KINDS.find((k) => k.value === item.kind)?.label.split(" ")[0]}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={item.isAvailable}
                    onChange={() => handleToggleAvailability(item.id, item.isAvailable)}
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-gray-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-green-600 peer-checked:after:translate-x-full" />
                </label>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}


      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Add Catalog Item</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Item Type</label>
                <select
                  value={newItem.kind}
                  onChange={(e) => setNewItem({ ...newItem, kind: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-base outline-none transition focus:border-mw-primary-500 focus:ring-2 focus:ring-mw-primary-100"
                >
                  {ITEM_KINDS.map((kind) => (
                    <option key={kind.value} value={kind.value}>
                      {kind.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Basmati Rice, Haircut, GP Consultation"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-base outline-none transition focus:border-mw-primary-500 focus:ring-2 focus:ring-mw-primary-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="250"
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-base outline-none transition focus:border-mw-primary-500 focus:ring-2 focus:ring-mw-primary-100"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Unit</label>
                  <input
                    type="text"
                    placeholder="5kg, 1pc, 30min"
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-base outline-none transition focus:border-mw-primary-500 focus:ring-2 focus:ring-mw-primary-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  rows={3}
                  placeholder="Optional details about this item"
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-base outline-none transition focus:border-mw-primary-500 focus:ring-2 focus:ring-mw-primary-100"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddItem}
                disabled={!newItem.name.trim() || !newItem.price || saving}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving && <Loader2 size={16} className="animate-spin" />}
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
