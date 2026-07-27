import { ArrowRight, Mail, Shield } from "lucide-react";

/* ── Link data ──────────────────────────────────────────────────────────── */
const FOOTER_SECTIONS = [
  {
    heading: "Product",
    links: [
      { label: "How it works",    href: "#how"      },
      { label: "Features",        href: "#features" },
      { label: "For Residents",   href: "#personas" },
      { label: "For RWAs",        href: "#personas" },
      { label: "For Merchants",   href: "#personas" },
      { label: "Advertise on Lokul", href: "/advertise" },
      { label: "Join the waitlist", href: "#waitlist" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About Lokul", href: "/about"   },
      { label: "Press kit",   href: "/press"   },
      { label: "Careers",     href: "/careers" },
      { label: "Blog",        href: "/blog"    },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy Policy",   href: "/privacy"              },
      { label: "Terms of Service", href: "/terms"                },
      { label: "Cookie Policy",    href: "/cookies"              },
      { label: "Contact us",       href: "mailto:hello@lokul.club" },
    ],
  },
] as const;

const SOCIAL_HANDLES = [
  { label: "X",   short: "X",  href: "https://x.com/lokulclub"                  },
  { label: "Instagram", short: "In", href: "https://instagram.com/lokulclub"    },
  { label: "LinkedIn",  short: "Li", href: "https://linkedin.com/company/lokul" },
] as const;

/* ── Component ──────────────────────────────────────────────────────────── */
export default function Footer() {
  return (
    <footer style={{ background: "#0a0e27" }}>

      {/* ── Main columns ── */}
      <div className="ds-container py-16 md:py-20">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr] lg:gap-12">

          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <a href="#top" className="mb-5 inline-flex items-center gap-2.5">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-[12px] text-sm font-bold text-white"
                style={{ background: "linear-gradient(135deg, var(--color-brand-500), var(--color-brand-700))" }}
              >
                L
              </span>
              <span className="text-lg font-bold tracking-tight text-white">
                lokul<span style={{ color: "var(--color-brand-400)" }}>.club</span>
              </span>
            </a>

            <p
              className="mb-5 max-w-[280px] text-sm leading-relaxed"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              The trusted operating system for Indian neighborhoods — safety alerts, RWA notices, verified local services, and community in one place.
            </p>

            {/* Social icons */}
            <div className="mb-5 flex items-center gap-2">
              {SOCIAL_HANDLES.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold transition-all hover:scale-110"
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    color: "rgba(255,255,255,0.55)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  {s.short}
                </a>
              ))}
            </div>

            {/* Email */}
            <a
              href="mailto:hello@lokul.club"
              className="inline-flex items-center gap-1.5 text-xs transition-colors hover:text-white"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              <Mail size={12} />
              hello@lokul.club
            </a>
          </div>

          {/* Link columns */}
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.heading}>
              <p
                className="mb-4 text-[11px] font-bold uppercase tracking-[0.15em]"
                style={{ color: "rgba(255,255,255,0.3)" }}
              >
                {section.heading}
              </p>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm transition-colors hover:text-white"
                      style={{ color: "rgba(255,255,255,0.55)" }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Waitlist CTA strip ── */}
        <div
          className="mt-14 flex flex-col items-start justify-between gap-4 rounded-2xl border p-6 sm:flex-row sm:items-center"
          style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)" }}
        >
          <div className="flex items-center gap-3">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
              style={{ background: "var(--color-brand-600)" }}
            >
              <Shield size={16} className="text-white" />
            </span>
            <div>
              <p className="text-sm font-bold text-white">Your neighborhood isn&apos;t on the list yet.</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
                Every new signup gets your locality closer to launch.
              </p>
            </div>
          </div>
          <a
            href="#waitlist"
            className="ds-button press shrink-0 text-sm"
          >
            Join the waitlist <ArrowRight size={14} />
          </a>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div
          className="ds-container flex flex-col items-center justify-between gap-3 py-6 text-xs sm:flex-row"
          style={{ color: "rgba(255,255,255,0.3)" }}
        >
          <p>© 2026 Lokul Technologies Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <a href="/privacy" className="transition-colors hover:text-white">Privacy</a>
            <a href="/terms"   className="transition-colors hover:text-white">Terms</a>
            <a href="/cookies" className="transition-colors hover:text-white">Cookies</a>
            <a href="mailto:hello@lokul.club" className="transition-colors hover:text-white">Contact</a>
          </div>
        </div>
      </div>

    </footer>
  );
}
