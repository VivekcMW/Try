"use client";

import { useState } from "react";
import { Flag, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Badge, Card, EmptyState, Switch } from "@/components/ui";
import { toggleFlag } from "@/app/admin/flags/actions";
import type { AdminFlag } from "@/lib/admin-platform";
import { FEATURE_METADATA } from "@/lib/feature-flags";

const SCOPE_TONES: Record<string, "brand" | "accent" | "success" | "warning" | "neutral"> = {
  global: "brand", society: "accent", city: "success", pincode: "warning", user: "neutral",
};

const PHASE_COLORS = {
  1: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  2: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  3: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
};

export default function FlagsTable({ flags }: { flags: AdminFlag[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleToggle(id: string, current: boolean) {
    setLoadingId(id);
    await toggleFlag(id, !current);
    setLoadingId(null);
  }

  if (flags.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={<Flag size={28} />}
          title="No feature flags"
          description="No flags have been configured yet. Run the seed script to create default flags."
        />
      </Card>
    );
  }

  // Group by key
  const grouped = flags.reduce<Record<string, AdminFlag[]>>((acc, f) => {
    if (!acc[f.key]) acc[f.key] = [];
    acc[f.key].push(f);
    return acc;
  }, {});

  // Group by phase for better organization
  const byPhase: Record<number, { key: string; entries: AdminFlag[] }[]> = { 1: [], 2: [], 3: [] };
  
  Object.entries(grouped).forEach(([key, entries]) => {
    const meta = FEATURE_METADATA[key];
    const phase = meta?.phase ?? 3;
    byPhase[phase].push({ key, entries });
  });

  // Add ungrouped flags to phase 3
  const ungroupedFlags = Object.entries(grouped)
    .filter(([key]) => !FEATURE_METADATA[key])
    .map(([key, entries]) => ({ key, entries }));
  
  byPhase[3].push(...ungroupedFlags);

  return (
    <div className="space-y-6">
      {/* Phase 1: Core Features (Launch Day) */}
      {byPhase[1].length > 0 && (
        <div>
          <div className={`flex items-center gap-2 mb-3 px-3 py-2 rounded-lg ${PHASE_COLORS[1].bg} ${PHASE_COLORS[1].border} border`}>
            <CheckCircle2 size={18} className={PHASE_COLORS[1].text} />
            <h3 className={`text-sm font-semibold ${PHASE_COLORS[1].text}`}>
              Phase 1: Core Features (Launch Day)
            </h3>
            <Badge tone="success" size="sm" variant="soft">
              {byPhase[1].filter(g => g.entries.find(e => e.scope === 'global')?.enabled).length} / {byPhase[1].length} enabled
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {byPhase[1].map(({ key, entries }) => (
              <FeatureFlagCard
                key={key}
                featureKey={key}
                entries={entries}
                loadingId={loadingId}
                onToggle={handleToggle}
              />
            ))}
          </div>
        </div>
      )}

      {/* Phase 2: Validation Required */}
      {byPhase[2].length > 0 && (
        <div>
          <div className={`flex items-center gap-2 mb-3 px-3 py-2 rounded-lg ${PHASE_COLORS[2].bg} ${PHASE_COLORS[2].border} border`}>
            <Clock size={18} className={PHASE_COLORS[2].text} />
            <h3 className={`text-sm font-semibold ${PHASE_COLORS[2].text}`}>
              Phase 2: Validation Required (Enable After Proof)
            </h3>
            <Badge tone="warning" size="sm" variant="soft">
              {byPhase[2].filter(g => g.entries.find(e => e.scope === 'global')?.enabled).length} / {byPhase[2].length} enabled
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {byPhase[2].map(({ key, entries }) => (
              <FeatureFlagCard
                key={key}
                featureKey={key}
                entries={entries}
                loadingId={loadingId}
                onToggle={handleToggle}
              />
            ))}
          </div>
        </div>
      )}

      {/* Phase 3: Advanced Features */}
      {byPhase[3].length > 0 && (
        <div>
          <div className={`flex items-center gap-2 mb-3 px-3 py-2 rounded-lg ${PHASE_COLORS[3].bg} ${PHASE_COLORS[3].border} border`}>
            <XCircle size={18} className={PHASE_COLORS[3].text} />
            <h3 className={`text-sm font-semibold ${PHASE_COLORS[3].text}`}>
              Phase 3: Advanced Features (Post-Fundraise)
            </h3>
            <Badge tone="brand" size="sm" variant="soft">
              {byPhase[3].filter(g => g.entries.find(e => e.scope === 'global')?.enabled).length} / {byPhase[3].length} enabled
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {byPhase[3].map(({ key, entries }) => (
              <FeatureFlagCard
                key={key}
                featureKey={key}
                entries={entries}
                loadingId={loadingId}
                onToggle={handleToggle}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FeatureFlagCard({
  featureKey,
  entries,
  loadingId,
  onToggle,
}: {
  featureKey: string;
  entries: AdminFlag[];
  loadingId: string | null;
  onToggle: (id: string, current: boolean) => Promise<void>;
}) {
  const globalEntry = entries.find(e => e.scope === "global");
  const overrides = entries.filter(e => e.scope !== "global");
  const meta = FEATURE_METADATA[featureKey];

  return (
    <Card>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-sm text-gray-900">
              {meta?.name ?? featureKey}
            </p>
            {globalEntry && (
              <Badge tone={globalEntry.enabled ? "success" : "neutral"} variant="soft" size="sm">
                {globalEntry.enabled ? "Enabled" : "Disabled"}
              </Badge>
            )}
            {meta?.category && (
              <Badge tone="neutral" variant="outline" size="sm">
                {meta.category}
              </Badge>
            )}
          </div>
          {(meta?.description || globalEntry?.description) && (
            <p className="mt-1 text-xs text-gray-600 line-clamp-2">
              {meta?.description ?? globalEntry?.description}
            </p>
          )}
          <p className="mt-1 text-[10px] font-mono text-gray-400">{featureKey}</p>
          {globalEntry && (
            <p className="mt-0.5 text-[10px] text-gray-400">
              Updated {new Date(globalEntry.updatedAt).toLocaleDateString("en-IN", { 
                day: "numeric", month: "short", year: "numeric" 
              })}
            </p>
          )}
        </div>

        {globalEntry && (
          <Switch
            checked={globalEntry.enabled}
            disabled={loadingId === globalEntry.id}
            onChange={() => onToggle(globalEntry.id, globalEntry.enabled)}
            aria-label={`Toggle ${featureKey} globally`}
          />
        )}
      </div>

      {/* Scope overrides */}
      {overrides.length > 0 && (
        <div className="mt-3 space-y-2 border-t border-border pt-3">
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">Scope overrides</p>
          {overrides.map((ov) => (
            <div key={ov.id} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Badge tone={SCOPE_TONES[ov.scope] ?? "neutral"} variant="outline" size="sm">
                  {ov.scope}
                </Badge>
                {ov.scopeValue && (
                  <span className="font-mono text-xs text-gray-500">{ov.scopeValue}</span>
                )}
              </div>
              <Switch
                checked={ov.enabled}
                disabled={loadingId === ov.id}
                onChange={() => onToggle(ov.id, ov.enabled)}
                aria-label={`Toggle ${featureKey} for ${ov.scope} ${ov.scopeValue ?? ""}`}
              />
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
