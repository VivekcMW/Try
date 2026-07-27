# 20 — Launch Plan, KPIs & Risk Register (v2)

> Sequencing the v2.0 launch around locality density — proving the peer economy flywheel in 1 locality before scaling to 500.

---

## 1. The Flywheel We're Proving

```
More residents join a locality
         ↓
More peer roles activate (cooks, riders, coaches)
         ↓
Local businesses see demand → onboard
         ↓
Feed gets richer → more daily opens
         ↓
More transactions → more trust → more supply activates
         ↓
Network effect locks in: leaving = losing your tiffin, your
gym class, your community, your kirana — all in one
```

**The proof we need for Series A:** When a locality crosses **40% resident density**, weekly transactions per locality hit ≥ 15. This is the flywheel proof.

---

## 2. Launch Phases

### α — Closed Alpha (T+0 → T+3 months)

- **Scope:** 1 pilot locality in Andheri West, Mumbai. 1 building cluster (~200m radius). 100 hand-picked users (mix of residents, 2 home cooks, 3 local businesses).
- **Modules live:** 01 Onboarding, 02 Feed (with radius), 03 Safety, 04 Chat, 05 Cook role only, 06 Local Business Hub (3 businesses), 08 Payments, 17 Profile.
- **Goal:** Prove daily habit. Cook orders > 0 on Day 7. At least 1 business posts every day.
- **Exit criteria:**
  - D7 retention ≥ 60%
  - ≥ 1 cook with ≥ 5 orders in week 2
  - ≥ 1 business with ≥ 20 post views/day
  - NPS ≥ 30
  - < 5 P1 bugs/week

### β — Open Beta (T+3 → T+6 months)

- **Scope:** 10 localities in Mumbai MMR. ~2,000 residents, 100 local businesses, 50 peer role users (cooks, riders, coaches).
- **Modules added:** Rider role, Coach role, Reseller role, Community Creation, Group Buying, Map/Discovery, Society Ops, Events, Lost & Found, Polls.
- **Goal:** Prove flywheel. Locality 1 (original alpha) should hit 40% density and ≥ 10 transactions/week.
- **Exit criteria:**
  - D30 retention ≥ 35% across all beta localities
  - ≥ 3 localities with transactions/week ≥ 10
  - At least 30% of businesses posted in the last 7 days
  - Group buy success rate ≥ 60%
  - No P1 security incidents

### GA 2.0 — Public Launch (T+6 → T+9 months)

- **Scope:** Mumbai MMR fully open + Pune. All 20 modules. Target: 50,000 users, 2,000 businesses, 500 active localities.
- **Launch strategy:**
  - Hyperlocal on-ground ops: 2 ops people per city, going building-by-building
  - Business BD: dedicated kirana/salon/clinic outreach team (4 people)
  - Peer supply activation: "Become a Cook" WhatsApp campaign targeting homemakers
  - Community seeding: pre-create 5 communities per locality before launch
- **Goals:** 500 active localities, ≥ 15 transactions/locality/week, ₹5 crore GMV/month run-rate

### v2.1 (T+9 → T+12 months)

- **Geo expansion:** Bangalore + Delhi NCR
- **New features:** Tamil/Kannada languages, AI digest improved, multi-city carpool, school bus pooling, bulk CSV catalogue import, business analytics v2
- **Goals:** 200,000 users, 10,000 businesses, ₹20 crore GMV/month

### v2.2 (T+12 → T+18 months)

- **Geo expansion:** Top-8 metros (Chennai, Hyderabad, Ahmedabad, Kolkata, Jaipur, Surat)
- **New features:** Telugu, Bengali, Gujarati, AI assistant "Ask Lokul", recurring group buys, Lokul-brokered supplier partnerships, loyalty system
- **Goals:** 1M users, 50,000 businesses, ₹100 crore GMV/month run-rate

---

## 3. North Star & KPI Tree

```
North Star: Weekly Transactions per Active Locality (target ≥ 15 at GA)

├── Supply (what people can do)
│   ├── Active peer roles / locality              (target: ≥ 10)
│   ├── Businesses with posts in last 7 days      (≥ 60%)
│   ├── Cooks with active menus / locality        (≥ 5)
│   └── Riders available in peak hours            (≥ 3 / locality)
│
├── Demand (what people want)
│   ├── DAU / MAU (stickiness)                    (≥ 0.38)
│   ├── Feed opens / DAU                          (≥ 2.5)
│   ├── Discover tab opens / DAU                  (≥ 1.2)
│   └── Search queries / DAU                      (≥ 0.5)
│
├── Transactions (value exchanged)
│   ├── Food orders / cook / active week          (≥ 6)
│   ├── Errand requests accepted within 10 min    (≥ 70%)
│   ├── Business catalogue orders / business / month (≥ 20)
│   ├── Group buys completed / locality / month   (≥ 4)
│   └── Coach batch fill rate                     (≥ 60%)
│
├── Retention
│   ├── D1 / D7 / D30                             (65 / 48 / 38%)
│   ├── M3 cohort retention                       (≥ 30%)
│   └── Churn 60d                                 (≤ 12%)
│
├── Community
│   ├── Communities created / locality             (≥ 8 in 90 days)
│   ├── Community posts / active community / week  (≥ 5)
│   └── Group buy success rate                    (≥ 65%)
│
├── Trust & Safety
│   ├── SOS first responder p50                   (≤ 90s)
│   ├── Disputes / 1000 transactions              (≤ 15)
│   ├── Business reviews avg                      (≥ 4.2)
│   └── Crash-free sessions                       (≥ 99.5%)
│
└── Revenue
    ├── GMV / active locality / month              (≥ ₹50,000)
    ├── Take-rate revenue (avg 5% of in-app GMV)
    ├── Business listing revenue / business         (target: ≥ 15% on Pro+)
    └── Wallet float income
```

---

## 4. Locality Activation Playbook

**How to get a locality from 0 → flywheel (30-day playbook):**

| Week | Action | Owner |
|---|---|---|
| W1 | Identify 1 anchor business (kirana or restaurant) → help them set up and post | Lokul ops |
| W1 | Find 1 home cook → help them post first menu | Lokul ops |
| W1 | Identify RWA or building group → pitch and demo Lokul | Lokul ops |
| W2 | Seed 3 communities (Morning walkers, Parents group, General residents) | Lokul community manager |
| W2 | First group buy organized (vegetables, mangoes, or similar) | Community manager facilitates |
| W2 | Help anchor business get first 10 orders | Ops + product |
| W3 | 25% resident density target → invite via WhatsApp templates | Lokul + RWA co-op |
| W4 | First transactions week reviewed: 15+ target | PM review |
| D30 graduation: ≥ 30% WAU density + ≥ 15 transactions/week → "Active" locality; ops moves on |

---

## 5. Cost Forecast (Monthly at T+12 months, 200K MAU)

| Item | Monthly Cost | Notes |
|---|---|---|
| Ably (realtime, 200K MAU) | ₹2,00,000 | Negotiable on volume |
| Cloudflare R2 + Stream + Workers | ₹1,50,000 | Media + egress-free |
| MSG91 SMS (OTP, high volume) | ₹1,00,000 | Drops with adoption |
| Razorpay (1% MDR avg, ₹10Cr GMV) | ₹10,00,000 | Pass-through partially |
| Ola Maps API (geocoding, routing) | ₹80,000 | |
| OpenAI (digest, moderation assist) | ₹60,000 | |
| Llama 3.1 self-hosted (4× GPU) | ₹2,00,000 | Moderation |
| Postgres + Redis (managed, Aiven) | ₹1,50,000 | |
| OneSignal (iOS push) | ₹50,000 | |
| PostHog + Sentry (analytics + errors) | ₹40,000 | |
| Meilisearch (managed) | ₹50,000 | |
| **Total infra/month** | **~₹20,30,000** | ~₹2 crore/year |

---

## 6. Team Structure (T+9 months)

| Function | Headcount | Focus |
|---|---|---|
| Mobile (React Native) | 6 | iOS + Android |
| Backend (Node + Postgres) | 6 | API, realtime, payments |
| ML / AI | 2 | Moderation, digest, ranking |
| Design | 2 | Product design |
| Web | 2 | Web companion |
| QA | 3 | Manual + automated |
| Product | 2 | PM + researcher |
| Ops / Community | 6 | City-level locality activation |
| Business BD | 4 | Kirana/salon/clinic onboarding |
| Trust & Safety | 4 | Moderation ops |
| Legal + Compliance | 1 | DPDPA, RBI |
| **Total** | **~38** | |

---

## 7. Risk Register (v2)

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R-1 | Cook supply doesn't activate — users don't want to cook for neighbors | Med | High | On-ground ops identify and hand-hold 2 cooks per locality in alpha; success story amplification |
| R-2 | Local businesses don't post regularly → feed goes stale | High | High | Business BD checks in weekly; automated "Time to post" reminder push; ops posts on their behalf initially |
| R-3 | Density never reaches 30% → no flywheel | Med | High | Choose alpha locality carefully (high-density, active WhatsApp groups); ops-led activation |
| R-4 | WhatsApp groups remain stickier than Lokul chat | High | Med | Offer "forward to WhatsApp" from Lokul; differentiate on commerce + discovery, not just chat |
| R-5 | Food safety incident (buyer gets sick from peer cook) | Low | Critical | Hygiene badge, photo-proof, review system; T&C; no liability for peer food; clear ToS + in-app disclaimers |
| R-6 | Rider safety incident during errand | Low | High | Gold KYC for paid riders; photo-proof; chat log; Lokul support; insurance partner (v2.1) |
| R-7 | Fake businesses / spam listings | Med | Med | Silver KYC required; self-declaration reviewed; 5 reports → auto-suspend; ops spot-checks |
| R-8 | RWA blocks Lokul onboarding | Med | Med | Approach residents directly; RWA features are optional (Lokul works without RWA integration) |
| R-9 | Group buy organizer absconds with money | Low | High | Escrow holds funds until all distribution confirmed; organizer trust score requirement; Lokul mediates disputes |
| R-10 | Community becomes toxic / harassment hub | Med | High | Community reporting; admin tools; Lokul override; 30-report/week threshold triggers review |
| R-11 | Server costs explode with realtime + media | Med | Med | Ably usage caps; media compression on client; CDN caching; cost alerts at 80% of budget |
| R-12 | Payment fraud / chargebacks from group buys | Low | Med | Escrow prevents pre-payment fraud; 24h release window; Razorpay fraud rules |
| R-13 | DPDPA / RBI audit | Low | High | Privacy-by-design; named DPO; RBI PPI partner from day 1; legal review quarterly |
| R-14 | App store rejection (Apple — in-app ordering) | Med | Med | Ensure all in-app purchases go through Razorpay (not Apple IAP issue); comply with Apple guidelines for marketplace |
| R-15 | Competitor (MyGate, NoBroker) copies hyperlocal peer economy | Low | Med | Execute fast on alpha → beta; build network effect moat before competitors can react; data moat via reviews and trust scores |
| R-16 | SMS DLT / TRAI delays OTP | Med | High | WhatsApp OTP fallback; Firebase fallback; multi-provider setup from Day 1 |

---

## 8. Compliance Checklist (Pre-GA)

### DPDPA-2023
- [ ] Privacy notice: EN, HI, MR
- [ ] Consent UX at every data collection point
- [ ] Data export endpoint (7-day delivery)
- [ ] Account deletion: 30-day grace + hard purge automated
- [ ] Consent log immutable
- [ ] DPO named + contact published
- [ ] Breach notification process (≤72h) documented and tested

### RBI PPI (Wallet)
- [ ] PPI partner contract (M2P or Razorpay X)
- [ ] Wallet limits: ₹10K / ₹2L enforced
- [ ] KYC norms: Silver = semi-KYC, Gold = full KYC
- [ ] AML monitoring live

### IT Rules 2021
- [ ] Grievance Officer named (India address)
- [ ] Complaint SLA: 24h ack, 15 days resolution
- [ ] Monthly transparency report process

### Food Safety (Peer Cook)
- [ ] In-app disclaimer: Lokul does not certify food safety
- [ ] ToS: peer cooks are independent; no liability on Lokul
- [ ] "Report food safety issue" flow live
- [ ] Hygiene badge criteria documented

### Maps / Location
- [ ] Survey of India compliance for overlays
- [ ] User consent for location collected

---

## 9. Go / No-Go for GA

**Go** if all true at T+6 month beta review:
- D30 retention ≥ 35% across all beta localities
- ≥ 3 localities with ≥ 15 transactions/week
- Cook supply: ≥ 5 active cooks per pilot locality
- Business retention: ≥ 60% of onboarded businesses posted in last 7 days
- Group buy success rate ≥ 60%
- Compliance checklist 100%
- Crash-free sessions ≥ 99.5%
- NPS ≥ 40

**No-go** triggers a 45-day remediation sprint focused on the failing metric.

---

## 10. Post-Launch Cadence

| Cadence | What |
|---|---|
| Daily | Crash dashboard; mod queue SLA; locality transaction count; cook order volume |
| Weekly | Locality activation reviews; business posting rate; peer role activation; flywheel metrics |
| Monthly | Full KPI tree review; unit economics; risk register update; cost vs revenue |
| Quarterly | DPDPA compliance audit; roadmap reprioritisation; investor update |
