# 10 — Map, Discovery & Carpool

> A live map of the neighborhood that shows safety incidents, events, merchants — plus a carpool matcher.

---

## 1. Goal

Give residents a visual sense of their hyperlocal world ("what's happening near me right now") and reduce daily commute costs via carpool matching with verified neighbors.

---

## 2. User stories

### Map & Discovery
- **US-10.1** As a resident, I can open a map centered on my society and see pinned: live safety incidents, events today, top-rated merchants nearby.
- **US-10.2** As a resident, I can filter the map by category.
- **US-10.3** As a resident, I can tap a pin to see details and act (RSVP, book, react).
- **US-10.4** As a new resident, I can use "Discover" cards: top 5 maids, top 5 tiffins, this week's events.

### Carpool
- **US-10.5** As a commuter, I can post a recurring trip (Mon-Fri 9am, Andheri E → BKC).
- **US-10.6** As a passenger, I can find a driver going my way and request a seat.
- **US-10.7** As driver+passenger, we settle costs in-app via wallet split.
- **US-10.8** Both parties can rate each other after a trip.

---

## 3. UX flows

### 3.1 Map

```
Tab 4: Map → Map view centered on user (or society)
- Layer toggles: Safety · Events · Merchants · Lost&Found · Carpool
- Heat overlay for incident density (last 24h)
- Tap pin → bottom sheet with details + CTA
```

### 3.2 Discover

```
Marketplace → "Discover" chip → cards:
- Top maids near you
- This week's events
- New merchants
- Trending posts
- Carpool routes near your work address
```

### 3.3 Carpool — driver

```
+ → Carpool → "I'm driving" → From + To (route preview via Ola Maps) →
Recurring (days/times) or one-shot → Seats available → Cost per seat →
Vehicle info → Post
```

### 3.4 Carpool — passenger

```
+ → Carpool → "I need a ride" → From + To + when → Search →
Matched drivers list (same direction, ≤500m detour) → Request seat →
Driver accepts → Chat opens → On trip day: tap "Started" / "Arrived"
```

---

## 4. Functional requirements

### Map
- **FR-10.1** Map provider: Google Maps SDK (display only); reverse-geocode via Ola Maps API.
- **FR-10.2** Pin sources: live incidents (module 03), events upcoming today (module 08), merchants `available_now=true` (module 05), open lost posts (module 09), active carpool offers.
- **FR-10.3** Clustering when zoom < 14; expanded pins above.
- **FR-10.4** Heat overlay for safety: kernel density of last 24h safety posts; colored by severity.
- **FR-10.5** Filter chips above map: Safety, Events, Merchants, Lost, Carpool.
- **FR-10.6** Default radius: 1km from user; user can pan/zoom anywhere (data still bounded by their PIN + adjacent PINs to limit cost).

### Discovery cards
- **FR-10.7** Cards generated server-side daily: top-N rankings of merchants, this-week events list, trending posts (by interaction/age).
- **FR-10.8** Personalisation: weighted by user's saved categories + past interactions; cold-start uses society-level defaults.

### Carpool
- **FR-10.9** Trip types: `recurring` (weekly schedule) or `one_shot` (date+time).
- **FR-10.10** Route: origin + destination (lat/lng); polyline computed via Ola Maps; matching uses Hausdorff-like detour heuristic.
- **FR-10.11** Match criteria: passenger's pickup ≤ 500m off driver's route AND passenger's drop ≤ 500m off route AND time window overlap ≥ 30 min.
- **FR-10.12** Seats: 1–4; cost_per_seat_paise set by driver (capped by Lokul at city benchmark + 30%).
- **FR-10.13** Booking: passenger requests; driver accepts → seat held; auto-debit on `trip_started`.
- **FR-10.14** Cancellation: free up to 1h before; ₹20 fee within 1h; ₹50 no-show fee.
- **FR-10.15** Eligibility: both driver and passenger must be Silver+ AND in the same OR adjacent PIN.
- **FR-10.16** Driver verification (Gold-only) required if collecting payments; cash carpools allowed for Silver but Lokul does not facilitate payment.
- **FR-10.17** Live trip: driver + passenger share live location during the trip (Ably channel `trip:{id}`); auto-stops at `arrived`.
- **FR-10.18** Rating both ways; 1–5 stars; affects trust score.

---

## 5. Data model

```
# Map data is largely views over existing tables; no new entity for map itself.

discover_rankings
  society_id, kind ('merchants'|'events'|'trending'), payload_json
  computed_at

carpool_trips
  id (ULID), driver_id (FK users)
  trip_kind ('recurring'|'one_shot')
  schedule_json     -- e.g. {dow: [1,2,3,4,5], start: '09:00', end: '09:30'}
  one_shot_at (nullable)
  origin_lat, origin_lng, origin_label
  dest_lat, dest_lng, dest_label
  route_polyline
  seats_total, seats_available
  cost_per_seat_paise
  vehicle_type ('car'|'bike'|'auto')
  vehicle_meta_json
  status ('active'|'paused'|'archived')
  created_at

carpool_bookings
  id, trip_id (FK), passenger_id (FK)
  trip_date     -- the specific date being booked
  pickup_lat, pickup_lng, drop_lat, drop_lng
  cost_paise
  status ('requested'|'accepted'|'rejected'|'cancelled'|'started'|'completed'|'no_show')
  payment_txn_id
  created_at, started_at, completed_at

carpool_ratings
  booking_id, rater_user_id, rated_user_id, rating (1-5), note
```

---

## 6. APIs

```
# Map
GET  /v1/map/pins?bbox=lat1,lng1,lat2,lng2&layers=safety,events,merchants

# Discover
GET  /v1/discover?society_id=&kinds=merchants,events,trending

# Carpool
POST /v1/carpool/trips
GET  /v1/carpool/trips?from=lat,lng&to=lat,lng&when=
PATCH /v1/carpool/trips/:id
DELETE /v1/carpool/trips/:id

POST /v1/carpool/bookings        { trip_id, trip_date, pickup, drop }
POST /v1/carpool/bookings/:id/accept
POST /v1/carpool/bookings/:id/reject
POST /v1/carpool/bookings/:id/start
POST /v1/carpool/bookings/:id/complete
POST /v1/carpool/bookings/:id/cancel
POST /v1/carpool/bookings/:id/rate { rating, note }
```

**Realtime:** `trip:{booking_id}` for live location while `started`.

---

## 7. Edge cases

- **EC-10.1** GPS off → map opens at society centroid with a banner "Showing approximate area".
- **EC-10.2** Carpool detour exceeds threshold → match excluded.
- **EC-10.3** Driver no-show → passenger marks `no_show`; driver penalty + auto-refund.
- **EC-10.4** Vehicle changed at trip time → driver updates vehicle_meta; passenger notified.
- **EC-10.5** Map cluster contains 100+ pins → only top 20 by recency rendered; "+N more" badge.
- **EC-10.6** Carpool route polyline very long (cross-city) → API caps at 50km point-to-point.
- **EC-10.7** Driver paused trip mid-week → existing accepted bookings honored; future requests blocked.
- **EC-10.8** Passenger underage (DOB indicates < 18) → blocked from carpool unless parent confirmed.

---

## 8. Metrics

| Metric | Target |
|---|---|
| Map tab opens / DAU | ≥ 0.3 |
| Pin tap-through rate | ≥ 15% |
| Carpool trips active / city | ≥ 200 (Mumbai T+6mo) |
| Carpool match success | ≥ 25% of passenger requests |
| Avg cost saving per passenger trip | ≥ ₹80 vs auto |
| Carpool repeat rate | ≥ 50% within 14d |

---

## 9. Dependencies

- Ola Maps API (geocoding, route, ETA).
- Google Maps SDK (display).
- Payments module 06 (wallet split).
- Trust score module 13.
- Moderation module 14 (driver/passenger reports).

---

## 10. Out of scope (v1.0)

- Cross-city / intercity rides.
- Live driver tracking before pickup (only during trip).
- Multi-passenger pickups along the route in one trip (each passenger is a single booking in v1).
- Cab aggregator integration (Ola/Uber redirect).
- EV / sustainability score.
- Ride-pooling for school children (regulated, deferred).
