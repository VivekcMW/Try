# Lokul Monetization PRD
## Subtle, Contextual, Trust-First Advertising & Revenue Architecture

**Document Version:** 1.0  
**Phase:** Phase 3 — Revenue Infrastructure  
**Status:** Draft  
**Owner:** Product & Growth  

---

## 1. Executive Summary

Lokul's monetization strategy is built on a single non-negotiable premise:

> **Every rupee earned must come from making a user's life better — not from exploiting their attention.**

India's existing super-apps have taught users to distrust ads. Banners are scrolled past. Pop-ups are rage-closed. Sponsored content is tuned out. Lokul's advantage is trust — earned through verified identity, hyperlocal relevance, and community-first design. We protect that trust like a first principle.

This PRD defines 12 native ad placements, 8 non-ad revenue streams, 1 premium subscription tier, and a governance framework that ensures no ad unit ever compromises user experience, safety, or privacy.

**Revenue Target:**
- Month 18: ₹50 lakh/month
- Month 30: ₹5 crore/month
- Month 42: ₹25 crore/month (ads) + ₹120 crore/month (transactions + SaaS + fintech)
- **Total ARR by Year 4: ₹1,450 crore**

---

## 2. Monetization Pillars

| Pillar | Description | Revenue Share (Yr 4) |
|--------|-------------|----------------------|
| **Transaction Fees** | 1–2% on marketplace, peer payments, bookings | 34% |
| **Advertising** | 12 native ad formats across app surfaces | 15% |
| **Financial Services** | Credit, insurance, BC agent commissions | 21% |
| **B2G (Govt Contracts)** | State/Central government scheme delivery fees | 14% |
| **SaaS (Business Tools)** | Analytics, CRM, catalogue management for businesses | 7% |
| **Premium Subscription** | Lokul Plus — ad-free + advanced features | 5% |
| **Agri Intelligence SaaS** | Mandi analytics, FPO management tools | 4% |

---

## 3. Core Ad Philosophy & Design Rules

### 3.1 The Three Laws of Lokul Advertising

**Law 1 — Contextual Relevance is Non-Negotiable**  
An ad is only shown when it is directly relevant to what the user is currently doing, viewing, or has recently expressed interest in. A person looking at a plumber listing never sees a saree ad. A farmer reading crop advice never sees a credit card offer.

**Law 2 — Local Businesses Get Priority**  
Any local business within the user's active radius (200m–5km) gets bid priority over national brands at the same CPM. Lokul's inventory belongs to the neighbourhood first.

**Law 3 — Frequency Caps Are Inviolable**  
- Never more than 1 ad per 8 organic items in any feed or list
- Never more than 2 ad placements visible on one screen simultaneously
- Never more than 3 sponsored notifications per week per user
- Never any ad inside an SOS, emergency, health crisis, or active disaster flow

### 3.2 Ad Labelling Standards

Every single sponsored unit carries one of these labels — no exceptions, no grey areas:

| Label | When Used |
|-------|-----------|
| `Sponsored` | Paid placement by a business (grey, 10sp font, top-right) |
| `Promoted` | Seller paid to boost their own Lokul listing |
| `Powered by [Brand]` | Brand co-sponsored a community event or campaign |
| `Ad` | Story-format or video ads |
| `Partner Offer` | Financial product, insurance, credit |

Label colour: `#9CA3AF` (light grey) — visible but not attention-grabbing. Users who understand it will notice it. Users who don't care will scroll past without disruption.

### 3.3 Sacred Zones — Permanently Ad-Free

These surfaces will never carry any form of advertising under any commercial circumstance:

- SOS and emergency alert screens
- Active safety incident view
- Women's journey guardian screen
- Disaster relief coordination board
- Mental health crisis chat
- Ambulance / blood emergency request
- Government scheme application flow
- RTI / grievance filing flows
- Child safety alert
- Any screen where user has been detected to be in distress (AI-flagged)

**Implementation:** An `isEmergencyContext` boolean flag is propagated across the entire app session. If `true`, all ad slots return null components. This is enforced at the component level, not the API level, so there is no network-layer race condition.

---

## 4. The 12 Ad Placements — Detailed Specifications

---

### Placement 01 — Feed Sponsored Post (Native Card)

**Surface:** Home Feed (main tab)  
**Format:** Native post card — visually identical to organic user and business posts  
**Label:** "Sponsored" — light grey, 10sp, top-right corner of card  
**Frequency:** 1 sponsored card per 8 organic cards. First sponsored card never appears before card position 5.  
**Minimum scroll depth before first ad:** 400px (user must have seen actual content first)

**Card Anatomy:**
```
┌──────────────────────────────────────────────────┐
│  [Avatar]  Sharma Kirana · Karol Bagh  Sponsored │
│            2 min ago                             │
│                                                  │
│  Fresh paneer stock just arrived 🥛              │
│  ₹280/kg · Delivery available till 9 PM          │
│                                                  │
│  [Product Photo — 16:9 ratio, max 300KB]         │
│                                                  │
│  📍 0.3 km away   ★ 4.7 (312 reviews)           │
│                                                  │
│  [Order Now]              [Save for later]       │
│ ─────────────────────────────────────────────── │
│  👍 Like   💬 Comment   ↗ Share   ⋯ Hide this ad │
└──────────────────────────────────────────────────┘
```

**Targeting Parameters:**
- User's active radius (hard match — no ads outside selected radius)
- Category interest (inferred from feed interactions, search history)
- Time of day (food ads 7–9 AM and 6–9 PM; home services 10 AM–3 PM)
- Trust tier (Gold-tier users see premium business ads; Bronze sees local micro-ads)
- Weather API integration (hot day → cold drink ads; rainy day → umbrella/raincoat ads)

**User Controls:**
- "Hide this ad" → dismisses permanently for this business
- "Why am I seeing this?" → plain language explanation shown
- "Don't show [category] ads" → category-level suppression
- After 3 "hide this ad" actions → frequency of this category drops by 50%

**Pricing Model:**

| Package | Format | Price | Minimum Spend |
|---------|--------|-------|---------------|
| Micro Local | Pay per impression | ₹40 CPM | ₹500/week |
| Growth | Pay per click | ₹3–₹8 CPC | ₹2,000/week |
| Brand | Fixed placement, 10K impressions/day | ₹8,000/week | ₹8,000/week |
| National Brand | Category takeover, all users in city | ₹50,000/day | ₹50,000/day |

**Who Buys This:**
- Local kirana shops, salons, home bakers, coaching centres
- FMCG brands running hyperlocal campaigns
- Real estate projects targeting locality residents
- New restaurant/cloud kitchen launches

**Acceptance Criteria:**
- [ ] Ad card component is pixel-identical to organic post card
- [ ] "Sponsored" label is present on every render — no exceptions
- [ ] "Hide this ad" action updates preference in <500ms, ad disappears immediately
- [ ] No ad appears within first 5 cards on cold start
- [ ] Frequency cap enforced server-side AND client-side (dual enforcement)
- [ ] Ad renders correctly offline (cached creative) or gracefully hides if no cached creative

---

### Placement 02 — Discover / Search Promoted Listing

**Surface:** Discover tab → Search results, category browse lists  
**Format:** Top 1–2 results pinned with a subtle amber dot and "Promoted" text  
**Label:** Amber dot (●) + "Promoted" in amber (#F59E0B), 9sp — visible but not aggressive  
**Frequency:** Maximum 2 promoted listings per search results page (positions 1 and 4)

**Search Result Card Anatomy:**
```
┌──────────────────────────────────────────────────┐
│  ● Promoted                                      │
│  [Business Photo]  Rajesh Plumbing Services      │
│                    ★ 4.8 (89 reviews) · 0.8 km  │
│                    Verified ✓ · Available Now     │
│                    Starting ₹300                 │
│  [Book Now]                              [Call]  │
└──────────────────────────────────────────────────┘
```

**Relevance Gate (Critical):**  
A promoted listing is only shown if its categories and service tags match the user's search query with ≥70% semantic similarity (via Meilisearch relevance score). A plumbing ad never appears in a search for "yoga classes". Irrelevant promoted results are suppressed even if the advertiser has paid — we refund unshown impressions.

**Pricing Model:**

| Boost Level | Price | Duration |
|-------------|-------|----------|
| Basic Boost | ₹99/week | Top 3 in category, 500m radius |
| Growth Boost | ₹299/week | Top 1 in category, 2km radius |
| Power Boost | ₹799/week | Top 1 in category, 5km radius + featured on Discover tab |

**Who Buys This:**
- Any verified Lokul business wanting more walk-ins and bookings
- Service professionals (electricians, plumbers, tutors, beauticians)
- New businesses in the area wanting rapid discovery

**Acceptance Criteria:**
- [ ] Promoted badge renders in position 1 and/or 4 only — never adjacent (no two promoted results side-by-side)
- [ ] Relevance gate blocks irrelevant ads regardless of payment status
- [ ] Unshown impressions auto-refunded within 24 hours
- [ ] Promoted listings still require same trust score as organic listings — cannot buy visibility without verification

---

### Placement 03 — Map Promoted Pins

**Surface:** Map view in Discover tab and Kisan Hub  
**Format:** Sponsored business pins are 20% larger than standard pins. Use a filled icon (filled circle with category icon inside). On tap, bottom sheet opens with business card.  
**Label:** "Sponsored" chip at top-right of bottom sheet business card  
**Frequency:** Maximum 5 promoted pins visible at any map zoom level. As user zooms in, less relevant promoted pins are hidden.

**Pin Design System:**
```
Standard Pin:    ○ (outline icon, 20px)
Promoted Pin:    ● (filled icon, 24px) — slightly larger, filled colour
Selected Pin:    ◉ (ring + filled, 28px) — on tap
```

**Bottom Sheet on Tap:**
```
┌──────────────────────────────────────────────────┐
│ ════════════════ (drag handle)                   │
│                                          Sponsor │
│  [Full-width business photo]                     │
│                                                  │
│  Asha Medicals                                   │
│  Pharmacy · 0.4 km away · Open until 10 PM      │
│  ★ 4.6 (201 reviews) · Verified ✓               │
│                                                  │
│  Today's offer: 10% off on diabetic strips       │
│                                                  │
│  [Get Directions]    [Call]    [View Catalogue]  │
└──────────────────────────────────────────────────┘
```

**Targeting:**
- Geographic radius from map centre (tight match)
- Map zoom level determines visibility — broader zoom shows fewer, larger pins
- Category filter active on map → only matching promoted pins shown

**Pricing Model:**

| Coverage | Price | Duration |
|----------|-------|----------|
| 500m radius | ₹599/month | Standard pin upgrade |
| 2km radius | ₹1,499/month | Prominent placement |
| Whole city | ₹15,000/month | National brands (pharmacies, banks, fuel stations) |

**Who Buys This:**  
Petrol pumps, ATMs, hospitals, pharmacies, supermarkets, QSR chains — anyone whose business model depends on physical foot traffic and location-triggered discovery.

**Acceptance Criteria:**
- [ ] Max 5 promoted pins visible at any given zoom level
- [ ] Promoted pin cluster radius enforced — no two promoted pins within 100m of each other at the same zoom
- [ ] If user taps and holds promoted pin, "Why promoted?" tooltip appears
- [ ] On map category filter change, irrelevant promoted pins disappear immediately

---

### Placement 04 — Stories — Sponsored Story Tile

**Surface:** Stories strip on Home Feed (horizontal scroll at top)  
**Format:** One sponsored story tile between organic story tiles. Subtle gradient border (amber/gold) instead of standard border. "Ad" chip overlay on tile.  
**Label:** "Ad" — white chip, top-right corner of the story tile thumbnail  
**Frequency:** 1 sponsored story per story strip. Appears at position 3 or 4 (never first, never last).  
**Duration:** Maximum 6 seconds autoplay (same as organic). User can tap to skip at any time.

**Story Tile Anatomy (in strip):**
```
 [User1]   [User2]  [● Ad]   [User3]  [User4]
```

**Full-Screen Story Ad Anatomy:**
```
┌──────────────────────────────────────────────────┐
│ ●●●●●●●●●● ●●●●●●●●●● [Ad] ●●●●●●●●●●          │  ← progress bars
│ [Brand Logo]  Brand Name         [Skip ›]        │
│                                                  │
│                                                  │
│         [Full bleed creative — 9:16]             │
│                                                  │
│                                                  │
│         "Monsoon sale — 30% off                  │
│          all rainwear"                           │
│                                                  │
│         [Shop Now ↑]  (swipe up CTA)            │
└──────────────────────────────────────────────────┘
```

**Creative Specifications:**
- Vertical video: 9:16 ratio, max 6 seconds, max 5MB
- Static image: 9:16 ratio, max 500KB, min 3-second display
- File formats: MP4 (H.264), JPG, PNG, WebP
- Safe zone: 150px top and 200px bottom (no text in these zones — UI overlays them)
- No auto-play audio — audio plays only if user has tapped the story (with explicit intent)

**Targeting:**
- Age group (inferred from profile + onboarding data — never from third-party data)
- Interest category (inferred from Lokul interactions only)
- Time of day and day of week
- Seasonality (auto-applied by platform — Diwali inventory, Holi, etc.)

**Pricing Model:**

| Package | Price | Impressions |
|---------|-------|-------------|
| City Stories | ₹5,000/day | ~50,000 impressions in one city |
| State Stories | ₹18,000/day | ~200,000 impressions across a state |
| National Stories | ₹75,000/day | All active users nationally |

**Who Buys This:**  
FMCG brands (HUL, P&G, Marico, Britannia), D2C brands, OTT platforms (new show launches), fintech, insurance, fashion — brands with visual storytelling budgets.

**Acceptance Criteria:**
- [ ] Skip button present from frame 1 — no mandatory watch time
- [ ] Audio muted by default, plays only if user has unmuted the story strip
- [ ] Story creative pre-cached on Wi-Fi — no buffering on 4G/3G
- [ ] On 2G, story ad gracefully degrades to static image or is skipped entirely

---

### Placement 05 — Transaction Confirmation Screen (Post-Payment Offer)

**Surface:** Payment success screen, shown after any completed transaction  
**Format:** A single offer card appears below the success confirmation. Non-blocking — user can proceed without interacting.  
**Label:** "Partner Offer" — left-aligned, above the offer card  
**Frequency:** Maximum 1 offer per transaction. Not shown on every transaction — shown on every 3rd transaction for the same user (frequency cap).

**Screen Layout:**
```
┌──────────────────────────────────────────────────┐
│                                                  │
│  ✅  Payment Successful                          │
│                                                  │
│  ₹450 paid to Sharma Kirana                     │
│  Ref: TXN2025XXXXXXXX                           │
│                                                  │
│  [View Receipt]          [Back to Home]          │
│                                                  │
│ ─────────────────────────────────────────────── │
│                                                  │
│  Partner Offer                                   │
│  ┌─────────────────────────────────────────┐    │
│  │ 🏦 HDFC SmartPay                        │    │
│  │                                         │    │
│  │  Get 5% cashback on grocery purchases   │    │
│  │  above ₹500 this week.                  │    │
│  │  Offer valid till Sunday.               │    │
│  │                                         │    │
│  │  [Activate Offer]          [No thanks]  │    │
│  └─────────────────────────────────────────┘    │
│                                                  │
└──────────────────────────────────────────────────┘
```

**Contextual Matching Logic:**

| User Just Paid For | Offer Category Shown |
|--------------------|----------------------|
| Grocery / kirana | Cashback card, grocery insurance |
| Medical / pharmacy | Health insurance top-up, Jan Aushadhi |
| Peer service (plumber, electrician) | Home insurance, warranty plan |
| Food order (tiffin/restaurant) | Food subscription, nutrition app |
| Coaching / tuition | Ed-loan, scholarship finder |
| Rent payment | Renters insurance, home loan pre-approval |
| Any large transaction (>₹5,000) | Credit line, BNPL, investment suggestion |

**Pricing Model:**  
Cost Per Acquisition (CPA) — advertiser pays only when user taps "Activate Offer", not just on impression.

| Partner Type | CPA Rate |
|--------------|----------|
| Credit card / debit card | ₹150–₹400 per activation |
| Insurance policy | ₹200–₹600 per lead |
| Loan product | ₹300–₹1,000 per qualified lead |
| Cashback offer | ₹15–₹50 per activation |

**Who Buys This:**  
Banks (HDFC, ICICI, SBI, Kotak), insurance companies (Star Health, HDFC Life), BNPL providers (LazyPay, ZestMoney), investment platforms (Groww, Zerodha, Paytm Money).

**Acceptance Criteria:**
- [ ] Offer card never blocks or delays access to receipt or home button
- [ ] "No thanks" dismisses permanently for that partner for 30 days
- [ ] CPA tracking pixel fires only on "Activate Offer" tap, never on impression
- [ ] Offer not shown if transaction amount is <₹50 (too small to be relevant)
- [ ] Offer not shown to users in financial distress (AI-flagged users with negative balance signals)

---

### Placement 06 — Onboarding Completion — Neighbourhood Welcome Offers

**Surface:** Welcome screen — shown once, immediately after onboarding is complete  
**Format:** A carousel of 3 local business offers, framed as "Welcome to [Locality Name]" gifts  
**Label:** Small "Offers from local partners" subtitle below the headline  
**Frequency:** Shown exactly once per user lifetime — on first successful onboarding completion  

**Screen Layout:**
```
┌──────────────────────────────────────────────────┐
│                                                  │
│  Welcome to Karol Bagh, Priya! 🎉               │
│  Your neighbourhood is ready for you.            │
│                                                  │
│  Offers from local partners                      │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐ │
│  │[Shop Photo]│  │[Shop Photo]│  │[Shop Photo]│ │
│  │ Sharma     │  │ Sonu Salon │  │ Karol Bagh │ │
│  │ Kirana     │  │            │  │ Pharmacy   │ │
│  │ 10% off    │  │ Free 1st   │  │ ₹100 off   │ │
│  │ first order│  │ haircut    │  │ first order│ │
│  │ [Claim]    │  │ [Claim]    │  │ [Claim]    │ │
│  └────────────┘  └────────────┘  └────────────┘ │
│                                                  │
│  [Explore Lokul →]                               │
│                                                  │
└──────────────────────────────────────────────────┘
```

**Inventory Logic:**  
Participating local businesses pre-register "new neighbour offers" through the Lokul Business Dashboard. Shown in order of: distance first → highest offer value second → most reviews third.

**Pricing Model:**  
Local businesses pay ₹199–₹499 per new customer lead generated through this placement. The offer itself is the business's choice (they decide the discount — Lokul does not fund the discount).

**Acceptance Criteria:**
- [ ] Shown exactly once — onboarding completion event is idempotent
- [ ] Maximum 3 offer cards shown — never more
- [ ] All 3 offers must be from businesses within user's detected locality radius
- [ ] "Explore Lokul" CTA is always visible — user never blocked by offers
- [ ] Claimed offers tracked and redeemable at the partner business

---

### Placement 07 — Kisan Hub — Agricultural Input Sponsorships

**Surface:** Kisan Hub → Crop advisory pages, Soil health card page, Agri Advisor AI recommendations  
**Format:** "Recommended Products" section appears below organic agri advice content. Brand name and logo clearly displayed. Framed as a product recommendation, not a banner.  
**Label:** "Sponsored by [Brand Name]" — left-aligned, above the product card  
**Frequency:** Maximum 1 sponsored section per crop advisory page. Never shown in the Agri Advisor AI chat interface — only on static advisory pages.

**Crop Advisory Page Layout:**
```
┌──────────────────────────────────────────────────┐
│  Wheat Crop Advisory — Rabi Season               │
│                                                  │
│  Sowing window: Oct 15 – Nov 15                 │
│  Recommended variety: HD-2967, PBW-502           │
│  Water requirement: 5–6 irrigations              │
│  ...                                             │
│                                                  │
│ ─────────────────────────────────────────────── │
│                                                  │
│  Sponsored by Bayer CropScience                  │
│  ┌─────────────────────────────────────────┐    │
│  │ [Product Image]                         │    │
│  │ Mahyco 8475 Wheat Seed                  │    │
│  │ Suitable for this soil type ✓           │    │
│  │ Avg yield: 52 qt/hectare                │    │
│  │ Price: ₹1,200/kg (MRP shown)            │    │
│  │                                         │    │
│  │ [Compare with other brands]  [Enquire]  │    │
│  └─────────────────────────────────────────┘    │
│                                                  │
│  [View 3 more product options]                  │
└──────────────────────────────────────────────────┘
```

**Trust Rules for Agri Ads:**
- MRP must always be shown — no hidden pricing
- Competing brands' products always linkable — "Compare with other brands" is mandatory
- Sponsored products must be relevant to the exact crop and soil type on the page
- No misleading efficacy claims — FSSAI/CIBRC compliance verified at upload
- Farmer reviews of the product shown below (cannot be hidden by advertiser)

**Pricing Model:**

| Package | Targeting | Price |
|---------|-----------|-------|
| Crop Category | All farmers viewing wheat/rice/cotton pages | ₹3,000 CPM |
| State-crop combo | Wheat farmers in Punjab only | ₹5,000 CPM |
| Soil type targeted | Sandy loam + rice farmers in UP | ₹7,000 CPM |

**Who Buys This:**  
Bayer, Syngenta, UPL, IFFCO, Mahindra AgriTech, Coromandel, Godrej Agrovet, seed companies, irrigation equipment brands (Netafim, Jain Irrigation).

**Acceptance Criteria:**
- [ ] MRP display is mandatory — ad rejected at upload if price absent
- [ ] "Compare with other brands" link always functional and leads to unsponsored comparison
- [ ] Sponsored section appears below all organic advisory content — never above
- [ ] Farmer can report misleading claim — reported ads paused within 2 hours pending review
- [ ] Not shown to farmers browsing from states where the product is banned (state regulatory check)

---

### Placement 08 — Job Board — Promoted Job Listings

**Surface:** Rozgar Connect → Job listings feed, category browse  
**Format:** Boosted job cards appear at top of relevant category. Tag reads "Hiring Actively" in green — positive, benefit-forward framing.  
**Label:** "Hiring Actively" green chip on card top-left  
**Frequency:** Maximum 2 promoted listings per category page (positions 1 and 5)

**Promoted Job Card Anatomy:**
```
┌──────────────────────────────────────────────────┐
│  ● Hiring Actively                               │
│  [Company Logo]  Raj Construction Co.            │
│                  Site Supervisor · Saket         │
│                  ₹25,000–₹32,000/month           │
│                  Full-time · Verified Employer ✓ │
│                                                  │
│  ✓ PF + ESIC      ✓ Paid leaves                 │
│  ✓ Timings: 8AM–5PM   ✓ Sunday off              │
│                                                  │
│  [Apply Now]                  [Save Job]         │
└──────────────────────────────────────────────────┘
```

**Trust Requirements for Promoted Jobs:**
- Employer must be Lokul-verified (GSTIN or Udyam registration)
- Salary range must be disclosed — no "salary negotiable" for promoted slots
- Benefits (PF, ESIC, leave policy) must be filled — incomplete listings rejected
- Below-minimum-wage listings blocked regardless of payment status
- Employers with active disputes or complaints cannot purchase promoted slots

**Pricing Model:**

| Duration | Price | Reach |
|----------|-------|-------|
| 7 days | ₹499 | Promoted in 5km radius |
| 14 days | ₹899 | Promoted in 10km radius |
| 30 days | ₹1,799 | Promoted city-wide |
| Premium (30 days + featured on Jobs homepage) | ₹3,499 | City + featured banner |

**Who Buys This:**  
Construction companies, factories, restaurants, retail chains, domestic help agencies, logistics companies, courier companies, hospitals (nurse/ward boy roles), BPO/call centres.

**Acceptance Criteria:**
- [ ] "Hiring Actively" badge only granted after employer passes verification
- [ ] Salary field validation: floor = applicable state minimum wage × 1.1 (10% above minimum)
- [ ] Employer with 3+ unresolved complaints auto-blocked from promoted slots
- [ ] Job seekers can one-tap report misleading promoted listings

---

### Placement 09 — Community Pages — Brand Co-Sponsored Events

**Surface:** Community tab → Event listings, RWA notice board, Community event detail pages  
**Format:** Brands co-sponsor hyperlocal community events. Their name appears as "Powered by [Brand]" on event cards and detail pages. No other visual intrusion.  
**Label:** "Powered by [Brand]" — small, bottom of event card, muted text  
**Frequency:** Maximum 1 co-sponsor per event. Maximum 30% of events in the community feed can be co-sponsored.

**Event Card — Co-Sponsored:**
```
┌──────────────────────────────────────────────────┐
│  🎉 Karol Bagh Diwali Mela                       │
│  Sat, 2 Nov · 5:00 PM onwards                    │
│  Arya Samaj Ground, Karol Bagh                   │
│                                                  │
│  312 going · Free entry                          │
│  Organised by Karol Bagh RWA                     │
│                                                  │
│  [RSVP]                    [Share]               │
│                                                  │
│  Powered by Haldiram's Karol Bagh ·· ··          │
└──────────────────────────────────────────────────┘
```

**Sponsorship Rules:**
- The community (RWA/group admin) must accept the sponsorship — brands cannot unilaterally attach to events
- Community takes 60% of co-sponsorship fee, Lokul takes 40%
- Brand gets no editorial control over event content
- Alcohol, tobacco, gambling, political brands cannot co-sponsor any event
- Brand can optionally offer an "attendee offer" (discount code shown after RSVP)

**Pricing Model:**

| Event Size | Co-sponsorship Fee (total) | Community Earns |
|------------|---------------------------|-----------------|
| Locality event (<200 attendees) | ₹2,000 | ₹1,200 |
| Society event (<1,000 attendees) | ₹7,500 | ₹4,500 |
| Neighbourhood event (<5,000 attendees) | ₹25,000 | ₹15,000 |

**Who Buys This:**  
Local restaurant chains, sweet shops (Diwali/Eid tie-ins), sports brands (cricket season), FMCG brands, telecom companies wanting hyperlocal brand presence.

**Acceptance Criteria:**
- [ ] Community admin receives in-app approval prompt before any brand name appears on their event
- [ ] Community's 60% share deposited to community wallet within 48 hours of event date
- [ ] Brand cannot modify event details, remove attendees, or add their own posts to the event
- [ ] Political, religious divisive, alcohol, tobacco brands hard-blocked at submission

---

### Placement 10 — Daily Digest Notification — Sponsored Insight

**Surface:** Morning AI digest notification (sent daily at 7:30 AM local time)  
**Format:** Digest ends with a single sponsored line, clearly separated with a horizontal divider and "Sponsored" label  
**Label:** "Sponsored" — before the sponsored line  
**Frequency:** Maximum 1 sponsored line per digest. Not shown every day — shown maximum 4 times per week.

**Digest Notification Format:**
```
🌅 Good morning, Priya

• 2 new safety updates in Karol Bagh
• Fresh vegetables arriving at Sharma Kirana at 8 AM
• Your community yoga session is at 6:30 PM today
• 3 new job listings match your skills

──────────────────
Sponsored: Star Health Insurance — 
Monsoon is here. Is your family's health 
cover enough? Check in 2 min.
──────────────────

[Open Lokul]
```

**Contextual Rules for Digest Ads:**
- Sponsored line must be relevant to current season, local events, or user life stage
- Health insurance shown before monsoon season (June–Sept), not in January
- Crop insurance shown to farmers before Kharif/Rabi sowing seasons
- Travel insurance shown before long weekends (auto-detected from public holiday API)
- Education loans shown in April–June (admission season)
- No financial product ads shown to users with recent negative payment history (detected from wallet)

**Pricing Model:**
- Sold by week-slot in a given city
- ₹3,000–₹12,000 per city per week (based on active user base size)
- National digest sponsorship: ₹80,000/week

**Who Buys This:**  
Insurance companies, banks, edtech platforms, travel companies, health supplement brands, NBFC (loan products).

**Acceptance Criteria:**
- [ ] Sponsored line renders below a clear `──────────────────` divider
- [ ] Digest without a sponsored line (3 days per week) shows no divider
- [ ] User can turn off sponsored digest lines in notification settings (one tap)
- [ ] Digest sponsorship not shown to users who have Lokul Plus subscription

---

### Placement 11 — Scheme Aggregator — Complementary Private Product Card

**Surface:** Jan Seva → Government scheme results page, post-eligibility check  
**Format:** Below the list of eligible government schemes, a "Private Options That Complement This Scheme" section shows 1–2 relevant private products  
**Label:** "Sponsored" — clearly marked above the private product card  
**Frequency:** 1 private product card per scheme results view. Not shown if user has ≤Bronze KYC (sensitive population — don't push financial products)

**Page Layout:**
```
┌──────────────────────────────────────────────────┐
│  You qualify for these schemes 🎉                │
│                                                  │
│  ✅ PM-JAY Ayushman Bharat                       │
│     Up to ₹5 lakh health cover/year             │
│     [Apply Now]                                  │
│                                                  │
│  ✅ PM Suraksha Bima Yojana                      │
│     ₹2 lakh accident cover · ₹20/year           │
│     [Apply Now]                                  │
│                                                  │
│  ✅ Atal Pension Yojana                          │
│     ₹1,000–₹5,000 monthly pension               │
│     [Apply Now]                                  │
│                                                  │
│ ─────────────────────────────────────────────── │
│  Sponsored                                       │
│  ┌─────────────────────────────────────────┐    │
│  │ 💊 Star Health Insurance                 │    │
│  │                                         │    │
│  │  PM-JAY gives ₹5L cover for hospital.   │    │
│  │  What about OPD, medicines & tests?     │    │
│  │  Top-up plans from ₹99/month.           │    │
│  │                                         │    │
│  │  [Check Plans]            [No thanks]   │    │
│  └─────────────────────────────────────────┘    │
└──────────────────────────────────────────────────┘
```

**Ethical Rules:**
- Private product card can never suggest the government scheme is insufficient — it only mentions what it does NOT cover
- No dark patterns — "No thanks" dismisses for 30 days
- Products shown must be genuinely complementary, not substitutes for the government scheme
- RBI-licensed entities only — no unlicensed lenders or chit funds

**Pricing Model:**
- CPC model: ₹25–₹80 per "Check Plans" tap
- Premium category placements: Insurance (₹80 CPC), Loans (₹60 CPC), Savings (₹30 CPC)

**Acceptance Criteria:**
- [ ] Not shown to Bronze-tier users (most vulnerable population)
- [ ] Government scheme content never altered or diminished by presence of sponsored card
- [ ] All advertiser products IRDAI/RBI licensed — verified at onboarding, re-verified quarterly
- [ ] Sponsored card collapsed by default on first view — user taps to expand (ultra-non-intrusive variant)

---

### Placement 12 — Business Profile Page — "Similar Businesses Nearby" Footer

**Surface:** Local Business profile page → bottom section  
**Format:** "Explore nearby" section shows 2–3 cards — mix of organic similar businesses and 1 promoted slot  
**Label:** Promoted business card has a subtle "Promoted" chip in grey — identical size as organic cards  
**Frequency:** 1 promoted slot in every "Explore nearby" section. Section itself only appears if user has scrolled past 70% of the business profile (high intent signal).

**Section Layout:**
```
┌──────────────────────────────────────────────────┐
│  Explore nearby                                  │
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ [Photo]  │  │ [Photo]  │  │ [Photo]  │       │
│  │ Pawan    │  │ City     │  │Promoted  │       │
│  │ Salon    │  │ Barbers  │  │ ─────── │       │
│  │ ★4.5    │  │ ★4.2    │  │ Style Co │       │
│  │ 0.3km   │  │ 0.7km   │  │ ★4.8 New│       │
│  └──────────┘  └──────────┘  └──────────┘       │
└──────────────────────────────────────────────────┘
```

**Strategy Options:**
- **Competitor conquest:** A competing business pays to appear on a rival's profile page. Allowed — this is standard in all search advertising.
- **Complementary cross-sell:** A flower shop appears at the bottom of a wedding planner's profile.
- **New business launch:** A new business buys placements on all established competitors' pages.

**Pricing Model:**
- ₹50 CPM — paid by the appearing business
- Minimum ₹500/campaign, self-serve via Lokul Business Dashboard

**Acceptance Criteria:**
- [ ] Promoted card is always visually the same size as organic cards — no size advantage
- [ ] A business cannot buy placement on its own profile page
- [ ] Profile page owner is not notified of who bought the placement (privacy for advertiser)
- [ ] Section only renders if user scrolled >70% of profile — prevents accidental impressions

---

## 5. Lokul Plus — Premium Ad-Free Subscription

**Price:** ₹49/month or ₹499/year (save ₹89)  
**Target segment:** Urban power users, business owners, privacy-conscious users, seniors who dislike distraction

**What Lokul Plus Includes:**

| Feature | Free | Plus |
|---------|------|------|
| Feed ads | ✅ | ❌ (ad-free) |
| Discover promoted listings | ✅ | ❌ |
| Map promoted pins | ✅ | ✅ (still shown — adds value) |
| Story ads | ✅ | ❌ |
| Transaction screen offers | ✅ | ❌ |
| Digest sponsored line | ✅ | ❌ |
| Scheme page sponsored card | ✅ | ❌ |
| Business profile promoted section | ✅ | ❌ |
| Priority customer support | ❌ | ✅ |
| Advanced wallet analytics | ❌ | ✅ |
| Business booking priority | ❌ | ✅ |
| Larger file uploads (community posts) | ❌ | ✅ |
| Exclusive community events access | ❌ | ✅ |
| Extended transaction history (5 years) | 1 year | 5 years |

**Revenue Model:**  
At 5% of 10M users (500,000 Plus subscribers) × ₹49/month = **₹2.45 crore/month** recurring.

**Acceptance Criteria:**
- [ ] Plus subscription verified server-side — client cannot spoof Plus status
- [ ] Plus activated within 30 seconds of payment confirmation
- [ ] Cancellation is one tap — no dark patterns, no "are you sure?" loops
- [ ] Downgrade to free tier immediately restores all ad placements

---

## 6. Non-Ad Revenue Streams

### 6.1 Transaction Fees

| Transaction Type | Fee | Notes |
|-----------------|-----|-------|
| Peer-to-peer goods sale | 2% (seller pays) | Capped at ₹50/transaction |
| Service booking (peer) | 2.5% (split: 1.5% buyer, 1% seller) | Escrow included |
| Business catalogue order | 1.5% (business pays) | Encourages business adoption |
| Group buy coordinator fee | 1% of total group buy value | Paid by the lead organiser |
| Event ticket (third-party events) | 3% service fee | Standard ticketing industry rate |
| Classifieds (>₹5,000 item) | ₹25 flat listing fee | Free below ₹5,000 |

**Zero-fee commitments (permanently):**
- User-to-user money transfers
- Scheme application submissions
- Safety / SOS activations
- Grievance / RTI filing
- Health consultation (free tier)
- Job applications

### 6.2 Business SaaS Tools — Lokul Business Pro

**₹199/month per business location**

Includes:
- Advanced analytics dashboard (views, clicks, conversion, repeat customers)
- Customer CRM with purchase history
- Bulk WhatsApp messaging to customers (via Lokul — no external tool needed)
- Inventory management with low-stock alerts
- Multi-branch management
- GST invoice generation and bulk download
- Priority placement in search (algorithmic boost, not paid ad)
- Dedicated business onboarding manager

### 6.3 Financial Services Commission

| Product | Commission Rate |
|---------|----------------|
| Term life insurance enrollment | ₹200–₹500 per policy |
| Health insurance enrollment | ₹300–₹800 per policy |
| Micro-loan referral (NBFC) | 1–2% of loan disbursed |
| BC agent cash-in/cash-out transactions | 0.5% shared with BC agent |
| PMJDY account opening (BC commission) | ₹150 per account |
| Fixed deposit referral | 0.25% of FD amount |
| Mutual fund SIP referral | 0.5% annual trail commission |

### 6.4 B2G (Government Contracts)

State and Central government departments pay Lokul for last-mile scheme delivery:
- PM-JAY enrollment drives (per verified enrollment: ₹50–₹150)
- e-Shram registration camps (per registration: ₹30)
- Digital literacy missions (per certified learner: ₹200)
- Voter registration drives (partnered with ECI — per registration: ₹25)
- Health survey digitisation (per completed household survey: ₹40)

### 6.5 Agri Intelligence SaaS

For FPOs, agri-input companies, and state agriculture departments:
- Mandi price analytics API: ₹5,000/month per API consumer
- Crop advisory content licensing: ₹50,000/year per district
- FPO management SaaS (white-labelled): ₹2,000/month per FPO
- Farmer database insights (anonymised, consent-based): ₹1 lakh/year per report

---

## 7. Ad Quality & Governance Framework

### 7.1 Ad Review Process

```
Advertiser submits creative + targeting
        ↓
Automated scan (AI moderation)
  • Prohibited category check
  • Misleading claim detection (LLM-based)
  • Image quality and spec check
  • Price validity check (must match actual website price)
  • Legal compliance check (ASCI guidelines)
        ↓
Pass → Goes live within 2 hours
Fail → Rejection with specific reason code sent to advertiser
Uncertain → Human review queue (24-hour SLA)
```

### 7.2 Prohibited Ad Categories (Absolute Blocklist)

The following categories are permanently blocked — no exceptions, no manual overrides:

- Alcohol and tobacco products
- Gambling and online betting (even where legally permitted — platform-level choice)
- Cryptocurrency trading platforms
- Political parties and candidates
- Religious content marketed as commercial service
- Loan sharks, unlicensed moneylenders, chit fund schemes
- Miracle health claims (cancer cures, diabetes reversal, weight loss in 7 days)
- Multi-level marketing (MLM) / pyramid schemes
- Adult content of any kind
- Weapons, arms, ammunition
- Any product banned by BIS, FSSAI, CDSCO, or state authorities

### 7.3 Ad Transparency Dashboard (User-Facing)

Every user can access their "Ad Transparency Centre" in settings:

```
Settings → Privacy → Ad Preferences
  
  Your ad profile:
  • Interests inferred: Food & Grocery, Health & Fitness, Local Services
  • Location used: Yes — your active radius
  • Data NOT used: Transaction history, health data, messages, contacts
  
  Ads you've hidden: [list]
  Categories you've muted: [list]
  
  [Edit preferences]  [Turn off interest-based ads]  [Download your ad data]
```

**Key commitments displayed clearly:**
- Lokul does NOT sell your data to advertisers
- Advertisers only set targeting parameters — they never see individual user data
- Health and financial data is NEVER used for ad targeting

### 7.4 Advertiser Trust Tiers

| Tier | Requirements | Benefits |
|------|-------------|---------|
| **Micro** | GSTIN or Udyam reg | Access to Placement 01, 02, 08 |
| **Growth** | GSTIN + 6 months on Lokul + ₹5K spend | All placements, lower CPM |
| **Brand** | Company registration + ASCI membership + ₹50K/month | Priority review, dedicated account manager, category exclusivity |
| **Government** | MOU with Lokul | Zero-commission placement, co-branded campaigns |

---

## 8. Revenue Forecast Model

### Assumptions
- Users at Month 18: 500,000 active
- Users at Month 30: 5,000,000 active
- Users at Month 42: 20,000,000 active
- Ad impression per user per day: 3–5 across all placements
- Average CPM blended: ₹60
- Average CPC blended: ₹6
- CTR on native feed ads: 1.8% (vs. 0.35% for banner ads)
- Transaction fee revenue: ₹8 average per active user per month (Month 30)

### Monthly Revenue Forecast

| Revenue Stream | Month 18 | Month 30 | Month 42 |
|----------------|----------|----------|----------|
| Feed + Story Ads | ₹12L | ₹1.2 Cr | ₹4.8 Cr |
| Search + Map Promoted | ₹5L | ₹50L | ₹2 Cr |
| Transaction Screen Offers | ₹8L | ₹80L | ₹3.2 Cr |
| Kisan + Job Board Ads | ₹3L | ₹30L | ₹1.2 Cr |
| Other placements | ₹2L | ₹20L | ₹80L |
| **Total Ad Revenue** | **₹30L** | **₹2.8 Cr** | **₹12 Cr** |
| Transaction Fees | ₹40L | ₹4 Cr | ₹16 Cr |
| Lokul Plus subscriptions | ₹5L | ₹50L | ₹2 Cr |
| Business SaaS | ₹8L | ₹80L | ₹3.2 Cr |
| Financial Services | ₹10L | ₹1 Cr | ₹4 Cr |
| B2G Contracts | ₹5L | ₹50L | ₹2 Cr |
| Agri SaaS | ₹2L | ₹20L | ₹80L |
| **Total Monthly Revenue** | **₹1 Cr** | **₹10.2 Cr** | **₹40 Cr** |
| **Annualised (ARR)** | **₹12 Cr** | **₹122 Cr** | **₹480 Cr** |

---

## 9. Implementation Roadmap

### Phase A — Months 9–12 (Foundation)
**Goal: First ₹50L/month**

- [ ] Build self-serve advertiser dashboard (create campaign, upload creative, set budget, view analytics)
- [ ] Implement Placement 01 (Feed Sponsored Post) — most impactful, highest revenue
- [ ] Implement Placement 02 (Search Promoted Listing) — drives Business SaaS adoption
- [ ] Implement Placement 05 (Transaction Confirmation Offer) — CPA model, zero risk
- [ ] Launch Lokul Plus subscription
- [ ] Ad quality AI moderation pipeline live
- [ ] User Ad Transparency Centre in settings
- [ ] Frequency cap enforcement (server-side + client-side)

### Phase B — Months 13–18 (Expansion)
**Goal: ₹1 Cr/month**

- [ ] Implement Placement 03 (Map Promoted Pins)
- [ ] Implement Placement 04 (Stories Sponsored Tile)
- [ ] Implement Placement 09 (Community Event Co-sponsorship)
- [ ] Implement Placement 10 (Digest Sponsored Line)
- [ ] Launch financial services commission partnerships (3 insurers, 2 banks, 2 NBFCs)
- [ ] Launch B2G pilots (2 state governments)
- [ ] Onboard first 100 Growth-tier and 10 Brand-tier advertisers

### Phase C — Months 19–24 (Rural & Agri Monetization)
**Goal: ₹3 Cr/month**

- [ ] Implement Placement 07 (Kisan Hub Agri Sponsorships)
- [ ] Implement Placement 08 (Job Board Promoted Listings)
- [ ] Implement Placement 11 (Scheme Aggregator Private Product Card)
- [ ] Implement Placement 12 (Business Profile Similar Businesses)
- [ ] Launch Agri Intelligence SaaS (FPO + state agri departments)
- [ ] Launch BC Agent network monetization
- [ ] Onboard agri input companies (Bayer, Syngenta, IFFCO, UPL)

### Phase D — Months 25–30 (Scale)
**Goal: ₹10 Cr/month**

- [ ] Programmatic ad exchange integration (Lokul inventory tradeable via DSPs)
- [ ] Account Aggregator integration for financial product targeting (consent-based)
- [ ] National brand advertising packages (city + state + national tiers)
- [ ] Implement Placement 06 (Onboarding Welcome Offers) — as new user volume scales
- [ ] Category exclusivity packages for Brand-tier advertisers
- [ ] International remittance corridor advertising (NRI sending money to India → insurance/investment ads)

---

## 10. Key Performance Indicators

### Ad Platform Health Metrics

| KPI | Target (Month 18) | Target (Month 30) |
|-----|-------------------|-------------------|
| Ad fill rate | >60% | >80% |
| Average CTR (feed ads) | >1.5% | >2% |
| Ad rejection rate | <10% | <5% |
| User "hide this ad" rate | <3% per impression | <1.5% |
| User ad complaint rate | <0.1% | <0.05% |
| Advertiser renewal rate | >60% | >75% |
| Average campaign ROI (advertiser-reported) | >3x | >5x |
| Lokul Plus conversion rate | >2% of MAU | >4% of MAU |

### User Trust Metrics (Ad Health)

| KPI | Threshold (Action Trigger) |
|-----|---------------------------|
| Ad skip rate (stories) | >70% → review creative quality standards |
| "Hide this ad" rate | >5% on a specific placement → reduce frequency |
| Negative feedback on ad category | >2% → remove category from that placement |
| User churn after ad introduction | >0.5% → immediate audit |
| Lokul Plus upgrades spike | Positive signal → ad experience is as expected |

---

## 11. Legal & Compliance

| Regulation | Compliance Requirement |
|------------|----------------------|
| ASCI (Advertising Standards Council of India) | All creatives comply with ASCI code — no misleading claims |
| IT Act 2000 / IT Rules 2021 | User data used for targeting disclosed in privacy policy |
| PDPB (Digital Personal Data Protection Act 2023) | Consent obtained before using any personal data for targeting; consent records stored |
| RBI guidelines | Financial product ads only from licensed entities; no guaranteed return claims |
| FSSAI | Food product ads comply with FSSAI advertising guidelines |
| CDSCO | Health product ads (OTC medicines, supplements) reviewed by CDSCO guidelines |
| Consumer Protection Act 2019 | No bait-and-switch, no price deception in promoted listings |
| Competition Act 2002 | Competitor conquest ads allowed but no false comparative claims |

---

## 12. What We Will Never Do

This section is as important as every feature above. These are permanent commitments — not "not yet" decisions:

| Practice | Status | Reason |
|----------|--------|--------|
| Full-screen pop-up / interstitial ads | **Never** | Destroys trust on low-end phones; users uninstall |
| Auto-play video with sound | **Never** | Disrespectful in shared Indian household context |
| Ads inside SOS / emergency flows | **Never** | Safety is sacred, no commercial value justifies it |
| Health or financial data used for targeting | **Never** | Violates user trust and PDPB |
| Third-party data broker targeting | **Never** | Lokul uses only first-party data |
| Selling user data to advertisers | **Never** | Revenue model never depends on this |
| Ads for users in active distress (AI-detected) | **Never** | 24-hour suppression of all ads when distress signals detected |
| Disguised ads without label | **Never** | Illegal under ASCI; destroys the trust that is our moat |
| Retargeting across other apps | **Never** | Lokul ads are Lokul-only; no cross-app tracking |
| Alcohol, tobacco, gambling, political ads | **Never** | Platform-level values choice, non-negotiable |

---

*This document is a living PRD. Each placement spec will be expanded into a detailed engineering ticket as development begins. The governance framework and prohibited category list should be reviewed quarterly by the Trust & Safety team.*

*Next documents to author: Advertiser Dashboard UX spec, Ad Quality AI pipeline architecture, Lokul Plus subscription flow, B2G contract template.*
