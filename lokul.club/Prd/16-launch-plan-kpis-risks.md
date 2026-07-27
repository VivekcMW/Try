# 16 — Launch Plan, KPIs & Risk Register

> Sequencing the v1.0 launch, the KPIs we hold ourselves to, and the risks we know about.

---

## 1. Launch phases

### α — Closed Alpha (T+0 → T+3 months)

- **Scope:** 1 society in Andheri West (Mumbai). 50 hand-picked residents (mix of founders' network + RWA-introduced).
- **Modules live:** 01 Onboarding, 02 Feed, 09 RWA Notices, 12 Notifications, 13 Profile, 14 basic moderation.
- **Goals:** Validate core engagement loop. Daily standup with users. Crash-free ≥ 98%.
- **Exit criteria:** D7 retention ≥ 60%, NPS ≥ 30, < 5 P1 bugs/week.

### β — Open Beta (T+3 → T+5 months)

- **Scope:** 5 societies in Mumbai MMR + Pune. 1,000 invited residents.
- **Modules added:** 03 Safety & SOS, 04 Chat (no calls yet), 05 Marketplace (browse only), 09 Polls, 11 Visitor management.
- **Goals:** Stress-test cross-society isolation, moderation pipeline, SOS p95 ≤ 90s.
- **Exit criteria:** D30 retention ≥ 35%, SOS responder rate ≥ 60%, no P1 security incidents.

### GA 1.0 — Public launch (T+5 → T+8 months)

- **Scope:** Mumbai MMR fully open; assisted onboarding of next 200 societies.
- **All 15 modules live**, all languages (en/hi/mr).
- **PR launch + RWA partnership push** + paid acquisition (₹50L budget for first 90 days).
- **Goals:** 50,000 verified residents, 5,000 verified merchants, 1L total downloads.

### v1.1 (T+8 → T+11 months)

- **Geo expansion:** Pune + Bangalore + Delhi NCR.
- **Languages added:** Tamil, Kannada.
- **Deferred features moved in:** Web voice/video calls, multi-society household, dark mode (per user feedback).
- **Goals:** 200,000 verified residents, ARR-positive unit economics.

### v1.2 (T+11 → T+14 months)

- **Geo expansion:** Top 10 metros.
- **Languages added:** Telugu, Bengali, Gujarati.
- **New surfaces:** AI assistant "Ask Lokul", subscription bookings, ride-pool school buses.

---

## 2. North star + KPI tree

```
North star: WAU per active society (target ≥ 35%)
├── Acquisition
│   ├── Installs / month
│   ├── Install → Bronze verified  (≥ 75%)
│   └── CAC                        (target ≤ ₹120 paid; ₹0 organic via RWA)
├── Activation
│   ├── Bronze → Silver / 7d        (≥ 55%)
│   ├── First post / first reaction (≥ 60% within D3)
│   └── Notification opt-in         (≥ 75%)
├── Engagement
│   ├── DAU/MAU (stickiness)        (≥ 0.40)
│   ├── Posts / society / day       (≥ 8)
│   ├── Messages / DAU              (≥ 12)
│   └── Feed sessions / DAU         (≥ 2)
├── Retention
│   ├── D1 / D7 / D30               (60 / 45 / 35 %)
│   ├── M3 cohort retention         (≥ 30%)
│   └── Churn 60d                   (≤ 12%)
├── Monetisation
│   ├── GMV (bookings + classifieds)
│   ├── Take-rate revenue           (~ 5% on bookings)
│   ├── Wallet float earnings       (treasury, RBI-permitted)
│   └── Merchant LTV
└── Trust & Safety
    ├── Reports resolved / SLA      (≥ 95%)
    ├── SOS responder rate          (≥ 80%)
    ├── False positive rate         (≤ 10%)
    └── Crash-free sessions         (≥ 99.5%)
```

---

## 3. Roll-out cadence (society onboarding)

1. RWA outreach (Lokul ops): pitch + demo.
2. RWA admin onboards on Lokul + grants admin role.
3. RWA sends invitation broadcast (email + WhatsApp templates by Lokul).
4. Lokul community manager handholds first 30 days.
5. Graduation criteria: ≥ 25% of registered residents WAU at D30 → society "active"; less → re-engagement playbook.

---

## 4. Compliance checklist (must-pass before GA)

### DPDPA-2023
- [ ] Privacy notice published (English, Hindi, Marathi).
- [ ] Consent UX for every data category at point of collection.
- [ ] Data export endpoint implemented + tested (module 13).
- [ ] Account deletion 30-day grace + hard purge automated.
- [ ] Consent log immutable.
- [ ] Children (< 18) flow: blocked from Gold KYC; parental consent for under-18 onboarding (deferred — kids can't sign up at v1).
- [ ] Data Protection Officer named + contact published.
- [ ] Breach notification process (≤ 72h) tested.

### RBI PPI (wallet)
- [ ] PPI partner contract signed (M2P or Razorpay X).
- [ ] Wallet limits enforced (₹10K / ₹2L per tier).
- [ ] KYC norms aligned (Silver = mid-KYC, Gold = full).
- [ ] AML monitoring in place.

### IT Rules 2021
- [ ] Grievance Officer named with India address.
- [ ] Complaint resolution SLA: 24h ack, 15 days resolution.
- [ ] Compliance Officer named.
- [ ] Monthly transparency report internal.

### Payment Aggregator
- [ ] Razorpay agreement.
- [ ] Reconciliation cron + alerts.

### Maps & location
- [ ] Survey of India compliance for any map vector overlays (Ola Maps is compliant by default).
- [ ] User consent for "always" location (only for Visitor module).

### Content takedown
- [ ] CSAM hash matching (PhotoDNA-equivalent).
- [ ] 24h takedown response for legal requests.

---

## 5. Risk register

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R-1 | RWA gatekeeping; admins block onboarding | Med | High | Pre-sales BD team; offer them analytics + billing automation as carrot |
| R-2 | Network effects don't trigger; ghost-town societies | Med | High | Onboarding playbook + community manager + seed posts |
| R-3 | Spam / fake users brigade reports | Med | Med | Strong KYC + auto-mod + brigading detection (module 14) |
| R-4 | SOS misuse / false alarms | Low-Med | High | Gold KYC + 3-strike downgrade + cooldown |
| R-5 | RBI PPI norm changes affect wallet | Low | High | Partner with regulated PPI; legal monitoring |
| R-6 | DPDPA Rule notification breaches user trust | Med | High | Privacy-by-design from day 1; named DPO |
| R-7 | LLM moderation hallucinations cause false bans | Med | Med | Schema-validated outputs + 24h appeal SLA |
| R-8 | WhatsApp groups remain stickier than Lokul chat | High | High | Differentiate via search + identity + structured threads; integrate (one-way share to WhatsApp) |
| R-9 | MyGate / NoBroker compete on visitor module | Med | High | Visitor module priced free for residents; bundled with the rest |
| R-10 | Server costs explode with realtime usage | Med | Med | Ably contract with usage caps; downgrade to polling on free tier |
| R-11 | Payment fraud / chargebacks | Low-Med | Med | Razorpay fraud rules + escrow + manual review for > ₹10K |
| R-12 | Bad actor merchant scams residents | Med | High | KYC + escrow + review-after-completion; blacklist mechanism |
| R-13 | Society admin turns rogue (deletes notices, suspends critics) | Low | Med | Lokul has override authority; appeal flow |
| R-14 | Carpool safety incident (assault, accident) | Low | Critical | Gold KYC for both; insurance partner (deferred); clear ToS; police partnership for incidents |
| R-15 | App store rejection (Apple — gating, ratings) | Med | Med | Pre-review with Apple BD; ensure age rating 17+; Google rollout first |
| R-16 | India SMS regulations (DLT, TRAI) delay OTP delivery | Med | High | DLT templates pre-approved across providers; multi-provider failover |
| R-17 | Realtime infra outage (Ably) | Low | High | Polling fallback baked in; PostgreSQL LISTEN/NOTIFY for backup |

---

## 6. Cost forecast (rough, T+12 months)

| Item | Monthly | Notes |
|---|---|---|
| Razorpay (1% MDR avg, ₹5Cr GMV) | ₹5,00,000 | Pass-through partial |
| Ably (realtime, 200K MAU) | ₹2,00,000 | Negotiable on volume |
| Cloudflare R2 + Stream + Workers | ₹1,00,000 | Egress-free advantage |
| MSG91 SMS (OTP at 75¢/msg) | ₹1,50,000 | Decreases on growth |
| OpenAI (GPT-4o-mini digest) | ₹50,000 | At 250K daily digests × ₹0.30 cap |
| LLM moderation (self-hosted Llama on 4× GPU) | ₹1,80,000 | India region |
| Postgres + Redis (managed) | ₹1,20,000 | Aiven/Neon |
| OneSignal | ₹40,000 | iOS APNs |
| Sentry + PostHog | ₹30,000 | Self-hosted PostHog reduces this |
| **Total infra/month** | **~₹13,70,000** | |

---

## 7. Team & sequencing (build plan)

| Module owner | Headcount | Modules |
|---|---|---|
| Identity & auth | 2 BE + 1 mobile | 01, parts of 13 |
| Feed & content | 3 BE + 2 mobile + 1 ML | 02, 08, 09 |
| Realtime | 2 BE + 1 mobile | 04 (chat/calls), parts of 03 |
| Safety squad | 2 BE + 1 mobile + 1 design | 03 |
| Marketplace | 3 BE + 2 mobile + 1 web | 05, 06, 07 |
| Society Ops | 2 BE + 1 mobile + 1 design | 10 (map), 11 |
| ML / AI | 2 ML + 1 BE | 12 digest, 14 auto-mod |
| Trust & Safety ops | 4 mods + 1 lead | 14 |
| Web | 2 web | 15 |
| Design system | 1 design | All |
| QA | 3 QAE | All |
| **Total engineering+** | **~30 people** | |

---

## 8. Go / no-go for GA

**Go** if all true at T+5 month review:
- D30 retention ≥ 35% across β societies.
- SOS p95 ≤ 90s with ≥ 60% responder rate.
- Reports resolved within SLA ≥ 95%.
- Crash-free sessions ≥ 99.5%.
- Compliance checklist 100%.
- ≥ 80% of β-society residents say they'd recommend (NPS proxy).

**No-go** triggers a 30-day remediation sprint then re-review.

---

## 9. Post-launch operating cadence

- Daily: Crash & ops dashboard standup; mod queue SLA review.
- Weekly: Society-level engagement review; merchant onboarding pipeline; release train.
- Monthly: KPI tree review with founders; risk register update; cost & unit economics review.
- Quarterly: Transparency report; roadmap reprioritisation; legal & compliance audit.

---

## 10. End of PRD

This document set is **living**. Every PR that materially changes UX or scope MUST update the matching module file. See [README.md](./README.md) for the change-log convention.

**Approval signatures (pending):**

| Role | Name | Date | Signature |
|---|---|---|---|
| Founder / CEO | | | |
| Head of Product | | | |
| Head of Engineering | | | |
| Head of Trust & Safety | | | |
| Legal & Compliance | | | |
