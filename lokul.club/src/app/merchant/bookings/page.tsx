"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Phone,
  CheckCircle,
  XCircle,
  Clock,
  User,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useProfileLabels, useMerchantProfile } from "@/lib/merchant-profile-context";

type Appointment = {
  id: string;
  serviceLabel: string;
  scheduledAt: string;
  status: string;
  notesForMerchant?: string | null;
  cancellationReason?: string | null;
  user: { id: string; name: string; phone: string; avatarUrl?: string | null };
  slot?: { date: string; startTime: string; endTime: string } | null;
};

const FILTERS = [
  { value: "today", label: "Today" },
  { value: "upcoming", label: "Upcoming" },
  { value: "past", label: "Past" },
  { value: "cancelled", label: "Cancelled" },
] as const;

type FilterValue = (typeof FILTERS)[number]["value"];

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  pending:   { bg: "bg-yellow-100", text: "text-yellow-700", label: "Pending" },
  confirmed: { bg: "bg-blue-100",   text: "text-blue-700",   label: "Confirmed" },
  cancelled: { bg: "bg-red-100",    text: "text-red-700",    label: "Cancelled" },
  completed: { bg: "bg-green-100",  text: "text-green-700",  label: "Completed" },
};

function formatScheduledAt(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export default function BookingsPage() {
  const labels = useProfileLabels();
  const profile = useMerchantProfile();
  const [filter, setFilter] = useState<FilterValue>("upcoming");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [cancelModal, setCancelModal] = useState<{ id: string; name: string } | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/merchant/bookings?filter=${filter}`);
      const data = await res.json();
      setAppointments(data.appointments ?? []);
    } catch {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  async function doAction(id: string, action: "confirm" | "cancel" | "complete", reason?: string) {
    setActionLoading(id + action);
    try {
      await fetch(`/api/merchant/bookings/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason }),
      });
      setAppointments((prev) =>
        prev.map((a) => {
          if (a.id !== id) return a;
          const statusMap: Record<string, string> = { confirm: "confirmed", cancel: "cancelled", complete: "completed" };
          return { ...a, status: statusMap[action], cancellationReason: action === "cancel" ? (reason ?? null) : a.cancellationReason };
        })
      );
    } finally {
      setActionLoading(null);
    }
  }

  function handleCancel(id: string, name: string) {
    setCancelReason("");
    setCancelModal({ id, name });
  }

  async function submitCancel() {
    if (!cancelModal) return;
    await doAction(cancelModal.id, "cancel", cancelReason || undefined);
    setCancelModal(null);
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{labels.bookings}</h1>
        <p className="mt-1 text-sm text-gray-600">
          {profile === "home_services"
            ? "Track incoming service requests and update job progress."
            : "Manage your appointments and bookings"}
        </p>
      </div>

      {/* Filter tabs */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`shrink-0 rounded-md px-4 py-2 text-sm font-semibold transition ${
              filter === f.value
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
        </div>
      ) : appointments.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 bg-gray-50 py-16">
          <CalendarDays className="h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">No bookings found</h3>
          <p className="mt-2 text-sm text-gray-600">
            {filter === "today" && "No appointments scheduled for today."}
            {filter === "upcoming" && "No upcoming appointments."}
            {filter === "past" && "No past appointments."}
            {filter === "cancelled" && "No cancelled appointments."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((appt) => {
            const statusStyle = STATUS_STYLES[appt.status] ?? STATUS_STYLES.pending;
            const isLoading = actionLoading?.startsWith(appt.id);
            return (
              <div
                key={appt.id}
                className="rounded-md border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-blue-100">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-base font-semibold text-gray-900 truncate">
                        {appt.serviceLabel}
                      </p>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}
                      >
                        {statusStyle.label}
                      </span>
                    </div>

                    <p className="mt-0.5 text-sm text-gray-700 font-medium">{appt.user.name}</p>

                    <div className="mt-1.5 flex flex-wrap items-center gap-3">
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock size={12} />
                        {formatScheduledAt(appt.scheduledAt)}
                      </span>
                      {appt.slot && (
                        <span className="text-xs text-gray-500">
                          {appt.slot.startTime} – {appt.slot.endTime}
                        </span>
                      )}
                    </div>

                    {appt.cancellationReason && (
                      <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle size={12} />
                        {appt.cancellationReason}
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <a
                        href={`tel:${appt.user.phone}`}
                        className="flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
                      >
                        <Phone size={13} />
                        {appt.user.phone}
                      </a>

                      {appt.status === "pending" && (
                        <>
                          <button
                            onClick={() => doAction(appt.id, "confirm")}
                            disabled={!!isLoading}
                            className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                          >
                            {isLoading && actionLoading === appt.id + "confirm" ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <CheckCircle size={13} />
                            )}
                            Confirm
                          </button>
                          <button
                            onClick={() => handleCancel(appt.id, appt.user.name)}
                            disabled={!!isLoading}
                            className="flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                          >
                            <XCircle size={13} />
                            Cancel
                          </button>
                        </>
                      )}

                      {appt.status === "confirmed" && (
                        <>
                          <button
                            onClick={() => doAction(appt.id, "complete")}
                            disabled={!!isLoading}
                            className="flex items-center gap-1.5 rounded-md bg-green-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
                          >
                            {isLoading && actionLoading === appt.id + "complete" ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <CheckCircle size={13} />
                            )}
                            Complete
                          </button>
                          <button
                            onClick={() => handleCancel(appt.id, appt.user.name)}
                            disabled={!!isLoading}
                            className="flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                          >
                            <XCircle size={13} />
                            Cancel
                          </button>
                        </>
                      )}

                      <Link
                        href={`/merchant/bookings/${appt.id}`}
                        className="ml-auto flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700"
                      >
                        View <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel modal */}
      {cancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-md bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-gray-900">Cancel Appointment</h2>
            <p className="mt-1 text-sm text-gray-600">
              Are you sure you want to cancel the appointment for{" "}
              <span className="font-semibold">{cancelModal.name}</span>?
            </p>
            <div className="mt-4">
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Reason (optional)
              </label>
              <textarea
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Merchant unavailable, rescheduling…"
                className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none"
              />
            </div>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setCancelModal(null)}
                className="flex-1 rounded-md border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={submitCancel}
                disabled={actionLoading?.startsWith(cancelModal.id)}
                className="flex flex-1 items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading?.startsWith(cancelModal.id) && (
                  <Loader2 size={14} className="animate-spin" />
                )}
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
