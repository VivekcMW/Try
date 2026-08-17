"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, CalendarDays, ChevronLeft, ChevronRight, Clock, Users, Loader2, X, CalendarRange, CheckSquare, Square } from "lucide-react";
import { useMerchantProfile, useProfileLabels, useMerchantWorkflowConfig } from "@/lib/merchant-profile-context";
import { useToast } from "@/components/ui";

type ServiceSlot = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedCount: number;
};

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DURATION_OPTIONS = [30, 45, 60, 90, 120];

function getTodayString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function shiftDate(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  const ny = date.getFullYear();
  const nm = String(date.getMonth() + 1).padStart(2, "0");
  const nd = String(date.getDate()).padStart(2, "0");
  return `${ny}-${nm}-${nd}`;
}

function formatDateNice(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(t: string): string {
  return t.slice(0, 5);
}

function addMinutes(hhmm: string, minutes: number): string {
  const [h, min] = hhmm.split(":").map(Number);
  const total = h * 60 + min + minutes;
  const nh = Math.floor(total / 60) % 24;
  const nm = total % 60;
  return `${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}`;
}

function generateWeekSlots(
  startTime: string,
  endTime: string,
  durationMins: number,
  capacity: number,
  days: boolean[],
  weeksAhead: number
): Array<{ date: string; startTime: string; endTime: string; capacity: number }> {
  const slots: Array<{ date: string; startTime: string; endTime: string; capacity: number }> = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let week = 0; week < weeksAhead; week++) {
    for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
      if (!days[dayOfWeek]) continue;

      const date = new Date(today);
      const currentDayOfWeek = today.getDay();
      const targetDayOfWeek = dayOfWeek === 6 ? 0 : dayOfWeek + 1;
      let diff = targetDayOfWeek - currentDayOfWeek;
      if (diff < 0) diff += 7;
      date.setDate(today.getDate() + diff + week * 7);

      const y = date.getFullYear();
      const mo = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      const dateStr = `${y}-${mo}-${d}`;

      let current = startTime;
      while (true) {
        const next = addMinutes(current, durationMins);
        if (next > endTime) break;
        slots.push({ date: dateStr, startTime: current, endTime: next, capacity });
        current = next;
      }
    }
  }
  return slots;
}

export default function SlotsPage() {
  const profile = useMerchantProfile();
  const labels = useProfileLabels();
  const workflowConfig = useMerchantWorkflowConfig();
  const toast = useToast();
  const [merchantId, setMerchantId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [slots, setSlots] = useState<ServiceSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSlot, setNewSlot] = useState({ startTime: "", endTime: "", capacity: 1 });
  const [saving, setSaving] = useState(false);

  const [showWeekModal, setShowWeekModal] = useState(false);
  const [weekConfig, setWeekConfig] = useState({
    startTime: "09:00",
    endTime: "18:00",
    durationMins: 60,
    capacity: 1,
    weeksAhead: 1,
    days: [true, true, true, true, true, true, false],
  });
  const [weekSaving, setWeekSaving] = useState(false);
  const [weekProgress, setWeekProgress] = useState<{ done: number; total: number } | null>(null);
  const [weekSuccess, setWeekSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const res = await fetch("/api/merchant/auth/session");
        const data = await res.json();
        if (!data.authenticated) return;
        setMerchantId(data.merchant.id);
      } catch (error) {
        console.error("Failed to load session:", error);
      }
    }
    init();
  }, []);

  const loadSlots = useCallback(async () => {
    if (!merchantId) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/mobile/merchants/${merchantId}/slots?date=${selectedDate}`
      );
      const data = await res.json();
      setSlots(data.slots ?? []);
    } catch (error) {
      console.error("Failed to load slots:", error);
      setSlots([]);
    } finally {
      setLoading(false);
    }
  }, [merchantId, selectedDate]);

  useEffect(() => {
    if (merchantId) {
      loadSlots();
    }
  }, [loadSlots, merchantId]);

  const handleAddSlot = async () => {
    if (!newSlot.startTime || !newSlot.endTime || !merchantId) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/mobile/merchants/${merchantId}/slots`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slots: [
            {
              date: selectedDate,
              startTime: newSlot.startTime,
              endTime: newSlot.endTime,
              capacity: newSlot.capacity,
            },
          ],
        }),
      });

      if (!res.ok) throw new Error("Failed to add slot");

      setNewSlot({ startTime: "", endTime: "", capacity: 1 });
      setShowAddForm(false);
      await loadSlots();
    } catch (error) {
      toast.error("Failed to add slot", "Please try again");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddWeekSlots = async () => {
    if (!merchantId) return;

    const slotsToCreate = generateWeekSlots(
      weekConfig.startTime,
      weekConfig.endTime,
      weekConfig.durationMins,
      weekConfig.capacity,
      weekConfig.days,
      weekConfig.weeksAhead
    );

    if (slotsToCreate.length === 0) {
      toast.warning("No slots to create", "Check your configuration");
      return;
    }

    setWeekSaving(true);
    setWeekProgress({ done: 0, total: slotsToCreate.length });
    setWeekSuccess(null);

    let done = 0;
    for (const slot of slotsToCreate) {
      try {
        await fetch(`/api/mobile/merchants/${merchantId}/slots`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slots: [slot] }),
        });
      } catch {
        // continue on individual failures
      }
      done++;
      setWeekProgress({ done, total: slotsToCreate.length });
    }

    setWeekSaving(false);
    setWeekSuccess(`Created ${done} slots successfully.`);
    await loadSlots();
  };

  const toggleDay = (idx: number) => {
    setWeekConfig((prev) => {
      const days = [...prev.days];
      days[idx] = !days[idx];
      return { ...prev, days };
    });
  };

  const canSave =
    newSlot.startTime.trim() !== "" &&
    newSlot.endTime.trim() !== "" &&
    newSlot.capacity >= 1;

  const canSaveWeek =
    weekConfig.startTime < weekConfig.endTime &&
    weekConfig.days.some(Boolean) &&
    !weekSaving;

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900">{profile === "home_services" ? "Availability" : labels.slots}</h1>
          <p className="mt-1 text-sm text-gray-600">
            {profile === "home_services"
              ? "Set your service windows and availability for incoming job requests."
              : `Manage available time slots for ${workflowConfig.label.toLowerCase()} bookings.`}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={() => { setWeekSuccess(null); setWeekProgress(null); setShowWeekModal(true); }}
            className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 hover:shadow-md active:scale-95"
          >
            <CalendarRange size={18} />
            Add Week&apos;s Slots
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md active:scale-95"
          >
            <Plus size={18} />
            Add Slot
          </button>
        </div>
      </div>

      {/* Date Selector */}
      <div className="mb-6 flex items-center gap-3 rounded-md border border-gray-200 bg-white p-4 shadow-sm">
        <button
          onClick={() => setSelectedDate((d) => shiftDate(d, -1))}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 text-gray-600 transition hover:bg-gray-100 active:scale-95"
          aria-label="Previous day"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="flex flex-1 items-center justify-center gap-2">
          <CalendarDays size={18} className="text-blue-600" />
          <span className="text-sm font-semibold text-gray-900">
            {formatDateNice(selectedDate)}
          </span>
        </div>

        <button
          onClick={() => setSelectedDate((d) => shiftDate(d, 1))}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 text-gray-600 transition hover:bg-gray-100 active:scale-95"
          aria-label="Next day"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Slot List */}
      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
        </div>
      ) : slots.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 bg-gray-50 py-16">
          <Clock className="h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">No slots for this date</h3>
          <p className="mt-2 text-sm text-gray-600">
            Add slots to accept bookings for this day.
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="mt-6 flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Plus size={18} />
            Add Slot
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {slots.map((slot) => {
            const available = slot.capacity - slot.bookedCount;
            const full = available <= 0;
            return (
              <div
                key={slot.id}
                className={`flex items-center gap-4 rounded-md border bg-white p-4 shadow-sm transition hover:shadow-md ${
                  full ? "border-red-200" : "border-gray-200"
                }`}
              >
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-md ${
                    full ? "bg-red-100" : "bg-blue-100"
                  }`}
                >
                  <Clock className={`h-6 w-6 ${full ? "text-red-600" : "text-blue-600"}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-gray-900">
                    {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                      <Users size={12} />
                      {slot.capacity === 1 ? "1 seat" : `${slot.capacity} seats`}
                    </span>
                    {slot.bookedCount > 0 && (
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          full
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {slot.bookedCount} booked
                      </span>
                    )}
                    {full && (
                      <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
                        Full
                      </span>
                    )}
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <p className={`text-sm font-semibold ${full ? "text-red-600" : "text-green-600"}`}>
                    {full ? "0" : available} left
                  </p>
                  <p className="text-xs text-gray-500">available</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Slot Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-md bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Add Time Slot</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900"
              >
                <X size={20} />
              </button>
            </div>

            <p className="mb-5 text-sm text-gray-600">
              Adding slot for{" "}
              <span className="font-semibold text-gray-800">
                {formatDateNice(selectedDate)}
              </span>
            </p>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Start Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={newSlot.startTime}
                    onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-base outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    End Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={newSlot.endTime}
                    onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-base outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Capacity (seats)
                </label>
                <input
                  type="number"
                  min={1}
                  value={newSlot.capacity}
                  onChange={(e) =>
                    setNewSlot({ ...newSlot, capacity: Math.max(1, parseInt(e.target.value) || 1) })
                  }
                  className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-base outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <p className="mt-1 text-xs text-gray-500">
                  How many customers can book this slot simultaneously
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewSlot({ startTime: "", endTime: "", capacity: 1 });
                }}
                className="flex-1 rounded-md border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSlot}
                disabled={!canSave || saving}
                className="flex flex-1 items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving && <Loader2 size={16} className="animate-spin" />}
                Save Slot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Week's Slots Modal */}
      {showWeekModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-md bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Add Week&apos;s Slots</h2>
              <button
                onClick={() => setShowWeekModal(false)}
                className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5">
              {/* Working hours */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Working Hours Start
                  </label>
                  <input
                    type="time"
                    value={weekConfig.startTime}
                    onChange={(e) => setWeekConfig({ ...weekConfig, startTime: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-base outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Working Hours End
                  </label>
                  <input
                    type="time"
                    value={weekConfig.endTime}
                    onChange={(e) => setWeekConfig({ ...weekConfig, endTime: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-base outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Slot Duration
                </label>
                <select
                  value={weekConfig.durationMins}
                  onChange={(e) => setWeekConfig({ ...weekConfig, durationMins: Number(e.target.value) })}
                  className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-base outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  {DURATION_OPTIONS.map((d) => (
                    <option key={d} value={d}>
                      {d} minutes
                    </option>
                  ))}
                </select>
              </div>

              {/* Capacity */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Capacity per Slot
                </label>
                <input
                  type="number"
                  min={1}
                  value={weekConfig.capacity}
                  onChange={(e) =>
                    setWeekConfig({ ...weekConfig, capacity: Math.max(1, parseInt(e.target.value) || 1) })
                  }
                  className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-base outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Days of the week */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Days of the Week
                </label>
                <div className="flex gap-2 flex-wrap">
                  {DAY_LABELS.map((day, idx) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(idx)}
                      className={`flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium transition ${
                        weekConfig.days[idx]
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {weekConfig.days[idx] ? <CheckSquare size={14} /> : <Square size={14} />}
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              {/* Weeks ahead */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Weeks Ahead
                </label>
                <div className="flex gap-3">
                  {[1, 2].map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setWeekConfig({ ...weekConfig, weeksAhead: w })}
                      className={`flex-1 rounded-md border py-2.5 text-sm font-semibold transition ${
                        weekConfig.weeksAhead === w
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {w} {w === 1 ? "week" : "weeks"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Progress indicator */}
              {weekProgress && (
                <div>
                  <div className="mb-1 flex justify-between text-xs text-gray-500">
                    <span>Creating slots…</span>
                    <span>{weekProgress.done} / {weekProgress.total}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-blue-600 transition-all"
                      style={{ width: `${(weekProgress.done / weekProgress.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Success message */}
              {weekSuccess && (
                <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm font-medium text-green-700">
                  {weekSuccess}
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowWeekModal(false)}
                className="flex-1 rounded-md border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                {weekSuccess ? "Close" : "Cancel"}
              </button>
              {!weekSuccess && (
                <button
                  onClick={handleAddWeekSlots}
                  disabled={!canSaveWeek}
                  className="flex flex-1 items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {weekSaving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Creating…
                    </>
                  ) : (
                    <>
                      <CalendarRange size={16} />
                      Create Slots
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
