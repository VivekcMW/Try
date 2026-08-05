"use client";

import { useEffect, useState } from "react";
import {
  GitBranch,
  Plus,
  Pencil,
  Trash2,
  Phone,
  MapPin,
  CheckCircle,
  XCircle,
  Loader2,
  X,
} from "lucide-react";

type Branch = {
  id: string;
  name: string;
  address: string;
  pinCode: string;
  city: string;
  phone: string | null;
  lat: number | null;
  lng: number | null;
  isActive: boolean;
  createdAt: string;
};

type BranchFormData = {
  name: string;
  address: string;
  pinCode: string;
  city: string;
  phone: string;
};

const EMPTY_FORM: BranchFormData = {
  name: "",
  address: "",
  pinCode: "",
  city: "",
  phone: "",
};

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  // Add modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState<BranchFormData>(EMPTY_FORM);
  const [addError, setAddError] = useState("");
  const [addSaving, setAddSaving] = useState(false);

  // Edit modal
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [editForm, setEditForm] = useState<BranchFormData>(EMPTY_FORM);
  const [editError, setEditError] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  // Delete confirm
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Toggle loading per branch
  const [togglingId, setTogglingId] = useState<string | null>(null);

  async function loadBranches() {
    try {
      setLoading(true);
      const res = await fetch("/api/merchant/branches");
      const data = await res.json();
      setBranches(data.branches || []);
    } catch (err) {
      console.error("Failed to load branches:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBranches();
  }, []);

  // ── Add Branch ──────────────────────────────────────────────────────────────
  async function handleAdd() {
    setAddError("");
    if (!addForm.name.trim()) { setAddError("Branch name is required"); return; }
    if (!addForm.address.trim()) { setAddError("Address is required"); return; }
    if (!addForm.pinCode.trim()) { setAddError("Pin code is required"); return; }
    if (!addForm.city.trim()) { setAddError("City is required"); return; }

    setAddSaving(true);
    try {
      const res = await fetch("/api/merchant/branches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: addForm.name.trim(),
          address: addForm.address.trim(),
          pinCode: addForm.pinCode.trim(),
          city: addForm.city.trim(),
          phone: addForm.phone.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAddError(data.error || "Failed to create branch");
        return;
      }
      setBranches((prev) => [...prev, data.branch]);
      setShowAddModal(false);
      setAddForm(EMPTY_FORM);
    } catch (err) {
      setAddError("An unexpected error occurred");
    } finally {
      setAddSaving(false);
    }
  }

  // ── Edit Branch ─────────────────────────────────────────────────────────────
  function openEdit(branch: Branch) {
    setEditingBranch(branch);
    setEditForm({
      name: branch.name,
      address: branch.address,
      pinCode: branch.pinCode,
      city: branch.city,
      phone: branch.phone || "",
    });
    setEditError("");
  }

  async function handleEdit() {
    if (!editingBranch) return;
    setEditError("");
    if (!editForm.name.trim()) { setEditError("Branch name is required"); return; }
    if (!editForm.address.trim()) { setEditError("Address is required"); return; }
    if (!editForm.pinCode.trim()) { setEditError("Pin code is required"); return; }
    if (!editForm.city.trim()) { setEditError("City is required"); return; }

    setEditSaving(true);
    try {
      const res = await fetch(`/api/merchant/branches/${editingBranch.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name.trim(),
          address: editForm.address.trim(),
          pinCode: editForm.pinCode.trim(),
          city: editForm.city.trim(),
          phone: editForm.phone.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEditError(data.error || "Failed to update branch");
        return;
      }
      setBranches((prev) =>
        prev.map((b) => (b.id === editingBranch.id ? data.branch : b))
      );
      setEditingBranch(null);
    } catch (err) {
      setEditError("An unexpected error occurred");
    } finally {
      setEditSaving(false);
    }
  }

  // ── Toggle Active ────────────────────────────────────────────────────────────
  async function handleToggleActive(branch: Branch) {
    setTogglingId(branch.id);
    try {
      const res = await fetch(`/api/merchant/branches/${branch.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !branch.isActive }),
      });
      const data = await res.json();
      if (res.ok) {
        setBranches((prev) =>
          prev.map((b) => (b.id === branch.id ? data.branch : b))
        );
      }
    } catch (err) {
      console.error("Failed to toggle branch:", err);
    } finally {
      setTogglingId(null);
    }
  }

  // ── Delete Branch ────────────────────────────────────────────────────────────
  async function handleDelete(id: string) {
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/merchant/branches/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setBranches((prev) => prev.filter((b) => b.id !== id));
        setDeletingId(null);
      }
    } catch (err) {
      console.error("Failed to delete branch:", err);
    } finally {
      setDeleteLoading(false);
    }
  }

  // ── Form helper ──────────────────────────────────────────────────────────────
  function BranchForm({
    form,
    setForm,
    error,
    saving,
    onSave,
    onCancel,
    saveLabel,
  }: {
    form: BranchFormData;
    setForm: (f: BranchFormData) => void;
    error: string;
    saving: boolean;
    onSave: () => void;
    onCancel: () => void;
    saveLabel: string;
  }) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Branch Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-[6px] border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="e.g., Andheri Branch"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="w-full rounded-[6px] border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="e.g., Mumbai"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Address <span className="text-red-500">*</span>
          </label>
          <textarea
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            rows={2}
            className="w-full rounded-[6px] border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
            placeholder="Full street address"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Pin Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.pinCode}
              onChange={(e) => setForm({ ...form, pinCode: e.target.value })}
              maxLength={6}
              className="w-full rounded-[6px] border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="e.g., 400053"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Phone (optional)</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full rounded-[6px] border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="e.g., 9876543210"
            />
          </div>
        </div>

        {error && (
          <p className="rounded-[6px] bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</p>
        )}

        <div className="flex gap-3">
          <button
            onClick={onSave}
            disabled={saving}
            className="flex-1 rounded-[6px] bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Saving…
              </span>
            ) : (
              saveLabel
            )}
          </button>
          <button
            onClick={onCancel}
            disabled={saving}
            className="flex-1 rounded-[6px] border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────────
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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Branches</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your business locations
          </p>
        </div>
        <button
          onClick={() => {
            setAddForm(EMPTY_FORM);
            setAddError("");
            setShowAddModal(true);
          }}
          className="inline-flex items-center gap-2 rounded-[6px] bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Branch
        </button>
      </div>

      {/* Branch List */}
      {branches.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[6px] border-2 border-dashed border-gray-300 bg-gray-50 py-16 text-center">
          <GitBranch className="h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">No branches yet</h3>
          <p className="mt-2 max-w-sm text-sm text-gray-600">
            This is your main location. Add branches if you operate from multiple spots.
          </p>
          <button
            onClick={() => {
              setAddForm(EMPTY_FORM);
              setAddError("");
              setShowAddModal(true);
            }}
            className="mt-6 inline-flex items-center gap-2 rounded-[6px] bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add First Branch
          </button>
        </div>
      ) : (
        <div className="max-w-3xl space-y-4">
          {branches.map((branch) => (
            <div
              key={branch.id}
              className="rounded-[6px] border border-gray-200 bg-white p-5 shadow-sm"
            >
              {editingBranch?.id === branch.id ? (
                /* Inline edit form */
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-base font-semibold text-gray-900">Edit Branch</h3>
                    <button
                      onClick={() => setEditingBranch(null)}
                      className="rounded p-1 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <BranchForm
                    form={editForm}
                    setForm={setEditForm}
                    error={editError}
                    saving={editSaving}
                    onSave={handleEdit}
                    onCancel={() => setEditingBranch(null)}
                    saveLabel="Save Changes"
                  />
                </div>
              ) : deletingId === branch.id ? (
                /* Delete confirmation */
                <div className="flex flex-col gap-3">
                  <p className="text-sm font-medium text-gray-900">
                    Delete <strong>{branch.name}</strong>? This action cannot be undone.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleDelete(branch.id)}
                      disabled={deleteLoading}
                      className="flex-1 rounded-[6px] bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                      {deleteLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" /> Deleting…
                        </span>
                      ) : (
                        "Delete"
                      )}
                    </button>
                    <button
                      onClick={() => setDeletingId(null)}
                      className="flex-1 rounded-[6px] border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* Card view */
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-semibold text-gray-900">{branch.name}</h3>
                        {branch.isActive ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                            <CheckCircle className="h-3 w-3" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                            <XCircle className="h-3 w-3" /> Inactive
                          </span>
                        )}
                      </div>

                      <div className="mt-2 space-y-1">
                        <div className="flex items-start gap-1.5 text-sm text-gray-600">
                          <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
                          <span>{branch.address}</span>
                        </div>
                        <p className="pl-5 text-xs text-gray-500">
                          {branch.city} – {branch.pinCode}
                        </p>
                        {branch.phone && (
                          <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <Phone className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
                            <span>{branch.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {/* Toggle active */}
                      <button
                        onClick={() => handleToggleActive(branch)}
                        disabled={togglingId === branch.id}
                        title={branch.isActive ? "Deactivate branch" : "Activate branch"}
                        className="rounded-[6px] border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                      >
                        {togglingId === branch.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : branch.isActive ? (
                          "Deactivate"
                        ) : (
                          "Activate"
                        )}
                      </button>
                      <button
                        onClick={() => openEdit(branch)}
                        className="rounded-[6px] border border-gray-200 p-1.5 text-gray-600 hover:bg-gray-50 transition-colors"
                        title="Edit branch"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeletingId(branch.id)}
                        className="rounded-[6px] border border-red-200 p-1.5 text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete branch"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Branch Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-[6px] bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Add Branch</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <BranchForm
              form={addForm}
              setForm={setAddForm}
              error={addError}
              saving={addSaving}
              onSave={handleAdd}
              onCancel={() => setShowAddModal(false)}
              saveLabel="Add Branch"
            />
          </div>
        </div>
      )}
    </div>
  );
}
