"use client";
import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Truck, CheckCircle2, XCircle, Clock } from "lucide-react";

type Delivery = {
  id: string;
  deliveryDate: string;
  status: string;
  deliveredAt: string | null;
  notes: string | null;
  subscription: {
    quantity: number;
    customer: {
      name: string;
      phone: string;
      avatarUrl: string | null;
    };
    plan: {
      name: string;
      frequency: string;
      unit: string | null;
    };
  };
};

function toDateStr(date: Date): string {
  return date.toISOString().split("T")[0];
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
}

export default function DeliveriesPage() {
  const [date, setDate] = useState<string>(toDateStr(new Date()));
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState<string | null>(null);

  const load = useCallback(async (d: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/merchant/deliveries?date=${d}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setDeliveries(data.deliveries ?? []);
    } catch (err) {
      console.error("Failed to load deliveries:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(date);
  }, [date, load]);

  const navigate = (delta: number) => {
    const d = new Date(date + "T00:00:00");
    d.setDate(d.getDate() + delta);
    setDate(toDateStr(d));
  };

  const handleMark = async (deliveryId: string, status: "delivered" | "missed") => {
    setMarking(deliveryId);
    try {
      const res = await fetch("/api/merchant/deliveries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryId, status }),
      });
      if (!res.ok) throw new Error("Mark failed");
      setDeliveries((prev) =>
        prev.map((d) =>
          d.id === deliveryId
            ? { ...d, status, deliveredAt: status === "delivered" ? new Date().toISOString() : null }
            : d
        )
      );
    } catch (err) {
      console.error("Failed to mark delivery:", err);
    } finally {
      setMarking(null);
    }
  };

  const total = deliveries.length;
  const delivered = deliveries.filter((d) => d.status === "delivered").length;
  const missed = deliveries.filter((d) => d.status === "missed").length;
  const pending = deliveries.filter((d) => d.status === "pending").length;
  const progress = total > 0 ? (delivered / total) * 100 : 0;

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Deliveries</h1>
        <p className="mt-1 text-sm text-gray-600">Track and mark daily subscription deliveries</p>
      </div>

      <div className="mb-6 flex items-center justify-between gap-4">
        <button
          onClick={() => navigate(-1)}
          className="rounded-md border border-gray-300 p-2 text-gray-600 transition hover:bg-gray-50"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="text-center">
          <p className="text-base font-semibold text-gray-900">{formatDate(date)}</p>
          {date === toDateStr(new Date()) && (
            <span className="text-xs font-medium text-blue-600">Today</span>
          )}
        </div>
        <button
          onClick={() => navigate(1)}
          className="rounded-md border border-gray-300 p-2 text-gray-600 transition hover:bg-gray-50"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {total > 0 && (
        <div className="mb-6 rounded-md border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="font-semibold text-gray-700">
              {delivered} of {total} delivered
            </span>
            <span className="text-gray-400">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-2 rounded-full bg-green-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-3 flex gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-gray-500">
              <Clock size={12} className="text-gray-400" />
              <span>{pending} pending</span>
            </div>
            <div className="flex items-center gap-1.5 text-green-600">
              <CheckCircle2 size={12} />
              <span>{delivered} delivered</span>
            </div>
            <div className="flex items-center gap-1.5 text-red-500">
              <XCircle size={12} />
              <span>{missed} missed</span>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
        </div>
      ) : deliveries.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 bg-gray-50 py-16">
          <Truck className="h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">No deliveries scheduled</h3>
          <p className="mt-2 max-w-sm text-center text-sm text-gray-600">
            No deliveries are scheduled for this date.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {deliveries.map((delivery) => {
            const { subscription: sub } = delivery;
            const isPending = delivery.status === "pending";
            const isDelivered = delivery.status === "delivered";
            const isMissed = delivery.status === "missed";

            return (
              <div
                key={delivery.id}
                className={`flex items-center gap-4 rounded-md border bg-white p-4 shadow-sm transition ${
                  isDelivered
                    ? "border-green-200 bg-green-50/30"
                    : isMissed
                    ? "border-red-200 bg-red-50/30"
                    : "border-gray-200 hover:shadow-md"
                }`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                  {sub.customer.name.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-gray-900">{sub.customer.name}</span>
                    {isDelivered && (
                      <span className="flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                        <CheckCircle2 size={10} />
                        Delivered
                      </span>
                    )}
                    {isMissed && (
                      <span className="flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                        <XCircle size={10} />
                        Missed
                      </span>
                    )}
                    {isPending && (
                      <span className="flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
                        <Clock size={10} />
                        Pending
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-500">
                    <span>{sub.plan.name}</span>
                    <span>
                      Qty: {sub.quantity}
                      {sub.plan.unit ? ` ${sub.plan.unit}` : ""}
                    </span>
                    <span>{sub.customer.phone}</span>
                  </div>
                </div>

                {isPending && (
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={() => handleMark(delivery.id, "delivered")}
                      disabled={marking === delivery.id}
                      className="flex items-center gap-1.5 rounded-md bg-green-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
                    >
                      <CheckCircle2 size={12} />
                      Delivered
                    </button>
                    <button
                      onClick={() => handleMark(delivery.id, "missed")}
                      disabled={marking === delivery.id}
                      className="flex items-center gap-1.5 rounded-md border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                    >
                      <XCircle size={12} />
                      Missed
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
