"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { AdCard } from "./AdCard";
import { AdBanner } from "./AdBanner";
import { AdNativePost } from "./AdNativePost";

export type AdPlacement = "feed_post" | "search_slot" | "story" | "banner";
export type AdVariant = "card" | "banner" | "native";

interface SlotItem {
  creativeId: string;
  headline: string;
  body: string;
  mediaUrl: string | null;
  ctaLabel: string;
  ctaUrl: string;
  advertiserName: string;
  label: string;
}

const HIDE_KEY = "lokul_hidden_ads";

function readHidden(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    return new Set<string>(JSON.parse(window.localStorage.getItem(HIDE_KEY) ?? "[]"));
  } catch {
    return new Set();
  }
}

function persistHidden(creativeId: string) {
  const hidden = readHidden();
  hidden.add(creativeId);
  window.localStorage.setItem(HIDE_KEY, JSON.stringify([...hidden]));
}

function trackEvent(creativeId: string, event: "impression" | "click" | "hide") {
  fetch("/api/mobile/ads/event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ creativeId, event }),
    keepalive: true,
  }).catch(() => {});
}

/**
 * Fetches one eligible creative for `placement`×`pin` from the real ad-serving
 * endpoint and renders it via the matching presentational component. Renders
 * nothing if there's no eligible ad, the ad was previously hidden on this
 * device, or the request fails — ads must never break the page.
 */
export function AdSlot({
  placement,
  pin,
  variant = "card",
  className = "",
}: {
  readonly placement: AdPlacement;
  readonly pin: string;
  readonly variant?: AdVariant;
  readonly className?: string;
}) {
  const [item, setItem] = useState<SlotItem | null>(null);
  const [hidden, setHidden] = useState(false);
  const impressed = useRef(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!/^\d{6}$/.test(pin)) return;
    let cancelled = false;
    fetch(`/api/mobile/ads/slot?placement=${placement}&pin=${pin}`)
      .then((r) => r.json())
      .then((d: { item: SlotItem | null }) => {
        if (cancelled || !d.item) return;
        if (readHidden().has(d.item.creativeId)) return;
        setItem(d.item);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [placement, pin]);

  useEffect(() => {
    if (!item || impressed.current) return;
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      impressed.current = true;
      trackEvent(item.creativeId, "impression");
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !impressed.current) {
          impressed.current = true;
          trackEvent(item.creativeId, "impression");
          io.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [item]);

  if (!item || hidden) return null;

  function handleHide(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!item) return;
    persistHidden(item.creativeId);
    trackEvent(item.creativeId, "hide");
    setHidden(true);
  }

  const rendered =
    variant === "banner" ? (
      <AdBanner
        label={item.headline}
        sub={item.body}
        cta={item.ctaLabel}
        href={item.ctaUrl}
        advertiser={item.advertiserName}
        mediaUrl={item.mediaUrl}
      />
    ) : variant === "native" ? (
      <AdNativePost
        headline={item.headline}
        body={item.body}
        cta={item.ctaLabel}
        href={item.ctaUrl}
        advertiser={item.advertiserName}
        mediaUrl={item.mediaUrl}
      />
    ) : (
      <AdCard
        name={item.advertiserName}
        unit={item.label}
        badgeText={item.headline}
        cta={item.ctaLabel}
        href={item.ctaUrl}
        advertiser={item.advertiserName}
        mediaUrl={item.mediaUrl}
      />
    );

  return (
    <div
      ref={rootRef}
      className={`relative ${className}`}
      onClickCapture={() => trackEvent(item.creativeId, "click")}
    >
      {rendered}
      <button
        type="button"
        onClick={handleHide}
        aria-label="Hide this ad"
        className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-white/90 text-gray-400 shadow-sm transition-colors hover:bg-white hover:text-gray-600"
      >
        <X size={11} />
      </button>
    </div>
  );
}
