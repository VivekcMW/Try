"use client";

import Link from "next/link";
import { ArrowRight, Plug } from "lucide-react";
import { Badge, Card } from "@/components/ui";
import type { AdminIntegration } from "@/lib/admin-integrations";
import { getProviderIcon } from "@/components/admin/provider-icons";

const PRIORITY_ORDER = { critical: 0, high: 1, medium: 2 } as const;

export default function IntegrationsStatusWidget({
  integrations,
}: {
  integrations: AdminIntegration[];
}) {
  const visible = [...integrations]
    .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
    .slice(0, 8);

  const connectedCount = integrations.filter(
    (i) => i.enabled && i.lastTestOk === true,
  ).length;
  const errorCount = integrations.filter(
    (i) => i.enabled && i.lastTestOk === false,
  ).length;
  const unconfiguredCritical = integrations.filter(
    (i) => i.priority === "critical" && i.hasApiKey && !i.apiKeySet,
  ).length;

  function getTileStatus(i: AdminIntegration) {
    if (i.lastTestOk === true)  return { tone: "success", label: "Connected" } as const;
    if (i.lastTestOk === false) return { tone: "danger",  label: "Error"     } as const;
    if (i.enabled)              return { tone: "warning", label: "Untested"  } as const;
    return                             { tone: "neutral", label: "Off"       } as const;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-3 flex items-center gap-2">
        <Plug size={14} className="shrink-0 text-gray-400" />
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          Integrations Health
        </p>
        <span className="text-xs text-gray-400">
          {connectedCount} connected
          {errorCount > 0 && (
            <span className="ml-1 text-red-500">· {errorCount} error</span>
          )}
          {unconfiguredCritical > 0 && (
            <span className="ml-1 text-amber-500">
              · {unconfiguredCritical} critical unconfigured
            </span>
          )}
        </span>
        <Link
          href="/admin/integrations"
          className="ml-auto flex items-center gap-1 text-xs font-medium text-blue-600 transition-colors hover:text-blue-700"
        >
          Manage all
          <ArrowRight size={12} />
        </Link>
      </div>

      {/* Tiles grid */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-8">
        {visible.map((integ) => {
          const { tone, label } = getTileStatus(integ);
          return (
            <Link key={integ.provider} href="/admin/integrations">
              <Card className="flex cursor-pointer flex-col items-center gap-1.5 p-3 text-center transition-colors hover:bg-gray-50">
                <span className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-gray-100 text-gray-600">
                  {(() => { const Icon = getProviderIcon(integ.icon); return <Icon size={16} />; })()}
                </span>
                <p className="w-full truncate text-[11px] font-medium leading-tight text-gray-700">
                  {integ.label}
                </p>
                <Badge tone={tone} variant="soft" size="sm">
                  {label}
                </Badge>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
