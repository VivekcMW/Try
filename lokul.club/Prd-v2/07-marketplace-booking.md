# 07 — Marketplace & Booking (v2 Unified)

> One discovery and booking surface for every type of local supply: peer cooks, peer coaches, peer riders, local businesses, formal service providers — all findable by category and radius, all bookable with the same flow.

---

## 1. Goal

Replace the fragmented experience of searching JustDial for a plumber, opening a separate app for food, and calling the gym for availability — with one **Discover** tab that shows everything within your chosen radius, organized by need, bookable in under 60 seconds.

---

## 2. Supply Types in the Marketplace

| Supply Type | Managed by | Module | Booking flow |
|---|---|---|---|
| Home Cook / Tiffin | Peer (module 05) | 05 | Food order |
| Errand Rider | Peer (module 05) | 05 | Errand request |
| Coach (yoga, fitness, tutor) | Peer (module 05) | 05 | Session/batch booking |
| Local Business (catalogue) | Business (module 06) | 06 | In-app order or WhatsApp |
| Formal Service Provider (maid, plumber, etc.) | Merchant account | 07 | Slot booking |

The Discover tab aggregates all five types. Booking flows differ per type but share wallet/escrow/payment infrastructure.

---

## 3. User Stories

### Discovery
- **US-7.1** I open Discover and see: "Nearby Food", "Services", "Shops", "Coaches", "Riders" as category cards.
- **US-7.2** I search for "yoga" and see: coaches within 500m, gyms within 500m, and yoga-related products from local shops.
- **US-7.3** I filter by "Available now" and see only supply that is currently active.
- **US-7.4** I switch my radius from 500m to 2km and see more results.
- **US-7.5** I see each result with: photo, name, rating, distance, price range, and available slots or order CTA.

### Formal Service Providers
- **US-7.6** As a resident, I find a verified maid within my locality and book a slot for tomorrow 9am.
- **US-7.7** As a resident, I see ratings from real, verified neighbors — not fake reviews.
- **US-7.8** As a merchant, I list my services, set pricing, and manage bookings from the same app.
- **US-7.9** As a merchant, I set my availability calendar and can pause bookings.

---

## 4. UX Flows

### 4.1 Discover Tab

```
Discover Tab:
  ┌──────────────────────────────────────────┐
  │  Radius: [200m] [500m] [2km] [5km]       │
  │  Search: [Find service, shop, food...]    │
  ├──────────────────────────────────────────┤
  │  NEARBY FOOD                             │
  │  [Meena's Kitchen] [Rekha's Tiffin]  →  │
  ├──────────────────────────────────────────┤
  │  SHOP LOCAL                              │
  │  [Sharma Kirana] [Beauty Palace] →       │
  ├──────────────────────────────────────────┤
  │  SERVICES                                │
  │  [Maid] [Plumber] [Electrician] [More→]  │
  ├──────────────────────────────────────────┤
  │  COACHES NEARBY                          │
  │  [Yoga · Anita] [Fitness · Raj]  →       │
  ├──────────────────────────────────────────┤
  │  RIDERS AVAILABLE NOW                    │
  │  [3 riders within 500m]           →      │
  ├──────────────────────────────────────────┤
  │  TRENDING IN YOUR AREA                   │
  │  Best rated this week + new arrivals     │
  └──────────────────────────────────────────┘
```

### 4.2 Category Browse

```
Tap "Services" → Category Grid:
  Maid · Cook · Tiffin · Plumber · Electrician · Carpenter
  AC Repair · Appliance Repair · Salon (home) · Tutor
  Driver · Pet Care · Laundry · Pest Control · Movers
  Mehendi · Photographer · Yoga/Fitness · Doctor (home) · Other

→ Category selected → List of providers sorted by:
   (rating × 0.4) + (proximity × 0.4) + (response_speed × 0.2)

→ Each card:
   Photo · Name · KYC badge · Rating · Distance · Price from ₹___
   "Available now" green badge if currently available
   "Book" / "Order" / "Request" CTA
```

### 4.3 Formal Service Booking Flow (Maid, Plumber, etc.)

```
Provider profile → "Book"
  → Select service → Pick date → Pick slot (30-min grid)
  → Address (default: home)
  → Notes (optional)
  → Payment: Wallet / UPI / Pay on arrival
  → Confirm → Booking confirmation with QR token

Provider gets push → Accepts within 30 min
  → Resident gets "Accepted" push

At service time:
  Provider scans resident's QR → marks "Started"
  Provider scans again at end → marks "Completed"
  Funds release from escrow after 24h cooling
  Rating prompt to resident
```

### 4.4 Unified Search

```
Search "yoga" within 500m → results:
  [Coaches] Anita's Yoga — 300m · ₹800/month · batch openings
  [Coaches] Fitness First (Raj) — 450m · 1-1 sessions ₹500
  [Gyms] Planet Fitness — 400m · includes yoga
  [Products] Yoga mat from Rekha — ₹600 (classifieds)
  [Events] Morning yoga — community event tomorrow

Results tagged by type; tappable to see profile
```

---

## 5. Functional Requirements

### Discovery
- **FR-7.1** Discover tab aggregates: peer cooks, peer coaches, peer riders, business profiles, formal merchants — all filtered by user's radius.
- **FR-7.2** "Available now" filter: cooks with open menus not past cutoff; riders with `available=true`; merchants with `available_now=true`; businesses that are "open now".
- **FR-7.3** Search indexes: Meilisearch `marketplace` index across all supply types, searchable by name + category + description within radius.
- **FR-7.4** Trending: server-side daily ranking of top-rated + most-ordered per category per locality.

### Formal Merchant Accounts
- **FR-7.5** Formal merchants (maid agency, individual plumber, salon) use the same business profile system (module 06) but with `service_type = 'at_home'` which enables slot-based booking instead of catalogue.
- **FR-7.6** Merchant categories: Maid, Cook, Tiffin, Plumber, Electrician, Carpenter, AC repair, Appliance repair, Salon (at home), Tutor, Driver, Pet care, Laundry, Pest control, Packers & movers, Mehendi, Photographer, Yoga/fitness, Doctor (home visit), Other.
- **FR-7.7** Booking mechanics: slot-based, 30-min granularity, accept/reject within 30 min.
- **FR-7.8** Cancellation: free up to 2h before slot; 50% charge <2h; 100% if provider has arrived.
- **FR-7.9** QR-token check-in/check-out: provider scans resident's QR to mark start and completion.
- **FR-7.10** Reviews: only after completed booking; Silver+ residents only; 7-day window.
- **FR-7.11** "Responsive" badge: awarded to providers accepting ≥ 80% of requests within 30 min.

### Cross-type Booking Rules
- **FR-7.12** Each booking type uses the same payment/escrow infrastructure (module 08).
- **FR-7.13** Platform take-rate: 5% on all in-app paid transactions across all types.
- **FR-7.14** "Pay on arrival" / cash allowed for all types; no escrow; no Lokul revenue on those.
- **FR-7.15** All providers (peer or business) have a unified profile with: photo, name, KYC badge, trust score, rating, distance, reviews.

---

## 6. Data Model

```sql
-- Formal merchant profile (extends business_profiles with booking mode)
merchant_services
  id, business_id (FK)
  name, description
  pricing_kind ('fixed'|'quote')
  price_inr, duration_minutes
  is_active

bookings
  id (ULID), resident_id (FK users)
  -- provider is one of:
  merchant_id (FK business_profiles nullable)
  cook_user_id (FK nullable)       -- peer cook order
  coach_batch_id (FK nullable)     -- coach batch enrollment
  errand_id (FK nullable)          -- rider errand
  --
  service_id (FK merchant_services nullable)
  slot_start, slot_end
  address_text, lat, lng
  notes
  status ('pending'|'accepted'|'rejected'|'in_progress'|'completed'|'cancelled'|'reviewed')
  amount_paise, payment_method, payment_status
  qr_token
  created_at, completed_at

-- Unified discover ranking (server-side computed)
discover_rankings
  locality_pin, radius_m, category, kind ('merchant'|'cook'|'coach'|'rider'|'business')
  provider_id  -- id of the relevant entity
  score
  computed_at
```

---

## 7. APIs

```
# Discover
GET /v1/discover
    ?radius_m=&category=&available_now=&sort=
    → { food: [...], services: [...], shops: [...], coaches: [...], riders: [...] }

GET /v1/discover/search?q=&radius_m=
    → { results: [{ type, id, name, category, distance_m, rating, price_from }] }

# Formal merchants (slot booking)
GET  /v1/merchants?category=&radius_m=&available_now=
GET  /v1/merchants/:id
GET  /v1/merchants/:id/availability?date=
POST /v1/bookings              { merchant_id, service_id, slot_start, address, payment_method }
GET  /v1/bookings              ?role=resident|merchant&status=
POST /v1/bookings/:id/accept
POST /v1/bookings/:id/reject   { reason }
POST /v1/bookings/:id/start    { qr_token }
POST /v1/bookings/:id/complete { qr_token }
POST /v1/bookings/:id/cancel   { reason }
POST /v1/bookings/:id/review   { rating, body, photos[] }
```

---

## 8. Metrics

| Metric | Target |
|---|---|
| Discover tab opens / DAU | ≥ 1.2 |
| Search → provider tap-through | ≥ 30% |
| Provider tap → booking/order | ≥ 15% |
| Bookings completed / WAU | ≥ 0.5 |
| Available now conversion (vs not available) | 2× |
| Merchant repeat booking rate (30d) | ≥ 35% |

---

## 9. Dependencies

- Module 05 (peer roles supply data)
- Module 06 (local business supply data)
- Module 08 (payments, escrow)
- Module 14 (map pins for providers)
- Meilisearch marketplace index

---

## 10. Out of Scope (v2.0)

- Aggregator routing (Urban Company-style dispatch)
- Bidding / reverse auction
- Multi-day projects
- Subscriptions billing engine for formal merchants (peer subscriptions in module 05)
- Boosted listings for formal merchants (use business boost in module 06)
