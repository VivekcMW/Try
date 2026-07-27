import { NextResponse } from "next/server";

export interface PincodeResult {
  pincode: string;
  locality: string; // e.g. "Koramangala"
  city: string;     // e.g. "Bengaluru"
  state: string;    // e.g. "Karnataka"
  label: string;    // pre-formatted one-liner for UI
}

// Nominatim address fields (partial — only what we use)
interface NominatimAddress {
  suburb?: string;
  neighbourhood?: string;
  quarter?: string;
  village?: string;
  town?: string;
  city?: string;
  county?: string;
  state_district?: string;
  state?: string;
  postcode?: string;
}

interface NominatimResult {
  address?: NominatimAddress;
  display_name?: string;
}

function pickLocality(addr: NominatimAddress): string {
  // Prefer the most local name available
  return (
    addr.suburb ??
    addr.neighbourhood ??
    addr.quarter ??
    addr.village ??
    addr.town ??
    ""
  );
}

function pickCity(addr: NominatimAddress): string {
  return addr.city ?? addr.county ?? addr.state_district ?? "";
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ pin: string }> }
) {
  const { pin } = await params;

  // Validate: must be exactly 6 digits
  if (!/^\d{6}$/.test(pin)) {
    return NextResponse.json({ error: "Invalid PIN format" }, { status: 400 });
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?postalcode=${pin}&countrycodes=in&format=json&addressdetails=1&limit=1`;

    const res = await fetch(url, {
      headers: {
        // Nominatim usage policy requires a meaningful User-Agent
        "User-Agent": "lokul.club/1.0 (waitlist-form; contact@lokul.club)",
        Accept: "application/json",
      },
      // Next.js ISR cache: revalidate once a day (PIN–area mapping rarely changes)
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Lookup failed" }, { status: 502 });
    }

    const data: NominatimResult[] = await res.json();

    if (!data.length || !data[0].address) {
      return NextResponse.json({ error: "PIN code not found" }, { status: 404 });
    }

    const addr = data[0].address;
    const locality = pickLocality(addr);
    const city = pickCity(addr);
    const state = addr.state ?? "";

    // Build a clean label for the UI
    const parts = [locality, city].filter(Boolean);
    const label = parts.length
      ? `${parts.join(", ")} · ${state}`
      : state || "Location found";

    const result: PincodeResult = {
      pincode: pin,
      locality,
      city,
      state,
      label,
    };

    return NextResponse.json(result, {
      headers: {
        // Browser cache: 24 h (immutable per PIN)
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Lookup failed" }, { status: 502 });
  }
}
