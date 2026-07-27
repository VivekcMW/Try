/**
 * GET  /api/mobile/ads — fetch a single contextual ad for a placement
 * POST /api/mobile/ads/[id]/click — record an ad click
 */
import { NextRequest, NextResponse } from "next/server";

// Seed ads (replace with real DB query once ad_campaign table is migrated)
const SEED_ADS = [
  {
    id: "ad-001",
    title: "Get free pest control this month",
    body: "HyperClean Pest Services — 200+ societies served near Pune.",
    ctaLabel: "Book free visit",
    ctaUrl: "https://example.com/hyperclean",
    imageUrl: null,
    sponsorName: "HyperClean",
    placement: "feed",
  },
  {
    id: "ad-002",
    title: "Solar rooftop — ₹0 down, save ₹3,000/mo",
    body: "SunSave Energy — Serving your PIN code. MNRE approved.",
    ctaLabel: "Get free estimate",
    ctaUrl: "https://example.com/sunsave",
    imageUrl: null,
    sponsorName: "SunSave Energy",
    placement: "explore",
  },
  {
    id: "ad-003",
    title: "Open a savings account in 5 minutes",
    body: "Finova Bank — Zero-balance account. No branch visit needed.",
    ctaLabel: "Open account",
    ctaUrl: "https://example.com/finova",
    imageUrl: null,
    sponsorName: "Finova Bank",
    placement: "marketplace",
  },
  {
    id: "ad-004",
    title: "Tata 1mg — medicines delivered in 30 min",
    body: "Order prescriptions, wellness products from your locality.",
    ctaLabel: "Shop now",
    ctaUrl: "https://example.com/1mg",
    imageUrl: null,
    sponsorName: "Tata 1mg",
    placement: "notifications",
  },
  {
    id: "ad-005",
    title: "Home essentials delivered same day",
    body: "GrocerEase — serving your locality. First order 20% off.",
    ctaLabel: "Order now",
    ctaUrl: "https://example.com/grocerease",
    imageUrl: null,
    sponsorName: "GrocerEase",
    placement: "header",
  },
];

export async function GET(req: NextRequest) {
  const placement = req.nextUrl.searchParams.get("placement") ?? "feed";
  const matching  = SEED_ADS.filter((a) => a.placement === placement);
  const ad = matching.length > 0 ? matching[Math.floor(Math.random() * matching.length)] : SEED_ADS[0];
  return NextResponse.json({ ad });
}
