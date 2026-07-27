# 00 — Lokul v2 · Overview

> **The neighborhood economy platform for urban India.**  
> One app where any resident, any local shop, any home cook, any coach, and any community organizer connects, transacts, and thrives — all within 200 meters of home.

---

## 1. Vision & Mission

**Vision:** Every Indian neighborhood is economically self-sufficient, socially connected, and mutually safe — powered by Lokul.

**Mission for v2.0:** Build the platform that makes **200 meters the most valuable radius in Indian commerce** — where the kirana below you, the cook on the 4th floor, the trainer next door, and the school down the street all participate in a single trusted, local economy.

---

## 2. The Core Thesis

India's informal hyperlocal economy is massive, alive, and completely unplatformed.

- The biryani Mrs. Mehta makes on Sundays is better than anything Swiggy delivers — and 20 neighbors want it
- The kirana below your building stocks exactly what you need — and loses business to BigBasket because it has no digital presence
- The gym trainer two floors up has 6 paying clients through WhatsApp — and could have 60
- The school 300 meters away posts admission notices on a physical board — and parents 200m away never see them

**All of this commerce already exists. It just has no platform.**

Lokul does not need to create demand or supply. It needs to make them discoverable to each other within a verified, trusted, geography-bounded radius.

### The Three Unlocks

1. **Radius as primitive** — 200m / 500m / 2km is the core filter, not city, not category, not social graph
2. **Role fluidity** — every user is simultaneously resident, buyer, seller, cook, rider, coach, organizer; roles activate with a toggle, no separate app or account
3. **Trust by proximity** — neighbors already know each other; Lokul adds verified identity + transaction infrastructure on top of existing trust

---

## 3. Who Uses Lokul (Personas)

### P1 — Priya the Resident-Everything (Primary, 65% of DAU)
- 26–45, urban India, apartment or independent house
- Uses WhatsApp for everything — society group, ordering from kirana, coordinating rides
- Needs: one place that replaces 8 WhatsApp groups and 4 apps

### P2 — Ramesh the Kirana Owner (Local Business, key supply)
- 35–55, runs a shop within the locality, no website, no app presence
- Already knows his customers by face but loses them to online platforms
- Needs: digital storefront that reaches exactly his 500m customer base, nothing more

### P3 — Meena the Peer Seller / Cook (Peer supply, differentiator)
- 28–50, homemaker or working professional with a skill or excess capacity
- Makes great food, teaches yoga, does stitching, has a spare car seat daily
- Needs: a way to earn from neighbors without formal business setup, no GST, no shop

### P4 — Coach Arun (Peer professional)
- 25–40, fitness trainer, music teacher, language coach, academic tutor
- Has capacity beyond current students, works within a 1km radius
- Needs: discovery, booking, and payment in one place

### P5 — RWA Admin / Community Organizer (Power user, 8% of DAU)
- 40–65, runs a formal RWA or an informal community group (book club, cycling group, parents' network)
- Needs: tools for group communication, polls, events, dues collection, notices

### P6 — Ananya the New Arrival (Activation funnel)
- 22–32, just moved into the area, knows nobody
- Needs: local discovery — where to eat, which kirana is good, which coach is nearby, who her neighbors are

### P7 — Rajan the Senior Resident (Vulnerable, high trust)
- 60+, trusts neighbors deeply, needs help with services, medical appointments, errands
- Needs: simple, large-font UI in regional language; a rider to run errands; a cook who delivers

---

## 4. Jobs-to-be-Done (v2 expanded)

1. *"When I need something from the locality — food, a service, a product — help me find the best neighbor/shop within 200m."*
2. *"When I have something to offer — food I cook, skills I have, errands I can run — help me reach my nearby neighbors."*
3. *"When my local shop has something new or an offer, let me know before I order from somewhere far."*
4. *"When I want to build a community around something — morning walk, cooking club, school parents — give me the tools."*
5. *"When something happens near me — danger, a lost item, a great find — let everyone within 200m know instantly."*
6. *"When I need to transact with a neighbor — pay for tiffin, split a carpool cost, buy a used cycle — make it safe and instant."*
7. *"When I move to a new area, help me become part of the neighborhood in 7 days."*

---

## 5. Product Principles (v2)

1. **200m is the default.** Every entity (post, person, business, service, event) has a location. The default view is 200m. Users expand deliberately.
2. **Anyone is the supply.** No gatekeeping on who can offer. A toggle activates a role. Trust tier determines what's unlocked.
3. **Local businesses are peers, not ads.** The kirana posts in the same feed as residents. There is no "ads section" — just the neighborhood.
4. **One profile, many roles.** Same account = resident + cook + rider + coach + organizer + seller. Each role has its own mode, but the identity is unified.
5. **Trust is tiered, not binary.** Bronze → Silver → Gold. More trust = more roles unlocked. Downgrade is possible.
6. **Community before company.** Lokul earns by enabling transactions, not by charging for visibility. Supply-side earns; Lokul takes a small share.
7. **Offline India first.** Works on 3G, regional languages, low-end Android. Not every user has Jio 5G.
8. **DPDPA and RBI compliance by design.** Every data flow is documented, every payment is regulated.

---

## 6. User Roles & What They Unlock

Every user is a **Resident** by default. Additional roles activate via profile toggle. All roles live in one app, one profile.

| Role | Activation | What it unlocks |
|---|---|---|
| **Resident** | Default on signup | Feed, chat, classifieds, safety, events, community join |
| **Cook** | Toggle in profile (Silver KYC) | List daily food menu, accept tiffin orders, receive payments |
| **Rider** | Toggle in profile (Silver KYC) | Post availability for errands/deliveries, get matched |
| **Coach** | Toggle in profile (Silver KYC) | List sessions/batches, booking calendar, accept payments |
| **Reseller** | Toggle in profile (Silver KYC) | Buy and relist items with markup |
| **Community Organizer** | Tap "Create Community" (Silver KYC) | Create community, manage members, run group buys |
| **Local Business** | Separate business profile (Silver KYC) | Business storefront, catalogue, feed posts, orders |
| **RWA Admin** | Assigned by Lokul or existing admin (Gold KYC) | Notice board, binding polls, visitor mgmt, dues |
| **Guard** | Assigned by RWA admin (Gold KYC) | Gate management, punch-in/out |

---

## 7. Business Model (v2)

| Stream | Mechanism | Payer |
|---|---|---|
| Booking take-rate | 5–8% on in-app bookings (cook, coach, rider, formal services) | Seller earns net |
| Business listing | ₹299–999/month for kirana, salon, clinic, school storefronts | Local business |
| Hyperlocal reach boost | ₹20–500 per promotion (surface offer to users within chosen radius) | Local business / peer seller |
| Community tools | 2–3% on ticketed events and group buys | Organizer |
| RWA SaaS | 0.5% on dues collected (capped ₹10/txn) | RWA |
| Delivery network | ₹10–30 per local rider delivery | Buyer |
| Wallet float | Treasury income on PPI float (RBI-permitted) | Platform |
| Premium peer tools | Subscription for high-volume cooks/coaches — analytics, priority listing | Peer seller |

---

## 8. Goals & Success Metrics (v2, 12 months post-GA)

### North Star Metric
**Weekly Transactions per Active Locality** — average number of paid or confirmed transactions (bookings, orders, classifieds, group buys, carpool) per active 500m locality cluster per week.

**Target at 6 months post-GA:** ≥ 15 transactions/locality/week

### Top-Level KPIs

| Pillar | KPI | Target |
|---|---|---|
| Reach | Active localities (≥ 30% resident density) | 500 |
| Reach | Verified users | 300,000 |
| Reach | Local businesses onboarded | 10,000 |
| Peer supply | Users with active peer role (cook/rider/coach) | 25,000 |
| Engagement | D30 retention | 40% |
| Engagement | DAU/MAU (stickiness) | 0.38 |
| Commerce | GMV (all transactions) | ₹30 Cr/year run-rate |
| Commerce | Avg transactions/active user/month | ≥ 3 |
| Community | Active communities created | 5,000 |
| Safety | SOS first responder p50 | ≤ 90s |
| Trust | KYC Silver completion rate | ≥ 65% |
| NPS | App NPS | ≥ 45 |

---

## 9. Scope (v2.0)

### In scope
- All 20 modules listed in README.md
- iOS + Android native apps (React Native 0.76 + Expo Router)
- Web companion (module 19)
- Languages at launch: English, Hindi, Marathi; Tamil, Telugu, Kannada at v2.1
- Geography: Mumbai MMR + Pune for first 3 months; top-8 metros by Month 9

### New in v2 (not in v1)
- Peer roles: Cook, Rider, Coach, Reseller (module 05)
- Local Business Hub (module 06)
- Community Creation by anyone (module 10)
- Group Buying (module 11)
- Micro-radius selector (200m / 500m / 2km) on feed and discovery
- Business posts in community feed
- Daily food menu + tiffin ordering from home cooks
- Business catalogue (items + prices + photos)
- Hyperlocal promotions by businesses

### Deferred to v2.1
- AI chatbot "Ask Lokul"
- Multi-city carpool
- School bus ride pooling
- Multi-society household membership
- Dark mode
- Vernacular voice input
- Business subscription billing engine
- Group video calls

---

## 10. Tech Stack (v2 additions over v1)

| Layer | Choice | Rationale |
|---|---|---|
| Mobile | React Native 0.76 + Expo Router | Unchanged |
| Radius geofence | PostGIS + Ola Maps reverse-geocode | PIN + lat/lng polygon queries for 200m/500m/2km |
| Business catalogue | Meilisearch index `business_catalogue` | Product search within radius |
| Tiffin/food ordering | Custom order engine on same bookings infra | Reuses bookings module with `type=food_order` |
| Group buying | Custom pooling engine + wallet split | Built on top of wallet module |
| Real-time | Ably (same as v1) | Channels: feed, chat, SOS, group buy countdown |
| AI moderation | Llama 3.1 self-hosted + OpenAI GPT-4o-mini | Unchanged |
| Analytics | PostHog (events + funnels) | Locality-level cohort analysis added |

---

## 11. Information Architecture (v2)

```
Lokul App (v2)
├── Tab 1: Feed              → radius selector + post types + business posts + stories
├── Tab 2: Discover          → Local shops · Peer services · Communities · Group buys · Map
├── Tab 3: + (Create)        → Post · Sell · Order food · Offer service · Create community · SOS
├── Tab 4: Chats             → DMs · Society group · Tower · Communities · Bookings
└── Tab 5: You               → Profile · My roles · Earnings · Settings · Wallet
    └── Modal: SOS           → safety overlay from anywhere
    └── Modal: Role Mode     → switch active role context (Cook / Rider / Coach view)
```

---

## 12. Release Plan (v2)

| Milestone | When | Scope |
|---|---|---|
| α — Closed Alpha | T+3 mo | 1 locality, 100 users, 10 local businesses; Feed, Chat, Business Hub, 1 peer role (Cook) |
| β — Open Beta | T+5 mo | 10 localities, 2,000 users, 100 businesses; All peer roles, Community creation, Group buying |
| GA 2.0 | T+8 mo | Mumbai MMR open; all 20 modules; 50K users, 2,000 businesses |
| v2.1 | T+11 mo | Pune + Bangalore; Tamil/Kannada; AI assistant; school bus carpool |
| v2.2 | T+14 mo | Top-8 metros; Telugu, Bengali, Gujarati; business subscription engine |

---

## 13. Glossary (v2 additions)

| Term | Meaning |
|---|---|
| Locality | A ~200–500m geographic cluster; the primary unit of community in v2 |
| Radius | User-selected discovery scope: 200m / 500m / 2km / 5km |
| Peer Role | A non-business economic role any resident can activate: Cook, Rider, Coach, Reseller |
| Local Business | A registered business with a Lokul Business Profile (separate from personal profile) |
| Business Hub | The storefront section of a Local Business — catalogue, hours, posts, orders |
| Community | A user-created micro-group within a locality (interest, activity, or buying-based) |
| Group Buy | A community-coordinated bulk purchase where members pool demand before ordering |
| Tiffin | A daily home-cooked meal sold by a peer Cook to neighbors |
| Trust Tier | Bronze / Silver / Gold — controls which roles and features are accessible |
| Role Mode | The UI context a user switches into when acting as Cook / Rider / Coach |
