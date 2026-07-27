"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  EyeOff,
} from "lucide-react";
import { getProviderIcon } from "@/components/admin/provider-icons";
import { Badge, Button, Card, Input, Switch } from "@/components/ui";
import {
  saveIntegration,
  testIntegration,
  toggleIntegration,
} from "@/app/admin/integrations/actions";
import type { AdminIntegration, PrdPhase } from "@/lib/admin-integrations";

const PHASE_META: Record<
  PrdPhase,
  { label: string; tone: "neutral" | "brand" | "accent" | "warning" | "info" }
> = {
  v1: { label: "v1 · Society",      tone: "brand"   },
  v2: { label: "v2 · Peer Economy", tone: "accent"  },
  v3: { label: "v3 · Bharat OS",    tone: "warning" },
};

export default function IntegrationCard({
  integration,
}: {
  integration: AdminIntegration;
}) {
  const [expanded, setExpanded] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [enabled, setEnabled] = useState(integration.enabled);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  const statusTone =
    testResult?.ok === true || (!testResult && integration.lastTestOk === true)
      ? "success"
      : testResult?.ok === false || (!testResult && integration.lastTestOk === false)
      ? "danger"
      : "neutral";

  const statusLabel =
    testResult?.ok === true || (!testResult && integration.lastTestOk === true)
      ? "Connected"
      : testResult?.ok === false || (!testResult && integration.lastTestOk === false)
      ? "Error"
      : "Not tested";

  async function handleToggle(e: React.ChangeEvent<HTMLInputElement>) {
    e.stopPropagation();
    const next = !enabled;
    setToggling(true);
    setEnabled(next);
    try {
      await toggleIntegration(integration.provider, next);
    } catch {
      setEnabled(!next); // rollback
    } finally {
      setToggling(false);
    }
  }

  async function handleTest() {
    setTesting(true);
    setTestResult(null);
    const result = await testIntegration(integration.provider);
    setTestResult(result);
    setTesting(false);
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    await saveIntegration(formData);
    setSaving(false);
    setExpanded(false);
  }

  const activeMsgOk = testResult?.ok ?? integration.lastTestOk;
  const activeMsg   = testResult?.message ?? integration.lastTestMsg;

  return (
    <Card className="overflow-hidden p-0">
      {/* ── Collapsed header ────────────────────────────────────────────── */}
      <div
        className="flex cursor-pointer items-center gap-3 p-4"
        onClick={() => setExpanded((v) => !v)}
        role="button"
        aria-expanded={expanded}
      >
        <span className="shrink-0 flex h-9 w-9 items-center justify-center rounded-[6px] bg-gray-100 text-gray-600">
          {(() => { const Icon = getProviderIcon(integration.icon); return <Icon size={18} />; })()}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-sm font-semibold text-gray-900">
              {integration.label}
            </span>
            <Badge
              tone={PHASE_META[integration.prdPhase].tone}
              variant="soft"
              size="sm"
            >
              {PHASE_META[integration.prdPhase].label}
            </Badge>
            {integration.priority === "critical" && (
              <Badge tone="danger" variant="soft" size="sm">
                Critical
              </Badge>
            )}
          </div>
          <p className="mt-0.5 line-clamp-1 text-xs text-gray-500">
            {integration.description}
          </p>
        </div>

        <div
          className="flex shrink-0 items-center gap-3"
          onClick={(e) => e.stopPropagation()}
        >
          <Badge tone={statusTone} variant="soft" size="sm">
            {statusLabel}
          </Badge>
          <Switch
            checked={enabled}
            disabled={toggling}
            onChange={handleToggle}
            aria-label={`Toggle ${integration.label}`}
          />
          <span
            className="text-gray-400"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((v) => !v);
            }}
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </span>
        </div>
      </div>

      {/* ── Expanded form ───────────────────────────────────────────────── */}
      {expanded && (
        <div className="border-t border-border bg-gray-50/60 p-4">
          <form onSubmit={handleSave} className="space-y-3">
            <input type="hidden" name="provider" value={integration.provider} />
            <input type="hidden" name="enabled"  value={enabled ? "true" : "false"} />

            {/* API Key */}
            {integration.hasApiKey && (
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  {integration.apiKeyLabel}
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    name="apiKey"
                    type={showKey ? "text" : "password"}
                    placeholder={
                      integration.apiKeySet
                        ? "••••••••  (leave blank to keep current)"
                        : "Enter key"
                    }
                    inputSize="sm"
                    className="flex-1 font-mono"
                    autoComplete="off"
                    spellCheck={false}
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey((v) => !v)}
                    className="text-gray-400 hover:text-gray-600"
                    aria-label={showKey ? "Hide key" : "Show key"}
                  >
                    {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            )}

            {/* API Secret */}
            {integration.hasApiSecret && (
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  {integration.apiSecretLabel}
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    name="apiSecret"
                    type={showSecret ? "text" : "password"}
                    placeholder={
                      integration.apiSecretSet
                        ? "••••••••  (leave blank to keep current)"
                        : "Enter secret"
                    }
                    inputSize="sm"
                    className="flex-1 font-mono"
                    autoComplete="off"
                    spellCheck={false}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret((v) => !v)}
                    className="text-gray-400 hover:text-gray-600"
                    aria-label={showSecret ? "Hide secret" : "Show secret"}
                  >
                    {showSecret ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            )}

            {/* Webhook / Host URL */}
            {integration.hasWebhookUrl && (
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  {integration.webhookUrlLabel}
                </label>
                <Input
                  name="webhookUrl"
                  type="url"
                  defaultValue={integration.webhookUrl ?? ""}
                  placeholder="https://…"
                  inputSize="sm"
                  className="font-mono"
                />
              </div>
            )}

            {/* Config JSON */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Config (JSON)
              </label>
              <textarea
                name="config"
                rows={3}
                defaultValue={
                  Object.keys(integration.config).length > 0
                    ? JSON.stringify(integration.config, null, 2)
                    : integration.configHints
                }
                spellCheck={false}
                className="w-full rounded-[6px] border border-border bg-white px-3 py-2 font-mono text-xs text-gray-700 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              />
            </div>

            {/* Test result banner */}
            {activeMsg && (
              <div
                className={`flex items-start gap-2 rounded-[6px] px-3 py-2 text-xs ${
                  activeMsgOk
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {activeMsgOk ? (
                  <CheckCircle size={13} className="mt-0.5 shrink-0" />
                ) : (
                  <XCircle size={13} className="mt-0.5 shrink-0" />
                )}
                <span className="flex-1">{activeMsg}</span>
                {!testResult && integration.lastTestedAt && (
                  <span className="ml-auto flex shrink-0 items-center gap-1 opacity-60">
                    <Clock size={10} />
                    {new Date(integration.lastTestedAt).toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                )}
              </div>
            )}

            {/* Actions row */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex gap-2">
                <Button type="submit" size="sm" loading={saving} disabled={saving}>
                  Save
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={testing}
                  loading={testing}
                  onClick={handleTest}
                >
                  Test connection
                </Button>
              </div>
              {integration.docUrl && (
                <a
                  href={integration.docUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                >
                  Docs
                  <ExternalLink size={11} />
                </a>
              )}
            </div>
          </form>
        </div>
      )}
    </Card>
  );
}
