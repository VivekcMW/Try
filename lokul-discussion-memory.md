# Lokul Discussion Memory

**Date:** 26 May 2026  
**Project:** `lokul.club` concept + landing + GTM/fundraising planning

---

## 1) Product Vision Discussed

Lokul is positioned as a **hyperlocal community platform** for APAC markets (starting from India), combining:
- neighborhood community feed
- local safety alerts
- hyperlocal bazaar/services
- multilingual content experience

Core narrative discussed: **"neighborhood graph" for APAC** (trust + local utility + commerce).

---

## 2) Landing Page Build Progress (Static HTML/CSS)

### Completed
- Full marketing landing page built (`landing.html`, `landing.css`, `tokens.css`)
- Major sections included:
  - nav + hero
  - stats
  - problem
  - how it works
  - features
  - testimonials
  - Indian cities marquee
  - share section
  - waitlist CTA + pincode widget
  - footer
- City counter section removed
- APAC city names replaced by Indian city set in marquee
- Mobile responsiveness implemented across 3 breakpoints
- Mobile navigation menu added and working
- Hero mockup upgraded to **iPhone-style animated frame** with 5 concept screens

### Hero mockup concept screens
1. Community Feed
2. Hyperlocal Bazaar
3. Safety & Alerts
4. Local Events
5. Multilingual (Hindi-focused) experience

---

## 3) Pitching Guidance Discussed

A VC-facing pitch for APAC was drafted with:
- problem framing (fragmented local communication + commerce)
- product solution (single trusted local platform)
- wedge (safety + immediacy)
- monetization strategy
- expansion thesis (city-by-city APAC rollout)

Also drafted:
- 1-line pitch statement
- 90-second pitch format
- 10-slide deck flow structure

---

## 4) Market Size Estimates Discussed (Illustrative)

Using TAM/SAM/SOM framing:
- **TAM (APAC long-term):** ~$8B–$21B annual
- **SAM (India + initial SEA focus):** ~$1.4B–$3.9B annual
- **SOM (3-year practical capture):** ~$33M–$120M annual

Method: bottom-up assumptions on addressable merchants and blended annual monetization per merchant.

---

## 5) Monetization Strategy Discussed

Primary monetization streams:
1. Merchant subscriptions
2. Promoted listings/local ads
3. Service lead fees
4. Transaction/booking commissions
5. Verification/trust badges (premium)
6. Potential B2G/community infrastructure offerings later

Recommended early order:
- subscriptions + promoted visibility first
- lead fees next
- transaction take-rate later

---

## 6) Strategic Evaluation Discussed

### Pros
- strong daily-use pain point
- multi-use case stickiness
- clear local monetization path
- multilingual moat potential
- city-playbook scalability

### Risks/Cons
- cold-start local density challenge
- trust/moderation complexity
- two-sided marketplace execution load
- heavy ops requirement
- competitive substitutes (messaging groups/classified platforms)

Mitigation discussed:
- start with narrow wedge (safety + local updates)
- scale by micro-areas first
- strong moderation + verification system

---

## 7) Platform Decision Discussed

Recommended rollout:
- **Mobile-first (Android first)** for core user product
- Web initially for:
  - marketing site
  - merchant onboarding
  - admin/moderation dashboard
- iOS after core retention/ops model proves out

---

## 8) Phase 1 Web Plan Discussed

Requested Phase 1 includes:
- marketing site
- merchant onboarding
- basic admin/moderation dashboard

Suggested stack discussed:
- Next.js + TypeScript + Tailwind
- PostgreSQL + Prisma
- Redis + queue for moderation jobs
- Auth + RBAC + audit logs
- analytics + SEO + SEM foundation

Execution roadmap discussed: ~12-week implementation plan with milestones.

---

## 9) SEO/SEM Discussion Notes

Important clarification made:
- absolute “100% SEO/SEM forever” cannot be guaranteed due to changing algorithms/policies
- but production-grade compliance and monitoring can be built from day 1

Focus areas captured:
- technical SEO (metadata, sitemap, schema, CWV)
- content SEO (city/category pages, intent clusters)
- SEM policy-compliant landing pages, tracking governance, conversion setup

---

## 10) Environment Actions Performed

- Opened folder: `/Users/vivekanandchoudhari/try`
- Attempted `code` CLI (not installed)
- Opened same folder in VS Code via app launcher

---

## 11) Next Build Request Captured

User asked to **implement Phase 1 launch** in a new folder under `try` using app name **`lokul.club`**.

Pending execution (next implementation step):
- scaffold project in `/Users/vivekanandchoudhari/try/lokul.club`
- implement phase-1 modules and baseline architecture

---

## 12) Quick One-line Memory

Lokul is being developed as a mobile-first APAC hyperlocal platform; current work includes landing page readiness, investor narrative, and phase-1 web stack planning with a pending implementation request for `lokul.club`.
