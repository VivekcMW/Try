import Link from "next/link";
import { ExternalLink } from "lucide-react";

interface AdNativePostProps {
  readonly headline: string;
  readonly body: string;
  readonly cta: string;
  readonly href: string;
  readonly advertiser: string;
  readonly accent?: string;
  readonly mediaUrl?: string | null;
}

const STUB: AdNativePostProps = {
  headline:   "KGF 3 — now in theatres near you",
  body:       "Book seats at the nearest multiplex. Early bird discount ends tonight.",
  cta:        "Book tickets",
  href:       "https://in.bookmyshow.com",
  advertiser: "BookMyShow",
  accent:     "#E51937",
};

export function AdNativePost(props?: Partial<AdNativePostProps>) {
  const ad = { ...STUB, ...props };
  return (
    <div
      className="rounded-md border p-4"
      style={{ borderColor: "var(--color-brand-200)", background: "var(--color-brand-50)" }}
      aria-label="Sponsored content"
    >
      <div className="mb-2 flex items-center justify-between">
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
          style={{ background: "var(--color-brand-50)", color: "var(--color-brand-700)" }}
        >
          Sponsored
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--color-text-disabled)" }}>
          {ad.advertiser}
        </span>
      </div>

      <p className="text-sm font-semibold leading-snug" style={{ color: "var(--color-heading)" }}>
        {ad.headline}
      </p>
      <p className="mt-1 text-xs line-clamp-2" style={{ color: "var(--color-text-secondary)" }}>
        {ad.body}
      </p>

      {ad.mediaUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={ad.mediaUrl}
          alt=""
          className="mt-3 h-36 w-full rounded-md object-cover"
        />
      )}

      <Link
        href={ad.href}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="mt-3 inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-xs font-semibold text-white"
        style={{ background: ad.accent ?? "var(--color-brand-600)" }}
      >
        {ad.cta} <ExternalLink size={11} />
      </Link>
    </div>
  );
}
