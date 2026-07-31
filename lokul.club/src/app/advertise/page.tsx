"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BadgeCheck, Check, ImagePlus, Loader2, Megaphone, ShieldCheck, Sparkles, X } from "lucide-react";
import Footer from "@/components/Footer";
import { PhonePreview } from "./PhonePreview";
import { LocationTimingSection, AudienceSection, type LocationTimingValue, type AudienceValue } from "./TargetingFields";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

/* ────────────────────────────────────────────────────────────── */

const PACKAGES = [
  { value: "micro_local", label: "Micro Local", price: "₹40 CPM", blurb: "Pay per impression · min ₹500/week", min: 500 },
  { value: "growth",      label: "Growth",      price: "₹3–8 CPC", blurb: "Pay per click · min ₹2,000/week", min: 2000 },
  { value: "brand",       label: "Brand",       price: "₹8,000/week", blurb: "Fixed placement · 10K impressions/day", min: 8000 },
  { value: "national",    label: "National",    price: "₹50,000/day", blurb: "Category takeover, all users in city", min: 50000 },
];

const PLACEMENTS = [
  { value: "feed_post",   label: "Feed Sponsored Post" },
  { value: "search_slot", label: "Search Slot" },
  { value: "story",       label: "Story" },
  { value: "banner",      label: "Banner" },
];

const TRUST_POINTS = [
  { icon: BadgeCheck,  text: "Every creative human-reviewed" },
  { icon: ShieldCheck, text: "Never inside safety or SOS screens" },
  { icon: Sparkles,    text: "Always labelled “Sponsored”" },
];

/* ────────────────────────────────────────────────────────────── */

function Label({ children }: { readonly children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-sm font-medium" style={{ color: "var(--color-heading)" }}>
      {children}
    </label>
  );
}

function Field(props: Readonly<React.InputHTMLAttributes<HTMLInputElement>>) {
  return <input {...props} className="ds-input" />;
}

function SectionCard({ step, title, children }: {
  readonly step: string;
  readonly title: string;
  readonly children: React.ReactNode;
}) {
  return (
    <section className="ds-card space-y-5 p-6 md:p-7">
      <div className="flex items-center gap-3">
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
          style={{ background: "linear-gradient(135deg, var(--color-brand-500), var(--color-brand-700))" }}
        >
          {step}
        </span>
        <h2 className="text-lg font-bold tracking-tight" style={{ color: "var(--color-heading)" }}>{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Header() {
  return (
    <header
      className="sticky top-0 z-50 border-b backdrop-blur-xl"
      style={{ borderColor: "var(--color-border)", background: "rgba(255,255,255,0.78)" }}
    >
      <div className="ds-container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-[10px] text-sm font-bold text-white"
            style={{ background: "linear-gradient(135deg, var(--color-brand-500), var(--color-brand-700))" }}
          >
            L
          </span>
          <span className="text-base font-bold tracking-tight" style={{ color: "var(--color-heading)" }}>
            lokul<span style={{ color: "var(--color-brand-600)" }}>.club</span>
          </span>
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-(--color-heading)"
          style={{ color: "var(--color-text-secondary)" }}
        >
          <ArrowLeft size={14} /> Back to home
        </Link>
      </div>
    </header>
  );
}

/* ────────────────────────────────────────────────────────────── */

export default function AdvertisePage() {
  const [form, setForm] = useState({
    businessName: "", contactName: "", email: "", phone: "",
    campaignName: "", packageTier: "micro_local", budget: "500",
    startDate: "", endDate: "",
    placement: "feed_post", headline: "", body: "", ctaLabel: "Order Now", ctaUrl: "",
  });
  const [locationTiming, setLocationTiming] = useState<LocationTimingValue>({
    pinCodes: [], radiusKm: "", daysOfWeek: [], daypart: "",
  });
  const [audience, setAudience] = useState<AudienceValue>({
    topics: [], topicsExclusive: false, newResidentsOnly: false, ageBands: [], societies: [],
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [mediaDataUrl, setMediaDataUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const pkg = PACKAGES.find(p => p.value === form.packageTier) ?? PACKAGES[0];

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Please choose a JPEG, PNG, or WEBP image.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError("Image must be under 5MB.");
      return;
    }
    setError(null);
    setMediaDataUrl(await readFileAsDataUrl(file));
  }

  function removeImage() {
    setMediaDataUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function submit() {
    setError(null);
    if (locationTiming.pinCodes.length === 0) {
      setError("Add at least one target pincode.");
      return;
    }
    setSubmitting(true);
    try {
      let mediaKey: string | undefined;
      if (mediaDataUrl) {
        const upload = await fetch("/api/web/ads/creative-media", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: mediaDataUrl }),
        });
        const uploadData = await upload.json();
        if (!upload.ok) { setError(uploadData.error ?? "Image upload failed."); return; }
        mediaKey = uploadData.key;
      }

      const res = await fetch("/api/web/ads/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business: { name: form.businessName, contactName: form.contactName, email: form.email, phone: form.phone },
          campaign: {
            name: form.campaignName, packageTier: form.packageTier,
            budgetPaise: Math.round(Number(form.budget) * 100),
            startDate: form.startDate, endDate: form.endDate,
          },
          creative: {
            placement: form.placement, headline: form.headline, body: form.body,
            ctaLabel: form.ctaLabel, ctaUrl: form.ctaUrl, mediaKey,
            categories: audience.topics,
          },
          booking: {
            pinCodes: locationTiming.pinCodes,
            radiusKm: locationTiming.radiusKm ? Number(locationTiming.radiusKm) : undefined,
            daysOfWeek: locationTiming.daysOfWeek,
            daypart: locationTiming.daypart || undefined,
          },
          audience: {
            interestCohorts: audience.topicsExclusive ? audience.topics : [],
            societyIds: audience.societies.map((s) => s.id),
            newResidentsOnly: audience.newResidentsOnly,
            ageBands: audience.ageBands,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Something went wrong."); return; }
      setDone(true);
      window.scrollTo({ top: 0 });
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <>
        <Header />
        <main className="relative overflow-hidden">
          <div className="bg-mesh pointer-events-none absolute inset-0 opacity-90" />
          <div className="ds-container relative flex min-h-[70vh] max-w-xl flex-col items-center justify-center py-24 text-center">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full"
              style={{ background: "var(--color-success-bg)" }}
            >
              <Check className="h-8 w-8" style={{ color: "var(--color-success)" }} />
            </div>
            <h1 className="mt-6 text-3xl font-bold tracking-tight" style={{ color: "var(--color-heading)" }}>
              Request received
            </h1>
            <p className="mt-3 text-base" style={{ color: "var(--color-text-secondary)" }}>
              Our team reviews every booking and creative before it goes live — usually within 1 business day.
              We&apos;ll reach out at <strong style={{ color: "var(--color-heading)" }}>{form.email}</strong>.
            </p>
            <Link href="/" className="ds-button press mt-8 px-6 py-3 text-sm">
              Back to lokul.club <ArrowRight size={14} />
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="bg-mesh pointer-events-none absolute inset-0 opacity-90" />
        <div className="ds-container relative max-w-3xl pb-12 pt-16 text-center md:pb-16 md:pt-20">
          <div className="ds-chip mx-auto mb-5">
            <Megaphone size={13} /> Advertise with Lokul
          </div>
          <h1 className="text-balance text-4xl font-bold tracking-tight md:text-5xl" style={{ color: "var(--color-heading)" }}>
            Reach your neighbourhood,{" "}
            <span style={{ color: "var(--color-brand-600)" }}>not the whole internet</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-base md:text-lg" style={{ color: "var(--color-text-secondary)" }}>
            Native, pincode-targeted ads inside the app your neighbours already use every day.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {TRUST_POINTS.map(({ icon: Icon, text }) => (
              <span key={text} className="inline-flex items-center gap-1.5 text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
                <Icon size={15} style={{ color: "var(--color-brand-600)" }} /> {text}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Form ── */}
      <main className="ds-container max-w-3xl pb-20">
        <form
          onSubmit={(e) => { e.preventDefault(); void submit(); }}
          className="space-y-5"
        >
          {/* 1 · Business */}
          <SectionCard step="1" title="Your business">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>Business name</Label><Field required value={form.businessName} onChange={set("businessName")} placeholder="Sharma Kirana" /></div>
              <div><Label>Contact person</Label><Field required value={form.contactName} onChange={set("contactName")} placeholder="Ramesh Sharma" /></div>
              <div><Label>Email</Label><Field required type="email" value={form.email} onChange={set("email")} placeholder="you@business.in" /></div>
              <div><Label>Phone (optional)</Label><Field value={form.phone} onChange={set("phone")} placeholder="+91…" /></div>
            </div>
          </SectionCard>

          {/* 2 · Package */}
          <SectionCard step="2" title="Pick a package">
            <div className="grid gap-3 sm:grid-cols-2">
              {PACKAGES.map(p => {
                const selected = form.packageTier === p.value;
                return (
                  <button
                    key={p.value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setForm(f => ({ ...f, packageTier: p.value, budget: String(Math.max(Number(f.budget) || 0, p.min)) }))}
                    className="press rounded-(--radius-md) border p-4 text-left transition"
                    style={{
                      borderColor: selected ? "var(--color-brand-500)" : "var(--color-border)",
                      background: selected ? "var(--color-brand-50)" : "var(--color-surface)",
                      boxShadow: selected ? "0 0 0 3px rgba(99,102,241,0.18)" : undefined,
                    }}
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-semibold" style={{ color: "var(--color-heading)" }}>{p.label}</span>
                      <span className="text-sm font-bold" style={{ color: "var(--color-brand-600)" }}>{p.price}</span>
                    </div>
                    <div className="mt-1 text-xs" style={{ color: "var(--color-text-secondary)" }}>{p.blurb}</div>
                  </button>
                );
              })}
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div><Label>Budget (₹)</Label><Field required type="number" min={pkg.min} value={form.budget} onChange={set("budget")} /></div>
              <div><Label>Start date</Label><Field required type="date" value={form.startDate} onChange={set("startDate")} /></div>
              <div><Label>End date</Label><Field required type="date" value={form.endDate} onChange={set("endDate")} /></div>
            </div>
          </SectionCard>

          {/* 3 · Campaign & area */}
          <SectionCard step="3" title="Campaign & area">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>Campaign name</Label><Field required value={form.campaignName} onChange={set("campaignName")} placeholder="Paneer Push July" /></div>
              <div>
                <Label>Placement</Label>
                <select value={form.placement} onChange={set("placement")} className="ds-input">
                  {PLACEMENTS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
            </div>
            <LocationTimingSection value={locationTiming} onChange={setLocationTiming} />
          </SectionCard>

          {/* Audience — optional, only reaches consenting logged-in users */}
          <SectionCard step="4" title="Audience (optional)">
            <AudienceSection value={audience} onChange={setAudience} />
          </SectionCard>

          {/* 4 · Creative */}
          <SectionCard step="5" title="Your ad">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>Headline</Label><Field required maxLength={80} value={form.headline} onChange={set("headline")} placeholder="Fresh paneer stock just arrived" /></div>
              <div><Label>CTA button</Label><Field value={form.ctaLabel} onChange={set("ctaLabel")} placeholder="Order Now" /></div>
            </div>
            <div>
              <Label>Body</Label>
              <textarea
                required maxLength={200} rows={2} value={form.body} onChange={set("body")}
                placeholder="₹280/kg · Delivery available till 9 PM"
                className="ds-input resize-none"
              />
            </div>
            <div><Label>Link (optional)</Label><Field type="url" value={form.ctaUrl} onChange={set("ctaUrl")} placeholder="https://…" /></div>

            <div>
              <Label>Image (optional)</Label>
              {mediaDataUrl ? (
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={mediaDataUrl} alt="Creative preview" className="h-16 w-16 rounded-md object-cover" />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="inline-flex items-center gap-1.5 text-sm font-medium"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    <X size={13} /> Remove
                  </button>
                </div>
              ) : (
                <label
                  className="press flex cursor-pointer items-center justify-center gap-2 rounded-(--radius-md) border border-dashed p-4 text-sm font-medium"
                  style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
                >
                  <ImagePlus size={16} /> Upload a photo or banner
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => void handleImageChange(e)} />
                </label>
              )}
            </div>
          </SectionCard>

          {/* Live preview — mirrors the real feed rendering, updates as you type */}
          <SectionCard step="6" title="See it in the app">
            <PhonePreview form={form} mediaUrl={mediaDataUrl} />
          </SectionCard>

          {error && (
            <div
              className="rounded-(--radius-md) border px-4 py-3 text-sm font-medium"
              style={{ borderColor: "var(--color-danger-bg)", background: "var(--color-danger-bg)", color: "var(--color-danger)" }}
            >
              {error}
            </div>
          )}

          <div className="ds-card flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between md:p-7">
            <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
              Nothing goes live until our team approves your booking and creative.<br className="hidden sm:block" />
              No payment is taken at this step.
            </p>
            <button
              type="submit"
              disabled={submitting}
              className="ds-button press shrink-0 px-6 py-3.5 text-base transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Submit booking request <ArrowRight size={15} />
            </button>
          </div>
        </form>
      </main>

      <Footer />
    </>
  );
}
