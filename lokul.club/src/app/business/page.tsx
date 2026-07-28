"use client";

import { Suspense, useActionState, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { registerBusiness, type BusinessRegisterResult } from "@/app/actions/business";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Check,
  IndianRupee,
  MapPin,
  MessageCircle,
  PartyPopper,
  Radar,
  ShieldCheck,
  Smartphone,
  Star,
  Store,
  TrendingUp,
} from "lucide-react";

/* ════════════════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════════════ */

const CATEGORIES: { id: string; emoji: string; label: string }[] = [
  { id: "kirana",      emoji: "🛒", label: "Kirana / Grocery" },
  { id: "tiffin",      emoji: "🍱", label: "Tiffin / Home food" },
  { id: "restaurant",  emoji: "🍽️", label: "Restaurant / Café" },
  { id: "salon",       emoji: "💇", label: "Salon / Beauty" },
  { id: "pharmacy",    emoji: "💊", label: "Pharmacy" },
  { id: "tutor",       emoji: "📚", label: "Tuition / Classes" },
  { id: "tailor",      emoji: "🧵", label: "Tailor / Boutique" },
  { id: "electrician", emoji: "🔌", label: "Electrician" },
  { id: "plumber",     emoji: "🔧", label: "Plumber" },
  { id: "laundry",     emoji: "👕", label: "Laundry / Ironing" },
  { id: "fitness",     emoji: "🏋️", label: "Gym / Yoga" },
  { id: "petcare",     emoji: "🐾", label: "Pet care" },
  { id: "bakery",      emoji: "🎂", label: "Bakery / Sweets" },
  { id: "repair",      emoji: "🛠️", label: "Repairs / Services" },
  { id: "vegetables",  emoji: "🥬", label: "Fruits & Vegetables" },
  { id: "other",       emoji: "🏪", label: "Something else" },
];

const PERKS = [
  { Icon: IndianRupee,   title: "₹0 to list, forever",       desc: "No listing fee, no commission on walk-ins. Pay only for optional promotions." },
  { Icon: Radar,         title: "Reach 2 km that matters",   desc: "Show up in the feed of every verified resident living around your shop." },
  { Icon: BadgeCheck,    title: "Verified badge",            desc: "A 2-minute check earns the badge residents trust — no scammy listings around you." },
  { Icon: MessageCircle, title: "Direct chat with buyers",   desc: "Neighbors message you on the app. No middleman, no call-center." },
  { Icon: Star,          title: "Ratings from real buyers",  desc: "Only neighbors who actually bought from you can rate. No fake reviews." },
  { Icon: TrendingUp,    title: "Daily demand feed",         desc: "See what people nearby are asking for — tiffin, repairs, classes — and respond first." },
];

const STEPS_META = [
  { n: 1, label: "Category" },
  { n: 2, label: "Your shop" },
  { n: 3, label: "Location" },
];

/* ════════════════════════════════════════════════════════════════════════
   WIZARD
   ═══════════════════════════════════════════════════════════════════════ */

function RegisterWizard() {
  const posthog = usePostHog();
  const params = useSearchParams();
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState<string | null>(null);

  const [businessName, setBusinessName] = useState(params.get("name") ?? "");
  const [ownerName, setOwnerName]       = useState("");
  const [phone, setPhone]               = useState((params.get("phone") ?? "").replace(/\D/g, "").slice(-10));
  const [description, setDescription]   = useState("");
  const [pincode, setPincode]           = useState("");
  const [city, setCity]                 = useState("");
  const [address, setAddress]           = useState("");

  const [state, action, pending] = useActionState<BusinessRegisterResult | null, FormData>(
    registerBusiness,
    null
  );

  const topRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (state?.success) posthog?.capture("merchant_registered", { category });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.success]);

  function goto(n: number) {
    setStep(n);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const step1Valid = businessName.trim().length >= 2 && ownerName.trim().length >= 2 && /^[6-9]\d{9}$/.test(phone);
  const step2Valid = /^\d{6}$/.test(pincode) && city.trim().length >= 2;

  /* ── Success screen ── */
  if (state?.success) {
    return (
      <div className="wizard-pop rounded-3xl border bg-white p-10 text-center shadow-xl md:p-14" style={{ borderColor: "var(--color-border)" }}>
        <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full" style={{ background: "var(--color-brand-50)" }}>
          <PartyPopper size={38} style={{ color: "var(--color-brand-600)" }} />
        </span>
        <h2 className="mt-6 text-3xl font-bold" style={{ color: "var(--color-heading)", letterSpacing: "-0.02em" }}>
          {businessName} is registered! 🎉
        </h2>
        <p className="mx-auto mt-3 max-w-md text-base" style={{ color: "var(--color-text-secondary)" }}>
          Your listing is under review — most shops go live within 24 hours. We&apos;ll SMS you on <strong>+91 {phone}</strong> the moment it&apos;s approved.
        </p>
        <div className="mx-auto mt-8 max-w-sm rounded-2xl border p-5 text-left" style={{ borderColor: "var(--color-brand-200)", background: "var(--color-brand-50)" }}>
          <p className="flex items-center gap-2 text-sm font-bold" style={{ color: "var(--color-brand-700)" }}>
            <Smartphone size={16} /> Next: get the Lokul app
          </p>
          <p className="mt-1.5 text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Manage your listing, chat with customers, and track orders from your phone. We&apos;ll send you the download link by SMS.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={topRef} className="rounded-3xl border bg-white shadow-xl" style={{ borderColor: "var(--color-border)" }}>

      {/* ── Progress header ── */}
      <div className="border-b px-6 pb-5 pt-6 md:px-10" style={{ borderColor: "var(--color-border)" }}>
        <div className="flex items-center justify-between">
          {STEPS_META.map((s, i) => {
            const done = step > i;
            const active = step === i;
            let stepBg = "var(--color-surface-muted)";
            if (done) stepBg = "var(--color-brand-600)";
            else if (active) stepBg = "var(--color-brand-600)";
            return (
              <div key={s.n} className="flex flex-1 items-center">
                <div className="flex items-center gap-2.5">
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all duration-300"
                    style={{
                      background: stepBg,
                      color: done || active ? "white" : "var(--color-text-disabled)",
                      boxShadow: active ? "0 4px 14px -3px rgba(79,70,229,0.5)" : "none",
                      transform: active ? "scale(1.1)" : "scale(1)",
                    }}
                  >
                    {done ? <Check size={15} /> : s.n}
                  </span>
                  <span
                    className="hidden text-sm font-semibold sm:block"
                    style={{ color: active ? "var(--color-heading)" : "var(--color-text-disabled)" }}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS_META.length - 1 && (
                  <div className="mx-3 h-0.5 flex-1 overflow-hidden rounded-full" style={{ background: "var(--color-surface-muted)" }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: done ? "100%" : "0%", background: "var(--color-brand-600)" }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <form action={action} className="px-6 py-7 md:px-10 md:py-9">
        {/* Hidden fields carry all values regardless of visible step */}
        <input type="hidden" name="category"     value={category ?? ""} />
        <input type="hidden" name="businessName" value={businessName} />
        <input type="hidden" name="ownerName"    value={ownerName} />
        <input type="hidden" name="phone"        value={phone} />
        <input type="hidden" name="description"  value={description} />
        <input type="hidden" name="pincode"      value={pincode} />
        <input type="hidden" name="city"         value={city} />
        <input type="hidden" name="address"      value={address} />

        {/* ══ STEP 1 — Category ══ */}
        {step === 0 && (
          <div className="wizard-pop">
            <h2 className="text-2xl font-bold" style={{ color: "var(--color-heading)", letterSpacing: "-0.02em" }}>
              What kind of business do you run?
            </h2>
            <p className="mt-1.5 text-sm" style={{ color: "var(--color-text-secondary)" }}>
              Pick the closest one — you can refine it later.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {CATEGORIES.map((c) => {
                const active = category === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.id)}
                    className="press relative flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-all duration-200"
                    style={{
                      borderColor: active ? "var(--color-brand-500)" : "var(--color-border)",
                      background: active ? "var(--color-brand-50)" : "white",
                      borderWidth: active ? "2px" : "1px",
                      transform: active ? "translateY(-2px)" : "none",
                      boxShadow: active ? "0 8px 20px -6px rgba(245,158,11,0.35)" : "none",
                    }}
                  >
                    <span className="text-3xl">{c.emoji}</span>
                    <span className="text-xs font-semibold leading-tight" style={{ color: active ? "var(--color-brand-700)" : "var(--color-foreground)" }}>
                      {c.label}
                    </span>
                    {active && (
                      <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full text-white" style={{ background: "var(--color-brand-600)" }}>
                        <Check size={11} strokeWidth={3} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="mt-8 flex justify-end">
              <button
                type="button"
                disabled={!category}
                onClick={() => { goto(1); posthog?.capture("merchant_wizard_step", { step: 1, category }); }}
                className="ds-button press px-7 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                Continue <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* ══ STEP 2 — Details ══ */}
        {step === 1 && (
          <div className="wizard-pop">
            <h2 className="text-2xl font-bold" style={{ color: "var(--color-heading)", letterSpacing: "-0.02em" }}>
              Tell neighbors about your shop
            </h2>
            <p className="mt-1.5 text-sm" style={{ color: "var(--color-text-secondary)" }}>
              This is exactly what residents will see in their feed.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="block space-y-1.5 sm:col-span-2">
                <span className="text-sm font-semibold" style={{ color: "var(--color-foreground)" }}>Business name</span>
                <input className="ds-input" type="text" placeholder="Sharma Kirana Store" required maxLength={120}
                  value={businessName} onChange={(e) => setBusinessName(e.target.value)} autoFocus />
              </label>
              <label className="block space-y-1.5">
                <span className="text-sm font-semibold" style={{ color: "var(--color-foreground)" }}>Your name</span>
                <input className="ds-input" type="text" placeholder="Ramesh Sharma" required maxLength={100}
                  value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
              </label>
              <label className="block space-y-1.5">
                <span className="text-sm font-semibold" style={{ color: "var(--color-foreground)" }}>Mobile number</span>
                <div className="flex items-center gap-2">
                  <span className="flex h-11 items-center rounded-lg border px-3 text-sm font-semibold" style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}>
                    🇮🇳 +91
                  </span>
                  <input className="ds-input flex-1" type="tel" inputMode="numeric" placeholder="98765 43210" required
                    maxLength={10} pattern="[6-9]\d{9}"
                    value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} />
                </div>
              </label>
              <label className="block space-y-1.5 sm:col-span-2">
                <span className="text-sm font-semibold" style={{ color: "var(--color-foreground)" }}>
                  One line about your shop <span className="font-normal" style={{ color: "var(--color-text-disabled)" }}>(optional)</span>
                </span>
                <input className="ds-input" type="text" placeholder="3rd-generation kirana — free delivery within 1 km" maxLength={200}
                  value={description} onChange={(e) => setDescription(e.target.value)} />
              </label>
            </div>
            <div className="mt-8 flex items-center justify-between">
              <button type="button" onClick={() => goto(0)} className="press flex items-center gap-1.5 rounded-md px-4 py-3 text-sm font-semibold transition-colors hover:bg-gray-50" style={{ color: "var(--color-text-secondary)" }}>
                <ArrowLeft size={15} /> Back
              </button>
              <button
                type="button"
                disabled={!step1Valid}
                onClick={() => { goto(2); posthog?.capture("merchant_wizard_step", { step: 2 }); }}
                className="ds-button press px-7 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                Continue <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* ══ STEP 3 — Location ══ */}
        {step === 2 && (
          <div className="wizard-pop">
            <h2 className="text-2xl font-bold" style={{ color: "var(--color-heading)", letterSpacing: "-0.02em" }}>
              Where is your shop?
            </h2>
            <p className="mt-1.5 text-sm" style={{ color: "var(--color-text-secondary)" }}>
              Your PIN code decides which neighbors see you — that&apos;s the magic.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="block space-y-1.5">
                <span className="text-sm font-semibold" style={{ color: "var(--color-foreground)" }}>PIN code</span>
                <input className="ds-input tracking-widest" type="text" inputMode="numeric" placeholder="560038" required
                  maxLength={6} pattern="\d{6}"
                  value={pincode} onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))} autoFocus />
              </label>
              <label className="block space-y-1.5">
                <span className="text-sm font-semibold" style={{ color: "var(--color-foreground)" }}>City</span>
                <input className="ds-input" type="text" placeholder="Bengaluru" required maxLength={100}
                  value={city} onChange={(e) => setCity(e.target.value)} />
              </label>
              <label className="block space-y-1.5 sm:col-span-2">
                <span className="text-sm font-semibold" style={{ color: "var(--color-foreground)" }}>
                  Shop address <span className="font-normal" style={{ color: "var(--color-text-disabled)" }}>(optional)</span>
                </span>
                <input className="ds-input" type="text" placeholder="Shop 12, 5th Cross, near HDFC ATM" maxLength={300}
                  value={address} onChange={(e) => setAddress(e.target.value)} />
              </label>
            </div>

            {/* Live preview card */}
            {businessName && (
              <div className="mt-6 rounded-2xl border p-4" style={{ borderColor: "var(--color-brand-200)", background: "var(--color-brand-50)" }}>
                <p className="mb-2.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--color-brand-700)" }}>
                  Preview — how neighbors will see you
                </p>
                <div className="flex items-start gap-3 rounded-xl border bg-white p-3.5" style={{ borderColor: "var(--color-border)" }}>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-2xl" style={{ background: "var(--color-brand-50)" }}>
                    {CATEGORIES.find((c) => c.id === category)?.emoji ?? "🏪"}
                  </span>
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 text-sm font-bold" style={{ color: "var(--color-heading)" }}>
                      {businessName}
                      <BadgeCheck size={14} style={{ color: "var(--color-brand-600)" }} />
                    </p>
                    <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                      {description || CATEGORIES.find((c) => c.id === category)?.label}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-[11px]" style={{ color: "var(--color-text-disabled)" }}>
                      <MapPin size={10} /> {[address, city, pincode].filter(Boolean).join(" · ") || "Your locality"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {state && !state.success && (
              <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">{state.error}</p>
            )}

            <div className="mt-8 flex items-center justify-between">
              <button type="button" onClick={() => goto(1)} className="press flex items-center gap-1.5 rounded-md px-4 py-3 text-sm font-semibold transition-colors hover:bg-gray-50" style={{ color: "var(--color-text-secondary)" }}>
                <ArrowLeft size={15} /> Back
              </button>
              <button
                type="submit"
                disabled={!step2Valid || pending}
                className="press flex items-center gap-2 rounded-lg px-7 py-3 text-sm font-bold text-white shadow-lg transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                style={{ background: "linear-gradient(135deg, var(--color-brand-500), var(--color-brand-600))", boxShadow: "0 10px 28px -8px rgba(79,70,229,0.5)" }}
                onClick={() => posthog?.capture("merchant_register_submit", { category })}
              >
                {pending ? "Registering…" : <>Register my business — free <ArrowRight size={15} /></>}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════════════ */

export default function BusinessPage() {
  return (
    <div className="min-h-screen bg-white" style={{ color: "var(--color-foreground)" }}>
      <Navbar />

      <main id="top">
        {/* ══ HERO ══ */}
        <section className="relative overflow-hidden pb-14 pt-14 md:pb-20 md:pt-20">
          <div
            className="pointer-events-none absolute inset-0 opacity-70"
            style={{
              backgroundImage:
                "radial-gradient(at 15% 10%, rgba(245,158,11,0.14) 0px, transparent 45%), radial-gradient(at 85% 30%, rgba(99,102,241,0.12) 0px, transparent 45%)",
            }}
          />
          <div className="ds-container relative text-center">
            <div className="ds-chip mx-auto mb-5">
              <Store size={12} /> For local businesses
            </div>
            <h1
              className="mx-auto max-w-3xl text-balance text-[clamp(2.25rem,5vw,4rem)] font-bold leading-[1.05] tracking-tight"
              style={{ color: "var(--color-heading)", letterSpacing: "-0.04em" }}
            >
              Your shop, on the phone of{" "}
              <span style={{ color: "var(--color-brand-600)" }}>every neighbor.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-pretty text-lg leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
              Lokul puts your business in front of verified residents within 2 km of your door. Free to list. 3 minutes to register. No commission on walk-ins.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
              {[
                { Icon: IndianRupee, t: "₹0 listing fee" },
                { Icon: ShieldCheck, t: "Verified badge" },
                { Icon: Radar, t: "2 km hyperlocal reach" },
              ].map(({ Icon, t }) => (
                <span key={t} className="flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--color-text-secondary)" }}>
                  <Icon size={16} style={{ color: "var(--color-brand-600)" }} /> {t}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ══ WIZARD ══ */}
        <section id="register" className="pb-16 md:pb-24">
          <div className="ds-container max-w-3xl">
            <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl" style={{ background: "var(--color-surface-muted)" }} />}>
              <RegisterWizard />
            </Suspense>
          </div>
        </section>

        {/* ══ PERKS ══ */}
        <section className="ds-section border-t" style={{ borderColor: "var(--color-border)", background: "var(--color-surface-muted)" }}>
          <div className="ds-container">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl" style={{ color: "var(--color-heading)", letterSpacing: "-0.03em" }}>
                Built for the shop on the corner,<br />
                <span style={{ color: "var(--color-brand-600)" }}>not the brand on a billboard.</span>
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {PERKS.map(({ Icon, title, desc }) => (
                <article key={title} className="lift group h-full rounded-2xl border bg-white p-7" style={{ borderColor: "var(--color-border)" }}>
                  <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" style={{ background: "var(--color-brand-50)", color: "var(--color-brand-600)" }}>
                    <Icon size={20} />
                  </span>
                  <h3 className="text-lg font-bold leading-tight" style={{ color: "var(--color-heading)" }}>{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>{desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ══ BOTTOM CTA ══ */}
        <section className="ds-section">
          <div className="ds-container text-center">
            <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl" style={{ color: "var(--color-heading)", letterSpacing: "-0.03em" }}>
              320+ shops have already claimed their street.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-base" style={{ color: "var(--color-text-secondary)" }}>
              It takes 3 minutes. Your neighbors are already looking for you.
            </p>
            <a
              href="#register"
              className="press mt-7 inline-flex items-center gap-2 rounded-lg px-8 py-4 text-base font-bold text-white shadow-lg transition-all hover:scale-[1.02]"
              style={{ background: "linear-gradient(135deg, var(--color-brand-500), var(--color-brand-600))", boxShadow: "0 12px 32px -8px rgba(79,70,229,0.45)" }}
            >
              Register my business — free <ArrowRight size={16} />
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
