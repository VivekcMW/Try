# 07 — Classifieds (Buy / Sell)

> Hyperlocal buy/sell beyond services — second-hand furniture, electronics, vehicles, rentals.

---

## 1. Goal

Let residents safely buy and sell items within their society and neighborhood with verified identities and built-in chat.

---

## 2. User stories

- **US-7.1** As a seller, I can list an item with photos and price in under 60 seconds.
- **US-7.2** As a buyer, I can browse listings by category and proximity.
- **US-7.3** As a buyer, I can chat with the seller in-app without sharing my phone number.
- **US-7.4** As a seller, I can mark items as Sold or Reserved.
- **US-7.5** As a buyer, I can see seller's verification + ratings from prior transactions.
- **US-7.6** As either party, I can complete a payment in-escrow for high-value items.

---

## 3. UX flows

### 3.1 Browse

```
Marketplace tab → Classifieds → Category grid (Furniture · Electronics · Vehicles · Books · Kids · Rentals · Other)
→ List view: photo, title, price, distance, time-ago
→ Filters: Price range · Condition (New/Like-new/Used) · Distance
```

### 3.2 Listing flow

```
+ → Sell → Category → Photos (1–8) → Title (≤80 chars) → Description →
Price (₹) OR "Free" OR "Open to offers" → Condition → Location (default: home)
→ Post → Auto-expires in 30 days
```

### 3.3 Buyer→Seller chat

```
Listing → "Chat" → opens a chat thread tagged with the listing card →
Standard chat (module 04); listing card pinned at top of thread
```

### 3.4 Payment (high-value)

```
Both agree on price in chat → Buyer taps "Pay safely" →
Escrow flow: buyer pays into Lokul escrow → Seller delivers → Buyer confirms receipt
→ Funds released to seller. Dispute window 48h.
```

---

## 4. Functional requirements

- **FR-7.1** Categories: Furniture, Electronics, Vehicles (2-wheeler/4-wheeler), Books, Kids & Toys, Home Appliances, Rentals (flat-on-rent), Sports & Fitness, Other.
- **FR-7.2** A listing has: title (3–80 chars), description (≤2000 chars), 1–8 photos, price (₹0 = Free; -1 = "Open to offers"), condition, category, location pin.
- **FR-7.3** Only Silver+ can list; only Gold can list items ≥ ₹10,000.
- **FR-7.4** Listing visibility default = neighborhood (≤ 5km); seller can scope to society/tower.
- **FR-7.5** Listings auto-expire after 30 days; seller can renew once for another 30 days.
- **FR-7.6** Listing states: `active → reserved → sold` (or `expired` / `removed`).
- **FR-7.7** Marking sold prompts seller to optionally rate the buyer.
- **FR-7.8** "Pay safely" available for ₹500–₹50,000; uses booking-like escrow (module 06).
- **FR-7.9** Maximum 10 active listings per user at a time (anti-spam).
- **FR-7.10** "Saved" works for listings same as posts.
- **FR-7.11** Listing search: by Meilisearch index `classifieds`; supports title + description + tags.
- **FR-7.12** Rentals category requires KYC Gold; Lokul disclaims tenancy/legal liability.
- **FR-7.13** Prohibited categories enforced at AI moderation: weapons, alcohol, tobacco, drugs, pets-for-sale, fake brands, financial instruments, medical drugs.

---

## 5. Data model

```
classifieds
  id (ULID)
  seller_id (FK users)
  title, description
  category
  price_paise (-1 = OBO, 0 = Free)
  condition ('new'|'like_new'|'used'|'for_parts')
  visibility ('tower'|'society'|'neighborhood')
  pin, lat, lng
  status ('active'|'reserved'|'sold'|'expired'|'removed')
  expires_at, sold_at
  view_count, save_count, chat_count

classified_photos
  id, classified_id, storage_key, order_index

classified_chats
  thread_id (FK chat_threads), classified_id (FK)
  -- a chat thread can be tagged with one listing
```

---

## 6. APIs

```
GET    /v1/classifieds?category=&pin=&radius=&price_min=&price_max=&q=
GET    /v1/classifieds/:id
POST   /v1/classifieds                  { title, description, category, price_paise, condition, visibility, photos[] }
PATCH  /v1/classifieds/:id
DELETE /v1/classifieds/:id
POST   /v1/classifieds/:id/reserve
POST   /v1/classifieds/:id/sold         { buyer_user_id?, rating? }
POST   /v1/classifieds/:id/renew

POST   /v1/classifieds/:id/chat         → { thread_id }  (creates/returns tagged thread)

POST   /v1/classifieds/:id/escrow       { amount_paise } → { txn_id }
POST   /v1/escrow/:id/release           (buyer confirms receipt)
POST   /v1/escrow/:id/dispute           { reason }
```

---

## 7. Edge cases

- **EC-7.1** Photo upload partially fails → at least 1 photo required to publish.
- **EC-7.2** Buyer ghosts after "reserved" → seller can `unreserve` after 48h.
- **EC-7.3** Multiple buyers want same item — seller picks one; others auto-notified "no longer available".
- **EC-7.4** Listing flagged as prohibited → soft-delete + seller notified with policy link.
- **EC-7.5** Escrow dispute: moderation reviews chat + photos + delivery proof; refund or release.
- **EC-7.6** Rental listings without RERA exclude from "verified rentals" badge.
- **EC-7.7** Price drop: seller can edit; old saved-listing notifications fire to savers.
- **EC-7.8** Spam relisting (same item posted 5×) → AI dedupes by title+photo hash.

---

## 8. Metrics

| Metric | Target |
|---|---|
| Active listings / active society | ≥ 25 |
| Listing → first chat | ≥ 50% within 48h |
| Chat → marked sold | ≥ 30% |
| Avg time-to-sell | ≤ 7 days |
| % transactions via Lokul escrow | ≥ 20% |
| Reported listings / 1000 | ≤ 8 |

---

## 9. Dependencies

- Chat module 04 (tagged threads).
- Payments module 06 (escrow).
- Moderation module 14 (prohibited content, dispute resolution).
- Meilisearch index.
- AI moderation pipeline (Llama-3.1 + image NSFW classifier).

---

## 10. Out of scope (v1.0)

- Auctions / bidding.
- Delivery integration (Dunzo/Porter).
- Bulk seller / shop pages (use Merchants module instead).
- Cross-society discovery (city-wide marketplace).
- Negotiation bots / counter-offer UI (chat-only at v1).
- Tax invoicing (residents are individuals).
