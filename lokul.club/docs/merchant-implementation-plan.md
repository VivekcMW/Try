# Merchant Profiles — Implementation Plan
> Lokul — Complete build plan across all 6 profiles
> Status: Ready for implementation
> Last updated: 2026-07-29

---

## What Already Exists (Do Not Rebuild)

| Feature | Status | Location |
|---|---|---|
| Merchant auth (OTP login/session) | ✅ Done | `/api/merchant/auth/*` |
| Catalog CRUD + categories + stock | ✅ Done | `/api/mobile/merchants/[id]/catalog/*` |
| Orders CRUD + status flow | ✅ Done | `/api/merchant/orders/*` |
| Offers CRUD | ✅ Done | `/api/mobile/merchants/[id]/offers/*` |
| Coupons CRUD | ✅ Done | `/api/merchant/coupons/*` |
| Slots CRUD | ✅ Done | `/api/mobile/merchants/[id]/slots/*` |
| ServiceSlot + Appointment models | ✅ In schema | `prisma/schema.prisma` |
| QuoteRequest model | ✅ In schema | `prisma/schema.prisma` |
| Customers page | ✅ Done | `/merchant/customers` |
| Earnings page | ✅ Done | `/merchant/earnings` |
| Analytics page | ✅ Done | `/merchant/analytics` |
| Branches CRUD | ✅ Done | `/merchant/branches` |
| Settings (hours, delivery, notifications) | ✅ Done | `/merchant/settings` |
| Business hours enforcement (API) | ✅ Done | Order creation route |

---

## What Needs to Be Built

Everything below is net-new work, grouped into phases.

---

# PHASE 1 — Foundation (Profile System)
> Makes the app profile-aware. No new features — just routing logic.
> **All other phases depend on this.**

### 1.1 — Schema: Add workflowProfile to Merchant

```prisma
model Merchant {
  ...
  workflowProfile  String  @default("retail")
  // Values: "retail" | "food" | "appointments" | "home_services" | "subscriptions" | "events"
}
```

**Migration:** additive, nullable with default — safe.

---

### 1.2 — Shared lib: Category → Profile mapping

**File:** `src/lib/merchant-profiles.ts`

```ts
export type WorkflowProfile = "retail" | "food" | "appointments" | "home_services" | "subscriptions" | "events";

export const CATEGORY_TO_PROFILE: Record<string, WorkflowProfile> = {
  kirana: "retail", pharmacy: "retail", dairy: "retail",
  meat: "retail", vegetables: "retail", bakery: "retail",
  stationery: "retail", gifts: "retail", jewellery: "retail",
  mobile: "retail", hardware: "retail", nursery: "retail",
  water: "retail", tailor: "retail", other: "retail",
  restaurant: "food", tiffin: "food", catering: "food",
  clinic: "appointments", salon: "appointments", fitness: "appointments",
  yoga: "appointments", ayurveda: "appointments", tutor: "appointments",
  driving: "appointments", petcare: "appointments", childcare: "appointments",
  senior: "appointments",
  electrician: "home_services", plumber: "home_services",
  carpenter: "home_services", painter: "home_services",
  cleaning: "home_services", laundry: "home_services",
  appliance: "home_services", repair: "home_services",
  packers: "home_services", courier: "home_services",
  security: "home_services", cycle: "home_services",
  ca_legal: "home_services", insurance: "home_services",
  newspaper: "subscriptions",
  events: "events", realestate: "events", travel: "events",
};

// Nav config per profile
export const PROFILE_NAV: Record<WorkflowProfile, NavItem[]> = { ... };

// Label overrides per profile
export const PROFILE_LABELS: Record<WorkflowProfile, ProfileLabels> = { ... };
```

---

### 1.3 — Auto-assign profile on merchant registration

**File:** `src/app/api/mobile/merchants/route.ts` (POST handler)

When a new merchant is created, resolve `workflowProfile` from `CATEGORY_TO_PROFILE[category]` and store it.

---

### 1.4 — Session returns workflowProfile

**File:** `src/app/api/merchant/auth/session/route.ts`

Add `workflowProfile` to the session response so the layout can read it.

---

### 1.5 — Layout becomes profile-aware

**File:** `src/app/merchant/layout.tsx`

- Read `workflowProfile` from session
- Replace hardcoded `navItems` array with `PROFILE_NAV[workflowProfile]`
- Store profile in a React context (`MerchantProfileContext`) for all child pages to consume

---

### 1.6 — Profile context + label hook

**File:** `src/lib/merchant-profile-context.tsx`

```ts
const MerchantProfileContext = createContext<WorkflowProfile>("retail");

export function useMerchantProfile() {
  return useContext(MerchantProfileContext);
}

export function useProfileLabel(key: LabelKey): string {
  const profile = useMerchantProfile();
  return PROFILE_LABELS[profile][key] ?? DEFAULT_LABELS[key];
}
```

Pages use `useProfileLabel("orders")` to get "Orders" / "Bookings" / "Jobs" etc.

---

### 1.7 — Dashboard becomes profile-aware

**File:** `src/app/merchant/page.tsx`

Replace generic stat cards with profile-specific KPI cards:
- Retail/Food → Today's Orders, Pending, Revenue, Low Stock
- Appointments → Today's Bookings, Next Appointment, This Week Revenue, Cancellations
- Home Services → Pending Requests, Jobs This Week, Revenue, Response Rate
- Subscriptions → Active Subscribers, Today's Deliveries, Paused Count, Month Revenue
- Events → Pending Enquiries, Upcoming Bookings, Month Revenue, Conversion Rate

---

**Phase 1 Deliverables:** Profile field in DB, mapping lib, profile-aware nav, profile context, profile-aware dashboard.
**Effort estimate:** 2–3 days

---

# PHASE 2 — Retail Profile Polish
> Retail is the default — most merchants land here. Mostly done, small gaps.

### 2.1 — Catalog: Veg/Non-Veg toggle (for bakery/sweets)
Not needed for retail. Skip.

### 2.2 — Orders: Delivery mode display
Show self-pickup vs home delivery clearly on order cards. Already in DB (`deliveryMode`), just surface it in the UI.

### 2.3 — Stock auto-decrement on order
**File:** `src/app/api/mobile/merchants/[id]/orders/route.ts`

When order is created, decrement `stockCount` for each ordered item (skip if `stockCount` is null). If any item's stockCount = 0 at time of order, reject with `{ error: "Item out of stock" }`.

### 2.4 — Low stock alert in dashboard
Dashboard KPI card: "3 items low stock" (stockCount < 5) — links to Catalog.

### 2.5 — Bulk order confirm already done ✅

---

**Phase 2 Deliverables:** Stock decrement, low stock dashboard card, delivery mode UI polish.
**Effort estimate:** 1 day

---

# PHASE 3 — Food Profile
> Builds on top of Retail. Needs menu-specific features.

### 3.1 — "Available Today" toggle per item
**File:** `src/app/merchant/catalog/page.tsx`

For Food profile, rename "isAvailable" toggle label to "Available today" and add a "Reset all to available" button (for start of each day).

### 3.2 — Veg / Non-veg attribute
**File:** `src/app/merchant/catalog/page.tsx`

For Food profile, add a Veg/Non-Veg/Egg toggle on each item (stored in `attributes.isVeg`, `attributes.isEgg`). Show green/red dot on the item card.

### 3.3 — Prep time per item (optional override)
Each menu item can have its own `durationMins` (already in schema). For Food profile, label this "Prep time" instead of "Duration". Used to show estimated ready time to customer.

### 3.4 — Today's Orders compact view
**File:** New section in `src/app/merchant/orders/page.tsx`

For Food profile, add a compact "Kitchen View" toggle at top of orders page:
- Shows all pending + confirmed orders in a grid
- Each card shows just: order #, items list, status, timer since placed
- [Confirm All] bulk action prominent at top

### 3.5 — Menu page instead of Catalog
**File:** `src/app/merchant/catalog/page.tsx`

For Food profile, page title becomes "Menu" via `useProfileLabel`. Group items by `catalogCategory` (Breakfast / Lunch / Snacks / Beverages etc.) — already implemented.

---

**Phase 3 Deliverables:** Veg/non-veg badges, today's toggle, kitchen view, prep time labelling.
**Effort estimate:** 1–2 days

---

# PHASE 4 — Appointments Profile
> ServiceSlot + Appointment models already exist. Needs merchant-facing UI.

### 4.1 — Bookings page (new)
**Files:**
- `src/app/merchant/bookings/page.tsx`
- `src/app/api/merchant/bookings/route.ts`

List all appointments for this merchant from `prisma.appointment`:
- Filter by: Today / Upcoming / Past / Cancelled
- Each card: customer name, service, time, status, call/WhatsApp buttons
- Actions: [Confirm] [Cancel] [Mark Complete]
- API: `GET /api/merchant/bookings?filter=today|upcoming|past`

### 4.2 — Today's Schedule (dashboard widget)
For Appointments profile, dashboard shows a chronological timeline of today's bookings instead of revenue stats. Each slot shows time, customer name, service.

### 4.3 — Booking detail page
**File:** `src/app/merchant/bookings/[id]/page.tsx`

Full booking detail: customer info, service, notes, slot time, history of status changes. Actions: confirm/cancel/complete.

### 4.4 — Appointment API: confirm/cancel/complete
**File:** `src/app/api/merchant/bookings/[id]/status/route.ts`

POST endpoint, mirrors the orders status endpoint:
- Actions: `confirm`, `cancel`, `complete`
- Updates `prisma.appointment.status`
- Sends push notification to customer

### 4.5 — Slots: bulk add for the week
**File:** `src/app/merchant/slots/page.tsx`

Add "Add slots for the week" button:
- Set working hours (e.g. 9 AM – 6 PM)
- Select days (Mon–Sat)
- Auto-generate hourly slots for all selected days
- Calls POST with array of slots

### 4.6 — Services page (appointments version of Catalog)
For Appointments profile:
- Page title: "Services"
- Remove "Stock count" field (not relevant)
- Add "Duration" field (already exists as `durationMins`)
- Add "Max simultaneous" capacity field (stored in `attributes.capacity`)

---

**Phase 4 Deliverables:** Bookings page + detail + status API, weekly slot bulk add, services page tweaks.
**Effort estimate:** 2–3 days

---

# PHASE 5 — Home Services Profile
> QuoteRequest model already exists. Needs the full quote → job flow UI.

### 5.1 — Quote Requests page (new)
**Files:**
- `src/app/merchant/requests/page.tsx`
- `src/app/api/merchant/requests/route.ts`

List all incoming `QuoteRequest` records for this merchant:
- Filter: Pending / Quoted / Accepted / Declined
- Each card: customer name, service description, budget range, preferred date, photos
- Actions: [Send Quote] [Call Customer] [Decline]

### 5.2 — Send Quote flow
**File:** `src/app/api/merchant/requests/[id]/quote/route.ts`

POST endpoint:
- Body: `{ quotedPaise, note, estimatedDate }`
- Updates `QuoteRequest.status = "quoted"`, `quotedPaise`, `merchantReply`, `repliedAt`
- Sends push notification to customer: "You have a new quote from [merchant]"

### 5.3 — Jobs page (accepted quotes become jobs)
**Files:**
- `src/app/merchant/jobs/page.tsx`
- `src/app/api/merchant/jobs/route.ts`

A "job" = a `QuoteRequest` with `status = "accepted"` plus an optional scheduled date.

List view with: customer, job description, scheduled date, status (scheduled / on the way / completed).

Actions per job:
- [On the way] → push to customer
- [Job Complete] → marks done, triggers rating request

### 5.4 — Job detail page
**File:** `src/app/merchant/jobs/[id]/page.tsx`

Shows full job info, customer contact, address, description, agreed price. Actions panel.

### 5.5 — Visit charge setting
**File:** `src/app/merchant/settings/page.tsx`

For Home Services profile, add "Visit / Inspection Charge" field in settings (stored as `attributes.visitChargePaise` on Merchant or a dedicated field). Shown to customers before they send a request.

### 5.6 — Response rate metric (dashboard)
Calculate: (requests responded to within 2 hours) / (total requests in last 30 days). Show as a % on dashboard.

---

**Phase 5 Deliverables:** Requests page, quote flow, jobs page + detail, visit charge setting.
**Effort estimate:** 3–4 days

---

# PHASE 6 — Subscriptions Profile
> No existing models. Needs new schema + full feature set.

### 6.1 — Schema: Subscription models

```prisma
model SubscriptionPlan {
  id           String   @id @default(cuid())
  merchantId   String
  name         String   // "500ml Milk"
  description  String?
  pricePaise   Int      // per delivery
  frequency    String   // "daily" | "weekdays" | "alternate" | "weekly"
  unit         String?  // "500ml", "1 can"
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  merchant      Merchant       @relation(fields: [merchantId], references: [id], onDelete: Cascade)
  subscriptions Subscription[]
}

model Subscription {
  id           String   @id @default(cuid())
  planId       String
  merchantId   String
  customerId   String
  quantity     Int      @default(1)
  status       String   @default("active") // active | paused | cancelled
  startDate    DateTime
  pausedFrom   DateTime?
  pausedUntil  DateTime?
  cancelledAt  DateTime?
  notes        String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  plan      SubscriptionPlan   @relation(fields: [planId], references: [id])
  merchant  Merchant           @relation(fields: [merchantId], references: [id])
  customer  User               @relation(fields: [customerId], references: [id])
  deliveries SubscriptionDelivery[]
}

model SubscriptionDelivery {
  id             String   @id @default(cuid())
  subscriptionId String
  deliveryDate   String   // YYYY-MM-DD
  status         String   @default("pending") // pending | delivered | missed
  deliveredAt    DateTime?
  notes          String?

  subscription Subscription @relation(fields: [subscriptionId], references: [id], onDelete: Cascade)

  @@index([subscriptionId, deliveryDate])
  @@index([deliveryDate, status])
}
```

### 6.2 — Plans CRUD
**Files:**
- `src/app/merchant/plans/page.tsx`
- `src/app/api/merchant/plans/route.ts`
- `src/app/api/merchant/plans/[id]/route.ts`

Create / edit / delete subscription plans.

### 6.3 — Subscribers page
**Files:**
- `src/app/merchant/subscribers/page.tsx`
- `src/app/api/merchant/subscribers/route.ts`

List all subscribers per plan. Per subscriber: status badge, pause/resume/cancel actions, quantity edit.

### 6.4 — Daily Deliveries page
**Files:**
- `src/app/merchant/deliveries/page.tsx`
- `src/app/api/merchant/deliveries/route.ts`

Show all deliveries due today. Merchant marks each as [Delivered] or [Missed]. Progress bar: "12/20 delivered".

### 6.5 — Monthly billing summary
**File:** `src/app/merchant/earnings/page.tsx` (extend for subscriptions)

For Subscriptions profile, earnings page shows: per-subscriber monthly bill (days delivered × price), total collected vs outstanding.

### 6.6 — Pause management
When customer requests pause → merchant notified → merchant confirms → deliveries skipped for date range → billing adjusted.

---

**Phase 6 Deliverables:** 3 new schema models + migration, Plans/Subscribers/Deliveries pages + APIs, billing summary.
**Effort estimate:** 4–5 days

---

# PHASE 7 — Events & Professionals Profile
> Most similar to Appointments. Lighter build.

### 7.1 — Packages page (instead of Catalog)
**Files:**
- `src/app/merchant/packages/page.tsx`

Identical to Catalog but terminology: "Packages", no stock count, add "Includes" field (bullet points stored in `attributes.includes`), add portfolio images.

### 7.2 — Enquiries page
**Files:**
- `src/app/merchant/enquiries/page.tsx`
- `src/app/api/merchant/enquiries/route.ts`

Reuses `QuoteRequest` model. Same as Home Services requests page but with different label ("Enquiry" not "Job Request").

### 7.3 — Bookings page (reuse Phase 4)
Reuse the Appointments bookings page — same model (`Appointment`), same flow.

### 7.4 — Advance payment tracking
**File:** `src/app/merchant/bookings/[id]/page.tsx`

Show payment terms on booking detail: advance paid / remaining balance. Merchant marks balance as collected.

---

**Phase 7 Deliverables:** Packages page, enquiries page, advance payment tracking.
**Effort estimate:** 2 days

---

# Summary: Build Sequence

| Phase | Name | Depends on | Effort | Priority |
|---|---|---|---|---|
| **1** | Foundation (profile system) | Nothing | 2–3 days | 🔴 Critical — blocks everything |
| **2** | Retail polish | Phase 1 | 1 day | 🔴 High — most merchants |
| **3** | Food profile | Phase 1 | 1–2 days | 🔴 High — common category |
| **4** | Appointments profile | Phase 1 | 2–3 days | 🟠 Medium — clinics/salons |
| **5** | Home Services profile | Phase 1 | 3–4 days | 🟠 Medium — electricians/plumbers |
| **6** | Subscriptions profile | Phase 1 | 4–5 days | 🟡 Lower — niche but important |
| **7** | Events & Professionals | Phase 4, 5 | 2 days | 🟡 Lower — small segment |

**Total estimate: ~16–20 days of development**

---

# New Files to Create (Complete List)

### Schema changes
- `prisma/migrations/YYYYMMDD_merchant_profiles/migration.sql` — workflowProfile field + subscription models

### Shared lib
- `src/lib/merchant-profiles.ts` — mapping + nav + labels
- `src/lib/merchant-profile-context.tsx` — React context + hooks

### API routes
- `src/app/api/merchant/bookings/route.ts`
- `src/app/api/merchant/bookings/[id]/route.ts`
- `src/app/api/merchant/bookings/[id]/status/route.ts`
- `src/app/api/merchant/requests/route.ts`
- `src/app/api/merchant/requests/[id]/quote/route.ts`
- `src/app/api/merchant/jobs/route.ts`
- `src/app/api/merchant/plans/route.ts`
- `src/app/api/merchant/plans/[id]/route.ts`
- `src/app/api/merchant/subscribers/route.ts`
- `src/app/api/merchant/subscribers/[id]/route.ts`
- `src/app/api/merchant/deliveries/route.ts`
- `src/app/api/merchant/enquiries/route.ts`

### Pages
- `src/app/merchant/bookings/page.tsx` — Appointments + Events
- `src/app/merchant/bookings/[id]/page.tsx`
- `src/app/merchant/requests/page.tsx` — Home Services
- `src/app/merchant/jobs/page.tsx` — Home Services
- `src/app/merchant/jobs/[id]/page.tsx`
- `src/app/merchant/plans/page.tsx` — Subscriptions
- `src/app/merchant/subscribers/page.tsx` — Subscriptions
- `src/app/merchant/deliveries/page.tsx` — Subscriptions
- `src/app/merchant/packages/page.tsx` — Events
- `src/app/merchant/enquiries/page.tsx` — Events

### Modified files
- `prisma/schema.prisma` — workflowProfile + subscription models
- `src/app/api/mobile/merchants/route.ts` — auto-assign profile
- `src/app/api/merchant/auth/session/route.ts` — return workflowProfile
- `src/app/merchant/layout.tsx` — profile-aware nav
- `src/app/merchant/page.tsx` — profile-aware dashboard
- `src/app/merchant/catalog/page.tsx` — food/appointments tweaks
- `src/app/merchant/orders/page.tsx` — kitchen view for food
- `src/app/merchant/settings/page.tsx` — visit charge for home services
- `src/app/api/mobile/merchants/[id]/orders/route.ts` — stock decrement

---

# What NOT to Build Yet

- Subscription billing automation (auto-deduct wallet on billing date) — Phase 2 of subscriptions
- Staff management (multiple staff per merchant, assign bookings to staff) — future
- In-app messaging between merchant and customer — separate feature
- Merchant mobile app (React Native) — future milestone
- Multi-currency / GST invoicing — future

---

*Ready to start with Phase 1?*
