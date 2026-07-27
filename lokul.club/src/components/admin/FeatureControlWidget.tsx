"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Flag, ArrowRight } from "lucide-react";
import { Badge, Card, Switch } from "@/components/ui";
import { toggleFlag } from "@/app/admin/flags/actions";
import type { AdminFlag } from "@/lib/admin-platform";

export default function FeatureControlWidget({ flags }: { flags: AdminFlag[] }) {
  const [optimistic, setOptimistic] = useState<Record<string, boolean>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function isEnabled(flag: AdminFlag) {
    return flag.id in optimistic ? optimistic[flag.id] : flag.enabled;
  }

  function handleToggle(flag: AdminFlag) {
    const next = !isEnabled(flag);
    setOptimistic((prev) => ({ ...prev, [flag.id]: next }));
    setLoadingId(flag.id);
    startTransition(async () => {
      await toggleFlag(flag.id, next);
      setLoadingId(null);
    });
  }

  return (
    <div>
      {/* Section header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flag size={14} className="text-gray-400" />
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            App Feature Control
          </p>
        </div>
        <Link
          href="/admin/flags"
          className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          Manage all
          <ArrowRight size={12} />
        </Link>
      </div>

      {flags.length === 0 ? (
        <Card>
          <p className="py-4 text-center text-sm text-gray-400">
            No global feature flags configured.{" "}
            <Link href="/admin/flags" className="text-blue-600 hover:underline">
              Add one →
            </Link>
          </p>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {flags.map((flag) => {
            const enabled = isEnabled(flag);
            const loading = loadingId === flag.id;

            return (
              <Card key={flag.id} className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-gray-900 truncate">
                      {flag.key}
                    </span>
                    <Badge
                      tone={enabled ? "success" : "neutral"}
                      variant="soft"
                      size="sm"
                    >
                      {enabled ? "On" : "Off"}
                    </Badge>
                  </div>
                  {flag.description && (
                    <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                      {flag.description}
                    </p>
                  )}
                  <p className="mt-1 text-[11px] text-gray-400">
                    Updated {new Date(flag.updatedAt).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </p>
                </div>

                <Switch
                  checked={enabled}
                  disabled={loading}
                  onChange={() => handleToggle(flag)}
                  aria-label={`Toggle ${flag.key}`}
                  className="shrink-0 mt-0.5"
                />
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
