"use client";

import { useEffect, useState } from "react";
import {
  Briefcase,
  Clock,
  IndianRupee,
  MessageSquare,
  CheckCircle,
  X,
  Loader2,
  User,
} from "lucide-react";
import { useProfileLabels } from "@/lib/merchant-profile-context";

type QuoteStatus = "open" | "quoted" | "accepted" | "declined";

type QuoteRequest = {
  id: string;
  serviceDescription: string;
  budgetPaise: number | null;
  status: QuoteStatus;
  merchantReply: string | null;
  quotedPaise: number | null;
  repliedAt: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    phone: string;
    avatarUrl: string | null;
  };
};

type Filter = "all" | "open" | "quoted" | "accepted" | "declined";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function formatRupees(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

function statusBadge(status: QuoteStatus) {
  const map = {
    open: "bg-yellow-100 text-yellow-800 border border-yellow-200",
    quoted: "bg-blue-100 text-blue-800 border border-blue-200",
    accepted: "bg-green-100 text-green-800 border border-green-200",
    declined: "bg-gray-100 text-gray-600 border border-gray-200",
  };
  const label = {
    open: "Open",
    quoted: "Quoted",
    accepted: "Accepted",
    declined: "Declined",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${map[status]}`}>
      {label[status]}
    </span>
  );
}

function getInitial(name: string): string {
  return (name ?? "?").charAt(0).toUpperCase();
}

export default function RequestsPage() {
  const labels = useProfileLabels();
  const [requests, setRequests] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");

  // Quote panel state
  const [quoteTarget, setQuoteTarget] = useState<string | null>(null);
  const [quoteAmount, setQuoteAmount] = useState("");
  const [quoteNote, setQuoteNote] = useState("");
  const [quoteSending, setQuoteSending] = useState(false);
  const [quoteError, setQuoteError] = useState("");

  // Action loading state
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  async function loadRequests(f: Filter = filter) {
    setLoading(true);
    try {
      const res = await fetch(`/api/merchant/requests?filter=${f}`);
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests ?? []);
      }
    } catch (err) {
      console.error("Failed to load requests:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequests(filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function handleSendQuote(id: string) {
    const amountRupees = parseFloat(quoteAmount);
    if (!quoteAmount || isNaN(amountRupees) || amountRupees <= 0) {
      setQuoteError("Please enter a valid amount");
      return;
    }
    setQuoteSending(true);
    setQuoteError("");
    try {
      const res = await fetch(`/api/merchant/requests/${id}/quote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quotedPaise: Math.round(amountRupees * 100),
          note: quoteNote.trim() || undefined,
        }),
      });
      if (res.ok) {
        setQuoteTarget(null);
        setQuoteAmount("");
        setQuoteNote("");
        loadRequests(filter);
      } else {
        const d = await res.json();
        setQuoteError(d.error || "Failed to send quote");
      }
    } catch {
      setQuoteError("Failed to send quote");
    } finally {
      setQuoteSending(false);
    }
  }

  async function handleStatusAction(id: string, action: "accept" | "decline") {
    setActionLoading(id + action);
    try {
      const res = await fetch(`/api/merchant/requests/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        loadRequests(filter);
      }
    } catch {
      // silent
    } finally {
      setActionLoading(null);
    }
  }

  const FILTERS: { value: Filter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "open", label: "Pending" },
    { value: "quoted", label: "Quoted" },
    { value: "accepted", label: "Accepted" },
    { value: "declined", label: "Declined" },
  ];

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600">
            <Briefcase className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{labels.requests}</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage service requests from customers
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === f.value
                ? "bg-brand-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
        </div>
      ) : requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 py-16">
          <Briefcase className="h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">No requests found</h3>
          <p className="mt-2 text-sm text-gray-600">
            {filter === "all"
              ? "New customer requests will appear here."
              : `No ${filter} requests at this time.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req.id}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              {/* Card header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-base font-bold text-brand-700">
                    {getInitial(req.user.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {req.user.name}
                    </p>
                    <p className="text-xs text-gray-500">{req.user.phone}</p>
                  </div>
                </div>
                <div className="flex flex-shrink-0 items-center gap-2">
                  {statusBadge(req.status)}
                </div>
              </div>

              {/* Description */}
              <p className="mt-3 text-sm text-gray-800 line-clamp-2">
                {req.serviceDescription}
              </p>

              {/* Meta row */}
              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {timeAgo(req.createdAt)}
                </span>
                {req.budgetPaise != null && (
                  <span className="flex items-center gap-1">
                    <IndianRupee className="h-3.5 w-3.5" />
                    Budget: {formatRupees(req.budgetPaise)}
                  </span>
                )}
                {req.quotedPaise != null && (
                  <span className="flex items-center gap-1 text-blue-600 font-medium">
                    <IndianRupee className="h-3.5 w-3.5" />
                    Quoted: {formatRupees(req.quotedPaise)}
                  </span>
                )}
              </div>

              {/* Merchant reply */}
              {req.merchantReply && (
                <div className="mt-3 flex items-start gap-2 rounded-lg bg-gray-50 p-3">
                  <MessageSquare className="h-4 w-4 flex-shrink-0 text-gray-400 mt-0.5" />
                  <p className="text-xs text-gray-600">{req.merchantReply}</p>
                </div>
              )}

              {/* Action buttons */}
              <div className="mt-4 flex flex-wrap gap-2">
                {req.status === "open" && (
                  <>
                    <button
                      onClick={() => {
                        setQuoteTarget(req.id);
                        setQuoteAmount("");
                        setQuoteNote("");
                        setQuoteError("");
                      }}
                      className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
                    >
                      <IndianRupee className="h-4 w-4" />
                      Send Quote
                    </button>
                    <button
                      onClick={() => handleStatusAction(req.id, "decline")}
                      disabled={actionLoading === req.id + "decline"}
                      className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                    >
                      {actionLoading === req.id + "decline" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                      Decline
                    </button>
                  </>
                )}

                {req.status === "quoted" && (
                  <>
                    <button
                      disabled
                      className="flex items-center gap-1.5 rounded-lg bg-blue-100 px-3 py-1.5 text-sm font-medium text-blue-700 cursor-not-allowed"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Quote Sent
                    </button>
                    <button
                      onClick={() => handleStatusAction(req.id, "decline")}
                      disabled={actionLoading === req.id + "decline"}
                      className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                    >
                      {actionLoading === req.id + "decline" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                      Decline
                    </button>
                  </>
                )}

                {req.status === "accepted" && (
                  <span className="flex items-center gap-1.5 rounded-lg bg-green-100 px-3 py-1.5 text-sm font-medium text-green-700">
                    <CheckCircle className="h-4 w-4" />
                    Job Accepted
                  </span>
                )}

                {req.status === "declined" && (
                  <span className="flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-600">
                    <X className="h-4 w-4" />
                    Declined
                  </span>
                )}
              </div>

              {/* Inline Quote Panel */}
              {quoteTarget === req.id && (
                <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
                  <h4 className="mb-3 text-sm font-semibold text-gray-900">Send Quote</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-700">
                        Quote Amount (₹) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 font-medium text-sm">
                          ₹
                        </span>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={quoteAmount}
                          onChange={(e) => setQuoteAmount(e.target.value)}
                          placeholder="e.g. 500"
                          className="w-full rounded-lg border border-gray-300 pl-7 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-700">
                        Note (optional)
                      </label>
                      <textarea
                        rows={2}
                        value={quoteNote}
                        onChange={(e) => setQuoteNote(e.target.value)}
                        placeholder="Any details about the service, visit time, etc."
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                      />
                    </div>
                    {quoteError && (
                      <p className="text-xs text-red-600">{quoteError}</p>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSendQuote(req.id)}
                        disabled={quoteSending}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50 transition-colors"
                      >
                        {quoteSending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <IndianRupee className="h-4 w-4" />
                        )}
                        Send Quote
                      </button>
                      <button
                        onClick={() => setQuoteTarget(null)}
                        disabled={quoteSending}
                        className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
