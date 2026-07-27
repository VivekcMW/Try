# 08 — Events & Stories

> Society events + short-lived Stories/Status for casual sharing.

---

## 1. Goal

Make society events frictionless to host and join, and give residents a casual "what's happening right now" surface via 24h Stories.

---

## 2. User stories

- **US-8.1** As a resident, I can create an event (Garba night, kids' workshop) with RSVP.
- **US-8.2** As a resident, I can RSVP yes/no/maybe and see who else is going.
- **US-8.3** As an RWA admin, I can host paid events with ticket fees.
- **US-8.4** As a resident, I can post a 24h Story (image/video) visible to my society.
- **US-8.5** As a resident, I can see Stories at the top of my Feed.
- **US-8.6** As a resident, I get a push 1h before any event I RSVP'd "yes" to.

---

## 3. UX flows

### 3.1 Events list

```
Feed → "Events" chip → Upcoming events list
- Card: title, date, going-count, RSVP CTA
```

### 3.2 Create event

```
+ → Event → Title, date+time, location (society/tower/external address),
visibility, capacity (optional), ticket fee (optional, ₹0 default),
description, cover photo → Post
```

### 3.3 Stories

```
Top of Feed: avatar ring (unread) → tap → full-screen story player →
swipe / tap to advance, hold to pause, swipe-up to react/reply
- + Story button: camera → capture image/video (≤15s) → text/sticker → Post
```

---

## 4. Functional requirements

### Events
- **FR-8.1** Event fields: title, description, start, end, location (lat/lng or "Online"), capacity (nullable), ticket_fee_paise (default 0), visibility, cover photo.
- **FR-8.2** RSVP states: `yes`, `maybe`, `no`, `waitlist` (if capacity reached).
- **FR-8.3** Capacity enforcement: first-come; "yes" demoted to waitlist when full.
- **FR-8.4** Ticketed events: payment via wallet/UPI required to RSVP "yes"; refund on event cancellation.
- **FR-8.5** Only Gold users can create ticketed events (anti-fraud).
- **FR-8.6** Event reminders: T-24h, T-1h pushes.
- **FR-8.7** Event comments allowed (like a post).
- **FR-8.8** Post-event: organizer can post photo recap; pinned for 48h.
- **FR-8.9** Cancellation: organizer flags `cancelled`; all RSVP'd users pushed; ticket refunds auto-initiated.

### Stories
- **FR-8.10** Story media: 1 image (max 5MB) OR 1 video (≤15s, ≤30MB).
- **FR-8.11** Story lifetime: 24h from post; auto-deleted after.
- **FR-8.12** Story visibility: society only (no neighborhood-wide Stories at v1).
- **FR-8.13** Reactions to Stories: 5 emojis; replies sent as DMs.
- **FR-8.14** Story view count visible to author only.
- **FR-8.15** Only Silver+ can post Stories.
- **FR-8.16** Stories max 5 per user per 24h (anti-spam).
- **FR-8.17** Stories appear in chronological order; viewed Stories greyed out.

---

## 5. Data model

```
events
  id (ULID), organizer_id (FK users), society_id
  title, description, cover_photo_url
  start_at, end_at, timezone ('Asia/Kolkata')
  location_kind ('society'|'external'|'online')
  location_text, lat, lng, online_url
  capacity (int nullable)
  ticket_fee_paise (default 0)
  visibility ('society'|'neighborhood')
  status ('upcoming'|'live'|'past'|'cancelled')
  created_at

rsvps
  event_id, user_id
  status ('yes'|'maybe'|'no'|'waitlist')
  payment_txn_id (nullable for free events)
  rsvped_at

stories
  id, author_id, society_id
  media_kind ('image'|'video')
  storage_key, duration_ms
  expires_at  -- created_at + 24h
  view_count

story_views
  story_id, viewer_id, viewed_at

story_reactions
  story_id, user_id, emoji
```

---

## 6. APIs

```
GET    /v1/events?society_id=&from=&to=
GET    /v1/events/:id
POST   /v1/events
PATCH  /v1/events/:id
POST   /v1/events/:id/cancel
POST   /v1/events/:id/rsvp           { status } → handles payment & waitlist
DELETE /v1/events/:id/rsvp
GET    /v1/events/:id/attendees      (organizer only)

GET    /v1/stories?society_id=
POST   /v1/stories                   multipart media
DELETE /v1/stories/:id
POST   /v1/stories/:id/view
POST   /v1/stories/:id/reactions     { emoji }
```

---

## 7. Edge cases

- **EC-8.1** Event date in the past → API rejects.
- **EC-8.2** Capacity reduced after RSVPs → existing "yes" preserved; new "yes" go to waitlist.
- **EC-8.3** Organizer leaves society → event ownership transfers to RWA admin or cancels.
- **EC-8.4** Ticketed event: payment success but RSVP write fails → auto-refund via reconciliation.
- **EC-8.5** Story upload while offline → queued; published on reconnect (timer starts from upload time, not capture).
- **EC-8.6** Story video over 15s → trim on client, reject on server.
- **EC-8.7** Story containing reported content → hidden + 24h timer continues; archived to mod queue.
- **EC-8.8** Reminder push fails (device offline) → no retry past event start.

---

## 8. Metrics

| Metric | Target |
|---|---|
| Events / active society / month | ≥ 4 |
| RSVP yes rate per event | ≥ 25% |
| % RSVPs that attend (organizer-confirmed) | ≥ 60% |
| Stories posters / WAU | ≥ 12% |
| Story view-through rate | ≥ 45% |
| Reactions per Story | ≥ 1.5 |

---

## 9. Dependencies

- Payments module 06 for ticketed events.
- Notifications module 12 for reminders.
- Cloudflare Stream for Story video transcoding.
- Cron worker for story expiry + reminder dispatch.

---

## 10. Out of scope (v1.0)

- Event ticket transfers / resale.
- Recurring events (weekly yoga) — manual re-creation in v1.
- Event check-in via QR.
- Story highlights / archives.
- Cross-society event discovery.
- Live streaming.
- Calendar export (.ics) — deferred to v1.1.
