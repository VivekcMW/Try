"use client";
import { useEffect, useState, useCallback } from "react";
import { Plus, Package, Edit2, Trash2, X, Loader2, Calendar } from "lucide-react";

type Plan = {
  id: string;
  name: string;
  description?: string | null;
  pricePaise: number;
  frequency: string;
  unit?: string | null;
  isActive: boolean;
  _count: { subscriptions: number };
};

type FormState = {
  name: string;
  description: string;
  priceRupees: string;
  frequency: string;
  unit: string;
};

const defaultForm: FormState = {
  name: "",
  description: "",
  priceRupees: "",
  frequency: "daily",
  unit: "",
};

const FREQUENCY_LABELS: Record<string, string> = {
  daily: "Daily",
  weekdays: "Weekdays",
  alternate: "Alternate Days",
  weekly: "Weekly",
};

function frequencyBadge(frequency: string) {
  const colors: Record<string, string> = {
    daily: "bg-blue-100 text-blue-700",
    weekdays: "bg-purple-100 text-purple-700",
    alternate: "bg-orange-100 text-orange-700",
    weekly: "bg-green-100 text-green-700",
  };
  return colors[frequency] ?? "bg-gray-100 text-gray-700";
}

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [formError, setFormError] = useState("");

  const loadPlans = useCallback(async () => {
    try {
      const res = await fetch("/api/merchant/plans");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setPlans(data.plans ?? []);
    } catch (err) {
      console.error("Failed to load plans:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  const openCreate = () => {
    setEditingPlan(null);
    setForm(defaultForm);
    setFormError("");
    setShowModal(true);
  };

  const openEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setForm({
      name: plan.name,
      description: plan.description ?? "",
      priceRupees: (plan.pricePaise / 100).toFixed(2),
      frequency: plan.frequency,
      unit: plan.unit ?? "",
    });
    setFormError("");
    setShowModal(true);
  };

  const handleSave = async () => {
    setFormError("");
    if (!form.name.trim()) {
      setFormError("Plan name is required.");
      return;
    }
    const price = parseFloat(form.priceRupees);
    if (!form.priceRupees || isNaN(price) || price <= 0) {
      setFormError("Price must be greater than 0.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        pricePaise: Math.round(price * 100),
        frequency: form.frequency,
        unit: form.unit.trim() || null,
      };

      let res: Response;
      if (editingPlan) {
        res = await fetch(`/api/merchant/plans/${editingPlan.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/merchant/plans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error ?? "Failed to save plan.");
        return;
      }

      setShowModal(false);
      await loadPlans();
    } catch (err) {
      setFormError("Something went wrong. Please try again.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (plan: Plan) => {
    setPlans((prev) =>
      prev.map((p) => (p.id === plan.id ? { ...p, isActive: !plan.isActive } : p))
    );
    try {
      const res = await fetch(`/api/merchant/plans/${plan.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !plan.isActive }),
      });
      if (!res.ok) throw new Error("Toggle failed");
    } catch (err) {
      setPlans((prev) =>
        prev.map((p) => (p.id === plan.id ? { ...p, isActive: plan.isActive } : p))
      );
      console.error("Failed to toggle plan:", err);
    }
  };

  const handleDelete = async (plan: Plan) => {
    if (plan._count.subscriptions > 0) {
      alert("Cannot delete a plan with active subscriptions.");
      return;
    }
    if (!confirm("Delete this plan? This cannot be undone.")) return;

    setPlans((prev) => prev.filter((p) => p.id !== plan.id));
    try {
      const res = await fetch(`/api/merchant/plans/${plan.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? "Failed to delete plan.");
        await loadPlans();
      }
    } catch (err) {
      console.error("Failed to delete plan:", err);
      await loadPlans();
    }
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
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900">Subscription Plans</h1>
          <p className="mt-1 text-sm text-gray-600">
            Create plans that customers can subscribe to for recurring deliveries
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex shrink-0 items-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md active:scale-95"
        >
          <Plus size={18} />
          Add Plan
        </button>
      </div>

      {plans.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 bg-gray-50 py-16">
          <Package className="h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">No plans yet</h3>
          <p className="mt-2 max-w-sm text-center text-sm text-gray-600">
            Create your first subscription plan to offer recurring deliveries to customers.
          </p>
          <button
            onClick={openCreate}
            className="mt-6 flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Plus size={18} />
            Add Plan
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="flex items-center gap-4 rounded-md border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-blue-50">
                <Package className="h-6 w-6 text-blue-600" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-base font-bold text-gray-900">{plan.name}</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${frequencyBadge(plan.frequency)}`}
                  >
                    <Calendar size={10} className="mr-1 inline" />
                    {FREQUENCY_LABELS[plan.frequency] ?? plan.frequency}
                  </span>
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                    ₹{(plan.pricePaise / 100).toFixed(0)}
                    {plan.unit ? ` / ${plan.unit}` : ""}
                  </span>
                </div>
                {plan.description && (
                  <p className="mt-0.5 truncate text-sm text-gray-500">{plan.description}</p>
                )}
                <p className="mt-1 text-xs text-gray-400">
                  {plan._count.subscriptions} subscriber{plan._count.subscriptions !== 1 ? "s" : ""}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={plan.isActive}
                    onChange={() => handleToggleActive(plan)}
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-gray-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-green-600 peer-checked:after:translate-x-full" />
                </label>
                <button
                  onClick={() => openEdit(plan)}
                  className="rounded-md p-2 text-gray-400 transition hover:bg-blue-50 hover:text-blue-600"
                  title="Edit plan"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(plan)}
                  className="rounded-md p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                  title="Delete plan"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-md bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingPlan ? "Edit Plan" : "Add Plan"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Plan Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Daily Milk"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-base outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Description <span className="text-gray-400 font-normal">optional</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Fresh full-cream milk delivered every morning"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-base outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={0.01}
                    step={0.01}
                    placeholder="e.g. 30"
                    value={form.priceRupees}
                    onChange={(e) => setForm({ ...form, priceRupees: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-base outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Unit <span className="text-gray-400 font-normal">optional</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 500ml, 1kg"
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-base outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Delivery Frequency <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(FREQUENCY_LABELS).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setForm({ ...form, frequency: value })}
                      className={`rounded-md border px-3 py-2.5 text-sm font-semibold transition ${
                        form.frequency === value
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {formError && (
                <p className="rounded-md bg-red-50 px-4 py-2.5 text-sm text-red-600">{formError}</p>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 rounded-md border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex flex-1 items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving && <Loader2 size={16} className="animate-spin" />}
                {editingPlan ? "Save Changes" : "Add Plan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
