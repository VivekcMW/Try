"use client";

import { useState } from "react";
import { Flag, CheckCircle2, XCircle, Clock, Plus } from "lucide-react";
import { Badge, Button, Card, EmptyState, FormField, Input, Modal, Select, Switch } from "@/components/ui";
import { toggleFlag, createFlag } from "@/app/admin/flags/actions";
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
  const [creating, setCreating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newScope, setNewScope] = useState("global");
  const [newScopeValue, setNewScopeValue] = useState("");
  const [newEnabled, setNewEnabled] = useState(false);

  async function handleToggle(id: string, current: boolean) {
    setLoadingId(id);
    await toggleFlag(id, !current);
    setLoadingId(null);
  }

  function resetCreateForm() {
    setCreating(false);
    setNewKey("");
    setNewDescription("");
    setNewScope("global");
    setNewScopeValue("");
    setNewEnabled(false);
  }

  async function handleCreate() {
    setSubmitting(true);
    const fd = new FormData();
    fd.set("key", newKey.trim().toLowerCase().replace(/[^a-z0-9_]+/g, "_"));
    fd.set("description", newDescription);
    fd.set("scope", newScope);
    fd.set("scopeValue", newScopeValue);
    if (newEnabled) fd.set("enabled", "on");
    try {
      await createFlag(fd);
      resetCreateForm();
    } finally {
      setSubmitting(false);
    }
  }

  if (flags.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button size="sm" variant="primary" leftIcon={<Plus size={14} />} onClick={() => setCreating(true)}>
            New flag
          </Button>
        </div>
        <Card>
          <EmptyState
            icon={<Flag size={28} />}
            title="No feature flags"
            description="No flags have been configured yet. Run the seed script to create default flags."
          />
        </Card>
        <CreateFlagModal
          open={creating}
          onClose={resetCreateForm}
          submitting={submitting}
          onSubmit={handleCreate}
          newKey={newKey} setNewKey={setNewKey}
          newDescription={newDescription} setNewDescription={setNewDescription}
          newScope={newScope} setNewScope={setNewScope}
          newScopeValue={newScopeValue} setNewScopeValue={setNewScopeValue}
          newEnabled={newEnabled} setNewEnabled={setNewEnabled}
        />
      </div>
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
      <div className="flex justify-end">
        <Button size="sm" variant="primary" leftIcon={<Plus size={14} />} onClick={() => setCreating(true)}>
          New flag
        </Button>
      </div>

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

      <CreateFlagModal
        open={creating}
        onClose={resetCreateForm}
        submitting={submitting}
        onSubmit={handleCreate}
        newKey={newKey} setNewKey={setNewKey}
        newDescription={newDescription} setNewDescription={setNewDescription}
        newScope={newScope} setNewScope={setNewScope}
        newScopeValue={newScopeValue} setNewScopeValue={setNewScopeValue}
        newEnabled={newEnabled} setNewEnabled={setNewEnabled}
      />
    </div>
  );
}

function CreateFlagModal({
  open, onClose, submitting, onSubmit,
  newKey, setNewKey,
  newDescription, setNewDescription,
  newScope, setNewScope,
  newScopeValue, setNewScopeValue,
  newEnabled, setNewEnabled,
}: {
  open: boolean;
  onClose: () => void;
  submitting: boolean;
  onSubmit: () => void;
  newKey: string; setNewKey: (v: string) => void;
  newDescription: string; setNewDescription: (v: string) => void;
  newScope: string; setNewScope: (v: string) => void;
  newScopeValue: string; setNewScopeValue: (v: string) => void;
  newEnabled: boolean; setNewEnabled: (v: boolean) => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New feature flag"
      description="Create a flag admins can toggle to control a feature at runtime, without a code deploy."
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="sm" loading={submitting} disabled={!newKey.trim()} onClick={onSubmit}>
            Create flag
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <FormField label="Key" hint="lowercase letters, numbers, underscores — e.g. merchant_reviews">
          <Input
            placeholder="e.g. merchant_reviews"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
          />
        </FormField>
        <FormField label="Description">
          <Input
            placeholder="What does this flag control?"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
          />
        </FormField>
        <FormField label="Scope">
          <Select value={newScope} onChange={(e) => setNewScope(e.target.value)}>
            <option value="global">Global</option>
            <option value="city">City</option>
            <option value="pincode">Pincode</option>
            <option value="society">Society</option>
            <option value="user">User</option>
          </Select>
        </FormField>
        {newScope !== "global" && (
          <FormField label="Scope value" hint={`The ${newScope} this override applies to`}>
            <Input
              placeholder={newScope === "pincode" ? "e.g. 560001" : `${newScope} id`}
              value={newScopeValue}
              onChange={(e) => setNewScopeValue(e.target.value)}
            />
          </FormField>
        )}
        <FormField label="Initial state">
          <div className="flex items-center gap-2">
            <Switch checked={newEnabled} onChange={() => setNewEnabled(!newEnabled)} aria-label="Enabled on creation" />
            <span className="text-sm text-gray-600">{newEnabled ? "Enabled" : "Disabled"}</span>
          </div>
        </FormField>
      </div>
    </Modal>
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
