# 06 — Local Business Hub (v2 NEW)

> Every kirana, salon, clinic, school, gym, restaurant, and repair shop within the locality gets a free digital presence that reaches exactly their 200–500m customer base — and nothing more.

---

## 1. Goal

Give every local business — from a 10-sqft kirana to a multi-room clinic — a digital storefront that:
- Reaches **only the neighbors who are their real customers**
- Requires **zero technical knowledge** to set up and maintain
- Enables **discovery, communication, ordering, and payment** in one place
- Costs **less than a month of pamphlet printing** to operate

---

## 2. Business Categories

| Category | Sub-types |
|---|---|
| 🛒 **Grocery & Provisions** | Kirana, General store, Supermarket, Organic store, Dry fruits |
| 🍽️ **Food & Beverage** | Restaurant, Dhaba, Bakery, Sweet shop, Juice center, Ice cream, Cafe, Tiffin center, Catering |
| 💇 **Salon & Beauty** | Hair salon, Spa, Parlour, Nail studio, Mehendi |
| 🏥 **Health & Wellness** | Clinic (GP / specialist), Pharmacy, Dental, Physiotherapy, Homeopathy, Ayurveda, Diagnostic lab |
| 🏋️ **Fitness & Sports** | Gym, Yoga studio, Martial arts, Swimming pool, Sports coaching |
| 🏫 **Education** | School, Coaching center, Hobby classes, Skill training, Tuition center, Playschool |
| 🔧 **Home Services** | Electrician, Plumber, Carpenter, AC repair, Appliance repair, Pest control, Painting |
| 👗 **Retail** | Clothing, Footwear, Mobile & accessories, Stationery, Toy store, Gift shop |
| 🚗 **Automotive** | Mechanic, Driving school, Car wash, Puncture shop |
| 💼 **Professional Services** | CA, Lawyer, Insurance agent, Travel agent, Courier |
| 🐾 **Pets & Animals** | Vet clinic, Pet store, Pet grooming, Dog walking |
| 🧹 **Other Services** | Laundry, Tailor, Cobbler, Water purifier, Tiffin subscription center |
| 📦 **Other** | Anything that doesn't fit above |

---

## 3. User Stories

### Business Owner
- **US-6.1** I set up my business in under 5 minutes with name, photo, category, and location.
- **US-6.2** I post daily announcements ("Fresh stock arrived", "Today's special") to residents within my service area.
- **US-6.3** I list my products or services with photos and prices in a catalogue.
- **US-6.4** Customers can message me directly in-app, call me, or ping on WhatsApp.
- **US-6.5** Customers can order from my catalogue in-app or be redirected to WhatsApp.
- **US-6.6** I receive payment via UPI / Lokul Wallet (optional; I can keep it call/WhatsApp only).
- **US-6.7** I run a hyperlocal promotion (e.g., "20% off today — tap to save") visible within 300m.
- **US-6.8** I post a Story that disappears in 24h — for quick daily offers.
- **US-6.9** I respond to customer questions in comments or DMs.
- **US-6.10** I see how many people saw my post, clicked my profile, and messaged me.

### Resident / Customer
- **US-6.11** I discover local businesses within my chosen radius in the Discover tab under "Shop Local".
- **US-6.12** I browse a business's catalogue, see prices, and order or call directly.
- **US-6.13** I see which local businesses are open right now.
- **US-6.14** I see ratings and reviews from verified local customers (not bots from the internet).
- **US-6.15** I save a business ("my kirana") for quick re-access.
- **US-6.16** I receive a push when a saved business posts a new offer.

### School / Clinic (Announcement-heavy use case)
- **US-6.17** As a school, I post admission open dates, events, holidays, and fee reminders to parents within 1km.
- **US-6.18** As a clinic, I post appointment availability: "Dr. Sharma available today 5–8pm."
- **US-6.19** As a school, I create a parent community linked to my business profile.

---

## 4. UX Flows

### 4.1 Business Profile Page

```
Business Profile:
  ┌──────────────────────────────────────────┐
  │  [Business Logo]  Sharma Kirana   ✓      │
  │  🛒 Grocery  ·  120m away  ·  Open       │
  │  ⭐ 4.7 (143 reviews from locals)        │
  │                                          │
  │  [Message] [Call] [WhatsApp] [Save]      │
  ├──────────────────────────────────────────┤
  │  Tabs: [Posts] [Catalogue] [Reviews]     │
  ├──────────────────────────────────────────┤
  │  Posts tab:                              │
  │  "Ratnagiri mangoes ₹80/dozen — today"   │
  │  "Festival offer — buy 5 get 1 free"     │
  │  ...                                     │
  ├──────────────────────────────────────────┤
  │  Catalogue tab:                          │
  │  [Category: Fresh Produce]               │
  │   Alphonso Mangoes  ₹80/dozen   [Order]  │
  │   Bananas           ₹40/dozen   [Order]  │
  │  [Category: Dairy]                       │
  │   Full cream milk   ₹28/500ml   [Order]  │
  │  ...                                     │
  ├──────────────────────────────────────────┤
  │  Reviews tab:                            │
  │  "Freshest produce in the area"          │
  │  ⭐⭐⭐⭐⭐ · Priya S. · Tower 3        │
  │  ...                                     │
  └──────────────────────────────────────────┘
```

### 4.2 Business Owner — Post Flow

```
Business Mode (toggle in app) → My Business Dashboard
  → + Post
  → Post type:
      📢 Announcement  → text + media + optional CTA
      🏷️ Offer         → text + discount + expiry + CTA
      📋 Notice        → for clinics, schools (informational, no CTA)
      📦 New Arrival   → linked to catalogue item(s)
  → Write text → Add media → Pick CTA button type → Radius → Post
  → Published to feed + business profile Posts tab
```

### 4.3 Business Owner — Catalogue Editor

```
Business Dashboard → Catalogue
  → [+ Add Item] or [+ Add Category]
  
  Add Category: name (e.g., "Fresh Produce", "Dairy", "Services")
  
  Add Item:
    Name, Description (optional)
    Photo (recommended)
    Price: ₹___ or "Call for price"
    Unit: per piece / per kg / per litre / per session / other
    Availability: Always / Today only / Seasonal (date range)
    Order via: [In-app] [WhatsApp] [Call] (multi-select)
    Stock: In stock / Out of stock / Limited (qty)
  
  → Save → appears in Catalogue tab
  → Out-of-stock items auto-tagged with "Unavailable"
```

### 4.4 Hyperlocal Promotion Flow

```
Business Dashboard → Boost / Promote
  → Select a post or create new promotion
  → Set:
      Offer text: "20% off on all vegetables today"
      CTA: "Tap to save" / "Order now" / "Visit us"
      Radius: 200m / 300m / 500m
      Duration: Today (24h) / 48h / 72h
  → Budget: ₹20 / ₹50 / ₹100 / custom
  → Preview → Pay → Live
  → Shown in feed with "Promoted" label
  → Analytics: impressions, taps, saves
```

### 4.5 Customer — Order from Catalogue

```
Business Catalogue → Item → [Order]
  → Order type: In-app (pay now) or WhatsApp redirect
  
  In-app order:
    Qty picker → Add to cart
    Cart (from same business only)
    Delivery: Pickup / Doorstep (if business offers)
    Notes (optional)
    Payment: Wallet / UPI
    → Confirm → Order sent to business owner's app
    → Business accepts/rejects within 30 min
    → Completion: business marks "Ready" / "Delivered"
    → Rating prompt

  WhatsApp redirect:
    Qty + item name pre-filled in WhatsApp message
    Opens WhatsApp with business's number
    Order handled outside Lokul (no escrow)
```

### 4.6 School / Clinic Notice Flow

```
School profile → + Post → Notice type
  → Title + body + attachment (PDF timetable, etc.)
  → Target: "All residents within 1km"
  → Optional: "Action required — parents please confirm receipt"
  → Post → pinned to school profile + visible in feed
  → Parents who saved the school get a push notification
```

---

## 5. Functional Requirements

### Business Profile
- **FR-6.1** A business has: name, logo, category, description (≤500 chars), location (lat/lng + pin), service radius, hours, contact options.
- **FR-6.2** Service radius options: 200m / 300m / 500m / 1km / 2km. Default: 500m.
- **FR-6.3** Hours: per-day open/closed + open times. "Call to confirm" option for irregular hours.
- **FR-6.4** "Open now" computed server-side from hours_json + IST time; shown as green badge.
- **FR-6.5** Business profile URL: `lokul.in/biz/{slug}` — shareable externally.
- **FR-6.6** A business owner can link their personal Lokul profile to the business ("Meet the owner" section).
- **FR-6.7** Multiple owners / managers: up to 3 people can manage one business profile (each must be Silver+).

### Catalogue
- **FR-6.8** Categories within catalogue: business-defined, up to 20 categories.
- **FR-6.9** Items per business: up to 200 items (enough for a full kirana stock).
- **FR-6.10** Bulk catalogue import: CSV upload for businesses with large inventories (v2.1 feature — manual entry for v2.0).
- **FR-6.11** Item availability is toggleable: in-stock / out-of-stock / limited (qty).
- **FR-6.12** Catalogue search: Meilisearch index `business_catalogue`; searchable by item name + business name within radius.
- **FR-6.13** Seasonal items can have date-range availability set; auto-hide outside range.

### Posts & Announcements
- **FR-6.14** Business post limit: 5 announcements/day + unlimited catalogue-item stock updates.
- **FR-6.15** Business stories: 1 per day; same 24h expiry as resident stories; appear in stories row with shop icon.
- **FR-6.16** Business posts appear in: (a) main feed within service radius, (b) business profile Posts tab, (c) pushed to users who saved the business.
- **FR-6.17** School/clinic "Notice" posts can have PDF attachments (≤10MB, ≤5 files).
- **FR-6.18** Business comments: residents can comment; business can reply; comments visible on post.

### Orders & Payments
- **FR-6.19** In-app ordering optional; business can choose order channels: in-app / WhatsApp / call.
- **FR-6.20** In-app orders use same escrow infrastructure as marketplace (module 08). Platform fee: 5% on in-app orders.
- **FR-6.21** WhatsApp redirect: pre-filled message with item + qty + business name. Lokul does not facilitate this payment; no take-rate.
- **FR-6.22** Minimum order for in-app: ₹20.
- **FR-6.23** Business can set a minimum order amount for home delivery (e.g., "Delivery only above ₹200").
- **FR-6.24** Business can offer delivery (with their own delivery staff) or pickup only.

### Reviews & Trust
- **FR-6.25** Reviews allowed only from users who have: (a) made an in-app order from the business, OR (b) been to the business within 200m (geo-verified visit in future v2.1; manual "I visited" for v2.0).
- **FR-6.26** "Visited" reviews (without in-app order): Silver+ users can leave a review with "I visited this place" flag; visible with a different badge.
- **FR-6.27** Rating: 1–5 stars + text (≤500 chars) + up to 3 photos.
- **FR-6.28** Business can respond to any review; response appears below.
- **FR-6.29** Rating shown only when business has ≥ 3 reviews; else "New".

### Analytics (Business Dashboard)
- **FR-6.30** Business owners see: post impressions, profile views, catalogue views, message taps, order count, review count — all time + last 30 days.
- **FR-6.31** Analytics are per-business, not shared with Lokul competitors.

### Promotions
- **FR-6.32** Boosted posts (paid): ₹20–₹500; radius 200m–2km; duration 24h–72h.
- **FR-6.33** Maximum 1 active boost per business at a time.
- **FR-6.34** Boost analytics: impressions, taps, saves, orders attributed.
- **FR-6.35** Boost payment via Lokul Wallet only.

### Subscription / Listing Fee
- **FR-6.36** Basic listing: free. Includes: profile, 5 posts/day, up to 50 catalogue items, 1 story/day, in-app messaging.
- **FR-6.37** Pro listing: ₹299/month. Includes: unlimited catalogue, priority placement in Discover, weekly analytics report, 1 boost credit/month.
- **FR-6.38** Premium listing: ₹999/month. Includes: Pro + 4 boost credits/month, "Featured Business" badge, dedicated community page, school/clinic notice pinning.

---

## 6. Data Model

```sql
business_profiles   -- defined in module 01
  id, owner_user_id, business_name, logo_url, description
  category, sub_category
  pin_code, lat, lng, service_radius_m
  hours_json
  contact_phone, contact_whatsapp, contact_in_app (bool)
  delivery_available (bool), min_delivery_order_paise
  status, verification_kind
  slug (unique, for URL)
  subscription_tier ('free'|'pro'|'premium')
  subscription_expires_at

business_managers
  business_id (FK), user_id (FK), role ('owner'|'manager')
  added_at

business_catalogue_categories
  id, business_id, name, order_index

business_catalogue_items
  id (ULID), business_id (FK)
  category_id (FK nullable)
  name, description, photo_url
  price_paise (-1 = call for price)
  unit_label   -- 'per kg', 'per piece', 'per session'
  availability ('always'|'today'|'seasonal')
  season_start, season_end (date, nullable)
  stock_status ('in_stock'|'out_of_stock'|'limited')
  stock_qty (int nullable)
  order_channels TEXT[]  -- ['in_app','whatsapp','call']
  is_active (bool)
  order_index

business_orders
  id (ULID), business_id (FK), buyer_user_id (FK)
  items_json   -- [{item_id, qty, price_paise}]
  total_paise, delivery_charge_paise
  order_channel ('in_app'|'whatsapp')
  delivery_kind ('pickup'|'doorstep')
  delivery_address_text, delivery_lat, delivery_lng
  notes
  status ('pending'|'accepted'|'rejected'|'ready'|'delivered'|'completed'|'cancelled')
  txn_id (FK nullable)
  created_at, completed_at

business_reviews
  id, business_id (FK), reviewer_user_id (FK)
  rating (1–5), body, photos TEXT[]
  visit_kind ('in_app_order'|'visited')
  order_id (FK nullable)
  business_response (text nullable)
  status ('active'|'hidden')
  created_at

business_saves
  business_id, user_id, saved_at

business_analytics_daily
  business_id, date
  post_impressions, profile_views, catalogue_views
  message_taps, order_count, review_count, boost_impressions

business_boosts
  id, business_id, post_id
  amount_paise, radius_m, duration_hours
  started_at, ends_at
  impressions, taps, saves, orders_attributed
  status ('active'|'completed'|'cancelled')
```

---

## 7. APIs

```
# Business profile
GET   /v1/businesses/:id                        → full profile
GET   /v1/businesses/nearby?radius_m=&category= → [BusinessSummary]
POST  /v1/businesses                            { ...fields }
PATCH /v1/businesses/:id
GET   /v1/businesses/mine

# Catalogue
GET   /v1/businesses/:id/catalogue
POST  /v1/businesses/:id/catalogue/categories   { name }
POST  /v1/businesses/:id/catalogue/items        { ...fields }
PATCH /v1/businesses/:id/catalogue/items/:id
DELETE /v1/businesses/:id/catalogue/items/:id
PATCH /v1/businesses/:id/catalogue/items/:id/stock { stock_status, stock_qty? }

# Posts
POST  /v1/businesses/:id/posts                  { type, body, media[], cta_kind, cta_value }
GET   /v1/businesses/:id/posts?cursor

# Orders
POST  /v1/businesses/:id/orders                 { items[], delivery_kind, address, channel }
GET   /v1/business-orders?role=buyer|business&status=
POST  /v1/business-orders/:id/accept
POST  /v1/business-orders/:id/reject            { reason }
POST  /v1/business-orders/:id/ready
POST  /v1/business-orders/:id/delivered
POST  /v1/business-orders/:id/complete          (buyer)

# Reviews
POST  /v1/businesses/:id/reviews                { rating, body, photos[], visit_kind, order_id? }
GET   /v1/businesses/:id/reviews?cursor
POST  /v1/businesses/:id/reviews/:id/respond    { response }

# Save
POST  /v1/businesses/:id/save
DELETE /v1/businesses/:id/save
GET   /v1/me/saved-businesses

# Boost
POST  /v1/businesses/:id/boosts                 { post_id, amount_paise, duration_hours, radius_m }
GET   /v1/businesses/:id/boosts

# Analytics
GET   /v1/businesses/:id/analytics?from=&to=

# Subscription
POST  /v1/businesses/:id/subscription           { tier }
GET   /v1/businesses/:id/subscription
```

---

## 8. Edge Cases

- **EC-6.1** Business posts while suspended → API blocked; owner sees "Your account is suspended" message.
- **EC-6.2** Catalogue item runs out mid-day → owner marks "Out of stock"; existing pending orders honored; new orders blocked for that item.
- **EC-6.3** Customer orders from catalogue then business rejects → auto-refund within 5 min; customer notified with rejection reason.
- **EC-6.4** Business changes location → service radius recomputed; existing saved users re-notified.
- **EC-6.5** School posts notice with PDF → ClamAV scans file; reject + alert on malware.
- **EC-6.6** Business review by non-local (user 10km away manages to review) → reviews filtered to users within 5km of business; others blocked.
- **EC-6.7** Two businesses claim same phone number → each must use unique verified phone; second rejected until first delinks.
- **EC-6.8** Business subscription lapses → downgraded to free; catalogue capped at 50 items; excess items hidden (not deleted); resubscribe to restore.
- **EC-6.9** Boost budget exhausted before duration ends → boost ends early; owner notified; can renew.

---

## 9. Metrics

| Metric | Target |
|---|---|
| Businesses onboarded / active locality (500 residents) | ≥ 8 |
| Businesses with ≥ 5 catalogue items | ≥ 70% |
| Business posts per active business / week | ≥ 3 |
| Profile views per business / month | ≥ 200 |
| Order conversion: catalogue view → order | ≥ 12% |
| Business review avg rating | ≥ 4.2 |
| Business retention (active at 90 days) | ≥ 65% |
| Pro/Premium subscription rate | ≥ 15% of active businesses |

---

## 10. Dependencies

- Module 01 (business onboarding, Silver KYC)
- Module 02 (business posts in feed)
- Module 08 (in-app orders + payments)
- Module 10 (business can create a linked community)
- Module 12 (push for new posts to savers)
- Module 16 (notifications digest includes local business offers)
- Module 18 (moderation of business posts + reviews)
- Meilisearch `business_catalogue` index

---

## 11. Out of Scope (v2.0)

- Multi-branch / franchise management
- POS system integration
- GST invoice generation (manual for now)
- Loyalty points / stamp cards
- Business-to-business ordering
- Delivery fleet management for businesses
- WhatsApp Business API deep integration (link only, not embed)
- Aggregator mode (Lokul-routed orders across multiple businesses)
- Live inventory sync from external systems
- Bulk CSV catalogue import (v2.1)
