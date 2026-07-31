# Merchant Workflow Profiles
> Lokul — Hyperlocal Merchant App
> Version 1.0 — Pre-implementation reference

---

## Overview

Every merchant on Lokul is assigned one of **5 workflow profiles** based on their business category. The profile determines:
- Which nav items are visible
- Terminology used throughout the app (Orders vs Bookings vs Jobs)
- Dashboard KPIs
- Onboarding checklist
- Features enabled / hidden

The profile is stored as `workflowProfile` on the `Merchant` model and resolved at login.

---

## Category → Profile Mapping

| Category ID | Category Label | Profile |
|---|---|---|
| `kirana` | Kirana / Grocery | RETAIL |
| `pharmacy` | Pharmacy | RETAIL |
| `dairy` | Dairy / Milk | RETAIL |
| `meat` | Meat / Fish / Eggs | RETAIL |
| `vegetables` | Fruits & Vegetables | RETAIL |
| `bakery` | Bakery / Sweets | RETAIL |
| `stationery` | Stationery / Xerox | RETAIL |
| `gifts` | Gifts / Flowers | RETAIL |
| `jewellery` | Jewellery | RETAIL |
| `mobile` | Mobile / Electronics | RETAIL |
| `hardware` | Hardware / Paint shop | RETAIL |
| `nursery` | Plant nursery | RETAIL |
| `water` | Water can / RO service | RETAIL |
| `tailor` | Tailor / Boutique | RETAIL |
| `restaurant` | Restaurant / Café | FOOD |
| `tiffin` | Tiffin / Home food | FOOD |
| `catering` | Catering / Cook | FOOD |
| `clinic` | Clinic / Doctor | APPOINTMENTS |
| `salon` | Salon / Beauty | APPOINTMENTS |
| `fitness` | Gym / Yoga | APPOINTMENTS |
| `yoga` | Yoga / Meditation | APPOINTMENTS |
| `ayurveda` | Ayurveda / Homeopathy | APPOINTMENTS |
| `tutor` | Tuition / Classes | APPOINTMENTS |
| `driving` | Driving school / Taxi | APPOINTMENTS |
| `petcare` | Pet care | APPOINTMENTS |
| `childcare` | Daycare / Creche | APPOINTMENTS |
| `senior` | Elder care / Nurse | APPOINTMENTS |
| `electrician` | Electrician | HOME_SERVICES |
| `plumber` | Plumber | HOME_SERVICES |
| `carpenter` | Carpenter | HOME_SERVICES |
| `painter` | Painter | HOME_SERVICES |
| `cleaning` | Cleaning / Pest control | HOME_SERVICES |
| `laundry` | Laundry / Ironing | HOME_SERVICES |
| `appliance` | Appliance repair | HOME_SERVICES |
| `repair` | Repairs / Services | HOME_SERVICES |
| `packers` | Packers & Movers | HOME_SERVICES |
| `courier` | Courier / Logistics | HOME_SERVICES |
| `security` | Security services | HOME_SERVICES |
| `cycle` | Cycle / Bike shop | HOME_SERVICES |
| `ca_legal` | CA / Legal services | HOME_SERVICES |
| `insurance` | Insurance agent | HOME_SERVICES |
| `newspaper` | Newspaper / Magazine | SUBSCRIPTIONS |
| `events` | Events / Photography | EVENTS |
| `realestate` | Real estate / Rentals | EVENTS |
| `travel` | Travel agent | EVENTS |
| `other` | Something else | RETAIL |

---

---

# PROFILE 1 — RETAIL 🛒

**Merchant types:** Kirana, Pharmacy, Grocery, Dairy, Meat/Fish, Vegetables, Bakery, Stationery, Gifts, Jewellery, Mobile/Electronics, Hardware, Nursery, Water can, Tailor, Other

---

## Onboarding Checklist (shown on first login)

1. ✅ Add at least 5 catalog items with prices
2. ✅ Set stock count for key items
3. ✅ Set your delivery fee (or mark as free)
4. ✅ Set estimated delivery/ready time
5. ✅ Set your business hours
6. ✅ Create one welcome offer or discount

---

## Core Workflows

### A. Add Products to Catalog
```
Merchant opens Catalog →
  Clicks "Add Item" →
    Fills: Name, Category (e.g. "Pulses"), Price, Unit (e.g. "1 kg"), Stock count, Image →
  Item appears in catalog →
    If stockCount = 0 → auto-shows "Out of Stock" badge to customers
    If stockCount > 0 → decrements on each order
    If stockCount = null → unlimited (no tracking)
```

### B. Receive & Fulfill an Order
```
Customer places order →
  Merchant gets push notification: "New order #LK-001 from Ramesh" →
  Opens Orders page →
    Sees: Items list, delivery address, payment method, customer notes →
    Actions:
      [Confirm] → order moves to "Confirmed", customer notified
      [Reject]  → order cancelled, wallet refunded if applicable
  After confirming:
    Packs items →
    Clicks [Ready / Out for Delivery] → order moves to "In Progress"
    Customer picks up OR delivery agent picks up →
    Clicks [Delivered] → order moves to "Completed"
    Customer gets notification + prompted to rate
```

### C. Manage Stock
```
Merchant opens Catalog →
  Each item shows current stock count →
  Clicks stock badge to edit inline →
  Sets new count (e.g. "12 kg remaining") →
  When count hits 0: item auto-hides from customer view →
  Merchant restocks → sets count again → item reappears
```

### D. Create a Discount Offer
```
Merchant opens Offers →
  Clicks "New Offer" →
    Chooses type: % Off / ₹ Off / BOGO / Free Delivery →
    Sets value, minimum spend, expiry date →
  Offer appears on their shop page for customers →
  Applied automatically at checkout when conditions met
```

### E. Create a Coupon Code
```
Merchant opens Coupons →
  Clicks "Create Coupon" →
    Sets: code (e.g. "SAVE20"), 20% off, min spend ₹200, 50 max uses →
  Shares code with customers via WhatsApp / Lokul feed post →
  Customer enters code at checkout → discount applied
```

---

## Nav Items (Retail)
```
Dashboard | Catalog | Offers | Coupons | Orders | Customers | Earnings | Settings
```

## Dashboard KPIs (Retail)
- Today's Orders
- Pending to Confirm
- Today's Revenue
- Low Stock Items (count of items with stockCount < 5)

## Terminology
| Generic | Retail |
|---|---|
| Catalog | Catalog / Shop |
| Orders | Orders |
| Items | Products |
| Fulfill | Deliver / Pack |

---

---

# PROFILE 2 — FOOD 🍽️

**Merchant types:** Restaurant/Café, Tiffin/Home food, Catering/Cook

---

## Onboarding Checklist

1. ✅ Add your menu items (group into categories: Breakfast, Lunch, Snacks, etc.)
2. ✅ Mark items as Veg / Non-Veg using attributes
3. ✅ Set prep time (how long to prepare an order)
4. ✅ Set delivery fee and minimum order amount
5. ✅ Set your operating hours (no orders outside hours)
6. ✅ Add one photo per popular item

---

## Core Workflows

### A. Set Up Today's Menu
```
Merchant opens Menu →
  All menu items listed →
  Quick toggle per item: Available today / Not available →
    (e.g. "Dal makhani — unavailable today, sold out") →
  Changes reflect immediately on customer-facing shop page →
  Optionally pin a "Today's Special" item at top
```

### B. Receive & Fulfill a Food Order
```
Customer orders 2 items →
  Merchant gets push notification →
  Opens Orders →
    Sees: item list, qty, special instructions, delivery mode →
    [Confirm] → kitchen starts prep, customer notified with ETA →
    [Reject]  → e.g. "Closed early today"
  After prep:
    [Ready] → customer notified to pick up OR delivery person notified →
    [Delivered / Done] → order completed →
  Customer rates meal and delivery
```

### C. Bulk Order View (Lunch rush)
```
During peak hours, merchant opens Orders →
  Sees all pending orders in a compact list →
  [Confirm All Pending] bulk action →
  All confirmed at once →
  Each order shows prep time countdown
```

### D. Manage Recurring Tiffin Orders (basic)
```
Regular customer orders same meal daily →
  Merchant sees returning customer badge in Orders →
  Customer history shows streak: "Orders 5 days this week" →
  Merchant can note preferred items per customer
```

---

## Nav Items (Food)
```
Dashboard | Menu | Offers | Orders | Customers | Earnings | Settings
```

## Dashboard KPIs (Food)
- Today's Orders
- Items to Prepare (pending + confirmed)
- Today's Revenue
- Avg Prep Time (based on completed orders today)

## Terminology
| Generic | Food |
|---|---|
| Catalog | Menu |
| Orders | Orders |
| Items | Dishes / Menu Items |
| Fulfill | Prepare & Deliver |
| isAvailable | Available today |

---

---

# PROFILE 3 — APPOINTMENTS 📅

**Merchant types:** Clinic, Salon/Beauty, Gym/Yoga, Ayurveda, Tuition/Classes, Driving school, Petcare, Childcare, Elder care

---

## Onboarding Checklist

1. ✅ Add your services with duration and price (e.g. "Haircut — 30 min — ₹200")
2. ✅ Set up available time slots for the next 7 days
3. ✅ Set your cancellation policy (in business hours settings)
4. ✅ Set your business hours (slots outside hours auto-hidden)
5. ✅ Enable push notifications for new bookings

---

## Core Workflows

### A. Set Up Services
```
Merchant opens Services →
  Clicks "Add Service" →
    Name: "Full Body Massage"
    Duration: 60 minutes
    Price: ₹800
    Category: "Body treatments"
    Max simultaneous: 1 (one table) or 2 (two chairs in salon) →
  Service appears on their profile for customers to book
```

### B. Open Slots for Booking
```
Merchant opens Slots →
  Selects date (e.g. tomorrow) →
  Clicks "Add Slots" →
    Start: 10:00 AM, End: 11:00 AM, Capacity: 1 →
    Repeat for each hour of working day →
    Or use "Bulk add slots" — set working hours, auto-generates hourly slots →
  Customers can now see and book these slots →
  Slot shows: Available / Booked / Full
```

### C. Receive & Manage a Booking
```
Customer books "Haircut at 3 PM tomorrow" →
  Merchant gets push notification: "New booking from Priya — Haircut, 3 PM" →
  Opens Bookings →
    Sees: service, time, customer name, phone, any notes →
    [Confirm] → customer gets confirmation SMS/notification →
    [Reject / Cancel] → slot reopens, customer refunded/notified
  On the day:
    Appointment reminder sent to customer 1 hour before →
    Merchant marks [Start] when customer arrives →
    Marks [Complete] when done →
    Customer prompted to rate and review
```

### D. Today's Schedule View
```
Merchant opens Dashboard →
  Sees timeline of today's bookings (chronological) →
  Each slot shows: time, customer name, service →
  Quick access to call / WhatsApp customer from booking card
```

### E. Handle Cancellations
```
Customer cancels booking →
  Merchant notified →
  Slot automatically reopens for others →
  If paid in advance: refund initiated →
  Merchant can see cancellation reason
```

---

## Nav Items (Appointments)
```
Dashboard | Services | Slots | Bookings | Customers | Earnings | Settings
```

## Dashboard KPIs (Appointments)
- Today's Bookings (count)
- Next Appointment (time + customer name)
- This Week Revenue
- Cancellation Rate

## Terminology
| Generic | Appointments |
|---|---|
| Catalog | Services |
| Orders | Bookings |
| Items | Services |
| Fulfill | Complete appointment |
| Slots | Available slots |

---

---

# PROFILE 4 — HOME SERVICES 🔧

**Merchant types:** Electrician, Plumber, Carpenter, Painter, Cleaning/Pest control, Laundry, Appliance repair, Packers & Movers, Courier, Security, Cycle/Bike shop, CA/Legal, Insurance

---

## Onboarding Checklist

1. ✅ Add your services with starting price (e.g. "Electrical wiring — from ₹500")
2. ✅ Set your service area (which pincodes you cover)
3. ✅ Set your availability (days and hours you take jobs)
4. ✅ Add photos of past work (builds trust)
5. ✅ Enable push notifications for job requests

---

## Core Workflows

### A. List Your Services
```
Merchant opens Services →
  Clicks "Add Service" →
    Name: "AC Servicing"
    Starting price: ₹400 (or "Price on visit")
    Description: "Includes cleaning filters, gas check, basic service"
    Duration estimate: "1-2 hours" →
  Customer sees service list on merchant profile →
  Customer sends a job request (not a fixed-price order)
```

### B. Receive a Job Request
```
Customer sends request: "Need AC serviced, 2 units, 3rd floor flat" →
  Merchant gets push notification →
  Opens Quote Requests →
    Sees: customer description, address, preferred date/time, photos (if any) →
    Merchant can:
      [Send Quote] → enter price, notes, estimated time →
      [Call Customer] → discuss before quoting →
      [Decline] → with a reason
  Customer receives quote →
    [Accept] → job is confirmed →
    [Counter / Decline] → negotiation or cancel
```

### C. Manage a Job
```
Job confirmed →
  Merchant sees it in Jobs (scheduled date + address) →
  Day of job:
    Merchant marks [On the way] → customer notified →
    Arrives, does the work →
    Marks [Job Complete] →
    Customer verifies and rates →
  Payment collected on-site (cash/UPI) or via wallet
```

### D. Quote Management
```
Merchant opens Quote Requests →
  Sees list of pending requests →
  Each request shows: urgency, description, customer location, time requested →
  Merchant prioritizes and responds →
  Accepted quotes move to Jobs →
  Expired/declined requests archived
```

### E. Visit Charge
```
Some merchants charge a visit fee regardless of job outcome →
  Set in Settings: "Visit charge: ₹100" →
  Shown to customer before they send request →
  Deducted from final bill if job proceeds
```

---

## Nav Items (Home Services)
```
Dashboard | Services | Requests | Jobs | Customers | Earnings | Settings
```

## Dashboard KPIs (Home Services)
- Pending Requests
- Jobs This Week
- This Month Revenue
- Response Rate (% of requests responded to within 1 hour)

## Terminology
| Generic | Home Services |
|---|---|
| Catalog | Services |
| Orders | Jobs |
| Items | Services |
| Fulfill | Complete job |
| Slots | Availability |
| Offers | — (not used) |
| Coupons | — (not used) |

---

---

# PROFILE 5 — SUBSCRIPTIONS 🔁

**Merchant types:** Newspaper delivery, Water can / RO delivery, Milk/Dairy delivery

---

## Onboarding Checklist

1. ✅ Create your subscription plans (e.g. "500ml milk — daily — ₹30/day")
2. ✅ Set your delivery schedule (daily / alternate days / weekly)
3. ✅ Add your first subscribers manually or share signup link
4. ✅ Set monthly billing date
5. ✅ Enable notifications for paused / cancelled subscriptions

---

## Core Workflows

### A. Create a Subscription Plan
```
Merchant opens Plans →
  Clicks "New Plan" →
    Name: "Full cream milk 500ml"
    Price: ₹30/day
    Frequency: Daily (Mon-Sun) or Weekdays or Custom
    Min commitment: 1 month →
  Plan published →
  Customers can subscribe from merchant profile
```

### B. Daily Delivery Management
```
Each morning, merchant opens Deliveries →
  Sees list of all active subscribers for today →
    Includes: name, address, floor/flat, plan, quantity →
  Merchant (or delivery boy) goes through list →
  Marks each as [Delivered] →
  Customers who are paused for today are auto-filtered out →
  End of day: delivery completion % shown on dashboard
```

### C. Subscriber Management
```
Merchant opens Subscribers →
  List of all subscribers with status: Active / Paused / Cancelled →
  Each shows: plan, start date, amount owed this month →
  Actions per subscriber:
    [Pause] — stop delivery for a date range
    [Resume] — restart delivery
    [Edit quantity] — e.g. customer wants 1L instead of 500ml
    [Cancel] — end subscription →
  Cancelled subscribers archived but kept for reference
```

### D. Monthly Billing
```
On billing date (set by merchant, e.g. 1st of month) →
  System calculates: days delivered × daily rate - paused days →
  Generates bill per subscriber →
  Merchant shares bill via WhatsApp or Lokul notification →
  Customer pays via Lokul wallet, UPI, or cash →
  Merchant marks as paid →
  Next month's billing cycle starts
```

### E. Pause / Holiday Management
```
Customer going on vacation →
  Requests pause from app (date range) →
  Merchant notified →
  Merchant confirms pause →
  Deliveries stop for those dates →
  Billing adjusted automatically →
  Auto-resumes on return date
```

---

## Nav Items (Subscriptions)
```
Dashboard | Plans | Subscribers | Deliveries | Earnings | Settings
```

## Dashboard KPIs (Subscriptions)
- Active Subscribers
- Today's Deliveries (pending / completed)
- Paused Subscribers
- This Month Collected (₹)

## Terminology
| Generic | Subscriptions |
|---|---|
| Catalog | Plans |
| Orders | Deliveries |
| Items | Plans |
| Customers | Subscribers |
| Fulfill | Mark delivered |

---

---

# PROFILE 6 — EVENTS & PROFESSIONALS 🎉

**Merchant types:** Events/Photography, Real estate/Rentals, Travel agent

---

## Onboarding Checklist

1. ✅ Add your packages/services with pricing
2. ✅ Add a portfolio (photos of past events / properties)
3. ✅ Set your availability calendar
4. ✅ Enable enquiry requests

---

## Core Workflows

### A. Manage Enquiries
```
Customer sends enquiry: "Need a photographer for wedding, 12 Dec" →
  Merchant gets notification →
  Opens Enquiries →
    Sees: event type, date, location, budget range, contact →
    [Reply with Quote] → custom quote for this event →
    [Schedule Call] → book a consultation call →
    [Decline] →
  Customer accepts quote → converted to a confirmed Booking
```

### B. Package Management
```
Merchant opens Packages →
  Adds: "Wedding Photography Package — ₹25,000"
    Includes: 8 hours, 2 photographers, 500 edited photos, 1 album →
  Packages visible on profile →
  Customers can enquire about any package
```

### C. Booking & Payment
```
Booking confirmed →
  Merchant sets payment terms: 50% advance, 50% on delivery →
  Customer pays advance via Lokul wallet →
  Event day: merchant delivers service →
  Customer pays remaining balance →
  Merchant uploads deliverables (photo gallery link, document) →
  Customer reviews and rates
```

---

## Nav Items (Events & Professionals)
```
Dashboard | Packages | Enquiries | Bookings | Earnings | Settings
```

## Dashboard KPIs (Events)
- Pending Enquiries
- Upcoming Bookings
- This Month Revenue
- Conversion Rate (Enquiries → Bookings)

## Terminology
| Generic | Events |
|---|---|
| Catalog | Packages |
| Orders | Bookings |
| Items | Packages |
| Quote Requests | Enquiries |

---

---

# Profile Assignment Logic

```
Registration → merchant selects category →
  system maps category → workflowProfile →
  stored on Merchant.workflowProfile →
  merchant app reads profile at login →
  renders correct nav, labels, dashboard
```

## Profile can be changed
- Admin can reassign a merchant's profile from the admin panel
- Merchant can request a profile change (e.g. a dairy shop that also does subscriptions)
- Edge cases: some merchants fit two profiles → start with primary, extend later

---

# Shared Features Across All Profiles

These features exist in every profile:

| Feature | Notes |
|---|---|
| Push notifications | New order/booking/request alerts |
| Customer list | With order history |
| Earnings page | Revenue charts |
| Settings | Business hours, profile, notifications |
| Offers | Except Home Services and Events |
| Reviews & Ratings | All profiles |
| Business profile | Name, description, photos, hours |
| Branches | Multi-location (all profiles) |

---

# Implementation Plan (after this doc is reviewed)

1. Add `workflowProfile` field to `Merchant` schema
2. Add category → profile mapping constant (shared lib)
3. Auto-assign profile on merchant registration
4. Merchant layout reads profile → renders profile-specific navItems
5. Rename labels in each page based on active profile (via context or props)
6. Build Subscriptions-specific pages (Plans, Subscribers, Deliveries)
7. Build Events-specific pages (Packages, Enquiries)
8. Build Home Services quote flow (Requests → Quote → Job)
9. Dashboard becomes profile-aware (different KPI cards)

---

*Last updated: 2026-07-29*
*Status: Pre-implementation reference — pending review*
