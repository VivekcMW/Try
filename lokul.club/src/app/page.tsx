"use client";

import { useState, useEffect, useRef, useActionState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { joinWaitlist, type WaitlistResult } from "@/app/actions/waitlist";
import { PincodeField } from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import {
  Shield,
  Users,
  ShoppingBag,
  Calendar,
  MapPin,
  Check,
  ArrowRight,
  ChevronDown,
  Sparkles,
  Star,
  Zap,
  Lock,
  Globe,
  Building2,
  Home as HomeIcon,
  AlertTriangle,
  TrendingUp,
  UserCheck,
  Search,
  Droplets,
  Car,
  UtensilsCrossed,
  GraduationCap,
  PawPrint,
  Tag,
  Newspaper,
  HeartHandshake,
  Phone as PhoneIcon,
  Store,
  BadgeCheck,
  IndianRupee,
  Radar,
  Bell,
  CircleUserRound,
} from "lucide-react";

/* ════════════════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════════════ */

const CITIES = [
  "Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Chennai", "Pune", "Ahmedabad",
  "Kolkata", "Jaipur", "Surat", "Lucknow", "Nagpur", "Indore", "Thane",
  "Bhopal", "Kochi", "Chandigarh", "Coimbatore", "Visakhapatnam", "Patna",
];

const TRUST_LOCALITIES = [
  "Andheri West", "HSR Layout", "Indiranagar", "GK-1", "Powai",
  "Koramangala", "Banjara Hills", "Salt Lake", "Adyar", "Vashi",
];

const FEED_TYPES = [
  { Icon: Shield,         label: "Safety alerts",        color: "#DC2626", bg: "#FEE2E2", count: "8 active",     desc: "Real-time, verified, geofenced to your pin code." },
  { Icon: Users,          label: "Community",            color: "#4F46E5", bg: "#EEF2FF", count: "47 today",     desc: "RWA notices, polls, lost & found, neighborhood updates." },
  { Icon: ShoppingBag,    label: "Local market",         color: "#16A34A", bg: "#F0FDF4", count: "320 nearby",   desc: "Tiffin, plumbers, tutors, salons — all background-verified." },
  { Icon: Calendar,       label: "Events & camps",       color: "#7C3AED", bg: "#F5F3FF", count: "12 this week", desc: "Health camps, cultural events, society meetings." },
  { Icon: UserCheck,      label: "Daily house help",     color: "#0369A1", bg: "#E0F2FE", count: "54 nearby",    desc: "Find verified maids, cooks, and drivers with references from your own building." },
  { Icon: Search,         label: "Lost & Found",         color: "#B45309", bg: "#FEF3C7", count: "6 open",       desc: "Lost keys, wallets, pets — posted and resolved within your pin code." },
  { Icon: Droplets,       label: "Water & power",        color: "#0891B2", bg: "#ECFEFF", count: "2 alerts",     desc: "Scheduled cuts, tanker timings, borewell updates — before you run dry." },
  { Icon: Car,            label: "Carpooling",           color: "#0F766E", bg: "#F0FDFA", count: "18 rides",     desc: "Share office commutes, school drops, and station runs with verified neighbors." },
  { Icon: UtensilsCrossed,label: "Food & Tiffin",        color: "#B91C1C", bg: "#FFF1F2", count: "29 options",   desc: "Home chefs, dabbawalas, and cloud kitchens within 2 km — all rated by neighbors." },
  { Icon: PhoneIcon,      label: "Emergency contacts",   color: "#7C3AED", bg: "#F5F3FF", count: "On-call",      desc: "Verified on-call plumber, electrician, locksmith, and doctor for your area." },
  { Icon: GraduationCap,  label: "Kids & Learning",      color: "#166534", bg: "#F0FDF4", count: "41 classes",   desc: "Tuition, hobby classes, playgroups, and school bus updates near you." },
  { Icon: PawPrint,       label: "Pets",                 color: "#C2410C", bg: "#FFF7ED", count: "14 posts",     desc: "Vet nearby, dog walkers, lost pet alerts, and breed-specific groups." },
  { Icon: Tag,            label: "Deals & Offers",       color: "#15803D", bg: "#F0FDF4", count: "33 live",      desc: "Kirana discounts, festive sales, and first-customer promos from shops near you." },
  { Icon: HeartHandshake, label: "Donation requests",    color: "#BE185D", bg: "#FDF2F8", count: "3 urgent",     desc: "Emergency blood groups, food drives, and charity collections in your area." },
  { Icon: Newspaper,      label: "Local news",           color: "#374151", bg: "#F9FAFB", count: "Daily",        desc: "Road digs, new shops, pothole reports, construction noise — straight from neighbors." },
];

const BENTO_FEATURES = [
  { Icon: Shield,      title: "Verified safety alerts",  desc: "No fake forwards. Every alert has a verified source, timestamp, and geofence.", tone: "danger"  },
  { Icon: Lock,        title: "Real identity, optional anonymity", desc: "Address-verified profiles keep noise out. Post anonymously when you need to.", tone: "brand" },
  { Icon: Globe,       title: "Speaks your language",     desc: "Read your feed in Hindi, Marathi, Tamil, Telugu — translation built-in.", tone: "accent" },
  { Icon: TrendingUp,  title: "Smart priority feed",      desc: "Safety bubbles to the top. Polls when they're closing. Tiffin when it's lunchtime.", tone: "brand"  },
  { Icon: Building2,   title: "Made for RWAs",            desc: "Send notices, run polls, post agendas. One source of truth for your society.", tone: "brand"  },
  { Icon: Sparkles,    title: "Zero ads. Always.",        desc: "Free for residents, forever. Trusted merchants pay to reach their own street.", tone: "accent" },
];

const STEPS = [
  { num: "01", Icon: MapPin, title: "Enter your pin code", desc: "We auto-detect your locality from your 6-digit pin code. No long forms." },
  { num: "02", Icon: Check,  title: "Verify with one OTP", desc: "30-second SMS verification confirms you are a real resident of your area." },
  { num: "03", Icon: Users,  title: "Join the feed",        desc: "Your hyperlocal feed is live. Posts only from people within 500 m of you." },
];

const PERSONAS = {
  resident: {
    title:    "For Residents",
    Icon:     HomeIcon,
    headline: "Know what's happening on your street, before anyone else.",
    bullets:  [
      "Real-time safety alerts — waterlogging, power cuts, theft attempts",
      "Find a tiffin service, electrician, or tutor within walking distance",
      "Never miss an RWA notice, health camp, or community vote",
      "Post anonymously when you need to — your address stays private",
    ],
  },
  rwa: {
    title:    "For RWAs & Societies",
    Icon:     Building2,
    headline: "One verified channel that actually reaches every resident.",
    bullets:  [
      "Push notices, polls, and emergency alerts — see read receipts",
      "Eliminate chaotic WhatsApp groups; keep records and accountability",
      "Run digital RWA meetings, collect votes, share agendas in advance",
      "Free for societies under 500 units. Custom plans beyond that.",
    ],
  },
  merchant: {
    title:    "For Local Merchants",
    Icon:     ShoppingBag,
    headline: "Reach your own neighborhood — not strangers across the city.",
    bullets:  [
      "Show up in the feed of every resident within 2 km of your shop",
      "Verified business badge after a 2-minute background check",
      "Collect ratings only from neighbors who've actually bought from you",
      "₹0 to list. Pay only when a customer messages you.",
    ],
  },
} as const;

const TESTIMONIALS = [
  { name: "Priya M.",   loc: "Andheri West, Mumbai",  role: "Resident",       quote: "I have been waiting for this. WhatsApp groups are pure chaos. I just need to know what is actually happening in my area." },
  { name: "Ramesh K.",  loc: "Koramangala, Bengaluru", role: "Local Merchant", quote: "There has been no trusted way to reach my own neighborhood. Classifieds are full of scammers. Lokul fixes exactly that." },
  { name: "Sunita R.",  loc: "Sector 62, Noida",       role: "Resident",       quote: "Last monsoon we had zero reliable alerts. A platform like Lokul would have changed everything for our society." },
];

const FAQS = [
  { q: "Is Lokul free for residents?",                                   a: "Yes — always free for residents. We earn from verified local merchants who pay a small fee to reach their immediate neighborhood. Residents pay nothing, see no ads, and we never sell data." },
  { q: "How do you verify that I actually live here?",                   a: "A combination of mobile OTP and address verification at signup. Optional Aadhaar-eKYC unlocks a 'verified resident' badge. Your real identity is never shown to other users — you can post fully anonymously." },
  { q: "What's the difference between my locality and my city?",         a: "Your locality is defined by your 6-digit pin code (typically 0.5–2 km of your home). Your feed only shows posts from people in the same pin code — not the entire city." },
  { q: "Can my RWA / society manager use this?",                         a: "Yes. RWAs get a dedicated dashboard for sending notices, running polls, and managing residents. Free for societies under 500 units." },
  { q: "Which cities are launching first?",                              a: "Mumbai, Delhi NCR, and Bengaluru launch first in Q3 2026. Hyderabad, Chennai, and Pune follow. We're targeting 20 cities by end of 2027." },
  { q: "Will my data ever be sold or shared?",                           a: "Never. Your data is used only to personalize your local feed. We don't sell to advertisers, brokers, or any third party. Period." },
];

const LOKUL_SCREENS = [
  { Icon: Shield,          category: "Safety",        catColor: "#DC2626", catBg: "#FEE2E2", title: "Theft attempt near Gate 3",            meta: "Verified · 4 min ago · 12 views",   urgent: true  },
  { Icon: Building2,       category: "RWA Notice",    catColor: "#4F46E5", catBg: "#EEF2FF", title: "AGM tomorrow 10 AM — A-Block hall",    meta: "47 read receipts · Pinned",          urgent: false },
  { Icon: Droplets,        category: "Water",         catColor: "#0891B2", catBg: "#ECFEFF", title: "Water cut 6–10 AM tomorrow (BWSSB)",  meta: "Confirmed · 2 hrs ago",              urgent: true  },
  { Icon: UserCheck,       category: "House Help",    catColor: "#0369A1", catBg: "#E0F2FE", title: "Maid available Mon–Sat, 3BHK exp.",    meta: "3 refs from A-wing · Verified",      urgent: false },
  { Icon: Search,          category: "Lost & Found",  catColor: "#B45309", catBg: "#FEF3C7", title: "Lost: House keys near B-wing lift",    meta: "B-303 · 20 min ago",                 urgent: false },
  { Icon: UtensilsCrossed, category: "Tiffin",        catColor: "#B91C1C", catBg: "#FFF1F2", title: "Mrs. Sharma's Tiffin — ₹120/day",     meta: "4.9 ★ · 38 neighbors ordering",      urgent: false },
  { Icon: Users,           category: "Poll",          catColor: "#4F46E5", catBg: "#EEF2FF", title: "Should we install CCTV in parking?",  meta: "74% Yes · 89 votes · Closes 9 PM",   urgent: false },
  { Icon: Car,             category: "Carpool",       catColor: "#0F766E", catBg: "#F0FDFA", title: "Daily ride to Cyber City — 9 AM",     meta: "2 seats free · Mon–Fri",             urgent: false },
  { Icon: Calendar,        category: "Event",         catColor: "#7C3AED", catBg: "#F5F3FF", title: "Free health camp — BP & sugar test",  meta: "Sunday 9 AM · Block C garden",       urgent: false },
  { Icon: PhoneIcon,       category: "Emergency",     catColor: "#BE185D", catBg: "#FDF2F8", title: "Electrician on-call — 30 min ETA",    meta: "Verified · 4.8 ★ · 52 jobs done",    urgent: false },
  { Icon: Tag,             category: "Deal",          catColor: "#15803D", catBg: "#F0FDF4", title: "D-Mart: 20% off dry fruits today",    meta: "1.2 km away · Expires midnight",     urgent: false },
  { Icon: PawPrint,        category: "Lost Pet",      catColor: "#C2410C", catBg: "#FFF7ED", title: "Lost: Indie dog Biscuit near park",   meta: "Last seen 2 hrs ago · B-gate area",  urgent: true  },
];

/* ════════════════════════════════════════════════════════════════════════
   REVEAL — IntersectionObserver-driven fade/rise on scroll
   ═══════════════════════════════════════════════════════════════════════ */
function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("is-visible");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal ${delay ? `reveal-delay-${delay}` : ""} ${className}`}>
      {children}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   SUCCESS CARD
   ═══════════════════════════════════════════════════════════════════════ */
function SuccessCard({ posthog }: { posthog: ReturnType<typeof usePostHog> }) {
  const { t } = useI18n();
  useEffect(() => {
    posthog?.capture("waitlist_signup_success");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="rounded-3xl border bg-white p-10 text-center md:p-14"
      style={{ borderColor: "var(--color-border)" }}
    >
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full" style={{ background: "var(--color-brand-50)" }}>
        <Check size={32} className="text-emerald-600" />
      </span>
      <h2 className="mt-5 text-3xl font-bold" style={{ color: "var(--color-heading)", letterSpacing: "-0.02em" }}>{t.waitlist.success.title}</h2>
      <p className="mt-3 text-base" style={{ color: "var(--color-text-secondary)" }}>
        {t.waitlist.success.sub}
      </p>
      <div className="mx-auto mt-7 rounded-2xl border p-5" style={{ borderColor: "var(--color-brand-200)", background: "var(--color-brand-50)" }}>
        <p className="text-sm font-bold" style={{ color: "var(--color-brand-700)" }}>{t.waitlist.success.wantPriority}</p>
        <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
          {t.waitlist.success.shareA}<span className="font-bold">lokul.club</span>{t.waitlist.success.shareB}
        </p>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   SCREENS CONVEYOR — animated two-column infinite scroll
   ═══════════════════════════════════════════════════════════════════════ */
function ScreenCard({ item }: { item: (typeof LOKUL_SCREENS)[number] }) {
  return (
    <div
      className="mb-3 rounded-2xl border bg-white p-3.5 shadow-sm"
      style={{
        borderColor: "var(--color-border)",
        borderLeftWidth: "3px",
        borderLeftColor: item.urgent ? "#DC2626" : "transparent",
      }}
    >
      <div className="flex items-start gap-2.5">
        <span
          className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
          style={{ background: item.catBg }}
        >
          <item.Icon size={13} style={{ color: item.catColor }} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-1.5">
            <span
              className="rounded-full px-1.5 py-px text-[9px] font-bold uppercase tracking-wide"
              style={{ background: item.catBg, color: item.catColor }}
            >
              {item.category}
            </span>
            {item.urgent && <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-red-500" />}
          </div>
          <p className="text-xs font-semibold leading-snug" style={{ color: "var(--color-heading)" }}>{item.title}</p>
          <p className="mt-0.5 text-[10px]" style={{ color: "var(--color-text-disabled)" }}>{item.meta}</p>
        </div>
      </div>
    </div>
  );
}

function ScreensConveyor() {
  const colA = LOKUL_SCREENS;
  const colB = [...LOKUL_SCREENS.slice(6), ...LOKUL_SCREENS.slice(0, 6)] as typeof LOKUL_SCREENS;
  return (
    <div
      className="screens-conveyor relative h-[520px] overflow-hidden rounded-2xl"
      style={{
        maskImage: "linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)",
      }}
    >
      <div className="flex gap-3">
        <div className="flex-1 animate-scroll-up">
          {[...colA, ...colA].map((item, i) => <ScreenCard key={i} item={item} />)}
        </div>
        <div className="flex-1 animate-scroll-down">
          {[...colB, ...colB].map((item, i) => <ScreenCard key={i} item={item} />)}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════════════ */
export default function Home() {
  const posthog = usePostHog();
  const { t } = useI18n();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [persona, setPersona] = useState<keyof typeof PERSONAS>("resident");
  const [state, action, pending] = useActionState<WaitlistResult | null, FormData>(
    joinWaitlist,
    null
  );
  const submitted = state?.success === true;

  // ── Geo detection state ──────────────────────────────────────────────
  const [pinVal,     setPinVal]     = useState("");
  const [cityVal,    setCityVal]    = useState<string | null>(null);
  const [locLoading, setLocLoading] = useState(false);

  // ── Neighborhood explore state ───────────────────────────────────────
  const router = useRouter();
  const [explorePin, setExplorePin] = useState("");

  // ── Merchant lead teaser state ───────────────────────────────────────
  const [bizName, setBizName]   = useState("");
  const [bizPhone, setBizPhone] = useState("");

  function handleExplore(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const pin = explorePin.trim();
    if (pin.length === 6) router.push("/n/".concat(pin));
  }

  // On mount: fetch IP-based geo to pre-fill PIN + city
  useEffect(() => {
    fetch("/api/geo")
      .then((r) => r.json())
      .then((data: { pin: string | null; city: string | null }) => {
        if (data.pin)  setPinVal(data.pin);
        if (data.city) setCityVal(data.city);
      })
      .catch(() => { /* silent — user fills manually */ });
  }, []);

  // "Use my location" button handler
  function handleUseLocation() {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res  = await fetch("/api/reverse-geocode", {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          });
          const data = await res.json() as { pin: string | null; city: string | null };
          if (data.pin)  setPinVal(data.pin);
          if (data.city) setCityVal(data.city);
        } catch { /* ignore */ }
        setLocLoading(false);
      },
      () => setLocLoading(false),
      { timeout: 8_000 }
    );
  }

  const active = PERSONAS[persona];

  return (
    <div className="min-h-screen bg-white" style={{ color: "var(--color-foreground)" }}>

      <Navbar />

      <main id="top">

        {/* ════════ HERO ════════ */}
        <section className="relative overflow-hidden pb-16 pt-12 md:pb-20 md:pt-20">
          <div className="bg-mesh pointer-events-none absolute inset-0 opacity-90" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-b from-transparent to-white" />

          <div className="ds-container relative grid items-start gap-8 md:gap-12 lg:grid-cols-[1.2fr_minmax(0,400px)] lg:gap-14">

            {/* ── Copy ── */}
            <div className="relative z-10 max-w-[640px]">
              <h1
                className="text-balance text-[clamp(2.5rem,5.5vw,4.5rem)] font-bold leading-[1.02] tracking-tight"
                style={{ color: "var(--color-heading)", letterSpacing: "-0.04em" }}
              >
                {t.hero.line1}{" "}
                <span className="relative whitespace-nowrap">
                  <span style={{ color: "var(--color-brand-600)" }}>{t.hero.line2}</span>
                </span>
                <br />
                {t.hero.line3}
              </h1>

              <p
                className="mt-6 max-w-xl text-pretty text-lg leading-relaxed md:text-xl"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {t.hero.sub}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a href="#waitlist"
                className="ds-button press group/cta px-6 py-3.5 text-base shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-500/30"
                onClick={() => posthog?.capture("cta_click", { location: "hero" })}
              >
                  {t.hero.ctaWaitlist} <ArrowRight size={16} className="transition-transform duration-300 group-hover/cta:translate-x-1" />
                </a>
                <a
                  href="/business"
                  className="press group/biz flex items-center gap-2 rounded-lg border-2 px-5 py-3 text-sm font-bold transition-all hover:scale-[1.02]"
                  style={{ borderColor: "var(--color-brand-200)", color: "var(--color-brand-700)", background: "var(--color-brand-50)" }}
                  onClick={() => posthog?.capture("cta_click", { location: "hero_business" })}
                >
                  <Store size={16} /> {t.hero.ctaBusiness}
                  <ArrowRight size={14} className="transition-transform duration-300 group-hover/biz:translate-x-1" />
                </a>
              </div>

              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
                {t.hero.trust.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
                    <Check size={15} className="shrink-0 text-emerald-600" />
                    {item}
                  </li>
                ))}
              </ul>

              {/* ── Inline hero form ── */}
              {submitted ? (
                <div className="mt-6 flex items-center gap-3 rounded-xl border px-4 py-3.5" style={{ background: "#F0FDF4", borderColor: "#BBF7D0" }}>
                  <Check size={18} className="shrink-0 text-emerald-600" />
                  <p className="text-sm font-semibold" style={{ color: "#166534" }}>{t.hero.successInline}</p>
                </div>
              ) : (
                <form action={action} className="mt-6">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-[1fr_1.4fr_8.5rem_auto]">
                    <input
                      className="ds-input h-11 min-w-0 text-sm"
                      type="text" name="name" placeholder={t.hero.phName} required
                    />
                    <input
                      className="ds-input h-11 min-w-0 text-sm"
                      type="email" name="email" placeholder={t.hero.phEmail} required
                    />
                    {/* PIN with "Use my location" button */}
                    <div className="relative">
                      <input
                        className="ds-input h-11 w-full min-w-0 pr-8 text-sm"
                        type="text" name="pincode" placeholder={t.hero.phPin}
                        pattern="\d{6}" maxLength={6} inputMode="numeric" required
                        value={pinVal}
                        onChange={(e) => setPinVal(e.target.value.replace(/\D/g, ""))}
                      />
                      <button
                        type="button"
                        title={t.hero.useLocation}
                        onClick={handleUseLocation}
                        disabled={locLoading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 transition-colors disabled:opacity-40"
                        style={{ color: locLoading ? "var(--color-brand-600)" : "var(--color-text-disabled)" }}
                      >
                        {locLoading
                          ? <span className="block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          : <MapPin size={14} />
                        }
                      </button>
                    </div>
                    <input type="hidden" name="role" value="resident" />
                    <input type="hidden" name="notify" value="on" />
                    <input type="hidden" name="detectedCity" value={cityVal ?? ""} />
                    <button
                      type="submit" disabled={pending}
                      className="ds-button press group/cta h-11 whitespace-nowrap px-5 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                      onClick={() => posthog?.capture("waitlist_submit_click", { location: "hero_inline" })}
                    >
                      {pending ? t.hero.saving : <>{t.hero.reserve} <ArrowRight size={14} className="transition-transform duration-300 group-hover/cta:translate-x-1" /></>}
                    </button>
                  </div>
                  {/* City chip — shown when geo detected a city */}
                  {cityVal && (
                    <p className="mt-1.5 flex items-center gap-1 text-xs" style={{ color: "var(--color-text-disabled)" }}>
                      <MapPin size={10} className="shrink-0" />
                      {t.hero.detected}: {cityVal}{pinVal ? ` · ${pinVal}` : ""} {t.hero.editIfWrong}
                    </p>
                  )}
                  {state && !state.success && (
                    <p className="mt-2 text-xs text-red-600">{state.error}</p>
                  )}
                  <p className="mt-2 text-xs" style={{ color: "var(--color-text-disabled)" }}>
                    {t.hero.noSpam}
                  </p>
                </form>
              )}
            </div>

            {/* ── Live feed panel ── */}
            <HeroPhone />
          </div>
        </section>

        {/* ════════ TRUST STRIP ════════ */}
        <section className="border-y" style={{ borderColor: "var(--color-border)", background: "var(--color-surface-muted)" }}>
          <div className="ds-container flex flex-col items-center justify-between gap-4 py-5 md:flex-row">
            <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "var(--color-text-disabled)" }}>
              {t.trustStrip.label}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {TRUST_LOCALITIES.slice(0, 7).map((loc) => (
                <span key={loc} className="text-sm font-semibold" style={{ color: "var(--color-text-secondary)" }}>
                  {loc}
                </span>
              ))}
              <span className="text-sm font-semibold" style={{ color: "var(--color-brand-600)" }}>{t.trustStrip.more}</span>
            </div>
          </div>
        </section>

        {/* ════════ EXPLORE YOUR NEIGHBORHOOD ════════ */}
        <section className="border-b py-14" style={{ borderColor: "var(--color-border)" }}>
          <div className="ds-container max-w-xl text-center">
            <span
              className="mb-3 inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest"
              style={{ background: "var(--color-brand-50)", color: "var(--color-brand-700)" }}
            >
              {t.explore.chip}
            </span>
            <h2 className="text-2xl font-bold sm:text-3xl" style={{ color: "var(--color-heading)" }}>
              {t.explore.title}
            </h2>
            <p className="mt-3 text-sm" style={{ color: "var(--color-text-secondary)" }}>
              {t.explore.sub}
            </p>
            <form onSubmit={handleExplore} className="mt-6 flex items-center gap-2 justify-center">
              <input
                className="ds-input h-11 w-36 text-center text-sm tracking-widest"
                type="text"
                inputMode="numeric"
                placeholder="560038"
                maxLength={6}
                pattern="\d{6}"
                value={explorePin}
                onChange={(e) => setExplorePin(e.target.value.replaceAll(/\D/gu, ""))}
                required
                aria-label="PIN code"
              />
              <button
                type="submit"
                disabled={explorePin.length !== 6}
                className="ds-button press h-11 px-5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Search size={14} /> {t.explore.cta}
              </button>
            </form>
            <p className="mt-3 text-xs" style={{ color: "var(--color-text-disabled)" }}>
              {t.explore.tryLabel} <button type="button" className="underline" onClick={() => { setExplorePin("560038"); router.push("/n/560038"); }}>{t.explore.sample}</button>
            </p>
          </div>
        </section>

        {/* ════════ VISION STATEMENT ════════ */}
        <section className="border-b" style={{ borderColor: "var(--color-border)", background: "var(--color-surface-muted)" }}>
          <Reveal className="ds-container py-16 md:py-20">
            <div className="mx-auto max-w-3xl text-center">
              <p className="mb-6 text-lg leading-relaxed md:text-xl" style={{ color: "var(--color-text-secondary)" }}>
                {t.vision.p1}
              </p>
              <p className="mb-8 text-2xl font-bold leading-snug tracking-tight md:text-3xl" style={{ color: "var(--color-text-primary)" }}>
                {t.vision.p2a}
                <span style={{ color: "var(--color-brand-600)" }}>{t.vision.p2b}</span>
              </p>
              <div className="mx-auto h-px max-w-xs" style={{ background: "var(--color-border)" }} />
              <p className="mt-8 text-base md:text-lg" style={{ color: "var(--color-text-secondary)" }}>
                {t.vision.p3a}
                <strong style={{ color: "var(--color-text-primary)" }}>{t.vision.p3b}</strong>
                {t.vision.p3c}
              </p>
            </div>
          </Reveal>
        </section>

        {/* ════════ MISSION STATEMENT ════════ */}
        <section className="border-b" style={{ borderColor: "var(--color-border)" }}>
          <Reveal className="ds-container py-14 md:py-18">
            <div className="mx-auto max-w-2xl text-center">
              <div className="ds-chip mx-auto mb-5">{t.mission.chip}</div>
              <p className="text-lg leading-relaxed md:text-xl" style={{ color: "var(--color-text-secondary)" }}>
                {t.mission.m1}
                <strong style={{ color: "var(--color-text-primary)" }}>{t.mission.m2}</strong>
                {t.mission.m3}
                <strong style={{ color: "var(--color-text-primary)" }}>{t.mission.m4}</strong>
              </p>
            </div>
          </Reveal>
        </section>

        {/* ════════ WHAT'S HAPPENING (Bento intro) ════════ */}
        <section className="ds-section border-b" style={{ borderColor: "var(--color-border)" }}>
          <div className="ds-container">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="text-balance text-3xl font-bold tracking-tight md:text-5xl" style={{ color: "var(--color-heading)", letterSpacing: "-0.03em" }}>
                {t.feed.title1}<span style={{ color: "var(--color-brand-600)" }}>{t.feed.title2}</span>
              </h2>
              <p className="mt-4 text-lg" style={{ color: "var(--color-text-secondary)" }}>
                {t.feed.sub}
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {FEED_TYPES.map(({ Icon, label, color, bg }, i) => (
                <Reveal key={label} delay={(((i % 4) + 1) as 1 | 2 | 3 | 4)}>
                  <article
                    className="lift group relative h-full overflow-hidden rounded-2xl border bg-white p-6"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: bg }} />
                    <span className="relative mb-5 flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" style={{ background: bg }}>
                      <Icon size={22} style={{ color }} />
                    </span>
                    <div className="relative">
                      <p className="text-xs font-bold uppercase tracking-widest" style={{ color }}>{t.feed.items[i]?.count}</p>
                      <h3 className="mt-1.5 text-lg font-bold" style={{ color: "var(--color-heading)" }}>{t.feed.items[i]?.label ?? label}</h3>
                      <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>{t.feed.items[i]?.desc}</p>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ════════ THE PROBLEM ════════ */}
        <section className="ds-section border-b" style={{ borderColor: "var(--color-border)" }}>
          <div className="ds-container grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <div className="ds-chip mb-4" style={{ borderColor: "var(--color-danger-bg)", background: "var(--color-danger-bg)", color: "var(--color-danger)" }}>
                {t.problem.chip}
              </div>
              <h2 className="text-balance text-3xl font-bold tracking-tight md:text-5xl" style={{ color: "var(--color-heading)", letterSpacing: "-0.03em" }}>
                {t.problem.title}
              </h2>
              <p className="mt-5 text-lg leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                {t.problem.para}
              </p>
              <ul className="mt-7 space-y-3">
                {t.problem.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-3 text-base" style={{ color: "var(--color-foreground)" }}>
                    <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full" style={{ background: "var(--color-danger-bg)" }}>
                      <AlertTriangle size={11} className="text-rose-700" />
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>

            {/* Animated Lokul feed conveyor */}
            <ScreensConveyor />
          </div>
        </section>

        {/* ════════ BENTO FEATURES ════════ */}
        <section id="features" className="ds-section border-b" style={{ borderColor: "var(--color-border)", background: "var(--color-surface-muted)" }}>
          <div className="ds-container">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <div className="ds-chip mx-auto mb-4">{t.bento.chip}</div>
              <h2 className="text-balance text-3xl font-bold tracking-tight md:text-5xl" style={{ color: "var(--color-heading)", letterSpacing: "-0.03em" }}>
                {t.bento.title1}<br />
                <span style={{ color: "var(--color-brand-600)" }}>{t.bento.title2}</span>
              </h2>
              <p className="mt-4 text-lg" style={{ color: "var(--color-text-secondary)" }}>
                {t.bento.sub}
              </p>
            </div>

            <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {BENTO_FEATURES.map(({ Icon, title, tone }, i) => {
                const accent   = tone === "danger" ? "#DC2626" : tone === "accent" ? "var(--color-accent-600)" : "var(--color-brand-600)";
                const accentBg = tone === "danger" ? "#FEE2E2" : tone === "accent" ? "var(--color-accent-50)"  : "var(--color-brand-50)";
                const delay    = ((i % 6) + 1) as 1 | 2 | 3 | 4 | 5 | 6;
                return (
                  <Reveal key={title} delay={delay}>
                    <article
                      className="lift group relative h-full overflow-hidden rounded-2xl border bg-white p-7"
                      style={{ borderColor: "var(--color-border)" }}
                    >
                      <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" style={{ background: accentBg, color: accent }}>
                        <Icon size={20} />
                      </span>
                      <h3 className="text-lg font-bold leading-tight" style={{ color: "var(--color-heading)" }}>{t.bento.items[i]?.title ?? title}</h3>
                      <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>{t.bento.items[i]?.desc}</p>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ════════ HOW IT WORKS ════════ */}
        <section id="how" className="ds-section border-b" style={{ borderColor: "var(--color-border)" }}>
          <div className="ds-container">
            <div className="mx-auto mb-14 max-w-2xl text-center">
              <div className="ds-chip mx-auto mb-4">{t.how.chip}</div>
              <h2 className="text-balance text-3xl font-bold tracking-tight md:text-5xl" style={{ color: "var(--color-heading)", letterSpacing: "-0.03em" }}>
                {t.how.title}
              </h2>
            </div>

            <div className="relative grid gap-6 md:grid-cols-3 md:gap-4">
              <div className="absolute left-[10%] right-[10%] top-12 hidden h-px md:block" style={{ background: "linear-gradient(90deg, transparent, var(--color-border) 20%, var(--color-border) 80%, transparent)" }} />
              {STEPS.map(({ num, Icon }, i) => (
                <Reveal key={num} delay={((i + 1) as 1 | 2 | 3)}>
                  <article className="lift group relative h-full rounded-2xl border bg-white p-6 text-center" style={{ borderColor: "var(--color-border)" }}>
                    <div
                      className="relative z-10 mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
                      style={{ background: "linear-gradient(135deg, var(--color-brand-500), var(--color-brand-700))", boxShadow: "0 12px 32px -8px rgba(79, 70, 229, 0.5)" }}
                    >
                      <Icon size={22} />
                    </div>
                    <p className="mb-1 text-xs font-bold uppercase tracking-widest" style={{ color: "var(--color-brand-600)" }}>{t.how.stepWord} {num}</p>
                    <h3 className="text-lg font-bold" style={{ color: "var(--color-heading)" }}>{t.how.items[i]?.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>{t.how.items[i]?.desc}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ════════ PERSONAS TABS ════════ */}
        <section id="personas" className="ds-section border-b" style={{ borderColor: "var(--color-border)", background: "var(--color-surface-muted)" }}>
          <div className="ds-container">
            <div className="mx-auto mb-10 max-w-2xl text-center">
              <div className="ds-chip mx-auto mb-4">{t.personas.chip}</div>
              <h2 className="text-balance text-3xl font-bold tracking-tight md:text-5xl" style={{ color: "var(--color-heading)", letterSpacing: "-0.03em" }}>
                {t.personas.title1}<br />
                <span style={{ color: "var(--color-brand-600)" }}>{t.personas.title2}</span>
              </h2>
            </div>

            <div className="mx-auto mb-8 flex max-w-xs sm:max-w-md gap-1 rounded-full border bg-white p-1 sm:p-1.5 shadow-sm" style={{ borderColor: "var(--color-border)" }}>
              {(Object.keys(PERSONAS) as Array<keyof typeof PERSONAS>).map((k) => {
                const isActive = persona === k;
                return (
                  <button
                    key={k}
                    onClick={() => setPersona(k)}
                    className="press flex-1 rounded-full px-2 py-2 sm:px-4 text-xs sm:text-sm font-semibold transition-all duration-300 whitespace-nowrap"
                    style={{
                      background: isActive ? "var(--color-brand-600)" : "transparent",
                      color:      isActive ? "white"                  : "var(--color-text-secondary)",
                      boxShadow:  isActive ? "0 4px 12px -2px rgba(79,70,229,0.4)" : "none",
                    }}
                  >
                    {t.personas.short[k]}
                  </button>
                );
              })}
            </div>

            <div key={persona} className="tab-fade mx-auto max-w-4xl rounded-3xl border bg-white p-8 shadow-lg md:p-12" style={{ borderColor: "var(--color-border)" }}>
              <div className="grid items-center gap-10 md:grid-cols-[auto_1fr]">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl text-white shadow-lg transition-transform duration-300 hover:scale-105 hover:rotate-3" style={{ background: "linear-gradient(135deg, var(--color-brand-500), var(--color-brand-700))" }}>
                  <active.Icon size={36} />
                </div>
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-widest" style={{ color: "var(--color-brand-600)" }}>{t.personas.items[persona].title}</p>
                  <h3 className="text-2xl font-bold leading-tight md:text-3xl" style={{ color: "var(--color-heading)", letterSpacing: "-0.02em" }}>
                    {t.personas.items[persona].headline}
                  </h3>
                </div>
              </div>
              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {t.personas.items[persona].bullets.map((b) => (
                  <li key={b} className="lift flex items-start gap-3 rounded-xl border p-4" style={{ borderColor: "var(--color-border)", background: "var(--color-surface-muted)" }}>
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full" style={{ background: "var(--color-brand-600)" }}>
                      <Check size={12} className="text-white" />
                    </span>
                    <span className="text-sm" style={{ color: "var(--color-foreground)" }}>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ════════ MERCHANT BAND ════════ */}
        <section id="business" className="relative overflow-hidden border-b" style={{ borderColor: "var(--color-border)" }}>
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, var(--color-brand-50) 0%, #fff 55%), radial-gradient(at 85% 20%, rgba(99,102,241,0.10) 0px, transparent 50%)",
            }}
          />
          <Reveal className="ds-container relative py-16 md:py-20">
            <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
              {/* Copy */}
              <div>
                <div className="ds-chip mb-4">
                  <Store size={12} /> {t.band.chip}
                </div>
                <h2 className="text-balance text-3xl font-bold tracking-tight md:text-5xl" style={{ color: "var(--color-heading)", letterSpacing: "-0.03em" }}>
                  {t.band.title1}<br />
                  <span style={{ color: "var(--color-brand-600)" }}>{t.band.title2}</span>
                </h2>
                <p className="mt-5 max-w-lg text-lg leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                  {t.band.para}
                </p>
                <ul className="mt-7 grid gap-3 sm:grid-cols-3">
                  {[IndianRupee, BadgeCheck, Radar].map((Icon, i) => (
                    <li key={t.band.perks[i]} className="flex items-center gap-2.5 rounded-xl border bg-white px-4 py-3 text-sm font-bold" style={{ borderColor: "var(--color-border)", color: "var(--color-heading)" }}>
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: "var(--color-brand-50)", color: "var(--color-brand-600)" }}>
                        <Icon size={16} />
                      </span>
                      {t.band.perks[i]}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Lead teaser card */}
              <div className="lift rounded-3xl border bg-white p-7 shadow-xl md:p-9" style={{ borderColor: "var(--color-border)" }}>
                <p className="text-xl font-bold" style={{ color: "var(--color-heading)", letterSpacing: "-0.02em" }}>
                  {t.band.cardTitle}
                </p>
                <p className="mt-1.5 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                  {t.band.cardSub}
                </p>
                <form
                  className="mt-5 space-y-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    posthog?.capture("merchant_lead", { location: "landing_band" });
                    const q = new URLSearchParams();
                    if (bizName.trim()) q.set("name", bizName.trim());
                    if (bizPhone.trim()) q.set("phone", bizPhone.trim());
                    router.push(`/business?${q.toString()}#register`);
                  }}
                >
                  <input
                    className="ds-input h-12"
                    type="text"
                    placeholder={t.band.phBizName}
                    value={bizName}
                    onChange={(e) => setBizName(e.target.value)}
                    maxLength={120}
                  />
                  <input
                    className="ds-input h-12"
                    type="tel"
                    inputMode="numeric"
                    placeholder={t.band.phPhone}
                    value={bizPhone}
                    onChange={(e) => setBizPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    maxLength={10}
                  />
                  <button
                    type="submit"
                    className="ds-button press group/biz w-full justify-center px-6 py-3.5 text-base"
                  >
                    {t.band.cta}
                    <ArrowRight size={16} className="transition-transform duration-300 group-hover/biz:translate-x-1" />
                  </button>
                </form>
                <p className="mt-3 text-center text-xs" style={{ color: "var(--color-text-disabled)" }}>
                  {t.band.note}
                </p>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ════════ CITIES MARQUEE ════════ */}
        <section className="overflow-hidden border-b py-10" style={{ borderColor: "var(--color-border)" }}>
          <div className="ds-container mb-5 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "var(--color-text-disabled)" }}>
              {t.cities.label}
            </p>
          </div>
          <div className="flex animate-marquee gap-12 whitespace-nowrap will-change-transform">
            {[...CITIES, ...CITIES].map((city, i) => (
              <span key={i} className="flex items-center gap-12">
                <span className="text-2xl font-bold tracking-tight md:text-3xl" style={{ color: "var(--color-gray-300)" }}>
                  {city}
                </span>
                <span className="text-lg" style={{ color: "var(--color-brand-200)" }}>✦</span>
              </span>
            ))}
          </div>
        </section>

        {/* ════════ TESTIMONIALS ════════ */}
        <section className="ds-section border-b" style={{ borderColor: "var(--color-border)" }}>
          <div className="ds-container">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <div className="ds-chip mx-auto mb-4">{t.testimonials.chip}</div>
              <h2 className="text-balance text-3xl font-bold tracking-tight md:text-5xl" style={{ color: "var(--color-heading)", letterSpacing: "-0.03em" }}>
                {t.testimonials.title1}<br />
                {t.testimonials.title2}
              </h2>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {TESTIMONIALS.map((tm, i) => (
                <Reveal key={tm.name} delay={((i + 1) as 1 | 2 | 3)}>
                  <blockquote
                    className="lift relative flex h-full flex-col gap-5 rounded-2xl border bg-white p-7"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    <div className="flex gap-0.5" style={{ color: "var(--color-accent-500)" }}>
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star key={`star-${tm.name}-${idx}`} size={14} fill="currentColor" />
                      ))}
                    </div>
                    <p className="text-base leading-relaxed" style={{ color: "var(--color-foreground)" }}>
                      &ldquo;{t.testimonials.quotes[i] ?? tm.quote}&rdquo;
                    </p>
                    <footer className="mt-auto flex items-center gap-3 border-t pt-5" style={{ borderColor: "var(--color-border)" }}>
                      <p className="text-xs font-semibold" style={{ color: "var(--color-text-secondary)" }}>{tm.loc} · {tm.role}</p>
                    </footer>
                  </blockquote>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ════════ WAITLIST CTA ════════ */}
        <section id="waitlist" className="ds-section relative overflow-hidden" style={{ background: "#0a0e27" }}>
          <div
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              backgroundImage:
                "radial-gradient(at 30% 20%, rgba(99,102,241,0.35) 0px, transparent 50%), radial-gradient(at 70% 80%, rgba(245,158,11,0.18) 0px, transparent 50%)",
            }}
          />
          <div className="ds-container relative">
            <div className="mx-auto max-w-2xl">
              {submitted ? (
                <SuccessCard posthog={posthog} />
              ) : (
                <>
                  <div className="mb-8 text-center">
                    <div
                      className="ds-chip mx-auto mb-5 inline-flex"
                      style={{ borderColor: "rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)", color: "white" }}
                    >
                      <Zap size={11} fill="currentColor" /> {t.waitlist.chip}
                    </div>
                    <h2 className="text-balance text-3xl font-bold tracking-tight text-white md:text-5xl" style={{ letterSpacing: "-0.03em" }}>
                      {t.waitlist.title1}<br />
                      {t.waitlist.title2}
                    </h2>
                    <p className="mx-auto mt-4 max-w-md text-base" style={{ color: "rgba(255,255,255,0.7)" }}>
                      {t.waitlist.sub}
                    </p>
                  </div>

                  <div className="rounded-3xl border bg-white p-6 shadow-2xl md:p-8" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
                    <form action={action} className="space-y-5">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label={t.waitlist.fullName}>
                          <input className="ds-input" type="text"  name="name"  placeholder={t.hero.phName} required />
                        </Field>
                        <Field label={t.waitlist.email}>
                          <input className="ds-input" type="email" name="email" placeholder={t.hero.phEmail} required />
                        </Field>
                        <PincodeField label={t.waitlist.pin} name="pincode" required />
                        <Field label={t.waitlist.joiningAs}>
                          <select className="ds-input" name="role" defaultValue="" required>
                            <option value="" disabled>{t.waitlist.selectOne}</option>
                            <option value="resident">{t.waitlist.optResident}</option>
                            <option value="merchant">{t.waitlist.optMerchant}</option>
                            <option value="rwa">{t.waitlist.optRwa}</option>
                          </select>
                        </Field>
                      </div>

                      <label className="flex items-start gap-2.5">
                        <input type="checkbox" name="notify" defaultChecked className="mt-0.5 h-4 w-4 rounded border-gray-300" style={{ accentColor: "var(--color-brand-600)" }} />
                        <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                          {t.waitlist.notify}
                        </span>
                      </label>

                      {state && !state.success && (
                        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
                          {state.error}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={pending}
                        className="ds-button press group/cta w-full px-6 py-4 text-base transition-transform hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
                        onClick={() => posthog?.capture("waitlist_submit_click")}
                      >
                        {pending ? t.waitlist.saving : t.waitlist.reserve}
                        {!pending && <ArrowRight size={16} className="transition-transform duration-300 group-hover/cta:translate-x-1" />}
                      </button>

                      <p className="text-center text-xs" style={{ color: "var(--color-text-disabled)" }}>
                        {t.waitlist.noSpam}
                      </p>
                    </form>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* ════════ FAQ ════════ */}
        <section id="faq" className="ds-section border-b" style={{ borderColor: "var(--color-border)" }}>
          <div className="ds-container">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <div className="ds-chip mx-auto mb-4">{t.faq.chip}</div>
              <h2 className="text-balance text-3xl font-bold tracking-tight md:text-5xl" style={{ color: "var(--color-heading)", letterSpacing: "-0.03em" }}>
                {t.faq.title}
              </h2>
            </div>
            <div className="mx-auto max-w-3xl divide-y rounded-2xl border bg-white" style={{ borderColor: "var(--color-border)", ["--tw-divide-opacity" as string]: 1 }}>
              {t.faq.items.map((f, i) => {
                const open = openFaq === i;
                return (
                  <div key={f.q} className="px-6 transition-colors hover:bg-[color:var(--color-surface-muted)]/40">
                    <button
                      onClick={() => setOpenFaq(open ? null : i)}
                      className="flex w-full items-center justify-between gap-4 py-5 text-left"
                      aria-expanded={open}
                    >
                      <span className="text-base font-semibold transition-colors md:text-lg" style={{ color: open ? "var(--color-brand-700)" : "var(--color-heading)" }}>{f.q}</span>
                      <span
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all duration-300"
                        style={{ background: open ? "var(--color-brand-600)" : "var(--color-surface-muted)", color: open ? "white" : "var(--color-text-secondary)", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
                      >
                        <ChevronDown size={15} />
                      </span>
                    </button>
                    <div className={`acc-content ${open ? "is-open" : ""}`}>
                      <div>
                        <p className="pb-5 pr-12 text-sm leading-relaxed md:text-base" style={{ color: "var(--color-text-secondary)" }}>
                          {f.a}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   FIELD WRAPPER
   ═══════════════════════════════════════════════════════════════════════ */
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="space-y-1.5 block">
      <span className="text-sm font-semibold" style={{ color: "var(--color-foreground)" }}>{label}</span>
      {children}
    </label>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   HERO PHONE — clean phone mockup with an auto-advancing neighborhood feed
   ═══════════════════════════════════════════════════════════════════════ */

function FeedRow({ item }: { readonly item: (typeof LOKUL_SCREENS)[number] }) {
  return (
    <div
      className="flex h-[66px] items-center gap-3 rounded-xl border bg-white px-3 shadow-sm"
      style={{
        borderColor: "var(--color-border)",
        borderLeftWidth: "3px",
        borderLeftColor: item.urgent ? "#DC2626" : "transparent",
      }}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: item.catBg }}>
        <item.Icon size={16} style={{ color: item.catColor }} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span
            className="rounded-full px-1.5 py-px text-[8px] font-bold uppercase tracking-wide"
            style={{ background: item.catBg, color: item.catColor }}
          >
            {item.category}
          </span>
          {item.urgent && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />}
        </div>
        <p className="mt-0.5 truncate text-[11px] font-semibold" style={{ color: "var(--color-heading)" }}>{item.title}</p>
        <p className="truncate text-[9px]" style={{ color: "var(--color-text-disabled)" }}>{item.meta}</p>
      </div>
    </div>
  );
}

function HeroPhone() {
  const [idx, setIdx] = useState(0);
  const [count, setCount] = useState(47);

  useEffect(() => {
    const a = globalThis.setInterval(() => setIdx((i) => (i + 1) % LOKUL_SCREENS.length), 3_200);
    const b = globalThis.setInterval(() => setCount((n) => (n >= 63 ? 46 : n + 1)), 4_800);
    return () => { globalThis.clearInterval(a); globalThis.clearInterval(b); };
  }, []);

  const visible = Array.from({ length: 6 }, (_, o) => LOKUL_SCREENS[(idx + o) % LOKUL_SCREENS.length]);

  return (
    <div className="relative mx-auto mt-2 hidden self-start lg:block">
      {/* Soft ambient glows */}
      <div
        className="pointer-events-none absolute -left-16 top-12 h-56 w-56 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.30), transparent 70%)" }}
      />
      <div
        className="pointer-events-none absolute -right-12 bottom-8 h-48 w-48 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(245,158,11,0.25), transparent 70%)" }}
      />

      {/* Phone frame */}
      <div
        className="relative mx-auto w-[310px] overflow-hidden rounded-[2.75rem] bg-white"
        style={{
          border: "8px solid #111827",
          boxShadow: "0 30px 80px -20px rgba(15,23,42,0.35), 0 8px 24px -8px rgba(15,23,42,0.18)",
        }}
      >
        {/* Notch */}
        <div className="absolute left-1/2 top-2.5 z-30 h-5 w-24 -translate-x-1/2 rounded-full" style={{ background: "#111827" }} />

        {/* App header */}
        <div className="flex items-center gap-2.5 border-b px-4 pb-3 pt-10" style={{ borderColor: "var(--color-border)" }}>
          <div
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-black text-white"
            style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)" }}
          >
            L
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-bold leading-tight" style={{ color: "var(--color-heading)" }}>Andheri West</p>
            <p className="flex items-center gap-1 text-[9px]" style={{ color: "var(--color-text-disabled)" }}>
              <MapPin size={8} /> 2 km radius · 400053
            </p>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            <span key={count} className="anim-count-pop tabular-nums text-[10px] font-bold text-emerald-700">{count}</span>
            <span className="text-[10px] text-emerald-600/70">live</span>
          </div>
        </div>

        {/* Feed — newest card pushes the stack down */}
        <div
          className="relative h-[400px] overflow-hidden px-3 pt-3"
          style={{
            background: "var(--color-surface-muted)",
            maskImage: "linear-gradient(to bottom, black 82%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 82%, transparent 100%)",
          }}
        >
          <div key={idx} className="anim-feed-push space-y-2">
            {visible.map((item, o) => (
              <div key={item.title} className={o === 0 ? "anim-feed-new" : undefined}>
                <FeedRow item={item} />
              </div>
            ))}
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex items-center justify-around border-t px-2 py-2.5" style={{ borderColor: "var(--color-border)" }}>
          <span className="flex flex-col items-center gap-0.5" style={{ color: "var(--color-brand-600)" }}>
            <HomeIcon size={16} strokeWidth={2.4} />
            <span className="text-[8px] font-bold">Feed</span>
          </span>
          <span className="flex flex-col items-center gap-0.5" style={{ color: "var(--color-text-disabled)" }}>
            <Search size={16} />
            <span className="text-[8px] font-medium">Explore</span>
          </span>
          <span className="flex flex-col items-center gap-0.5" style={{ color: "var(--color-text-disabled)" }}>
            <Bell size={16} />
            <span className="text-[8px] font-medium">Alerts</span>
          </span>
          <span className="flex flex-col items-center gap-0.5" style={{ color: "var(--color-text-disabled)" }}>
            <CircleUserRound size={16} />
            <span className="text-[8px] font-medium">Profile</span>
          </span>
        </div>
      </div>

      {/* Caption */}
      <p className="mt-4 text-center text-xs font-medium" style={{ color: "var(--color-text-disabled)" }}>
        A calm, verified feed — only your neighborhood.
      </p>
    </div>
  );
}





