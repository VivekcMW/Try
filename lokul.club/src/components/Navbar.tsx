import { ArrowRight, Store } from "lucide-react";

export default function Navbar() {
  return (
    <header
      className="sticky top-0 z-50 border-b backdrop-blur-xl"
      style={{
        borderColor: "var(--color-border)",
        background: "rgba(255,255,255,0.78)",
        WebkitBackdropFilter: "blur(24px)",
      }}
    >
      <div className="ds-container flex h-16 items-center justify-between">
        {/* Logo */}
        <a href="#top" className="flex items-center gap-2.5">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-[10px] text-sm font-bold text-white"
            style={{ background: "linear-gradient(135deg, var(--color-brand-500), var(--color-brand-700))" }}
          >
            L
          </span>
          <span className="text-base font-bold tracking-tight" style={{ color: "var(--color-heading)" }}>
            lokul<span style={{ color: "var(--color-brand-600)" }}>.club</span>
          </span>
        </a>

        {/* Desktop nav links */}
        <nav
          className="hidden items-center gap-7 text-sm font-medium md:flex"
          style={{ color: "var(--color-text-secondary)" }}
        >
          <a href="/#how"      className="transition-colors hover:text-[color:var(--color-heading)]">How it works</a>
          <a href="/#features" className="transition-colors hover:text-[color:var(--color-heading)]">Features</a>
          <a href="/#personas" className="transition-colors hover:text-[color:var(--color-heading)]">Who it&apos;s for</a>
          <a href="/#faq"      className="transition-colors hover:text-[color:var(--color-heading)]">FAQ</a>
          <a
            href="/business"
            className="flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 font-semibold transition-all hover:scale-[1.03]"
            style={{ borderColor: "var(--color-brand-200)", background: "var(--color-brand-50)", color: "var(--color-brand-700)" }}
          >
            <Store size={13} /> For Business
          </a>
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-2">
          <a
            href="/business"
            aria-label="For Business"
            className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold md:hidden"
            style={{ borderColor: "var(--color-brand-200)", background: "var(--color-brand-50)", color: "var(--color-brand-700)" }}
          >
            <Store size={13} /> Business
          </a>
          <a href="/#waitlist" className="ds-button press text-sm transition-transform hover:scale-[1.02]">
            <span className="hidden sm:inline">Get my pin code on the list</span>
            <span className="sm:hidden">Join</span>
            <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </header>
  );
}
