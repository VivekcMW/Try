# 02 — Home Feed & Radius Control (v2)

> The single surface where every resident, business, peer seller, and community organizer communicates with their locality — scoped to a user-controlled radius of 200m to 5km.

---

## 1. Goal

Make Lokul the **first thing opened every morning**: a feed where a safety alert, a neighbor's biryani listing, the kirana's fresh mango stock, an evening yoga class, and a society notice all coexist — hyper-relevant, real, and within walking distance.

---

## 2. User Stories

- **US-2.1** As a resident, I open the app and immediately see what's happening within 200m of my home.
- **US-2.2** As a resident, I can slide the radius selector to see 500m, 2km, or 5km content.
- **US-2.3** As a resident, I can filter the feed by type: All / Community / Shop Local / Peer Services / Safety / Events.
- **US-2.4** As a resident, I can post updates, safety alerts, events, polls, sell items, or offer services in one tap.
- **US-2.5** As a cook, my "Today's Menu" post appears in the feed with an Order button at the top of relevant neighbors' feeds.
- **US-2.6** As a local business, I can post announcements ("Fresh Alphonso mangoes arrived!") that appear in the feed with a "Shop" CTA.
- **US-2.7** As a resident, I see "Daily Specials" — a morning card summarizing available tiffins and local shop offers nearby.
- **US-2.8** As a resident, I can react, comment, share, save, and report any post.
- **US-2.9** As a resident, I see Stories (24h) from neighbors and local businesses at the top of the feed.
- **US-2.10** As a resident, I get an AI Digest card ("3 things you missed") at the top if I haven't opened in >6 hours.

---

## 3. UX Flows

### 3.1 Feed View

```
Feed Tab opens:
  ┌─────────────────────────────────────────┐
  │  [Stories row — neighbors + businesses] │
  ├─────────────────────────────────────────┤
  │  Radius: [200m] [500m] [2km] [5km]      │  ← sticky selector
  │  Filter: [All][Community][Shop][Peers]  │
  ├─────────────────────────────────────────┤
  │  📋 Daily Specials card (morning only)  │  ← tiffins + shop offers
  │  📌 Pinned: SOS / RWA Notice            │
  │  🤖 AI Digest card (if >6h gap)         │
  │  ─────── chronological posts ──────     │
  │  [Resident post]                        │
  │  [Cook post: "Biryani today — 10 left"] │  Order ↗
  │  [Kirana post: "Mangoes ₹80/kg"]        │  Shop ↗
  │  [Event post: "Yoga 6am tomorrow"]      │  RSVP ↗
  │  [Safety post: "Suspicious vehicle"]    │  ⚠️ pinned
  │  [Community post: "Morning walk 6am"]   │
  │  ...infinite scroll                     │
  └─────────────────────────────────────────┘
```

### 3.2 Radius Selector

```
Tap a radius chip:
  200m  → only immediate building cluster / street
  500m  → your neighborhood block
  2km   → your ward / locality
  5km   → your PIN code area

Feed re-renders instantly with radius-filtered content.
Radius preference saved per user; defaults to 500m for new users.
```

### 3.3 Feed Filters

```
Tabs below radius selector:
  All          → everything within radius
  Community    → resident posts, RWA notices, polls, lost & found
  Shop Local   → business posts, business offers, daily specials
  Peer Services→ cook menus, rider availability, coach sessions
  Safety       → safety alerts, SOS (always all radii)
  Events       → upcoming events within radius
```

### 3.4 Post Composer (+ button)

```
Tap + → Composer bottom sheet:
  ┌──────────────────────────────────────────┐
  │  What do you want to do?                 │
  │                                          │
  │  📝 Share an update                      │
  │  ⚠️  Post a safety alert                 │
  │  🍱 Share today's food menu  [Cook only] │
  │  🛍️  Sell something                      │
  │  🎉 Create an event                      │
  │  📊 Run a poll                           │
  │  🔍 Lost & found                         │
  │  👥 Create a community    [Silver+]      │
  │  🏪 Post for my business  [Biz profile] │
  └──────────────────────────────────────────┘

Each option opens its dedicated composer:
  - Update: text + media + visibility + tags
  - Food menu: today's menu editor (see module 05)
  - Business post: attached to business profile automatically
  - Community: new community setup wizard (module 10)
```

### 3.5 Business Post Appearance in Feed

```
┌──────────────────────────────────────────┐
│ 🏪 Sharma Kirana · 180m away  Verified ✓│
│ "Ratnagiri Alphonso mangoes arrived!     │
│  ₹80/dozen. First come first served.    │
│  Limited stock — 20 dozens only."        │
│  [Photo of mangoes]                      │
│                                          │
│  👍 14    💬 3    [Save]   [Shop →]      │
└──────────────────────────────────────────┘
```

### 3.6 Cook Post Appearance in Feed

```
┌──────────────────────────────────────────┐
│ 👩‍🍳 Meena's Kitchen · 3rd Floor  ⭐4.9   │
│ "Today's Lunch — Rajma Chawal + Salad   │
│  ₹80/plate · 12 servings left           │
│  Cutoff: 11:00 AM · Pickup or deliver"  │
│  [Food photo]                            │
│                                          │
│  👍 8    💬 2    [Save]   [Order →]      │
└──────────────────────────────────────────┘
```

### 3.7 Daily Specials Card (Morning, 6am–11am)

```
┌──────────────────────────────────────────┐
│ 🌅 Good morning! Here's what's nearby:  │
│                                          │
│  🍱 3 home cooks have lunch ready        │
│     Meena's Kitchen · Rekha's Tiffin...  │
│  🛒 2 shops with fresh stock today       │
│     Sharma Kirana · Fresh Farms          │
│  🏋️ Yoga batch starting at 7am           │
│     Coach Anita · 300m away              │
│                                          │
│           [See All →]                    │
└──────────────────────────────────────────┘
```

### 3.8 Stories Row

```
[+ Add story] [Neighbor 1] [Neighbor 2] [Kirana's story] [Coach's story] ...
Stories from businesses have a small shop bag icon; residents have none.
Business stories auto-expire at 24h; can be pinned to business profile.
```

---

## 4. Functional Requirements

### Radius & Scope
- **FR-2.1** Default radius: 500m for new users; persisted per user after change.
- **FR-2.2** Safety posts and SOS override radius — always visible at 2km regardless of setting.
- **FR-2.3** Radius query uses PostGIS `ST_DWithin(user_location, post_location, radius_m)`.
- **FR-2.4** Secondary locality (office area) viewable in Discovery tab but not mixed into home feed.
- **FR-2.5** Business and peer posts scoped by their declared service radius, intersected with user's feed radius. A cook serving 300m and a user set to 200m — post visible only if the user is within the cook's 300m AND user's 200m setting ≤ 500m.

### Post Types and Visibility
- **FR-2.6** Post types: `update`, `safety`, `food_menu`, `event`, `poll`, `sell`, `lost_found`, `rwa_notice`, `sos`, `business_announcement`, `community_post`, `peer_service_offer`.
- **FR-2.7** Visibility scopes: `building` (200m), `neighborhood` (500m), `locality` (2km), `pin_code` (5km).
- **FR-2.8** Safety posts auto-scope to `locality` regardless of author's setting.
- **FR-2.9** Business announcements default to business's declared service radius.
- **FR-2.10** Food menu posts automatically expire when cook's cutoff time passes; "Sold out" state if quantity exhausted.
- **FR-2.11** Post daily limits: residents 10/day; businesses 5 announcements/day + unlimited catalogue updates.

### Feed Ranking
- **FR-2.12** Relevance score:
  ```
  score = recency_decay(0.5)
        + proximity_boost(0.3)    ← stronger than v1
        + role_relevance(0.1)     ← cook posts rank higher for users who ordered before
        + interaction_boost(0.1)
  ```
- **FR-2.13** Proximity boost tiers: same building (+40), ≤200m (+30), ≤500m (+20), ≤2km (+10), ≤5km (+5).
- **FR-2.14** Pinned posts always above ranked posts: SOS > RWA Notice > Safety Danger > Business Deal (limited time).
- **FR-2.15** "Daily Specials" card generated server-side at 5:50am IST daily; shown only to users who open app between 6am–11am; disappears after 11am.

### Business Posts in Feed
- **FR-2.16** Business posts appear with a "Verified Business" or "Local Shop" badge.
- **FR-2.17** Business posts can contain: text (≤500 chars), 1 video or up to 6 photos, price tag (optional), CTA button: "Order", "Book", "Call", "WhatsApp", "Visit".
- **FR-2.18** Business can boost a post (pay ₹20–500) to increase reach within their service radius for 24–72h. Boosted posts show a subtle "Promoted" label. Max 1 boosted post active at a time per business.
- **FR-2.19** Business stories appear in the Stories row with a distinct shop bag icon.

### Cook / Peer Service Posts
- **FR-2.20** Cook's "Today's Menu" post is a special post type with: item list, per-item price, total servings, cutoff time, delivery options (pickup / doorstep).
- **FR-2.21** Order button on food menu post opens the order flow directly (module 07).
- **FR-2.22** When servings hit 0, Order button becomes "Sold Out" and post is de-ranked.
- **FR-2.23** Peer service offer (coach batch, rider availability) shows a "Book" or "Request" CTA.

### Reactions, Comments, Sharing
- **FR-2.24** Reactions: 👍 ❤️ 🙏 🤝 ⚠️ — one per user per post; changeable.
- **FR-2.25** Comments: 1-level nesting; 500 char limit; author can pin 1 comment.
- **FR-2.26** Share: native share sheet; creates short link `lokul.in/p/{id}`.
- **FR-2.27** Save: unlimited; accessible in You → Saved.
- **FR-2.28** Report: 5 reasons (Spam, Misinformation, Harassment, Off-topic, Fake business/listing).

### Moderation
- **FR-2.29** Silver+ users can post. Bronze users can react and comment only.
- **FR-2.30** Business accounts can post regardless of personal KYC tier (business has its own verification).
- **FR-2.31** Posts can be edited within 15 min; after that, delete only.
- **FR-2.32** Soft delete: retained 30 days for moderation.

---

## 5. Data Model

```sql
posts
  id (ULID, PK)
  author_user_id (FK users, nullable)
  author_business_id (FK business_profiles, nullable)
  -- one of author_user_id or author_business_id is set
  type  -- enum of all post types above
  body (text, ≤2000 chars)
  visibility ('building'|'neighborhood'|'locality'|'pin_code')
  lat, lng, pin_code
  pinned_until (timestamp nullable)
  boost_until (timestamp nullable)  -- for business boosted posts
  comments_locked (bool)
  status ('active'|'hidden'|'deleted'|'expired')
  created_at, updated_at, deleted_at
  -- denormalised counters
  reaction_count, comment_count, view_count, order_count

post_media
  id, post_id, kind ('image'|'video')
  storage_key, width, height, duration_ms, order_index

post_tags
  post_id, tag

reactions
  post_id, user_id, kind

comments
  id, post_id, parent_id (nullable)
  author_user_id, body, created_at, deleted_at

food_menu_posts
  post_id (PK, FK posts)
  cutoff_at (timestamp)
  delivery_kind ('pickup'|'doorstep'|'both')
  delivery_radius_m
  items_json  -- [{name, price_paise, servings_total, servings_left, photo_url}]
  status ('open'|'cutoff_passed'|'sold_out')

business_boost_purchases
  id, business_id, post_id
  amount_paise, started_at, ends_at
  radius_m, impressions_delivered

daily_specials
  id, locality_pin, generated_date
  cooks_json, shops_json, coaches_json
  generated_at
```

---

## 6. APIs

```
GET  /v1/feed
     ?radius_m=200|500|2000|5000
     &filter=all|community|shop|peers|safety|events
     &cursor=
     → { items: [Post...], next_cursor }

POST /v1/posts
     { type, body, media[], visibility, tags[], business_id? }
     → Post

PATCH /v1/posts/:id          (within 15 min)
DELETE /v1/posts/:id

POST /v1/posts/:id/reactions   { kind }
DELETE /v1/posts/:id/reactions
GET  /v1/posts/:id/comments?cursor
POST /v1/posts/:id/comments    { body, parent_id? }
POST /v1/posts/:id/save
POST /v1/posts/:id/report      { reason }
POST /v1/posts/:id/view

# Food menu specific
POST /v1/food-menus                { cutoff_at, items[], delivery_kind, delivery_radius_m }
PATCH /v1/food-menus/:id/items/:item_id/servings   { servings_left }
POST /v1/food-menus/:id/sold-out

# Business posts
POST /v1/businesses/:id/posts      { body, media[], cta_kind, cta_value }
POST /v1/businesses/:id/posts/:id/boost   { amount_paise, duration_hours, radius_m }

# Daily specials
GET  /v1/feed/daily-specials?pin=

# Stories
GET  /v1/stories?pin=&radius_m=
POST /v1/stories                   multipart media
POST /v1/businesses/:id/stories    multipart media
```

**Realtime (Ably):**
- `feed:locality:{pin_code}` — new posts at locality level
- `feed:user:{user_id}` — filtered posts for this user's radius
- `post:{id}` — reaction + comment updates when post open
- `food_menu:{id}` — live servings count update

---

## 7. Edge Cases

- **EC-2.1** User changes radius → feed reloads; cursor resets.
- **EC-2.2** Cook's tiffin sells out mid-morning → Order button turns "Sold Out" within 5s via Ably; feed ranking drops.
- **EC-2.3** Business posts when their profile is suspended → posts blocked with error.
- **EC-2.4** Bronze user tries to post → "Verify your address to post" CTA.
- **EC-2.5** Boosted post + SOS both pinned → SOS always above boosted post.
- **EC-2.6** Daily Specials card: if no cooks or shops active that morning → card hidden, not shown empty.
- **EC-2.7** Food menu post cutoff passes while someone has it in cart → cart item flagged "Order closed"; prompt to remove.
- **EC-2.8** Business posts a duplicate announcement (same text, same day) → AI dedupe flags for review.
- **EC-2.9** User at radius boundary (exactly 200m) → include if within ≤200m PostGIS circle.

---

## 8. Metrics

| Metric | Target |
|---|---|
| Feed opens / DAU | ≥ 2.5 sessions |
| Avg session time on feed | ≥ 4 min |
| Daily Specials card → tap-through | ≥ 35% |
| Business post impressions / post | ≥ 50 (within service radius) |
| Cook menu post → order conversion | ≥ 18% |
| Posts / day across active locality | ≥ 15 |
| Radius changes per week per user | ≥ 1.5 (users explore) |
| Spam reports / 1000 posts | ≤ 5 |

---

## 9. Dependencies

- PostGIS for radius queries
- Cloudflare Images + Stream (media)
- Ably for real-time feed + food menu countdown
- Meilisearch for tag/text search
- Moderation module 18
- Module 05 (food menu order flow)
- Module 06 (business profiles for business posts)
- Module 12 (notifications for mentions)

---

## 10. Out of Scope (v2.0)

- Algorithmic "For You" personalised feed (chronological + radius only)
- Cross-locality trending posts
- 2+ levels of comment nesting
- Reactions on comments
- Hashtag landing pages
- Multi-image carousel editing after post
- Scheduled posts (businesses)
- Auto-translation of posts
