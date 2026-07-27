# 11 — Group Buying (v2 NEW)

> Any resident or community organizer can pool demand from neighbors to get better prices, direct-from-source access, or bulk deals — all coordinated and paid in-app.

---

## 1. Goal

Enable neighbors to organically pool their buying power — for vegetables from a local farmer, a bulk grocery order, a group fitness subscription, or a shared service contract — with transparent coordination, committed payment, and fair distribution.

---

## 2. What Group Buying Covers

| Use case | Example | Lead organizer | Supply source |
|---|---|---|---|
| **Fresh produce** | 20 families pool for Alphonso mangoes direct from farmer | Resident or community admin | External supplier or local kirana |
| **Bulk grocery** | 15 families bulk-order rice, dal, oil at wholesale price | Resident or community admin | Kirana or wholesale supplier |
| **Shared service** | 10 families share a pest control visit (single booking, split cost) | Resident | Formal service provider |
| **Group subscription** | 12 neighbors jointly subscribe to a water purifier maintenance plan | Resident | Local service business |
| **Festival buy** | Garba committee buys decorations in bulk | Community organizer | Any supplier |
| **Direct from producer** | 30 families buy organic vegetables weekly from a farmer | Community admin | Farmer / supplier |

---

## 3. User Stories

### Organizer
- **US-11.1** As a resident, I create a group buy for "Alphonso mangoes — ₹80/dozen, minimum 10 orders."
- **US-11.2** I set: what is being bought, where from, price per unit, minimum orders needed, deadline to commit.
- **US-11.3** I share the group buy in the community feed or main feed (within radius).
- **US-11.4** I see how many people have committed and how many more are needed.
- **US-11.5** When the minimum is met, I confirm the buy. Payment is collected from wallets automatically.
- **US-11.6** I coordinate delivery/distribution and mark the group buy complete.
- **US-11.7** I earn a small optional facilitator fee (set by me upfront; transparent to members).

### Participant / Buyer
- **US-11.8** As a resident, I see group buys in my community feed and main feed.
- **US-11.9** I commit my quantity and payment in one tap.
- **US-11.10** I can withdraw my commitment before the minimum is reached (full refund).
- **US-11.11** Once minimum met and confirmed, my payment is locked in escrow until distribution complete.
- **US-11.12** I mark "Received" when I get my goods; organizer's funds release on all confirmations.
- **US-11.13** If the group buy fails (minimum not met by deadline), I get a full automatic refund.

---

## 4. UX Flows

### 4.1 Create Group Buy

```
+ → "Start a Group Buy"  (or from Community → Buy tab → + Group Buy)
  → Step 1 — What are you buying?
      Item/service name (e.g., "Alphonso Mangoes")
      Category: Fresh Produce / Grocery / Service / Subscription / Other
      Description: "Direct from Ratnagiri farmer. 1 dozen = 12 mangoes, ripe in 2 days."
      Photo (optional but strongly recommended)

  → Step 2 — Pricing & Quantities
      Price per unit: ₹80
      Unit label: per dozen / per kg / per piece / per person / custom
      Minimum units/orders to proceed: 10
      Maximum units/orders (optional): 50
      Each participant commits: fixed qty? OR "let them choose qty"

  → Step 3 — Source & Logistics
      Supplier: [known kirana / external / I'm sourcing it]
      Pickup: "Everyone picks up from [my flat / community hall / building entrance]"
      OR Delivery: "I will deliver to each flat" (organizer's choice)
      Distribution date: [date picker]

  → Step 4 — Timing & Fee
      Commitment deadline: [date + time]
      Facilitator fee: ₹0 (free) / ₹___ per unit (transparent)
        ("I'll take ₹5/dozen for my coordination effort")

  → Preview → Post to [My community / Main feed (neighborhood)] → Live
```

### 4.2 Group Buy Card in Feed

```
┌──────────────────────────────────────────┐
│  🛒 GROUP BUY — Alphonso Mangoes         │
│  by Arjun Shah · Morning Walkers Club    │
│                                          │
│  ₹80/dozen · Direct from Ratnagiri       │
│  [Progress bar: 8/10 orders needed]      │
│  ████████░░ 2 more to unlock!            │
│                                          │
│  Deadline: Tomorrow 10pm                 │
│  Distribution: Sat 28 May, Building gate │
│                                          │
│  [Join — ₹80/dozen →]                   │
└──────────────────────────────────────────┘
```

### 4.3 Joining a Group Buy

```
Tap "Join" on group buy card
  → Select quantity: [1] [2] [3] [other] dozens
  → Summary: 2 dozens = ₹160
  → Payment: deducted from wallet when minimum met (not now)
    "₹160 will be charged when 10 orders are confirmed"
  → Confirm commitment → name added to participant list
  → Push when minimum met / when group buy closes
```

### 4.4 Organizer Flow — Post-Commitment

```
When minimum met:
  Organizer gets push: "10 orders confirmed! Ready to proceed?"
  → Organizer taps Confirm → payments collected from all wallets → escrow
  → Organizer sees list: [Name · Qty · Flat] for distribution
  → Organizer marks each person "Received" OR bulk-mark all
  → Each person confirms receipt in app (or auto-confirms after 24h)
  → Escrow released to organizer's wallet (minus Lokul 3% + organizer's stated fee)
```

### 4.5 Failed Group Buy

```
Deadline passes with < minimum orders:
  → Lokul auto-closes group buy
  → All committed payments auto-refunded (no action needed from organizer)
  → Push to all: "Group buy closed — not enough participants. Full refund issued."
  → Organizer can re-create with lower minimum or extended deadline
```

---

## 5. Functional Requirements

### Creation
- **FR-11.1** Silver+ users can create group buys. Gold for buys > ₹10,000 total value.
- **FR-11.2** Group buy visible within: community (if created inside a community) or locality radius (if created in main feed, default 500m).
- **FR-11.3** Minimum participants: 2. Maximum: 200.
- **FR-11.4** Commitment deadline: minimum 2h from creation, maximum 14 days.
- **FR-11.5** Distribution date must be ≥ 24h after commitment deadline.

### Payment & Escrow
- **FR-11.6** Participants commit intent first (no payment deducted).
- **FR-11.7** On organizer confirmation (or auto on reaching max), wallets are debited and funds held in escrow.
- **FR-11.8** Participant can withdraw commitment before organizer confirms (funds not yet held) — full refund, no fee.
- **FR-11.9** Participant cannot withdraw after organizer confirms (funds in escrow) — must raise a dispute.
- **FR-11.10** Failed group buy (deadline passes, minimum not met) → auto-refund all within 1h.
- **FR-11.11** Platform fee: 3% on total GMV of completed group buy (lower than individual transaction rate to incentivize group behavior).
- **FR-11.12** Organizer's stated facilitator fee deducted from each participant's payment and transferred to organizer on completion.
- **FR-11.13** Organizer's funds held 24h after last participant marks "Received" before release (dispute window).

### Distribution Tracking
- **FR-11.14** Organizer sees distribution list: each participant's name, flat/location, qty ordered.
- **FR-11.15** Mark received: organizer taps "Mark received" per participant, or participant self-marks.
- **FR-11.16** Auto-confirm: any participant who doesn't mark received within 24h of distribution date → auto-confirmed.
- **FR-11.17** Dispute: participant can dispute "not received" within 48h of distribution date; escrow held; Lokul mediates.

### Organizer Tools
- **FR-11.18** Organizer can extend the deadline once (max +3 days) if minimum not yet met.
- **FR-11.19** Organizer can cancel the group buy anytime before confirmation → all commitments auto-refunded.
- **FR-11.20** Organizer cannot reduce the minimum after participants have committed (protect participant expectations).
- **FR-11.21** Organizer gets a PDF summary: participant list, quantities, total collected, payout details.

---

## 6. Data Model

```sql
group_buys
  id (ULID, PK)
  organizer_user_id (FK)
  community_id (FK nullable)   -- if created inside a community
  post_id (FK)                 -- linked feed post (shows progress bar)
  title, description, category
  item_photo_url
  price_paise_per_unit
  unit_label
  min_orders, max_orders (nullable)
  allow_custom_qty (bool)
  fixed_qty_per_person (int nullable)
  supplier_info_text
  pickup_address, distribution_date
  facilitator_fee_paise_per_unit
  commitment_deadline
  status ('open'|'min_met'|'confirmed'|'distributing'|'completed'|'failed'|'cancelled')
  total_committed, total_confirmed_orders, total_paise_in_escrow
  pin_code, lat, lng, radius_m
  created_at, confirmed_at, completed_at

group_buy_commitments
  id (ULID), group_buy_id (FK), user_id (FK)
  qty_committed
  unit_price_paise, facilitator_fee_paise, total_paise
  payment_status ('uncommitted'|'escrowed'|'released'|'refunded')
  txn_id (FK nullable)
  received_at (nullable)  -- when participant marks received
  committed_at, withdrawn_at (nullable)

group_buy_distributions
  group_buy_id, commitment_id (FK)
  user_id, flat_label, qty
  status ('pending'|'distributed'|'confirmed'|'disputed')
  confirmed_at, disputed_at
```

---

## 7. APIs

```
# Group buys
POST  /v1/group-buys              { title, category, price_paise_per_unit, unit_label,
                                    min_orders, allow_custom_qty, commitment_deadline,
                                    distribution_date, pickup_address,
                                    facilitator_fee_paise_per_unit,
                                    community_id?, radius_m }
GET   /v1/group-buys              ?community_id=|radius_m=&status=
GET   /v1/group-buys/:id
PATCH /v1/group-buys/:id/deadline { new_deadline }   (organizer; once only)
POST  /v1/group-buys/:id/confirm  (organizer; triggers payment collection)
POST  /v1/group-buys/:id/cancel   (organizer; before confirm)

# Commitments
POST  /v1/group-buys/:id/commit   { qty }
DELETE /v1/group-buys/:id/commit  (withdraw; before organizer confirms)

# Distribution
GET   /v1/group-buys/:id/distribution   (organizer view)
POST  /v1/group-buys/:id/distribution/:commitment_id/mark-received   (organizer marks)
POST  /v1/group-buys/:id/distribution/:commitment_id/received        (participant self-marks)
POST  /v1/group-buys/:id/distribution/:commitment_id/dispute         { reason }
```

**Realtime (Ably):**
- `group_buy:{id}` — live commitment count update (drives progress bar in feed card)

---

## 8. Edge Cases

- **EC-11.1** Organizer confirms but can't source the goods → organizer cancels post-confirm → dispute process; manual refund by Lokul support; organizer trust score impacted.
- **EC-11.2** Last-minute commit pushes total past max_orders → reject with "Full — no more orders" message.
- **EC-11.3** Participant wallet insufficient on payment collection (after organizer confirms) → retry 3x over 1h; on fail, commitment voided; organizer notified; group buy proceeds with remaining participants (if still ≥ minimum).
- **EC-11.4** Organizer marks group buy complete but one participant disputes → escrow split: confirmed participants' share released; disputed portion held until mediation.
- **EC-11.5** Organizer tries to extend deadline twice → blocked; suggest cancel + re-create.
- **EC-11.6** Group buy created in community but community later disbanded → group buy continues until its own lifecycle ends; no community link shown.
- **EC-11.7** Distribution date passes without organizer marking any distributions → auto-push to organizer; if 48h after distribution date, Lokul support flags for review.

---

## 9. Metrics

| Metric | Target |
|---|---|
| Group buys created / active locality / month | ≥ 4 |
| Avg participants / group buy | ≥ 12 |
| Group buy success rate (min met) | ≥ 65% |
| Avg time from creation to min met | ≤ 18h |
| Organizer repeat rate (created ≥ 2 in 60 days) | ≥ 40% |
| Dispute rate / completed group buy | ≤ 3% |

---

## 10. Dependencies

- Module 01 (Silver KYC for organizer)
- Module 02 (group buy post in feed with live progress bar)
- Module 08 (wallet, escrow, refund infrastructure)
- Module 10 (group buys created within communities)
- Module 12 (push for minimum met, deadline approaching, refund)
- Ably for real-time commitment count

---

## 11. Out of Scope (v2.0)

- Negotiation with external suppliers through Lokul (manual; organizer arranges)
- Lokul-brokered supplier partnerships (v2.2)
- Multi-city group buys
- Recurring weekly group buys (must re-create each time in v2.0)
- Group buy analytics dashboard for organizers (v2.1)
- Delivery coordination beyond "organizer distributes" (rider integration v2.1)
- Bidding / reverse auction for bulk pricing
