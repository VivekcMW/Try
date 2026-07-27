import { ArrowRight } from "lucide-react";

export default function Navbar() {
  return (
    <header
      className="sticky top-0 z-50 border-b backdrop-blur-xl"
      style={{ borderColor: "var(--color-border)", background: "rgba(255,255,255,0.78)" }}
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
          <a href="#how"      className="transition-colors hover:text-[color:var(--color-heading)]">How it works</a>
          <a href="#features" className="transition-colors hover:text-[color:var(--color-heading)]">Features</a>
          <a href="#personas" className="transition-colors hover:text-[color:var(--color-heading)]">Who it&apos;s for</a>
          <a href="#faq"      className="transition-colors hover:text-[color:var(--color-heading)]">FAQ</a>
        </nav>

        {/* CTA */}
        <a href="#waitlist" className="ds-button press text-sm transition-transform hover:scale-[1.02]">
          <span className="hidden sm:inline">Get my pin code on the list</span>
          <span className="sm:hidden">Join waitlist</span>
          <ArrowRight size={14} />
        </a>
      </div>
    </header>
  );
}
