# 05 — Marketplace, Services & Booking

> Verified local merchants + service providers + a booking/scheduling engine. The supply side of Lokul.

---

## 1. Goal

Make Lokul the **fastest way to find and book a trusted local service** (maid, tiffin, electrician, plumber, salon, tutor) inside a 2km radius, with a rating system the resident actually trusts.

---

## 2. User stories

- **US-5.1** As a resident, I can browse verified service providers in my society/neighborhood by category.
- **US-5.2** As a resident, I see ratings from real verified neighbors (not bots).
- **US-5.3** As a resident, I can book a slot (maid for 10am tomorrow) or send an "interest" request.
- **US-5.4** As a resident, I can pay in-app or "Pay on arrival".
- **US-5.5** As a merchant, I can list my services, set prices, and accept bookings.
- **US-5.6** As a merchant, I see my booking calendar and mark slots unavailable.
- **US-5.7** As a resident, I can leave a rating + photo review only after a completed booking.
- **US-5.8** As an RWA admin, I can endorse/blacklist a merchant for my society.

---

## 3. UX flows

### 3.1 Discover

```
Marketplace tab → Categories grid (Maid · Tiffin · Plumber · Electrician · ...)
→ Category → List sorted by rating × proximity → Filters (price, rating, distance, available now)
```

### 3.2 Merchant profile

```
- Header: photo, name, KYC badge, rating, distance
- About: services, price list, response time
- Availability calendar
- Reviews (with photos, "verified neighbor" tag)
- Actions: Book · Chat · Call · Save · Report
```

### 3.3 Booking flow

```
Book → Pick service → Pick date/time slot (calendar widget) →
Pick address (default = home) → Notes → Payment method
→ Confirm → Booking confirmation screen with QR token →
Push to merchant; merchant accepts/rejects within 30 min
```

### 3.4 Merchant onboarding

```
Profile → "Become a merchant" → Business name + category →
Upload GSTIN / Aadhaar + address proof → Service catalog (name, price, duration)
→ Bank account for payouts → Submit → Lokul review (≤ 48h) → Live
```

---

## 4. Functional requirements

### Listing & categories
- **FR-5.1** Categories (v1, 20): Maid, Cook, Tiffin, Plumber, Electrician, Carpenter, AC repair, Appliance repair, Salon (at home), Tutor, Driver, Pet care, Laundry, Pest control, Packers & movers, Mehendi, Photographer, Yoga / fitness, Doctor (home visit), Other.
- **FR-5.2** Each merchant has: name, photo, category(ies), service list, base PIN, service radius (m), hours.
- **FR-5.3** Merchant search MUST sort by `(rating * 20) + proximity_score - response_lag_penalty`.
- **FR-5.4** "Available now" filter shows only merchants whose `available_now=true` (manual toggle by merchant) AND inside service radius.

### Bookings
- **FR-5.5** Booking states: `pending → accepted → in_progress → completed → reviewed` (or `cancelled` at any time).
- **FR-5.6** Merchant must accept/reject within 30 min, else auto-cancel.
- **FR-5.7** Slot granularity: 30 min.
- **FR-5.8** Cancellation: free up to 2h before slot; 50% charge < 2h; 100% if merchant arrived.
- **FR-5.9** Reschedule allowed up to 2h before slot, max 1 reschedule per booking.
- **FR-5.10** Booking address default = resident's flat; can be changed.
- **FR-5.11** Booking QR token shown to resident; merchant scans to mark `in_progress` and again to mark `completed`.

### Pricing & payments
- **FR-5.12** Merchants can be `fixed_price` or `quote` (chat-first).
- **FR-5.13** Payment options: Wallet (module 06), UPI, "Pay on arrival" (cash/UPI direct).
- **FR-5.14** Platform fee: 5% of in-app payment (taken from merchant payout).
- **FR-5.15** Escrow for in-app payments: held by Lokul wallet, released to merchant on `completed` + 24h cooling period.
- **FR-5.16** Refunds: auto on `cancelled` (resident-initiated > 2h before) or on dispute resolution.

### Ratings & reviews
- **FR-5.17** Rating allowed only after `completed` status; window: 7 days post-completion.
- **FR-5.18** Rating: 1–5 stars + optional text (≤500 chars) + up to 3 photos.
- **FR-5.19** Avg rating shown only when merchant has ≥ 5 reviews (else "New").
- **FR-5.20** Reviews from Silver+ are weighted 1.0; Bronze users cannot review.
- **FR-5.21** Review can be reported and removed for policy violations (no PII, no abuse).

### Merchant tools
- **FR-5.22** Merchant Mode in the same app; toggle via Profile.
- **FR-5.23** Merchant calendar view: day/week, drag slots to block, see today's bookings.
- **FR-5.24** Merchant gets booking pushes via FCM `priority=high`.
- **FR-5.25** Merchant must respond to ≥ 80% of bookings in 30 min to retain "Responsive" badge.
- **FR-5.26** Merchant KYC: Aadhaar + business proof (GSTIN OR shop license OR self-declaration); category restrictions for unverified (e.g., no doctor home-visit without medical license proof).

### RWA endorsements
- **FR-5.27** RWA admin can `endorse` or `blacklist` a merchant for their society — affects only that society's residents.
- **FR-5.28** Blacklisted merchant hidden from society residents; can appeal to Lokul moderation.

---

## 5. Data model

```
merchants
  id (ULID)
  owner_user_id (FK users)
  business_name, photo_url
  primary_category, secondary_categories[]
  pin, lat, lng, service_radius_m
  hours_json
  rating_avg, rating_count
  available_now (bool)
  status ('pending'|'live'|'suspended')
  kyc_docs_ref
  bank_account_id

merchant_services
  id, merchant_id (FK)
  name, description
  pricing_kind ('fixed'|'quote')
  price_inr, duration_minutes
  is_active

bookings
  id (ULID)
  resident_id (FK), merchant_id (FK)
  service_id (FK)
  slot_start, slot_end
  address_text, lat, lng
  notes
  status, status_updated_at
  amount_inr, payment_method, payment_status
  qr_token
  reschedule_count
  created_at, completed_at

merchant_availability
  merchant_id, day_of_week, start_time, end_time

merchant_blackouts
  merchant_id, start_at, end_at, reason

reviews
  id, booking_id, resident_id, merchant_id
  rating (1–5), body, photos[]
  status ('active'|'hidden')

rwa_endorsements
  society_id, merchant_id, action ('endorsed'|'blacklisted'), by_user_id

merchant_payouts
  id, merchant_id, period_start, period_end, amount_inr, status
```

---

## 6. APIs

```
# Discover
GET  /v1/merchants?category=&pin=&radius=&sort=
GET  /v1/merchants/:id
GET  /v1/merchants/:id/availability?date=

# Bookings
POST   /v1/bookings              { merchant_id, service_id, slot_start, address, payment_method }
GET    /v1/bookings              ?role=resident|merchant&status=
POST   /v1/bookings/:id/accept   (merchant)
POST   /v1/bookings/:id/reject   (merchant) { reason }
POST   /v1/bookings/:id/start    { qr_token } (merchant scan)
POST   /v1/bookings/:id/complete { qr_token } (merchant scan)
POST   /v1/bookings/:id/cancel   { reason }
POST   /v1/bookings/:id/reschedule { new_slot_start }

# Reviews
POST   /v1/bookings/:id/review   { rating, body, photos[] }
GET    /v1/merchants/:id/reviews

# Merchant onboarding
POST   /v1/merchants             (apply)
PATCH  /v1/merchants/:id
POST   /v1/merchants/:id/services
PATCH  /v1/merchants/:id/availability

# RWA endorsement
POST   /v1/societies/:id/endorsements    { merchant_id, action }
```

---

## 7. Edge cases

- **EC-5.1** Merchant accepts then no-shows → resident reports → auto-refund + merchant rating penalty.
- **EC-5.2** Resident no-show → merchant marks `no_show`; cancellation fee charged.
- **EC-5.3** Merchant goes offline mid-booking → admin can manually mark `completed`.
- **EC-5.4** Time-zone bug: all slots in IST.
- **EC-5.5** Double-booking same slot → optimistic lock at DB; only first accept wins.
- **EC-5.6** Merchant changes service price mid-day → existing bookings keep their captured price.
- **EC-5.7** Review with PII (phone numbers) → auto-redacted via regex; reviewer warned.
- **EC-5.8** Merchant in 2 categories needs different KYC — KYC scoped per category.
- **EC-5.9** RWA blacklists merchant who has pending bookings → bookings honored; new bookings blocked.

---

## 8. Metrics

| Metric | Target |
|---|---|
| Bookings / WAU | ≥ 0.4 |
| % bookings completed | ≥ 88% |
| Avg time from book → accept | ≤ 10 min |
| Avg rating per merchant | ≥ 4.3 |
| Reviews / completed booking | ≥ 0.5 |
| Merchant repeat rate (30-day) | ≥ 35% |
| GMV / society / month | ≥ ₹50,000 |

---

## 9. Dependencies

- Payments module 06 (wallet, escrow, payout).
- Notifications module 12 (booking alerts).
- Trust score module 13 (KYC weight).
- Moderation module 14 (review reports, merchant disputes).
- Categories taxonomy seed.

---

## 10. Out of scope (v1.0)

- Subscriptions (e.g., monthly maid).
- Multi-day projects with milestones (one-shot bookings only).
- Bidding / reverse auctions.
- Aggregator behavior (Urban Company-style routing).
- Merchant ads / boosted listings.
- Multi-language merchant profiles (English only at v1).
