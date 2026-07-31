"use client";
import { useEffect, useState, useCallback } from "react";
import { Users, X, Loader2, Pause, Play, XCircle } from "lucide-react";

type Subscription = {
  id: string;
  quantity: number;
  status: string;
  startDate: string;
  pausedFrom: string | null;
  pausedUntil: string | null;
  cancelledAt: string | null;
  notes: string | null;
  plan: {
    name: string;
    frequency: string;
    pricePaise: number;
    unit: string | null;
  };
  customer: {
    name: string;
    phone: string;
    avatarUrl: string | null;
  };
};

const STATUS_TABS = ["active", "paused", "cancelled", "all"] as const;
type StatusTab = (typeof STATUS_TABS)[number];

const FREQUENCY_LABELS: Record<string, string> = {
  daily: "Daily",
  weekdays: "Weekdays",
  alternate: "Alternate Days",
  weekly: "Weekly",
};

function statusBadge(status: string) {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-700";
    case "paused":
      return "bg-yellow-100 text-yellow-700";
    case "cancelled":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default function SubscribersPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<StatusTab>("active");
  const [acting, setActing] = useState<string | null>(null);
  const [pauseModal, setPauseModal] = useState<{ id: string } | null>(null);
  const [pauseUntil, setPauseUntil] = useState("");

  const load = useCallback(
    async (status: StatusTab) => {
      setLoading(true);
      try {
        const res = await fetch(`/api/merchant/subscribers?status=${status}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setSubscriptions(data.subscriptions ?? []);
      } catch (err) {
        console.error("Failed to load subscribers:", err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    load(activeTab);
  }, [activeTab, load]);

  const handleAction = async (
    id: string,
    action: "pause" | "resume" | "cancel",
    extra?: { pausedUntil?: string }
  ) => {
    setActing(id);
    try {
      const res = await fetch(`/api/merchant/subscribers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      });
      if (!res.ok) throw new Error("Action failed");
      await load(activeTab);
    } catch (err) {
      console.error("Failed to update subscription:", err);
    } finally {
      setActing(null);
    }
  };

  const handlePauseSubmit = async () => {
    if (!pauseModal) return;
    await handleAction(pauseModal.id, "pause", { pausedUntil: pauseUntil || undefined });
    setPauseModal(null);
    setPauseUntil("");
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Subscribers</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your subscription customers and their delivery status
        </p>
      </div>

      <div className="mb-6 flex gap-1 rounded-lg border border-gray-200 bg-gray-100 p-1">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-semibold capitalize transition ${
              activeTab === tab
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
        </div>
      ) : subscriptions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 py-16">
          <Users className="h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            No {activeTab === "all" ? "" : activeTab} subscribers
          </h3>
          <p className="mt-2 max-w-sm text-center text-sm text-gray-600">
            {activeTab === "active"
              ? "Subscribers will appear here once customers sign up for your plans."
              : `No ${activeTab} subscriptions at the moment.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {subscriptions.map((sub) => (
            <div
              key={sub.id}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                  {sub.customer.name.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-gray-900">{sub.customer.name}</span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${statusBadge(sub.status)}`}
                    >
                      {sub.status}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-gray-500">{sub.customer.phone}</p>

                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                    <span className="font-medium text-gray-700">{sub.plan.name}</span>
                    <span>{FREQUENCY_LABELS[sub.plan.frequency] ?? sub.plan.frequency}</span>
                    <span>
                      Qty: {sub.quantity}
                      {sub.plan.unit ? ` ${sub.plan.unit}` : ""}
                    </span>
                    <span>₹{(sub.plan.pricePaise / 100).toFixed(0)}/delivery</span>
                    <span>
                      Since{" "}
                      {new Date(sub.startDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  {sub.pausedUntil && (
                    <p className="mt-1 text-xs text-yellow-600">
                      Paused until{" "}
                      {new Date(sub.pausedUntil).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  )}
                </div>

                <div className="flex flex-shrink-0 items-center gap-2">
                  {acting === sub.id ? (
                    <Loader2 size={18} className="animate-spin text-gray-400" />
                  ) : (
                    <>
                      {sub.status === "active" && (
                        <>
                          <button
                            onClick={() => setPauseModal({ id: sub.id })}
                            className="flex items-center gap-1.5 rounded-lg border border-yellow-300 bg-yellow-50 px-3 py-1.5 text-xs font-semibold text-yellow-700 transition hover:bg-yellow-100"
                          >
                            <Pause size={12} />
                            Pause
                          </button>
                          <button
                            onClick={() => handleAction(sub.id, "cancel")}
                            className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                          >
                            <XCircle size={12} />
                            Cancel
                          </button>
                        </>
                      )}
                      {sub.status === "paused" && (
                        <>
                          <button
                            onClick={() => handleAction(sub.id, "resume")}
                            className="flex items-center gap-1.5 rounded-lg border border-green-300 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 transition hover:bg-green-100"
                          >
                            <Play size={12} />
                            Resume
                          </button>
                          <button
                            onClick={() => handleAction(sub.id, "cancel")}
                            className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                          >
                            <XCircle size={12} />
                            Cancel
                          </button>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {pauseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Pause Subscription</h2>
              <button
                onClick={() => setPauseModal(null)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900"
              >
                <X size={20} />
              </button>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Paused Until <span className="text-gray-400 font-normal">optional</span>
              </label>
              <input
                type="date"
                value={pauseUntil}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setPauseUntil(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-base outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
              <p className="mt-1 text-xs text-gray-400">Leave blank to pause indefinitely</p>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setPauseModal(null)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePauseSubmit}
                className="flex-1 rounded-lg bg-yellow-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-yellow-600"
              >
                Pause
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
