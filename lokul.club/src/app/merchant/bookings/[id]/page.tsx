"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  CalendarDays,
  Phone,
  MessageCircle,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Clock,
  User,
  FileText,
  AlertCircle,
  Loader2,
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

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  pending:   { bg: "bg-yellow-100", text: "text-yellow-800", label: "Pending" },
  confirmed: { bg: "bg-blue-100",   text: "text-blue-800",   label: "Confirmed" },
  cancelled: { bg: "bg-red-100",    text: "text-red-800",    label: "Cancelled" },
  completed: { bg: "bg-green-100",  text: "text-green-800",  label: "Completed" },
};

function formatScheduledAt(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function parseNotes(raw?: string | null): { isJson: boolean; data: Record<string, string>; plain: string } {
  if (!raw) return { isJson: false, data: {}, plain: "" };
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === "object" && parsed !== null) {
      return { isJson: true, data: parsed as Record<string, string>, plain: "" };
    }
  } catch {
    // not json
  }
  return { isJson: false, data: {}, plain: raw };
}

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const labels = useProfileLabels();
  const profile = useMerchantProfile();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [cancelModal, setCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/merchant/bookings/${id}`);
        if (res.status === 404) { setNotFound(true); return; }
        const data = await res.json();
        setAppointment(data.appointment);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function doAction(action: "confirm" | "cancel" | "complete", reason?: string) {
    setActionLoading(action);
    try {
      await fetch(`/api/merchant/bookings/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason }),
      });
      setAppointment((prev) => {
        if (!prev) return prev;
        const statusMap: Record<string, string> = { confirm: "confirmed", cancel: "cancelled", complete: "completed" };
        return {
          ...prev,
          status: statusMap[action],
          cancellationReason: action === "cancel" ? (reason ?? null) : prev.cancellationReason,
        };
      });
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
      </div>
    );
  }

  if (notFound || !appointment) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Appointment not found.</p>
        <button onClick={() => router.back()} className="mt-4 text-sm text-blue-600 hover:underline">
          Go back
        </button>
      </div>
    );
  }

  const statusStyle = STATUS_STYLES[appointment.status] ?? STATUS_STYLES.pending;
  const notes = parseNotes(appointment.notesForMerchant);
  const isEvents = profile === "events";

  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition"
      >
        <ArrowLeft size={16} />
        {labels.bookings}
      </button>

      {/* Status header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{appointment.serviceLabel}</h1>
          <p className="mt-1 text-sm text-gray-500">Booking ID: {appointment.id.slice(-8).toUpperCase()}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${statusStyle.bg} ${statusStyle.text}`}>
          {statusStyle.label}
        </span>
      </div>

      {/* Date / time card */}
      <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <CalendarDays className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
          <div>
            <p className="text-sm font-medium text-gray-900">{formatScheduledAt(appointment.scheduledAt)}</p>
            {appointment.slot && (
              <p className="mt-0.5 text-sm text-gray-500">
                Slot: {appointment.slot.startTime} – {appointment.slot.endTime}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Customer card */}
      <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Customer</p>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-base font-semibold text-gray-900">{appointment.user.name}</p>
            <p className="text-sm text-gray-500">{appointment.user.phone}</p>
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <a
            href={`tel:${appointment.user.phone}`}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            <Phone size={16} />
            Call
          </a>
          <a
            href={`https://wa.me/${appointment.user.phone.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-green-200 py-2.5 text-sm font-semibold text-green-700 transition hover:bg-green-50"
          >
            <MessageCircle size={16} />
            WhatsApp
          </a>
        </div>
      </div>

      {/* Notes / payment info */}
      {appointment.notesForMerchant && (
        <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
            {isEvents ? "Payment & Notes" : "Notes"}
          </p>
          {notes.isJson ? (
            <div className="space-y-2">
              {isEvents && notes.data.advancePaid !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Advance Paid</span>
                  <span className="text-sm font-semibold text-green-700">₹{notes.data.advancePaid}</span>
                </div>
              )}
              {isEvents && notes.data.balanceDue !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Balance Due</span>
                  <span className="text-sm font-semibold text-red-600">₹{notes.data.balanceDue}</span>
                </div>
              )}
              {Object.entries(notes.data)
                .filter(([k]) => !["advancePaid", "balanceDue"].includes(k))
                .map(([k, v]) => (
                  <div key={k} className="flex items-start justify-between gap-2">
                    <span className="text-sm text-gray-600 capitalize">{k.replace(/_/g, " ")}</span>
                    <span className="text-sm font-medium text-gray-900 text-right">{String(v)}</span>
                  </div>
                ))}
            </div>
          ) : (
            <div className="flex items-start gap-2">
              <FileText size={16} className="mt-0.5 flex-shrink-0 text-gray-400" />
              <p className="text-sm text-gray-700">{notes.plain}</p>
            </div>
          )}
        </div>
      )}

      {/* Cancellation reason */}
      {appointment.cancellationReason && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-2">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0 text-red-500" />
            <div>
              <p className="text-sm font-semibold text-red-700">Cancellation Reason</p>
              <p className="mt-0.5 text-sm text-red-600">{appointment.cancellationReason}</p>
            </div>
          </div>
        </div>
      )}

      {/* Action buttons */}
      {(appointment.status === "pending" || appointment.status === "confirmed") && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Actions</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            {appointment.status === "pending" && (
              <button
                onClick={() => doAction("confirm")}
                disabled={!!actionLoading}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
              >
                {actionLoading === "confirm" ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                Confirm Appointment
              </button>
            )}
            {appointment.status === "confirmed" && (
              <button
                onClick={() => doAction("complete")}
                disabled={!!actionLoading}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
              >
                {actionLoading === "complete" ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                Mark as Complete
              </button>
            )}
            <button
              onClick={() => { setCancelReason(""); setCancelModal(true); }}
              disabled={!!actionLoading}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
            >
              <XCircle size={16} />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Cancel modal */}
      {cancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-gray-900">Cancel Appointment</h2>
            <p className="mt-1 text-sm text-gray-600">
              Cancel appointment for{" "}
              <span className="font-semibold">{appointment.user.name}</span>?
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
                className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setCancelModal(false)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={async () => {
                  await doAction("cancel", cancelReason || undefined);
                  setCancelModal(false);
                }}
                disabled={!!actionLoading}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading === "cancel" && <Loader2 size={14} className="animate-spin" />}
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
