"use client";

import { useEffect, useState } from "react";
import {
  CheckSquare,
  Phone,
  Clock,
  IndianRupee,
  Navigation,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useProfileLabels } from "@/lib/merchant-profile-context";
import Link from "next/link";

type JobStatus = "scheduled" | "on_the_way" | "completed";

type Job = {
  id: string;
  serviceDescription: string;
  budgetPaise: number | null;
  quotedPaise: number | null;
  merchantReply: string | null;
  repliedAt: string | null;
  updatedAt: string;
  createdAt: string;
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
    // plain text reply, treat as scheduled
  }
  return "scheduled";
}

function formatRupees(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getInitial(name: string): string {
  return (name ?? "?").charAt(0).toUpperCase();
}

function jobStatusBadge(status: JobStatus) {
  const map = {
    scheduled: "bg-yellow-100 text-yellow-800 border border-yellow-200",
    on_the_way: "bg-blue-100 text-blue-800 border border-blue-200",
    completed: "bg-green-100 text-green-800 border border-green-200",
  };
  const label = {
    scheduled: "Scheduled",
    on_the_way: "On My Way",
    completed: "Completed",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${map[status]}`}>
      {label[status]}
    </span>
  );
}

export default function JobsPage() {
  const labels = useProfileLabels();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  // Track optimistic UI job statuses: jobId → JobStatus
  const [jobStatuses, setJobStatuses] = useState<Record<string, JobStatus>>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  async function loadJobs() {
    setLoading(true);
    try {
      const res = await fetch("/api/merchant/jobs");
      if (res.ok) {
        const data = await res.json();
        const list: Job[] = data.jobs ?? [];
        setJobs(list);
        // Initialize statuses from stored merchantReply
        const initial: Record<string, JobStatus> = {};
        list.forEach((j) => {
          initial[j.id] = parseJobStatus(j.merchantReply);
        });
        setJobStatuses(initial);
      }
    } catch (err) {
      console.error("Failed to load jobs:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadJobs();
  }, []);

  async function handleOnMyWay(jobId: string) {
    setActionLoading(jobId + "_onway");
    // Optimistic update
    setJobStatuses((prev) => ({ ...prev, [jobId]: "on_the_way" }));
    try {
      // Persist job status via merchantReply JSON
      const note = JSON.stringify({ jobStatus: "on_the_way" });
      await fetch(`/api/merchant/requests/${jobId}/quote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quotedPaise: jobs.find((j) => j.id === jobId)?.quotedPaise ?? 100,
          note,
        }),
      });
      // Also send push
      // (push is sent by the quote endpoint already)
    } catch {
      // Revert on error
      setJobStatuses((prev) => ({ ...prev, [jobId]: "scheduled" }));
    } finally {
      setActionLoading(null);
    }
  }

  async function handleMarkComplete(jobId: string) {
    setActionLoading(jobId + "_complete");
    setJobStatuses((prev) => ({ ...prev, [jobId]: "completed" }));
    try {
      const note = JSON.stringify({ jobStatus: "completed" });
      await fetch(`/api/merchant/requests/${jobId}/quote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quotedPaise: jobs.find((j) => j.id === jobId)?.quotedPaise ?? 100,
          note,
        }),
      });
    } catch {
      setJobStatuses((prev) => ({ ...prev, [jobId]: "on_the_way" }));
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-green-600">
          <CheckSquare className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{labels.jobs}</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your active and upcoming jobs
          </p>
        </div>
        {jobs.length > 0 && (
          <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
            {jobs.length}
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 bg-gray-50 py-16">
          <CheckSquare className="h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">No active jobs</h3>
          <p className="mt-2 text-sm text-gray-600">
            Accepted requests will appear here as jobs.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => {
            const jobStatus = jobStatuses[job.id] ?? "scheduled";
            return (
              <div
                key={job.id}
                className="rounded-md border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-base font-bold text-green-700">
                      {getInitial(job.user.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {job.user.name}
                      </p>
                      <a
                        href={`tel:${job.user.phone}`}
                        className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                      >
                        <Phone className="h-3 w-3" />
                        {job.user.phone}
                      </a>
                    </div>
                  </div>
                  {jobStatusBadge(jobStatus)}
                </div>

                {/* Description */}
                <p className="mt-3 text-sm text-gray-800 line-clamp-2">
                  {job.serviceDescription}
                </p>

                {/* Meta */}
                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    Accepted {formatDate(job.updatedAt)}
                  </span>
                  {job.quotedPaise != null && (
                    <span className="flex items-center gap-1 font-medium text-gray-700">
                      <IndianRupee className="h-3.5 w-3.5" />
                      Agreed: {formatRupees(job.quotedPaise)}
                    </span>
                  )}
                </div>

                {/* Action buttons */}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {jobStatus === "scheduled" && (
                    <button
                      onClick={() => handleOnMyWay(job.id)}
                      disabled={actionLoading === job.id + "_onway"}
                      className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {actionLoading === job.id + "_onway" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Navigation className="h-4 w-4" />
                      )}
                      On My Way
                    </button>
                  )}

                  {jobStatus === "on_the_way" && (
                    <>
                      <span className="flex items-center gap-1.5 rounded-md bg-blue-100 px-3 py-1.5 text-sm font-medium text-blue-700">
                        <Navigation className="h-4 w-4" />
                        Heading there
                      </span>
                      <button
                        onClick={() => handleMarkComplete(job.id)}
                        disabled={actionLoading === job.id + "_complete"}
                        className="flex items-center gap-1.5 rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
                      >
                        {actionLoading === job.id + "_complete" ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                        Mark Complete
                      </button>
                    </>
                  )}

                  {jobStatus === "completed" && (
                    <span className="flex items-center gap-1.5 rounded-md bg-green-100 px-3 py-1.5 text-sm font-medium text-green-700">
                      <CheckCircle className="h-4 w-4" />
                      Completed
                    </span>
                  )}

                  <Link
                    href={`/merchant/jobs/${job.id}`}
                    className="ml-auto flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
