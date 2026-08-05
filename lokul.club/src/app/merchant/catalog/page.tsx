"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Package, Edit2, Trash2, X, Loader2, RefreshCw, Upload, Download, CheckCircle, AlertCircle } from "lucide-react";
import Image from "next/image";
import { useMerchantProfile, useProfileLabels } from "@/lib/merchant-profile-context";

type CatalogItem = {
  id: string;
  kind: string;
  name: string;
  pricePaise: number;
  unit?: string | null;
  durationMins?: number | null;
  isAvailable: boolean;
  description?: string | null;
  imageUrl?: string | null;
  catalogCategory?: string | null;
  stockCount?: number | null;
  attributes?: Record<string, unknown> | null;
};

type NewItemForm = {
  kind: string;
  name: string;
  price: string;
  unit: string;
  durationMins: string;
  description: string;
  imageUrl: string;
  catalogCategory: string;
  stockCount: string;
  vegType: "veg" | "nonveg" | "egg" | "";
};

const ITEM_KINDS = [
  { value: "product", label: "Product (Kirana/Retail)" },
  { value: "menu_item", label: "Menu Item (Food)" },
  { value: "service", label: "Service (Salon/Spa)" },
  { value: "consultation", label: "Consultation (Clinic)" },
  { value: "class_batch", label: "Class/Batch (Education)" },
];

function vegAttributes(vegType: "veg" | "nonveg" | "egg" | "") {
  if (vegType === "veg") return { isVeg: true };
  if (vegType === "nonveg") return { isVeg: false };
  if (vegType === "egg") return { isVeg: null };
  return undefined;
}

function VegDot({ attributes }: { attributes?: Record<string, unknown> | null }) {
  if (attributes?.isVeg === true) {
    return <div className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0" title="Veg" />;
  }
  if (attributes?.isVeg === false) {
    return <div className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0" title="Non-Veg" />;
  }
  return <div className="w-3 h-3 rounded-full bg-gray-300 flex-shrink-0" title="Egg / Unset" />;
}

const EMPTY_FORM: NewItemForm = {
  kind: "menu_item",
  name: "",
  price: "",
  unit: "",
  durationMins: "",
  description: "",
  imageUrl: "",
  catalogCategory: "",
  stockCount: "",
  vegType: "",
};

export default function CatalogPage() {
  const profile = useMerchantProfile();
  const labels = useProfileLabels();
  const isFood = profile === "food";
  const isAppointments = profile === "appointments";

  const [merchantId, setMerchantId] = useState<string>("");
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [newItem, setNewItem] = useState<NewItemForm>({
    ...EMPTY_FORM,
    kind: isFood ? "menu_item" : "product",
  });

  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  const [editForm, setEditForm] = useState<NewItemForm>({ ...EMPTY_FORM });

  // CSV import state
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    created: number;
    skipped: number;
    errors: Array<{ row: number; reason: string }>;
  } | null>(null);

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
      const attrs = isFood ? vegAttributes(newItem.vegType) : undefined;
      const res = await fetch(`/api/mobile/merchants/${merchantId}/catalog`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: newItem.kind,
          name: newItem.name.trim(),
          pricePaise: Math.round(parseFloat(newItem.price) * 100),
          unit: newItem.unit.trim() || undefined,
          durationMins: newItem.durationMins !== "" ? parseInt(newItem.durationMins) : undefined,
          description: newItem.description.trim() || undefined,
          imageUrl: newItem.imageUrl.trim() || undefined,
          catalogCategory: newItem.catalogCategory.trim() || undefined,
          stockCount: newItem.stockCount !== "" ? parseInt(newItem.stockCount) : null,
          ...(attrs !== undefined ? { attributes: attrs } : {}),
        }),
      });

      if (!res.ok) throw new Error("Failed to add item");

      setNewItem({ ...EMPTY_FORM, kind: isFood ? "menu_item" : "product" });
      setShowAddModal(false);
      await loadItems();
    } catch (error) {
      alert("Failed to add item. Please try again.");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleEditItem = async () => {
    if (!editingItem || !editForm.name.trim() || !editForm.price) return;

    setSaving(true);
    try {
      const attrs = isFood ? vegAttributes(editForm.vegType) : undefined;
      const res = await fetch(
        `/api/mobile/merchants/${merchantId}/catalog/${editingItem.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: editForm.name.trim(),
            pricePaise: Math.round(parseFloat(editForm.price) * 100),
            unit: editForm.unit.trim() || null,
            durationMins: editForm.durationMins !== "" ? parseInt(editForm.durationMins) : null,
            description: editForm.description.trim() || null,
            imageUrl: editForm.imageUrl.trim() || null,
            catalogCategory: editForm.catalogCategory.trim() || null,
            stockCount: editForm.stockCount !== "" ? parseInt(editForm.stockCount) : null,
            ...(attrs !== undefined ? { attributes: attrs } : {}),
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to update item");

      setEditingItem(null);
      await loadItems();
    } catch (error) {
      alert("Failed to save changes. Please try again.");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (item: CatalogItem) => {
    setEditingItem(item);
    let vegType: "veg" | "nonveg" | "egg" | "" = "";
    if (isFood && item.attributes) {
      if (item.attributes.isVeg === true) vegType = "veg";
      else if (item.attributes.isVeg === false) vegType = "nonveg";
      else if ("isVeg" in item.attributes) vegType = "egg";
    }
    setEditForm({
      kind: item.kind,
      name: item.name,
      price: (item.pricePaise / 100).toString(),
      unit: item.unit ?? "",
      durationMins: item.durationMins != null ? item.durationMins.toString() : "",
      description: item.description ?? "",
      imageUrl: item.imageUrl ?? "",
      catalogCategory: item.catalogCategory ?? "",
      stockCount: item.stockCount != null ? item.stockCount.toString() : "",
      vegType,
    });
  };

  const handleToggleAvailability = async (id: string, currentState: boolean) => {
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
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, isAvailable: currentState } : item
        )
      );
      console.error("Failed to toggle availability:", error);
    }
  };

  const handleResetAllAvailable = async () => {
    setResetting(true);
    try {
      await Promise.all(
        items.map((item) =>
          fetch(`/api/mobile/merchants/${merchantId}/catalog/${item.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isAvailable: true }),
          })
        )
      );
      setItems((prev) => prev.map((item) => ({ ...item, isAvailable: true })));
    } catch (error) {
      console.error("Failed to reset availability:", error);
    } finally {
      setResetting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    setItems((prev) => prev.filter((item) => item.id !== id));

    try {
      await fetch(`/api/mobile/merchants/${merchantId}/catalog/${id}`, {
        method: "DELETE",
      });
    } catch (error) {
      loadItems();
      console.error("Failed to delete item:", error);
    }
  };

  const handleDownloadTemplate = () => {
    const headers = "name,price,unit,description,category,kind,stock,available,image_url,duration_mins";
    const example1 = `"Basmati Rice 1kg",120,"1 kg","Premium basmati rice","Staples","product",50,true,,`;
    const example2 = `"Haircut - Men",200,"30 min","Classic men's haircut","Hair","service",,true,,30`;
    const example3 = `"Paneer Butter Masala",180,"1 plate","Creamy paneer curry","Mains","menu_item",,true,,`;
    const csv = [headers, example1, example2, example3].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "catalog-import-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    if (!importFile) return;
    setImporting(true);
    setImportResult(null);
    try {
      const formData = new FormData();
      formData.append("file", importFile);
      const res = await fetch("/api/merchant/catalog/import", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Import failed");
        return;
      }
      setImportResult(data);
      if (data.created > 0) await loadItems();
    } catch {
      alert("Import failed. Please check your file and try again.");
    } finally {
      setImporting(false);
    }
  };

  const showDurationField = (kind: string) =>
    isAppointments || kind === "service" || kind === "consultation";

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-brand-600" />
      </div>
    );
  }

  const renderItem = (item: CatalogItem) => (
    <div
      key={item.id}
      className="flex items-center gap-4 rounded-[6px] border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
    >
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[6px] bg-gray-100 overflow-hidden">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            width={48}
            height={48}
            className="h-12 w-12 rounded-[6px] object-cover"
            unoptimized
          />
        ) : (
          <Package className="h-6 w-6 text-gray-600" />
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          {isFood && <VegDot attributes={item.attributes} />}
          <h3 className="font-semibold text-gray-900">{item.name}</h3>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-600">
          <span className="font-semibold text-brand-600">
            ₹{(item.pricePaise / 100).toFixed(2)}
          </span>
          {item.unit && <span>· {item.unit}</span>}
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
            {ITEM_KINDS.find((k) => k.value === item.kind)?.label.split(" ")[0]}
          </span>
          {item.catalogCategory && (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
              {item.catalogCategory}
            </span>
          )}
          {item.stockCount === 0 && (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">
              Out of Stock
            </span>
          )}
          {item.stockCount != null && item.stockCount > 0 && (
            <span className="text-xs text-gray-400">Stock: {item.stockCount}</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-center gap-0.5">
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={item.isAvailable}
              onChange={() => handleToggleAvailability(item.id, item.isAvailable)}
              className="peer sr-only"
            />
            <div className="peer h-6 w-11 rounded-full bg-gray-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-green-600 peer-checked:after:translate-x-full" />
          </label>
          {isFood && (
            <span className="text-xs text-gray-400">Today</span>
          )}
        </div>
        <button
          onClick={() => openEditModal(item)}
          className="rounded-[6px] p-2 text-gray-400 transition hover:bg-blue-50 hover:text-blue-600"
        >
          <Edit2 size={18} />
        </button>
        <button
          onClick={() => handleDelete(item.id)}
          className="rounded-[6px] p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );

  const renderItemList = () => {
    if (items.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center rounded-[6px] border-2 border-dashed border-gray-300 bg-gray-50 py-16">
          <Package className="h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">No {labels.catalog.toLowerCase()} items yet</h3>
          <p className="mt-2 text-sm text-gray-600">
            Get started by adding your first {labels.catalogItem.toLowerCase()}
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-6 flex items-center gap-2 rounded-[6px] bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Plus size={18} />
            Add {labels.catalogItem}
          </button>
        </div>
      );
    }

    const hasCategories = items.some((item) => item.catalogCategory);

    if (!hasCategories) {
      return <div className="space-y-3">{items.map(renderItem)}</div>;
    }

    const groupMap = new Map<string, CatalogItem[]>();
    for (const item of items) {
      const key = item.catalogCategory?.trim() || "";
      if (!groupMap.has(key)) groupMap.set(key, []);
      groupMap.get(key)!.push(item);
    }
    const namedGroups = Array.from(groupMap.entries()).filter(([k]) => k !== "");
    const uncategorized = groupMap.get("") ?? [];

    return (
      <div className="space-y-6">
        {namedGroups.map(([category, groupItems]) => (
          <div key={category}>
            <h3 className="sticky top-0 z-10 mb-2 border-b border-gray-200 bg-gray-50 pb-1 text-sm font-semibold uppercase tracking-wide text-gray-500">
              {category}
            </h3>
            <div className="space-y-3">{groupItems.map(renderItem)}</div>
          </div>
        ))}
        {uncategorized.length > 0 && (
          <div>
            <h3 className="sticky top-0 z-10 mb-2 border-b border-gray-200 bg-gray-50 pb-1 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Uncategorized
            </h3>
            <div className="space-y-3">{uncategorized.map(renderItem)}</div>
          </div>
        )}
      </div>
    );
  };

  const renderDurationField = (
    form: NewItemForm,
    setForm: (f: NewItemForm) => void,
    kind: string
  ) => {
    if (!showDurationField(kind)) return null;
    const label = isFood ? "Prep time (mins)" : isAppointments ? "Duration (mins)" : "Duration (mins)";
    return (
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">{label}</label>
        <input
          type="number"
          min="1"
          placeholder="30"
          value={form.durationMins}
          onChange={(e) => setForm({ ...form, durationMins: e.target.value })}
          className="w-full rounded-[6px] border border-gray-300 px-4 py-2.5 text-base outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
      </div>
    );
  };

  const renderFoodDurationField = (
    form: NewItemForm,
    setForm: (f: NewItemForm) => void
  ) => {
    if (!isFood) return null;
    return (
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Prep time (mins)</label>
        <input
          type="number"
          min="1"
          placeholder="15"
          value={form.durationMins}
          onChange={(e) => setForm({ ...form, durationMins: e.target.value })}
          className="w-full rounded-[6px] border border-gray-300 px-4 py-2.5 text-base outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
      </div>
    );
  };

  const renderVegSelector = (
    form: NewItemForm,
    setForm: (f: NewItemForm) => void
  ) => {
    if (!isFood) return null;
    return (
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Veg type</label>
        <div className="flex gap-2">
          {(["veg", "nonveg", "egg"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setForm({ ...form, vegType: form.vegType === type ? "" : type })}
              className={`flex-1 rounded-[6px] border px-3 py-2 text-sm font-medium transition ${
                form.vegType === type
                  ? type === "veg"
                    ? "border-green-500 bg-green-50 text-green-700"
                    : type === "nonveg"
                    ? "border-red-500 bg-red-50 text-red-700"
                    : "border-yellow-500 bg-yellow-50 text-yellow-700"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {type === "veg" ? "Veg" : type === "nonveg" ? "Non-Veg" : "Egg"}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900">{labels.catalog}</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your products, menu items, and services
          </p>
        </div>
        <div className="flex flex-shrink-0 flex-wrap items-center gap-2">
          {isFood && items.length > 0 && (
            <button
              onClick={handleResetAllAvailable}
              disabled={resetting}
              className="inline-flex items-center gap-2 rounded-[6px] border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
            >
              {resetting ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
              Reset all available
            </button>
          )}
          <button
            onClick={() => { setShowImportModal(true); setImportResult(null); setImportFile(null); }}
            className="inline-flex items-center gap-2 rounded-[6px] border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <Upload size={16} />
            Import CSV
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-[6px] bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md active:scale-95"
          >
            <Plus size={18} />
            Add {labels.catalogItem}
          </button>
        </div>
      </div>

      {renderItemList()}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-[6px] bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Add {labels.catalogItem}</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-[6px] p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900"
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
                  className="w-full rounded-[6px] border border-gray-300 px-4 py-2.5 text-base outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
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
                  className="w-full rounded-[6px] border border-gray-300 px-4 py-2.5 text-base outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </div>

              {renderVegSelector(newItem, setNewItem)}

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
                    className="w-full rounded-[6px] border border-gray-300 px-4 py-2.5 text-base outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Unit</label>
                  <input
                    type="text"
                    placeholder="5kg, 1pc, 30min"
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    className="w-full rounded-[6px] border border-gray-300 px-4 py-2.5 text-base outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  />
                </div>
              </div>

              {isFood
                ? renderFoodDurationField(newItem, setNewItem)
                : renderDurationField(newItem, setNewItem, newItem.kind)}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  rows={3}
                  placeholder="Optional details about this item"
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  className="w-full rounded-[6px] border border-gray-300 px-4 py-2.5 text-base outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Image URL</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={newItem.imageUrl}
                  onChange={(e) => setNewItem({ ...newItem, imageUrl: e.target.value })}
                  className="w-full rounded-[6px] border border-gray-300 px-4 py-2.5 text-base outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Starters, Mains, Beverages"
                    value={newItem.catalogCategory}
                    onChange={(e) => setNewItem({ ...newItem, catalogCategory: e.target.value })}
                    className="w-full rounded-[6px] border border-gray-300 px-4 py-2.5 text-base outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Stock Count</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Leave blank for unlimited"
                    value={newItem.stockCount}
                    onChange={(e) => setNewItem({ ...newItem, stockCount: e.target.value })}
                    className="w-full rounded-[6px] border border-gray-300 px-4 py-2.5 text-base outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 rounded-[6px] border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddItem}
                disabled={!newItem.name.trim() || !newItem.price || saving}
                className="flex flex-1 items-center justify-center gap-2 rounded-[6px] bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving && <Loader2 size={16} className="animate-spin" />}
                Add {labels.catalogItem}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingItem !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-[6px] bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Edit {labels.catalogItem}</h2>
              <button
                onClick={() => setEditingItem(null)}
                className="rounded-[6px] p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Item Type</label>
                <select
                  value={editForm.kind}
                  disabled
                  className="w-full rounded-[6px] border border-gray-200 bg-gray-50 px-4 py-2.5 text-base text-gray-500 outline-none cursor-not-allowed"
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
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full rounded-[6px] border border-gray-300 px-4 py-2.5 text-base outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </div>

              {renderVegSelector(editForm, setEditForm)}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="250"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                    className="w-full rounded-[6px] border border-gray-300 px-4 py-2.5 text-base outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Unit</label>
                  <input
                    type="text"
                    placeholder="5kg, 1pc, 30min"
                    value={editForm.unit}
                    onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}
                    className="w-full rounded-[6px] border border-gray-300 px-4 py-2.5 text-base outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  />
                </div>
              </div>

              {isFood
                ? renderFoodDurationField(editForm, setEditForm)
                : renderDurationField(editForm, setEditForm, editForm.kind)}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  rows={3}
                  placeholder="Optional details about this item"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full rounded-[6px] border border-gray-300 px-4 py-2.5 text-base outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Image URL</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={editForm.imageUrl}
                  onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                  className="w-full rounded-[6px] border border-gray-300 px-4 py-2.5 text-base outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Starters, Mains, Beverages"
                    value={editForm.catalogCategory}
                    onChange={(e) => setEditForm({ ...editForm, catalogCategory: e.target.value })}
                    className="w-full rounded-[6px] border border-gray-300 px-4 py-2.5 text-base outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Stock Count</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Leave blank for unlimited"
                    value={editForm.stockCount}
                    onChange={(e) => setEditForm({ ...editForm, stockCount: e.target.value })}
                    className="w-full rounded-[6px] border border-gray-300 px-4 py-2.5 text-base outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setEditingItem(null)}
                className="flex-1 rounded-[6px] border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleEditItem}
                disabled={!editForm.name.trim() || !editForm.price || saving}
                className="flex flex-1 items-center justify-center gap-2 rounded-[6px] bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving && <Loader2 size={16} className="animate-spin" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import CSV Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-[6px] bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Import from CSV</h2>
              <button
                onClick={() => setShowImportModal(false)}
                className="rounded-[6px] p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900"
              >
                <X size={20} />
              </button>
            </div>

            {!importResult ? (
              <>
                {/* Instructions */}
                <div className="mb-4 rounded-[6px] border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
                  <p className="font-semibold mb-1">CSV format</p>
                  <p className="text-blue-700">Columns: <code className="rounded bg-blue-100 px-1">name, price, unit, description, category, kind, stock, available, image_url, duration_mins</code></p>
                  <p className="mt-1 text-blue-700">Only <strong>name</strong> and <strong>price</strong> are required. Max 500 rows per import.</p>
                </div>

                <button
                  onClick={handleDownloadTemplate}
                  className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  <Download size={15} />
                  Download template CSV
                </button>

                {/* File picker */}
                <div className="mb-5">
                  <label className="mb-2 block text-sm font-medium text-gray-700">Select CSV file</label>
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
                    className="block w-full rounded-[6px] border border-gray-300 px-3 py-2 text-sm text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {importFile && (
                    <p className="mt-1 text-xs text-gray-500">{importFile.name} ({(importFile.size / 1024).toFixed(1)} KB)</p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowImportModal(false)}
                    className="flex-1 rounded-[6px] border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={!importFile || importing}
                    className="flex flex-1 items-center justify-center gap-2 rounded-[6px] bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {importing ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                    {importing ? "Importing…" : "Import"}
                  </button>
                </div>
              </>
            ) : (
              /* Results view */
              <>
                <div className={`mb-4 flex items-start gap-3 rounded-[6px] p-4 ${importResult.created > 0 ? "bg-green-50 border border-green-200" : "bg-yellow-50 border border-yellow-200"}`}>
                  {importResult.created > 0
                    ? <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600 mt-0.5" />
                    : <AlertCircle className="h-5 w-5 flex-shrink-0 text-yellow-600 mt-0.5" />
                  }
                  <div>
                    <p className="font-semibold text-gray-900">Import complete</p>
                    <p className="text-sm text-gray-600">
                      {importResult.created} item{importResult.created !== 1 ? "s" : ""} added
                      {importResult.skipped > 0 && `, ${importResult.skipped} skipped`}
                    </p>
                  </div>
                </div>

                {importResult.errors.length > 0 && (
                  <div className="mb-4 max-h-48 overflow-y-auto rounded-[6px] border border-red-200 bg-red-50 p-3">
                    <p className="mb-2 text-sm font-semibold text-red-800">Rows with errors ({importResult.errors.length})</p>
                    {importResult.errors.map((e) => (
                      <div key={e.row} className="flex items-start gap-2 py-1 text-xs text-red-700">
                        <span className="rounded bg-red-100 px-1.5 py-0.5 font-mono font-bold">Row {e.row}</span>
                        <span>{e.reason}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => { setImportResult(null); setImportFile(null); }}
                    className="flex-1 rounded-[6px] border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Import more
                  </button>
                  <button
                    onClick={() => setShowImportModal(false)}
                    className="flex-1 rounded-[6px] bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    Done
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
