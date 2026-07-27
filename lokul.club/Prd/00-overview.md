# 00 — Lokul Mobile App · Overview

> **The hyperlocal app for Indian neighborhoods.** Real residents, verified by PIN code and address, helping each other with safety, services, society life, and daily needs.

---

## 1. Vision & Mission

**Vision:** Every Indian neighborhood is connected, safe, and self-sufficient through Lokul.

**Mission for v1.0:** Ship a single mobile app that becomes the **daily-use** hub for residents of a society — for safety, chat, services, and society life — replacing a fragmented mix of WhatsApp groups, MyGate-style apps, and classifieds.

---

## 2. Why now

- 🇮🇳 Smartphone + UPI penetration in urban India is at saturation.
- WhatsApp society groups are noisy, unmoderated, and not searchable.
- MyGate-class apps own the gate but not the community.
- Nextdoor/Neighbourly tried and failed because they were generic; Lokul is **India-first** (PIN codes, RWA structure, Indian languages, UPI, tiffin culture, BMC alerts, etc.).

---

## 3. Target users (Personas)

### P1 — **Priya the Resident** (Primary, 70% of DAU)
- 28–45, urban India, 2-tier or metro city, lives in a gated society.
- Uses WhatsApp society group reluctantly; misses important info.
- Needs: safety alerts, find a maid/tiffin/electrician, RWA notices, neighbor help.

### P2 — **Mr. Shah the RWA Admin** (Power user, 5% of DAU)
- 45–65, society committee member or president.
- Posts notices, runs polls, manages members, approves merchants.
- Needs: a place to make official communications discoverable and accountable.

### P3 — **Rajan the Verified Merchant** (Supply side)
- Local electrician / tiffin vendor / plumber / maid agency.
- Wants more orders from nearby residents without paying ads.
- Needs: verified profile, ratings, easy "Order via WhatsApp/UPI" flow.

### P4 — **Ananya the New Tenant** (Activation funnel)
- 22–32, just moved into a society.
- Doesn't know neighbors, doesn't know which maid/tiffin is good.
- Needs: introductions, recommendations, a starter directory.

### P5 — **Kumar the Senior Citizen** (Vulnerable but valuable)
- 60+, lives alone or with spouse.
- Trusts the society more than strangers; needs help with services.
- Needs: SOS, simple UI in regional language, large fonts, voice messaging.

---

## 4. Jobs-to-be-Done (JTBD)

1. *"When something happens near me, help me know fast — and let me check if my family is safe."*
2. *"When I need a plumber/maid/tiffin, help me pick one my neighbors trust."*
3. *"When my society makes a decision, let me see it and vote on it."*
4. *"When I need help right now, get me a neighbor in 60 seconds."*
5. *"When I lose something or find someone's pet, help me reach the right neighbor."*
6. *"When I move into a new society, help me feel at home in 7 days."*

---

## 5. Goals & success metrics (v1.0)

### North star metric
**WAU per active society** — average **Weekly Active Users per onboarded society**.
- **Target at GA:** ≥ 35% of verified residents weekly active.

### Top-level KPIs (12 months post-launch)

| Pillar | KPI | Target |
|---|---|---|
| Reach | Onboarded societies | 1,000 |
| Reach | Verified residents | 500,000 |
| Engagement | D30 retention | 40% |
| Engagement | Posts/day per active society | 8+ |
| Trust | KYC-completed users | 70% of verified residents |
| Monetization | Verified merchants live | 5,000 |
| Monetization | GMV (services + classifieds) | ₹50 Cr/year run-rate |
| Safety | Avg SOS response time | < 90 sec |
| NPS | App NPS | 40+ |

---

## 6. v1.0 Scope (locked)

### In scope
- All modules listed in [README.md](./README.md) (01–15).
- iOS + Android native apps (built with React Native).
- Web companion (read-only feed + basic auth, see [15-web-companion.md](./15-web-companion.md)).
- Languages at launch: **English, Hindi, Marathi**. Tamil, Telugu, Kannada, Bengali, Gujarati post-launch.
- Geography: Pan-India PIN codes; **focus rollout in Mumbai MMR + Pune** for first 3 months.

### Out of scope for v1.0 (deferred to v1.1+)
- Dark mode
- Wear OS / Apple Watch
- Multi-society household membership (linking two flats)
- Vernacular voice input
- Society-only private posts vs neighborhood-wide (single feed only in v1; per-society private spaces in v1.1)
- AI chatbot "Ask Lokul"
- Service provider mobile-app (merchants use the same app + a "Merchant Mode" toggle in v1)

---

## 7. Tech stack & platform decisions

| Layer | Choice | Rationale |
|---|---|---|
| Mobile app | **React Native 0.76 + Expo Router** | Shared codebase, hot reload, OTA via EAS |
| State | Zustand + React Query | Same as web stack (already in `mw-influence` pattern) |
| Auth | Phone OTP via **MSG91**; backup **Firebase Phone Auth** | Indian phone delivery > global SMS providers |
| Backend | **Node.js 22 + Fastify** + Postgres 16 + Redis 7 + Cloudflare R2 (media) | Already used in lokul.club server actions |
| Realtime | **Ably** (chat, live updates, SOS) | India-edge points-of-presence; simpler than self-hosting socket.io |
| Push notifs | **FCM** (Android) + **APNs via OneSignal** (iOS) | OneSignal handles segments + scheduling |
| Maps | **Google Maps SDK** (display) + **Ola Maps API** (geocoding, ETA — cheaper in INR) | Cost optimization |
| Payments | **Razorpay** primary, **PhonePe** secondary | UPI-first, widest coverage |
| Storage | Cloudflare R2 + Cloudflare Stream (videos) | Egress-free vs AWS S3 |
| Analytics | **PostHog** (events + funnels) + **Sentry** (crashes) | Self-hostable; matches web |
| Search | **Meili​search** (posts, merchants, classifieds) | Cheaper than ElasticSearch, Indian-language tokenization OK |
| AI | **OpenAI GPT-4o-mini** for digest summarization; **Llama-3.1 self-hosted** for moderation | Cost + privacy mix |
| Maps geofence | PostGIS extension on Postgres | PIN-code polygons, radius queries |
| Geo headers | Cloudflare Worker (already deployed for web) | Same infra |
| CI/CD | **EAS Build + EAS Submit**, GitHub Actions | Standard RN setup |

---

## 8. Architectural principles

1. **PIN-code is the unit of community.** Every entity (post, alert, merchant) has a PIN code + geocode.
2. **Trust is tiered.** Bronze (phone) → Silver (address) → Gold (ID + selfie). Features are gated by tier.
3. **Realtime is the default.** Feed, chat, SOS, polls — all push-updated, never poll-based.
4. **Offline-first reads.** Last 200 feed items, chat, profile cached locally. Writes queue.
5. **Indian-language first.** All strings i18n-keyed. RTL not needed.
6. **One feed, many surfaces.** Posts of different types render in one chronological feed; modules are *views* over the same posts table.
7. **Compliance by design.** DPDPA-2023, RBI (for wallet), IT Rules 2021.

---

## 9. Information architecture

```
Lokul App
├── Tab 1: Feed              → modules 02, 08 (events/stories), 09 (RWA/polls), 12 (digest)
├── Tab 2: Marketplace       → modules 05, 06, 07, 11 (booking/visitor)
├── Tab 3: + (Post / SOS)    → modules 02, 03, 04 (calls), 07 (sell)
├── Tab 4: Map               → modules 10 (map + carpool)
├── Tab 5: You               → modules 13, 14 (settings), 12 (inbox)
└── Modal: SOS               → module 03
```

---

## 10. Release plan (high-level)

See [16-launch-plan-kpis-risks.md](./16-launch-plan-kpis-risks.md) for detail.

| Milestone | When | Scope |
|---|---|---|
| α — Closed alpha | T+3 mo | 1 society, 50 users · modules 01, 02, 12, 13, 14 |
| β — Open beta | T+5 mo | 5 societies, 1000 users · + 03, 04, 09, 11 (visitor only) |
| GA 1.0 | T+8 mo | Mumbai MMR · all 15 modules |
| GA 1.1 | T+11 mo | Pune + Bangalore · + Tamil/Kannada |

---

## 11. Cross-cutting non-functional requirements

| Area | Requirement |
|---|---|
| Performance | Cold start ≤ 2.5s on mid-range Android; feed scroll 60fps |
| Crash-free sessions | ≥ 99.5% |
| API p99 latency | < 300ms intra-IN |
| Push delivery success | ≥ 95% within 15s |
| Accessibility | WCAG 2.1 AA equivalent, font scale to 200%, screen-reader labels |
| Localization | All user-facing strings via i18n; date/number locale-aware |
| Privacy | DPDPA-2023 compliant; data retention per category (see module 13) |
| Security | TLS 1.3, certificate pinning, jailbreak/root detection (warn-only) |
| Observability | Every API call traced; PII redacted in logs |

---

## 12. Dependencies & external integrations

- **DigiLocker / Aadhaar e-KYC** (for Gold tier) — via SETU/Karza
- **MSG91 SMS** — OTP delivery
- **Razorpay** — payments + wallet
- **Google Maps** — display + place search
- **Ola Maps API** — geocoding + routing
- **FCM + APNs** — push
- **Cloudflare** — DNS, CDN, R2 storage, Workers
- **Ably** — realtime messaging
- **Sentry** + **PostHog** — observability

---

## 13. Glossary

| Term | Meaning |
|---|---|
| Society | A gated residential complex (multiple towers) |
| Tower | One building within a society |
| RWA | Residents' Welfare Association |
| KYC tier | Bronze / Silver / Gold verification level |
| PIN | 6-digit Indian postal code |
| Feed | The chronological stream of posts visible to a user |
| Post | Any user-generated content; sub-typed (safety, event, lost, etc.) |
| Verified merchant | Lokul-approved local service/product provider |
| Trust score | 0–100 number derived from KYC + vouches + activity + reports |
| Vouching | Existing neighbor confirms a new user's identity |

---

## 14. Open questions (decisions pending)

| # | Question | Owner | Due |
|---|---|---|---|
| O-1 | Do we allow self-onboarding of societies, or invite-only? | Founders | T-1 week of α |
| O-2 | Wallet float held by us vs prepaid PPI partner? | Legal | Before module 06 build |
| O-3 | Voice notes in chat at v1 or v1.1? | PM | Before module 04 build |
| O-4 | "Anonymous post" allowed for safety alerts? | Trust & Safety | Before module 03 build |
| O-5 | E-pass QR validity duration default (4h vs 24h)? | Society Ops PM | Before module 11 build |
