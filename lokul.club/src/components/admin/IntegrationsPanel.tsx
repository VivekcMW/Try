"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Tabs } from "@/components/ui";
import IntegrationCard from "./IntegrationCard";
import type { AdminIntegration, ProviderCategory } from "@/lib/admin-integrations";

type Tab = ProviderCategory | "all";

const CATEGORY_LABELS: Record<Tab, string> = {
  all:              "All",
  infrastructure:   "Infrastructure",
  discovery:        "Discovery",
  local_context:    "Local Context",
  identity_kyc:     "Identity & KYC",
  government_civic: "Government & Civic",
  ai_language:      "AI & Language",
};

const TAB_ORDER: Tab[] = [
  "all",
  "infrastructure",
  "discovery",
  "local_context",
  "identity_kyc",
  "government_civic",
  "ai_language",
];

export default function IntegrationsPanel({
  integrations,
}: {
  integrations: AdminIntegration[];
}) {
  const [tab, setTab] = useState<Tab>("all");

  const unconfiguredCritical = integrations.filter(
    (i) => i.priority === "critical" && i.hasApiKey && !i.apiKeySet,
  );

  const filtered =
    tab === "all"
      ? integrations
      : integrations.filter((i) => i.category === tab);

  const tabItems = TAB_ORDER.map((key) => ({
    value: key,
    label:
      key === "all"
        ? `All (${integrations.length})`
        : `${CATEGORY_LABELS[key]} (${integrations.filter((i) => i.category === key).length})`,
  }));

  return (
    <div className="space-y-5">
      {/* Critical warning banner */}
      {unconfiguredCritical.length > 0 && (
        <div className="flex items-start gap-3 rounded-[6px] border border-red-200 bg-red-50 px-4 py-3">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-red-500" />
          <div>
            <p className="text-sm font-semibold text-red-700">
              {unconfiguredCritical.length} critical integration
              {unconfiguredCritical.length > 1 ? "s" : ""} not configured
            </p>
            <p className="mt-0.5 text-xs text-red-600">
              {unconfiguredCritical.map((i) => i.label).join(", ")} — configure
              before going live.
            </p>
          </div>
        </div>
      )}

      {/* Tab bar */}
      <div className="overflow-x-auto pb-1">
        <Tabs
          items={tabItems}
          value={tab}
          onChange={(v) => setTab(v as Tab)}
          variant="pill"
        />
      </div>

      {/* Cards */}
      <div className="space-y-2">
        {filtered.map((integ) => (
          <IntegrationCard key={integ.provider} integration={integ} />
        ))}
      </div>
    </div>
  );
}
