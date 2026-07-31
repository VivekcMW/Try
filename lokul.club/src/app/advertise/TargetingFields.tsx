"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, X } from "lucide-react";

/* ────────────────────────────────────────────────────────────── */

export const TOPICS: { value: string; label: string }[] = [
  { value: "interest",     label: "General interest" },
  { value: "activity",     label: "Activities & fitness" },
  { value: "parenting",    label: "Parenting" },
  { value: "cultural",     label: "Cultural" },
  { value: "buying",       label: "Buy & sell" },
  { value: "professional", label: "Professional" },
  { value: "cause",        label: "Causes" },
  { value: "pets",         label: "Pets" },
  { value: "business",     label: "Business" },
];

export const AGE_BANDS: { value: string; label: string }[] = [
  { value: "age_18_24",   label: "18–24" },
  { value: "age_25_34",   label: "25–34" },
  { value: "age_35_44",   label: "35–44" },
  { value: "age_45_54",   label: "45–54" },
  { value: "age_55_plus", label: "55+" },
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAYPARTS = [
  { value: "", label: "All day" },
  { value: "morning", label: "Morning (5am–12pm)" },
  { value: "afternoon", label: "Afternoon (12–5pm)" },
  { value: "evening", label: "Evening (5–9pm)" },
  { value: "night", label: "Night (9pm–5am)" },
];

function Label({ children }: { readonly children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-sm font-medium" style={{ color: "var(--color-heading)" }}>
      {children}
    </label>
  );
}

function Chip({ selected, onClick, children }: {
  readonly selected: boolean;
  readonly onClick: () => void;
  readonly children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className="press rounded-full border px-3 py-1.5 text-xs font-semibold transition"
      style={{
        borderColor: selected ? "var(--color-brand-500)" : "var(--color-border)",
        background: selected ? "var(--color-brand-600)" : "var(--color-surface)",
        color: selected ? "#fff" : "var(--color-text-secondary)",
      }}
    >
      {children}
    </button>
  );
}

/* ────────────────────────────────────────────────────────────── */

export interface LocationTimingValue {
  pinCodes: string[];
  radiusKm: string;
  daysOfWeek: number[];
  daypart: string;
}

export function LocationTimingSection({ value, onChange }: {
  readonly value: LocationTimingValue;
  readonly onChange: (next: LocationTimingValue) => void;
}) {
  const [draft, setDraft] = useState("");

  function addPincode() {
    const p = draft.trim();
    if (!/^\d{6}$/.test(p) || value.pinCodes.includes(p)) return;
    onChange({ ...value, pinCodes: [...value.pinCodes, p] });
    setDraft("");
  }

  function removePincode(p: string) {
    onChange({ ...value, pinCodes: value.pinCodes.filter((x) => x !== p) });
  }

  function toggleDay(d: number) {
    const has = value.daysOfWeek.includes(d);
    onChange({ ...value, daysOfWeek: has ? value.daysOfWeek.filter((x) => x !== d) : [...value.daysOfWeek, d] });
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>Target pincodes</Label>
        <div className="flex flex-wrap gap-2">
          {value.pinCodes.map((p) => (
            <span
              key={p}
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold"
              style={{ borderColor: "var(--color-brand-200)", background: "var(--color-brand-50)", color: "var(--color-brand-700)" }}
            >
              {p}
              <button type="button" onClick={() => removePincode(p)} aria-label={`Remove ${p}`}>
                <X size={11} />
              </button>
            </span>
          ))}
          <span className="inline-flex items-center gap-1">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value.replaceAll(/\D/gu, "").slice(0, 6))}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addPincode(); } }}
              placeholder="560001"
              inputMode="numeric"
              className="ds-input h-9 w-24 text-center text-xs"
            />
            <button
              type="button"
              onClick={addPincode}
              disabled={!/^\d{6}$/.test(draft)}
              aria-label="Add pincode"
              className="press flex h-9 w-9 items-center justify-center rounded-(--radius-md) border disabled:opacity-40"
              style={{ borderColor: "var(--color-border)" }}
            >
              <Plus size={14} />
            </button>
          </span>
        </div>
        {value.pinCodes.length === 0 && (
          <p className="mt-1.5 text-xs" style={{ color: "var(--color-danger)" }}>Add at least one pincode.</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Also target a radius (optional)</Label>
          <div className="flex items-center gap-2">
            <input
              type="number" min={1} max={50}
              value={value.radiusKm}
              onChange={(e) => onChange({ ...value, radiusKm: e.target.value })}
              placeholder="0"
              className="ds-input"
            />
            <span className="shrink-0 text-xs" style={{ color: "var(--color-text-secondary)" }}>km around your first pincode</span>
          </div>
        </div>
        <div>
          <Label>Time of day</Label>
          <select
            value={value.daypart}
            onChange={(e) => onChange({ ...value, daypart: e.target.value })}
            className="ds-input"
          >
            {DAYPARTS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
        </div>
      </div>

      <div>
        <Label>Days of week</Label>
        <div className="flex flex-wrap gap-2">
          {DAYS.map((d, i) => (
            <Chip key={d} selected={value.daysOfWeek.includes(i)} onClick={() => toggleDay(i)}>{d}</Chip>
          ))}
        </div>
        <p className="mt-1.5 text-xs" style={{ color: "var(--color-text-secondary)" }}>
          {value.daysOfWeek.length === 0 ? "Runs every day of the week." : "Runs only on the selected days."}
        </p>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── */

interface SocietyResult { id: string; name: string; pinCode: string; city: string }

export interface AudienceValue {
  topics: string[];
  topicsExclusive: boolean;
  newResidentsOnly: boolean;
  ageBands: string[];
  societies: SocietyResult[];
}

export function AudienceSection({ value, onChange }: {
  readonly value: AudienceValue;
  readonly onChange: (next: AudienceValue) => void;
}) {
  const [societyQuery, setSocietyQuery] = useState("");
  const [societyResults, setSocietyResults] = useState<SocietyResult[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const q = societyQuery.trim();
      if (q.length < 2) { setSocietyResults([]); return; }
      fetch(`/api/web/ads/societies/search?q=${encodeURIComponent(q)}`)
        .then((r) => r.json())
        .then((d: { items: SocietyResult[] }) => setSocietyResults(d.items ?? []))
        .catch(() => setSocietyResults([]));
    }, 250);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [societyQuery]);

  function toggleTopic(t: string) {
    const has = value.topics.includes(t);
    onChange({ ...value, topics: has ? value.topics.filter((x) => x !== t) : [...value.topics, t] });
  }

  function toggleAgeBand(a: string) {
    const has = value.ageBands.includes(a);
    onChange({ ...value, ageBands: has ? value.ageBands.filter((x) => x !== a) : [...value.ageBands, a] });
  }

  function addSociety(s: SocietyResult) {
    if (value.societies.some((x) => x.id === s.id)) return;
    onChange({ ...value, societies: [...value.societies, s] });
    setSocietyQuery("");
    setSocietyResults([]);
  }

  function removeSociety(id: string) {
    onChange({ ...value, societies: value.societies.filter((s) => s.id !== id) });
  }

  return (
    <div className="space-y-5">
      <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
        Everything below is optional. Topics tag your ad for relevant sections of the app — everyone can see it.
        Turning on “residents interested in these topics only”, new-resident targeting, society, or age targeting
        narrows delivery to residents who have personalised ads turned on <em>and</em> match — it will reach fewer
        people, more precisely.
      </p>

      <div>
        <Label>Topics</Label>
        <div className="flex flex-wrap gap-2">
          {TOPICS.map((t) => (
            <Chip key={t.value} selected={value.topics.includes(t.value)} onClick={() => toggleTopic(t.value)}>
              {t.label}
            </Chip>
          ))}
        </div>
        <label className="mt-3 flex items-center gap-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
          <input
            type="checkbox"
            checked={value.topicsExclusive}
            disabled={value.topics.length === 0}
            onChange={(e) => onChange({ ...value, topicsExclusive: e.target.checked })}
          />
          Only show to residents interested in these topics
        </label>
      </div>

      <div>
        <Label>Societies (optional)</Label>
        <div className="flex flex-wrap gap-2">
          {value.societies.map((s) => (
            <span
              key={s.id}
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold"
              style={{ borderColor: "var(--color-brand-200)", background: "var(--color-brand-50)", color: "var(--color-brand-700)" }}
            >
              {s.name}
              <button type="button" onClick={() => removeSociety(s.id)} aria-label={`Remove ${s.name}`}>
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
        <div className="relative mt-2">
          <input
            value={societyQuery}
            onChange={(e) => setSocietyQuery(e.target.value)}
            placeholder="Search society by name…"
            className="ds-input"
          />
          {societyResults.length > 0 && (
            <div
              className="absolute z-10 mt-1 w-full overflow-hidden rounded-(--radius-md) border shadow-lg"
              style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
            >
              {societyResults.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => addSociety(s)}
                  className="block w-full px-3 py-2 text-left text-sm hover:bg-(--color-brand-50)"
                >
                  {s.name} <span style={{ color: "var(--color-text-disabled)" }}>· {s.pinCode} {s.city}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
        <input
          type="checkbox"
          checked={value.newResidentsOnly}
          onChange={(e) => onChange({ ...value, newResidentsOnly: e.target.checked })}
        />
        Only show to residents who verified in the last 90 days
      </label>

      <div>
        <Label>Age range (optional)</Label>
        <div className="flex flex-wrap gap-2">
          {AGE_BANDS.map((a) => (
            <Chip key={a.value} selected={value.ageBands.includes(a.value)} onClick={() => toggleAgeBand(a.value)}>
              {a.label}
            </Chip>
          ))}
        </div>
      </div>
    </div>
  );
}
