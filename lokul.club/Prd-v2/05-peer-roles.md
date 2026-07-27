# 05 — Peer Roles: Cook · Rider · Coach · Reseller (v2 NEW)

> Any resident can become a neighborhood supplier with a single toggle. No formal business registration. No separate app. One profile, one trust score, unlimited earning potential within 200–500 meters.

---

## 1. Goal

Make it as easy for a neighbor to offer their skills, food, time, or goods as it is for them to post a photo — while giving buyers a safe, rated, payment-enabled experience with the same trust infrastructure as formal merchants.

---

## 2. The Four Peer Roles

| Role | What they offer | Primary transaction | Typical earner |
|---|---|---|---|
| **Cook** | Home-cooked food, tiffins, baked goods, specialty items | Pre-order with cutoff time | Homemaker, retired person, food enthusiast |
| **Rider** | Errands, local delivery, quick runs | On-demand or scheduled per-trip fee | Anyone with time + a vehicle/legs |
| **Coach** | Yoga, fitness, music, academics, dance, language | Session or batch booking | Trained professional, hobbyist with skill |
| **Reseller** | Pre-owned or sourced goods relisted to neighbors | Fixed price listing with buyer chat | Anyone who finds deals and resells |

---

## 3. User Stories

### Cook
- **US-5.1** As a cook, I publish today's menu (items, price, servings, cutoff time) in one tap.
- **US-5.2** As a cook, I choose: pickup from my door or doorstep delivery within my locality.
- **US-5.3** As a cook, I accept or reject orders within 15 minutes.
- **US-5.4** As a cook, I see my order queue for today and mark each complete.
- **US-5.5** As a cook, I get paid instantly to my Lokul Wallet after delivery/pickup confirmation.
- **US-5.6** As a cook, I can set recurring weekly schedules (e.g., every weekday lunch).
- **US-5.7** As a buyer, I see a cook's menu, ratings, past reviews, and cuisine type before ordering.
- **US-5.8** As a buyer, I can subscribe to a cook's weekly tiffin service with auto-debit.

### Rider
- **US-5.9** As a rider, I toggle "I'm available" and immediately appear on the Rider board.
- **US-5.10** As a rider, I set my mode: Errand (shopping, pickup), Delivery (from a neighbor/shop), or Both.
- **US-5.11** As a neighbor, I post an errand request ("Need someone to pick up medicines from Sharma Medical") with my offered price.
- **US-5.12** As a rider, I see requests within my radius and accept one.
- **US-5.13** As a rider, I confirm completion; buyer confirms receipt; payment releases from escrow.
- **US-5.14** As a rider, I can also do deliveries for local businesses (kirana, home cooks) as a third-party.

### Coach
- **US-5.15** As a coach, I list my discipline, session types (1-1, group), and schedule.
- **US-5.16** As a coach, I create a batch with: name, schedule (days + time), venue (my home / student's home / community space / online), capacity, price.
- **US-5.17** As a student, I can browse coaches within 500m, view their schedule, and book a trial session.
- **US-5.18** As a coach, I manage bookings via a calendar view and block unavailable times.
- **US-5.19** As a coach, I set a "Trial class" option (free or discounted) to attract first-time students.
- **US-5.20** As a student, I can join a monthly subscription to a coach's batch with auto-debit.

### Reseller
- **US-5.21** As a reseller, I list an item with my asking price and source (purchased, received, traded).
- **US-5.22** As a buyer, I can see if a seller is a "Reseller" (badge), not the original owner.
- **US-5.23** As a reseller, I can bundle multiple items into a lot.
- **US-5.24** As a reseller, my trust score and review history are visible; frequent resellers get a "Trusted Reseller" badge.

---

## 4. UX Flows

### 4.1 Activating a Peer Role

```
Profile → "My Roles" tab
  → [+ Activate a role]
  → Pick role: Cook / Rider / Coach / Reseller
  → Role-specific setup wizard:

Cook wizard:
  1. Cuisine types (multi-select: North Indian, South Indian, Continental, Baked goods, etc.)
  2. Delivery option (Pickup only / Doorstep within _m / Both)
  3. Payment: In-app (recommended) / Cash / Both
  4. "Add your first menu" → go to Menu Editor

Rider wizard:
  1. Mode: Errand / Delivery / Both
  2. Vehicle: On foot / Bicycle / Scooter / Car
  3. Service radius: 300m / 500m / 1km
  4. Rate structure: Per trip flat fee OR per km (set default)

Coach wizard:
  1. Discipline (multi-select)
  2. Session types: 1-1 / Group batch / Online / In-person
  3. Venue preference
  4. Create first batch or session slot

Reseller wizard:
  1. What do you usually sell? (multi-select tags)
  2. Add first listing (or skip)
```

### 4.2 Cook — Daily Menu Post Flow

```
Role Mode: Cook (active context)
  → + Post Menu
  → Menu Editor:
      Meal type: Breakfast / Lunch / Dinner / Snacks / Special
      Items: [+ Add Item]
        Name, Photo, Price, Servings available
        (repeat for each item)
      Cutoff time: [time picker]
      Delivery: Pickup / Doorstep (radius: ___m)
      Delivery charge: ₹0 / ₹10 / ₹20 / custom
      Note: (optional text, e.g., "No onion-garlic today")
  → Preview → Post to Feed
  → Appears in feed as food_menu post + in Daily Specials card (if before 11am)
```

### 4.3 Buyer — Order Flow from Cook

```
Feed → Cook's menu post → [Order →]
  → Item picker (select qty for each item)
  → Delivery preference: Pickup / Doorstep
  → Address (default: home; editable)
  → Payment: Wallet / UPI / Cash
  → Order summary → Confirm
  → Order sent to cook
  → Cook accepts / rejects within 15 min
    → On accept: buyer gets push, order confirmed
    → On reject: auto-refund within 5 min
  → On completion: cook taps "Ready" / "Delivered"
    → Buyer confirms receipt or auto-confirm after 2h
  → Funds released to cook's wallet
  → Rating prompt (1–5 stars + text)
```

### 4.4 Rider — Errand Request Flow

```
Resident → + → "I need an errand done"
  → Errand type: Grocery pickup / Medicine pickup / Document drop / Parcel delivery / Other
  → Describe errand (text, ≤200 chars)
  → Pick up from: [address or "I'll specify later"]
  → Deliver to: [my address / other address]
  → Offered price: ₹___ (auto-suggest based on distance)
  → Urgency: ASAP / Within 1h / Within 3h / Flexible
  → Post errand → visible to riders within radius
  
Rider → sees errand on Rider Board → taps "Accept"
  → Errand chat opens with resident
  → Rider completes → resident confirms → payment released
```

### 4.5 Coach — Batch Booking Flow

```
Discovery → Coaches (category) → Coach profile
  → View batches / sessions
  → Pick batch → "Book Trial" or "Join Batch"
  → Trial: free or discounted slot selection
  → Batch: schedule shown, monthly fee, join
  → Payment: Wallet / UPI
  → Confirmation → added to batch member list
  → Batch chat created (coach + all batch members)
```

---

## 5. Functional Requirements

### General (all peer roles)
- **FR-5.1** All peer roles require Silver KYC to go live.
- **FR-5.2** Peer roles are activated on the personal profile; no separate account.
- **FR-5.3** All peer transactions use the same wallet/escrow infrastructure as formal merchants (module 08).
- **FR-5.4** Platform take-rate on in-app paid peer transactions: 5% (same as formal merchants).
- **FR-5.5** Cash transactions allowed; Lokul does not facilitate those payments (no escrow for cash).
- **FR-5.6** Every peer seller has a unified rating (across all their roles) visible on their profile.
- **FR-5.7** A peer seller can deactivate a role at any time; active bookings/orders must be completed first.

### Cook
- **FR-5.8** Menu posts are ephemeral: auto-expire when cutoff passes. Cook can repost for dinner.
- **FR-5.9** Maximum menu posts per day: 3 (breakfast, lunch, dinner/snacks).
- **FR-5.10** Items per menu post: max 8.
- **FR-5.11** Servings field is mandatory per item; decrements in real-time on each order.
- **FR-5.12** Cook can set a home delivery radius (e.g., only within 200m). Orders outside radius offered as pickup-only.
- **FR-5.13** Tiffin subscription: weekly / monthly; subscriber auto-charged on each delivery day; cancellable with 3-day notice.
- **FR-5.14** Cook profile shows: cuisine tags, avg rating, total orders served, active since.
- **FR-5.15** Dietary tags: Jain, Vegan, Vegetarian, Non-vegetarian, Nut-free, Gluten-free — optional per item.
- **FR-5.16** Hygiene badge: auto-awarded after 50 orders with avg rating ≥ 4.5 and zero food-safety reports.

### Rider
- **FR-5.17** Rider availability is a real-time toggle. "Available" status shown on map and Rider board.
- **FR-5.18** Rider board: list of active riders within the user's radius, sorted by distance + rating.
- **FR-5.19** Errand request is visible to riders for 10 min; if no accept, requester gets a "No riders available" push and can increase offered price or wait.
- **FR-5.20** Rider can carry 1 active errand at a time (queue cap); second accepted only after first complete.
- **FR-5.21** Rider photo-proof required for delivery: photo of item delivered / dropped at door (uploaded in app).
- **FR-5.22** Rider earns only after resident confirms receipt or after 2h auto-confirm.
- **FR-5.23** Rider can be "hired" by local businesses (kirana, cook) for regular delivery slots; negotiated via chat, paid per trip.

### Coach
- **FR-5.24** Batch capacity: min 1, max 30 participants (coach sets limit).
- **FR-5.25** Batch schedule types: `one_time`, `weekly_recurring`, `monthly_series`.
- **FR-5.26** Trial class: max 1 per student per coach. After trial, student can join batch.
- **FR-5.27** Coach dashboard: earnings this month, batch fill rate, attendance per session, ratings.
- **FR-5.28** Batch chat auto-created with coach as admin; all batch members added.
- **FR-5.29** Coach can mark attendance per session; students see their attendance in profile.
- **FR-5.30** Monthly subscription auto-debit: 7 days before billing date, student gets push; can cancel before debit. Failed debit → student moved to inactive status; slot freed after 48h.

### Reseller
- **FR-5.31** Reseller badge displayed on all listings to maintain transparency.
- **FR-5.32** Reseller uses the same classifieds infrastructure (module 09) with an additional `is_resale` flag and `source` field ('purchased'|'received'|'traded').
- **FR-5.33** Trusted Reseller badge: ≥ 20 completed sales, avg rating ≥ 4.3, zero fraud reports.
- **FR-5.34** Resellers can create "Lot listings" (bundle 2–5 items at a single price).

---

## 6. Data Model

```sql
peer_roles
  user_id (FK), role ('cook'|'rider'|'coach'|'reseller')
  status ('active'|'paused'|'deactivated')
  activated_at, paused_at
  -- composite PK (user_id, role)

cook_profiles
  user_id (FK, PK)
  cuisine_tags TEXT[]
  dietary_tags TEXT[]
  delivery_kind ('pickup'|'doorstep'|'both')
  delivery_radius_m
  accepts_cash (bool)
  rating_avg, rating_count, total_orders
  hygiene_badge (bool)

food_menus
  id (ULID, PK)
  cook_user_id (FK)
  meal_type ('breakfast'|'lunch'|'dinner'|'snacks'|'special')
  cutoff_at
  delivery_charge_paise
  note
  status ('open'|'cutoff_passed'|'sold_out'|'cancelled')
  post_id (FK posts)     -- linked feed post
  created_at

food_menu_items
  id, menu_id (FK)
  name, description, photo_url
  price_paise
  servings_total, servings_left
  dietary_tags TEXT[]

food_orders
  id (ULID, PK)
  menu_id (FK), buyer_user_id (FK), cook_user_id (FK)
  items_json   -- [{item_id, qty, price_paise}]
  delivery_kind ('pickup'|'doorstep')
  delivery_address_text, delivery_lat, delivery_lng
  total_paise, delivery_charge_paise
  payment_method ('wallet'|'upi'|'cash')
  status ('pending'|'accepted'|'rejected'|'ready'|'delivered'|'completed'|'cancelled')
  txn_id (FK nullable)
  created_at, accepted_at, completed_at

tiffin_subscriptions
  id, cook_user_id, subscriber_user_id
  meal_type, delivery_kind
  days_of_week INT[]   -- [1,2,3,4,5] = Mon–Fri
  price_paise_per_delivery
  billing_period ('weekly'|'monthly')
  status ('active'|'paused'|'cancelled')
  next_billing_at
  created_at

rider_profiles
  user_id (FK, PK)
  mode ('errand'|'delivery'|'both')
  vehicle ('foot'|'bicycle'|'scooter'|'car')
  service_radius_m
  default_rate_paise_per_trip
  available (bool)
  rating_avg, rating_count, total_trips

errand_requests
  id (ULID, PK)
  requester_user_id (FK)
  errand_type ('grocery'|'medicine'|'document'|'parcel'|'other')
  description
  pickup_address, pickup_lat, pickup_lng
  dropoff_address, dropoff_lat, dropoff_lng
  offered_price_paise
  urgency ('asap'|'1h'|'3h'|'flexible')
  status ('open'|'accepted'|'in_progress'|'completed'|'cancelled'|'expired')
  rider_user_id (FK nullable)
  expires_at   -- open for 10 min
  proof_photo_url
  txn_id (FK nullable)
  created_at, completed_at

coach_profiles
  user_id (FK, PK)
  disciplines TEXT[]
  session_types TEXT[]
  venue_preference ('home'|'student_home'|'community'|'online'|'flexible')
  rating_avg, rating_count, total_students

coach_batches
  id (ULID, PK)
  coach_user_id (FK)
  name, description, discipline
  schedule_type ('one_time'|'weekly_recurring'|'monthly_series')
  schedule_json   -- {dow: [1,3,5], start: '07:00', duration_min: 60} or specific dates
  venue_kind, venue_address, online_url
  capacity, enrolled_count
  price_paise    -- per session OR per month
  billing_period ('per_session'|'monthly')
  trial_price_paise (nullable, 0 = free trial)
  status ('upcoming'|'active'|'completed'|'cancelled')
  chat_thread_id (FK)
  created_at

batch_enrollments
  id, batch_id (FK), student_user_id (FK)
  joined_at, trial_completed (bool)
  subscription_id (FK nullable)
  status ('trial'|'active'|'inactive'|'cancelled')

batch_attendance
  batch_id, session_date, student_user_id
  status ('present'|'absent'|'late')
  marked_by (coach)

coach_subscriptions
  id, batch_id, student_user_id
  price_paise_per_period, billing_period
  next_billing_at, status ('active'|'paused'|'cancelled')

peer_ratings
  id, rated_user_id, rater_user_id
  role ('cook'|'rider'|'coach'|'reseller')
  reference_id  -- order_id / errand_id / batch_enrollment_id / classified_id
  rating (1–5), body, created_at
```

---

## 7. APIs

```
# Role management
GET   /v1/me/roles                     → [{ role, status, profile }]
POST  /v1/me/roles                     { role }  → activates (needs Silver)
DELETE /v1/me/roles/:role

# Cook
GET   /v1/cook/profile
PATCH /v1/cook/profile                 { cuisine_tags, delivery_kind, delivery_radius_m }

POST  /v1/food-menus                   { meal_type, cutoff_at, items[], delivery_charge_paise, note }
GET   /v1/food-menus/today             → cook's menus for today
PATCH /v1/food-menus/:id/items/:item_id { servings_left }
POST  /v1/food-menus/:id/close

GET   /v1/food-orders                  ?role=cook|buyer&status=
POST  /v1/food-orders                  { menu_id, items[], delivery_kind, address, payment_method }
POST  /v1/food-orders/:id/accept
POST  /v1/food-orders/:id/reject       { reason }
POST  /v1/food-orders/:id/ready
POST  /v1/food-orders/:id/delivered    { proof_photo_url? }
POST  /v1/food-orders/:id/complete     (buyer confirms)
POST  /v1/food-orders/:id/rate         { rating, body }

POST  /v1/tiffin-subscriptions         { cook_user_id, meal_type, days_of_week, price_paise, billing_period }
DELETE /v1/tiffin-subscriptions/:id

# Rider
GET   /v1/rider/profile
PATCH /v1/rider/profile                { mode, vehicle, service_radius_m, default_rate_paise }
PATCH /v1/rider/available              { available: bool }

GET   /v1/errands?radius_m=            → open errand requests
POST  /v1/errands                      { errand_type, description, pickup, dropoff, price_paise, urgency }
POST  /v1/errands/:id/accept           (rider)
POST  /v1/errands/:id/complete         { proof_photo_url }  (rider)
POST  /v1/errands/:id/confirm          (buyer confirms)
POST  /v1/errands/:id/cancel           { reason }

GET   /v1/riders/nearby?radius_m=      → active riders

# Coach
GET   /v1/coach/profile
PATCH /v1/coach/profile                { disciplines[], session_types[], venue_preference }

POST  /v1/coach/batches                { name, discipline, schedule_type, schedule_json, venue, capacity, price_paise, trial_price_paise }
GET   /v1/coach/batches
PATCH /v1/coach/batches/:id
DELETE /v1/coach/batches/:id

POST  /v1/batches/:id/enroll           { as_trial: bool }
DELETE /v1/batches/:id/enroll

POST  /v1/batches/:id/attendance       { session_date, records: [{student_id, status}] }
GET   /v1/batches/:id/attendance?month=

POST  /v1/coach/batches/:id/subscriptions   { student_user_id } → subscription
DELETE /v1/coach/subscriptions/:id

# Discovery
GET   /v1/cooks/nearby?radius_m=&cuisine=   → cook profiles with today's menu
GET   /v1/riders/nearby?radius_m=
GET   /v1/coaches/nearby?radius_m=&discipline=

# Ratings
POST  /v1/peer-ratings                 { rated_user_id, role, reference_id, rating, body }
GET   /v1/users/:id/ratings?role=
```

---

## 8. Edge Cases

- **EC-5.1** Cook posts menu but goes offline before cutoff → system auto-closes menu at cutoff; pending orders auto-cancelled + refunded.
- **EC-5.2** Order accepted but cook runs out of ingredient → cook can cancel individual item from accepted order; partial refund issued.
- **EC-5.3** Rider accepts errand then can't go → rider must cancel; 2 cancellations in 24h → 1h "cooldown" (removed from rider board).
- **EC-5.4** No riders accept errand in 10 min → request expires; requester notified with "Try increasing price" suggestion.
- **EC-5.5** Buyer pays for food order but cook is Silver downgraded during dispute → escrow held; Lokul support mediates.
- **EC-5.6** Coach batch under-enrolled (< 3 students by 24h before first session) → coach can cancel with full refund or proceed with low enrollment.
- **EC-5.7** Student misses 3 consecutive batch sessions → coach gets option to remove and free slot; student notified.
- **EC-5.8** Tiffin subscription: auto-debit fails (insufficient wallet balance) → 3 retries over 24h; on final fail, subscription paused; cook notified.
- **EC-5.9** Cook receives order after cutoff (clock drift) → server time authoritative; order rejected silently; buyer sees "Ordering closed."
- **EC-5.10** Reseller marks item "sold" offline (outside Lokul) → must manually mark sold in app; buyer who messaged gets auto-notification.

---

## 9. Metrics

| Metric | Target |
|---|---|
| Active cooks / locality (500 residents) | ≥ 5 |
| Cook menu → order conversion | ≥ 18% |
| Cook avg orders / active day | ≥ 6 |
| Active riders / locality | ≥ 3 |
| Errand request → accept rate | ≥ 70% within 10 min |
| Active coaches / locality | ≥ 2 |
| Coach batch fill rate | ≥ 60% of capacity |
| Tiffin subscription retention (30-day) | ≥ 65% |
| Peer role rating avg across platform | ≥ 4.3 |

---

## 10. Dependencies

- Module 01 (Silver KYC to activate role)
- Module 02 (food menu posts in feed)
- Module 08 (wallet / escrow / payouts)
- Module 12 (push notifications for orders, errand requests)
- Module 14 (map for rider location)
- Module 17 (multi-role profile display)
- Module 18 (moderation of peer listings and food safety reports)
- Ably for real-time servings count and rider availability

---

## 11. Out of Scope (v2.0)

- Full restaurant-style multi-table ordering
- Rider fleet management (for businesses hiring multiple riders)
- Rider GPS live tracking during errand (chat-based updates only)
- Cook's own delivery app (riders are optional, not mandated)
- Coach live-streaming classes
- Reseller auction / bidding
- Group coaching via video call (online link provided; video infra not hosted)
- Background check / police verification for riders (manual recommendation only)
