"use client";

import { ArrowRight, Globe, Store } from "lucide-react";
import { LOCALES, useI18n } from "@/lib/i18n";
import type { Locale } from "@/i18n";

function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  return (
    <label
      className="relative flex items-center gap-1 rounded-full border px-2.5 py-1.5 text-xs font-semibold"
      style={{ borderColor: "var(--color-border)", background: "#fff", color: "var(--color-text-secondary)" }}
    >
      <Globe size={13} aria-hidden />
      <select
        aria-label="Language"
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        className="cursor-pointer appearance-none bg-transparent pr-3 text-xs font-semibold outline-none"
        style={{ color: "var(--color-heading)" }}
      >
        {LOCALES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-2 text-[9px]" aria-hidden>
        ▾
      </span>
    </label>
  );
}

export default function Navbar() {
  const { t } = useI18n();
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
          className="hidden items-center gap-5 whitespace-nowrap text-sm font-medium lg:flex lg:gap-7"
          style={{ color: "var(--color-text-secondary)" }}
        >
          <a href="/#how"      className="transition-colors hover:text-[color:var(--color-heading)]">{t.nav.how}</a>
          <a href="/#features" className="transition-colors hover:text-[color:var(--color-heading)]">{t.nav.features}</a>
          <a href="/#personas" className="transition-colors hover:text-[color:var(--color-heading)]">{t.nav.who}</a>
          <a href="/#faq"      className="transition-colors hover:text-[color:var(--color-heading)]">{t.nav.faq}</a>
          <a
            href="/business"
            className="flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 font-semibold transition-all hover:scale-[1.03]"
            style={{ borderColor: "var(--color-brand-200)", background: "var(--color-brand-50)", color: "var(--color-brand-700)" }}
          >
            <Store size={13} /> {t.nav.forBusiness}
          </a>
        </nav>

        {/* CTA */}
        <div className="flex min-w-0 shrink-0 items-center gap-1.5 sm:gap-2">
          <span className="hidden min-[400px]:inline-flex">
            <LanguageSwitcher />
          </span>
          <a
            href="/business"
            aria-label={t.nav.business}
            className="flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-sm font-semibold lg:hidden"
            style={{ borderColor: "var(--color-brand-200)", background: "var(--color-brand-50)", color: "var(--color-brand-700)" }}
          >
            <Store size={13} /> <span className="hidden min-[400px]:inline">{t.nav.business}</span>
          </a>
          <a href="/#waitlist" className="ds-button press shrink-0 text-sm transition-transform hover:scale-[1.02]">
            <span className="hidden sm:inline">{t.nav.ctaLong}</span>
            <span className="sm:hidden">{t.nav.join}</span>
            <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </header>
  );
}
