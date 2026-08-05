"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import {
  ArrowLeft,
  Phone,
  IndianRupee,
  Clock,
  MessageSquare,
  Navigation,
  CheckCircle,
  Loader2,
  User,
} from "lucide-react";
import Link from "next/link";

type JobStatus = "scheduled" | "on_the_way" | "completed";

type Job = {
  id: string;
  serviceDescription: string;
  budgetPaise: number | null;
  quotedPaise: number | null;
  merchantReply: string | null;
  repliedAt: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    phone: string;
    avatarUrl: string | null;
  };
};

function parseJobStatus(merchantReply: string | null): JobStatus {
  if (!merchantReply) return "scheduled";
  try {
    const parsed = JSON.parse(merchantReply);
    if (parsed?.jobStatus === "on_the_way") return "on_the_way";
    if (parsed?.jobStatus === "completed") return "completed";
  } catch {
    // plain text
  }
  return "scheduled";
}

function parseNote(merchantReply: string | null): string | null {
  if (!merchantReply) return null;
  try {
    const parsed = JSON.parse(merchantReply);
    return parsed?.note ?? null;
  } catch {
    return merchantReply;
  }
}

function formatRupees(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [jobStatus, setJobStatus] = useState<JobStatus>("scheduled");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/merchant/requests/${id}`);
        if (res.ok) {
          const data = await res.json();
          setJob(data.request);
          setJobStatus(parseJobStatus(data.request.merchantReply));
          setNote(parseNote(data.request.merchantReply));
        }
      } catch (err) {
        console.error("Failed to load job:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleOnMyWay() {
    if (!job) return;
    setActionLoading("onway");
    setJobStatus("on_the_way");
    try {
      const noteVal = JSON.stringify({ jobStatus: "on_the_way" });
      await fetch(`/api/merchant/requests/${job.id}/quote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quotedPaise: job.quotedPaise ?? 100,
          note: noteVal,
        }),
      });
    } catch {
      setJobStatus("scheduled");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleMarkComplete() {
    if (!job) return;
    setActionLoading("complete");
    setJobStatus("completed");
    try {
      const noteVal = JSON.stringify({ jobStatus: "completed" });
      await fetch(`/api/merchant/requests/${job.id}/quote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quotedPaise: job.quotedPaise ?? 100,
          note: noteVal,
        }),
      });
    } catch {
      setJobStatus("on_the_way");
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="p-6">
        <p className="text-gray-600">Job not found.</p>
        <Link href="/merchant/jobs" className="mt-4 inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
          <ArrowLeft className="h-4 w-4" />
          Back to Jobs
        </Link>
      </div>
    );
  }

  const statusLabel = {
    scheduled: "Scheduled",
    on_the_way: "On My Way",
    completed: "Completed",
  }[jobStatus];

  const statusColor = {
    scheduled: "bg-yellow-100 text-yellow-800",
    on_the_way: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
  }[jobStatus];

  return (
    <div className="p-6 lg:p-8">
      {/* Back */}
      <Link
        href="/merchant/jobs"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Jobs
      </Link>

      <div className="max-w-2xl space-y-5">
        {/* Status banner */}
        <div className={`flex items-center justify-between rounded-[6px] p-4 ${statusColor}`}>
          <div>
            <p className="text-xs font-medium opacity-70">Job Status</p>
            <p className="text-lg font-bold">{statusLabel}</p>
          </div>
          <div className="flex gap-2">
            {jobStatus === "scheduled" && (
              <button
                onClick={handleOnMyWay}
                disabled={actionLoading === "onway"}
                className="flex items-center gap-1.5 rounded-[6px] bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {actionLoading === "onway" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Navigation className="h-4 w-4" />
                )}
                On My Way
              </button>
            )}
            {jobStatus === "on_the_way" && (
              <button
                onClick={handleMarkComplete}
                disabled={actionLoading === "complete"}
                className="flex items-center gap-1.5 rounded-[6px] bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {actionLoading === "complete" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                Mark Complete
              </button>
            )}
            {jobStatus === "completed" && (
              <span className="flex items-center gap-1.5 text-sm font-medium text-green-700">
                <CheckCircle className="h-4 w-4" />
                Job Done
              </span>
            )}
          </div>
        </div>

        {/* Customer Info */}
        <div className="rounded-[6px] border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />
            <h2 className="text-sm font-semibold text-gray-900">Customer</h2>
          </div>
          <div className="space-y-2">
            <p className="text-base font-semibold text-gray-900">{job.user.name}</p>
            <a
              href={`tel:${job.user.phone}`}
              className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
            >
              <Phone className="h-4 w-4" />
              {job.user.phone}
              <span className="text-xs text-gray-400">(tap to call)</span>
            </a>
          </div>
        </div>

        {/* Service Details */}
        <div className="rounded-[6px] border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">Service Description</h2>
          <p className="text-sm text-gray-800 whitespace-pre-wrap">{job.serviceDescription}</p>
        </div>

        {/* Pricing */}
        <div className="rounded-[6px] border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">Pricing</h2>
          <div className="space-y-2">
            {job.quotedPaise != null && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Agreed Price</span>
                <span className="flex items-center gap-1 text-base font-bold text-green-700">
                  <IndianRupee className="h-4 w-4" />
                  {formatRupees(job.quotedPaise)}
                </span>
              </div>
            )}
            {job.budgetPaise != null && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Customer Budget</span>
                <span className="flex items-center gap-1 text-sm text-gray-700">
                  <IndianRupee className="h-4 w-4" />
                  {formatRupees(job.budgetPaise)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        {note && (
          <div className="rounded-[6px] border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-gray-500" />
              <h2 className="text-sm font-semibold text-gray-900">Notes</h2>
            </div>
            <p className="text-sm text-gray-700">{note}</p>
          </div>
        )}

        {/* Timeline */}
        <div className="rounded-[6px] border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <h2 className="text-sm font-semibold text-gray-900">Timeline</h2>
          </div>
          <div className="space-y-1 text-xs text-gray-600">
            <p>Requested: {formatDate(job.createdAt)}</p>
            {job.repliedAt && <p>Quoted: {formatDate(job.repliedAt)}</p>}
            <p>Last updated: {formatDate(job.updatedAt)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
