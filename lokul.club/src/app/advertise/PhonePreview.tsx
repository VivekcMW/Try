"use client";

import { MapPin, Search, Bell, Home as HomeIcon, CircleUserRound } from "lucide-react";
import { AdCard } from "@/components/ads/AdCard";
import { AdBanner } from "@/components/ads/AdBanner";
import { AdNativePost } from "@/components/ads/AdNativePost";

interface PreviewForm {
  readonly businessName: string;
  readonly placement: string;
  readonly headline: string;
  readonly body: string;
  readonly ctaLabel: string;
  readonly ctaUrl: string;
}

function FillerRow() {
  return (
    <div
      className="flex h-[52px] items-center gap-3 rounded-xl border bg-white px-3"
      style={{ borderColor: "var(--color-border)" }}
    >
      <span className="h-8 w-8 shrink-0 rounded-lg" style={{ background: "var(--color-surface-muted)" }} />
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="h-2 w-3/4 rounded-full" style={{ background: "var(--color-surface-muted)" }} />
        <div className="h-2 w-1/2 rounded-full" style={{ background: "var(--color-surface-muted)" }} />
      </div>
    </div>
  );
}

function StoryPreview({ form, mediaUrl }: { readonly form: PreviewForm; readonly mediaUrl: string | null }) {
  const initial = (form.businessName || "B").charAt(0).toUpperCase();
  return (
    <div className="flex items-start gap-3 px-1 pt-2">
      {["Priya", "Rahul"].map((name) => (
        <div key={name} className="flex flex-col items-center gap-1">
          <span
            className="flex h-14 w-14 items-center justify-center rounded-full text-sm font-bold text-white"
            style={{ background: "var(--color-surface-muted)", color: "var(--color-text-disabled)" }}
          >
            {name.charAt(0)}
          </span>
          <span className="text-[9px]" style={{ color: "var(--color-text-secondary)" }}>{name}</span>
        </div>
      ))}
      <div className="flex flex-col items-center gap-1">
        <span
          className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full text-sm font-bold text-white ring-2 ring-offset-2"
          style={{
            background: mediaUrl ? undefined : "linear-gradient(135deg, var(--color-accent-400), var(--color-accent-600))",
            ["--tw-ring-color" as string]: "var(--color-brand-500)",
          }}
        >
          {mediaUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={mediaUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            initial
          )}
        </span>
        <span className="text-[9px] font-semibold" style={{ color: "var(--color-brand-600)" }}>
          {form.businessName || "Sponsored"}
        </span>
      </div>
    </div>
  );
}

/**
 * Live mobile-screen mockup of how the advertiser's creative will actually
 * render in the app feed — reuses the real AdCard/AdBanner/AdNativePost
 * components (the same ones AdSlot renders in production) so there's no
 * drift between what an advertiser previews and what ships.
 */
export function PhonePreview({
  form,
  mediaUrl,
}: {
  readonly form: PreviewForm;
  readonly mediaUrl: string | null;
}) {
  const cardProps = {
    name: form.businessName || "Your business",
    unit: "Sponsored",
    badgeText: form.headline || "Your headline",
    cta: form.ctaLabel || "Learn more",
    href: form.ctaUrl || "#",
    advertiser: form.businessName || "Your business",
    mediaUrl,
  };
  const bannerProps = {
    label: form.headline || "Your headline",
    sub: form.body || "Your ad text",
    cta: form.ctaLabel || "Learn more",
    href: form.ctaUrl || "#",
    advertiser: form.businessName || "Your business",
    mediaUrl,
  };
  const nativeProps = {
    headline: form.headline || "Your headline",
    body: form.body || "Your ad text",
    cta: form.ctaLabel || "Learn more",
    href: form.ctaUrl || "#",
    advertiser: form.businessName || "Your business",
    mediaUrl,
  };

  return (
    <div className="relative mx-auto w-[280px]">
      {/* Phone frame — mirrors the homepage hero mockup so this reads as "the app" */}
      <div
        className="relative mx-auto overflow-hidden rounded-[2.5rem] bg-white"
        style={{
          border: "8px solid #111827",
          boxShadow: "0 24px 60px -16px rgba(15,23,42,0.30), 0 6px 18px -6px rgba(15,23,42,0.16)",
        }}
      >
        <div className="absolute left-1/2 top-2 z-30 h-4 w-20 -translate-x-1/2 rounded-full" style={{ background: "#111827" }} />

        {/* App header */}
        <div className="flex items-center gap-2 border-b px-3.5 pb-2.5 pt-8" style={{ borderColor: "var(--color-border)" }}>
          <div
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[10px] font-black text-white"
            style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)" }}
          >
            L
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-bold leading-tight" style={{ color: "var(--color-heading)" }}>Your neighbourhood</p>
            <p className="flex items-center gap-1 text-[8px]" style={{ color: "var(--color-text-disabled)" }}>
              <MapPin size={7} /> 2 km radius
            </p>
          </div>
        </div>

        {/* Content — swaps by placement so advertisers see exactly where their format lands.
            onClickCapture blocks navigation: this reuses real <Link>-based ad components
            purely as a visual mockup, not a live feed. */}
        <div
          className="h-[380px] overflow-hidden px-2.5 pt-2.5"
          onClickCapture={(e) => e.preventDefault()}
          style={{
            background: "var(--color-surface-muted)",
            maskImage: "linear-gradient(to bottom, black 88%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 88%, transparent 100%)",
          }}
        >
          {form.placement === "story" ? (
            <div className="space-y-2.5">
              <StoryPreview form={form} mediaUrl={mediaUrl} />
              <FillerRow />
              <FillerRow />
              <FillerRow />
            </div>
          ) : form.placement === "banner" ? (
            <div className="space-y-2.5">
              <FillerRow />
              <AdBanner {...bannerProps} />
              <FillerRow />
              <FillerRow />
            </div>
          ) : form.placement === "search_slot" ? (
            <div className="space-y-2.5">
              <FillerRow />
              <div className="scale-[0.94] origin-top">
                <AdCard {...cardProps} />
              </div>
              <FillerRow />
              <FillerRow />
            </div>
          ) : (
            <div className="space-y-2.5">
              <FillerRow />
              <AdNativePost {...nativeProps} />
              <FillerRow />
            </div>
          )}
        </div>

        {/* Tab bar */}
        <div className="flex items-center justify-around border-t px-2 py-2" style={{ borderColor: "var(--color-border)" }}>
          <span className="flex flex-col items-center gap-0.5" style={{ color: "var(--color-brand-600)" }}>
            <HomeIcon size={14} strokeWidth={2.4} />
          </span>
          <span className="flex flex-col items-center gap-0.5" style={{ color: "var(--color-text-disabled)" }}>
            <Search size={14} />
          </span>
          <span className="flex flex-col items-center gap-0.5" style={{ color: "var(--color-text-disabled)" }}>
            <Bell size={14} />
          </span>
          <span className="flex flex-col items-center gap-0.5" style={{ color: "var(--color-text-disabled)" }}>
            <CircleUserRound size={14} />
          </span>
        </div>
      </div>
      <p className="mt-3 text-center text-[11px]" style={{ color: "var(--color-text-disabled)" }}>
        Live preview — updates as you type
      </p>
    </div>
  );
}
