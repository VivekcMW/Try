# Lokul.club — Launch Plan & Phased Implementation
**Date:** July 27, 2026  
**Status:** Pre-Launch (Zero Users → First 100 Users)  
**Timeline:** 90 days to fundable traction  
**Philosophy:** Prove > Build > Scale

---

## 🎯 CRITICAL CONTEXT (Read This First)

**Current State:**
- ✅ You have 286 mobile screens built
- ✅ You have 145+ API endpoints
- ✅ You have production-ready infrastructure
- ❌ You have ZERO real users
- ❌ You have ZERO validated use cases
- ❌ You have ZERO proof any feature works

**The Hard Truth:**
You don't need more integrations. You don't need Google Maps API. You don't need DigiLocker. **You need users.**

**Launch Priority:**
1. **Get 20 users using the app THIS WEEK** (even with manual workarounds)
2. **Get 5 peer providers offering services** (cook, handyman, tutor)
3. **Facilitate 10 real transactions** (₹500-5000 each)
4. **Prove ONE use case has repeat usage** (D7 retention >35%)

**Only after above:**
5. Add integrations to scale what's working
6. Expand to more categories
7. Raise funding with proof

---

## 📋 PHASE 1: MANUAL PILOT (Weeks 1-4)
**Goal:** 20 users, 5 providers, 10 transactions — all MANUAL

### Week 1: Ship Minimal App

**What to Build:**
```
✅ Onboarding: Phone OTP → Name → Select Locality (manual dropdown)
✅ Feed: See posts within 500m radius
✅ Post Creation: Text + Photo (no video yet)
✅ Services: Browse peer providers (cook, handyman, tutor ONLY)
✅ Order Flow: Book service → Chat → Pay → Rate
✅ Wallet: Add money (Razorpay) → Pay from balance → Withdraw
✅ Profile: Name, photo, trust badge (Bronze/Silver/Gold)
```

**What to CUT (for now):**
```
❌ ALL 30+ other categories (telemedicine, insurance, pets, jobs, etc.)
❌ DigiLocker / Aadhaar verification (manual KYC for now)
❌ Google Maps integration (use hardcoded lat/lng for test locality)
❌ Real-time chat (use simple message thread, no Ably yet)
❌ Stories, polls, events, group buying, carpool
❌ RWA notices, society management
❌ Advanced filters, AI moderation
❌ Push notifications (use in-app bell icon)
```

**Accounts Needed (Week 1):**
| Service | Purpose | Cost | Setup Time | Priority |
|---------|---------|------|------------|----------|
| **Razorpay** | Payments (UPI, cards) | 2% + GST per txn | 2-3 days KYC | 🔴 CRITICAL |
| **Twilio/MSG91** | Phone OTP | ₹0.20/SMS | 1 day | 🔴 CRITICAL |
| **Cloudflare R2** | Image uploads | Free tier (10GB) | 1 hour | 🟡 NEEDED |
| **Vercel** | Web app hosting | Free tier | 30 mins | 🟢 OPTIONAL (use localhost) |

**What to Deploy:**
- Mobile app: TestFlight (iOS) + Play Console (internal testing)
- Web app: Keep on localhost OR Vercel free tier
- Database: Supabase free tier OR local PostgreSQL

**DO NOT SIGN UP FOR YET:**
- ❌ Google Maps API (use Mapbox free tier if needed, or hardcode coords)
- ❌ DigiLocker API (requires govt approval, 3-6 months)
- ❌ Aadhaar eSign (requires UIDAI approval)
- ❌ PostHog paid plan (use free tier, 1M events/month)
- ❌ Sentry paid plan (use free tier)
- ❌ Ably paid plan (skip realtime for now)

---

### Week 2-3: Manual Onboarding (Your Building/Society)

**Target:** Your own building OR a friend's society

**User Acquisition (Manual, Door-to-Door):**
1. **Print flyers** (A5 size, ₹2000 for 500 copies):
   ```
   🏘️ Your Neighbors Are Now Online!
   
   Lokul — Find trusted cooks, handymen, tutors in your building
   
   ✓ Verified neighbors only
   ✓ Safe payments (UPI)
   ✓ Chat before booking
   
   Scan QR to download → [QR code to TestFlight/Play Store]
   
   Free for first 50 users | No spam, ever
   ```

2. **Door-to-door visits** (Weekend, 2-3 hours):
   - Target: 50 flats
   - Pitch: "We're building an app for our society. Can you test it?"
   - Goal: 20 installs (40% conversion)
   - Offer: ₹100 Amazon voucher for first 3 bookings

3. **WhatsApp group** (Create "Lokul Beta Testers"):
   - Share updates, gather feedback
   - Ask for help recruiting peer providers

**Peer Provider Recruitment (Manual):**
```
Target: 5 providers across 3 categories

Category 1: Home Cook / Tiffin Service
- Find: Ask neighbors, WhatsApp groups, building staff
- Offer: "List for free, we'll bring you 5 customers this month"
- Setup: Help them create profile, add photos, set pricing

Category 2: Handyman / Electrician / Plumber
- Find: Security guard knows 2-3 reliable people
- Offer: "No commission for first 3 months"
- Setup: Take photos of past work, add to profile

Category 3: Tutor (Math/Science for kids)
- Find: Ask parents in society WhatsApp group
- Offer: "Get verified, attract more students"
- Setup: Add qualifications, subjects, hourly rate
```

**Manual KYC (No DigiLocker Yet):**
```
For Users:
✓ Phone OTP (via Twilio) — AUTOMATED
✓ Name + Profile Photo — SELF-SERVICE
✓ Address proof — ASK for Aadhaar photo via chat, YOU verify manually
✓ Trust badge — YOU assign Bronze/Silver/Gold based on verification

For Peer Providers:
✓ Phone OTP — AUTOMATED
✓ Profile + Photos — SELF-SERVICE  
✓ ID proof — WhatsApp them, ask for Aadhaar + past work photos
✓ Background check — MANUAL: Call 2 references
✓ Approval — YOU approve in admin panel after review
```

**Payment Flow (Week 2-3):**
```
User books home cook for ₹3000/month
   ↓
Razorpay UPI payment (user adds to Lokul wallet)
   ↓
Money held in escrow (Prisma: Order.status = 'escrowed')
   ↓
Cook delivers service (30 days)
   ↓
User confirms delivery in app
   ↓
YOU manually transfer ₹3000 to cook's bank (via Razorpay payout API)
   ↓
Take 10% commission (₹300)
```

---

### Week 4: Facilitate 10 Transactions

**Goal:** Prove people will pay neighbors for services

**Target Transactions:**
```
5x Home cook tiffin orders (₹2000-4000/month each) = ₹10K-20K GMV
3x Handyman bookings (₹500-1500 each) = ₹1500-4500 GMV
2x Tutor sessions (₹500-800/hour) = ₹1000-1600 GMV

Total GMV: ₹12,500 - ₹26,000 in Month 1
Your revenue (10% commission): ₹1,250 - ₹2,600
```

**How to Facilitate:**
1. **Pre-sell services** (before app is perfect):
   - WhatsApp users: "Priya aunty makes great tiffins, want to try?"
   - Offer first order discount (₹200 off if paid via app)

2. **Hand-hold first 5 transactions**:
   - Walk user through: Download app → Add money → Book service
   - Call provider: "You got a booking! Here's what to do next..."
   - Follow up after delivery: "How was it? Please rate!"

3. **Collect feedback**:
   - What was confusing?
   - What's missing?
   - Would you use this again?

**Success Metrics (Week 4):**
```
✅ 20 users signed up
✅ 5 peer providers listed
✅ 10 completed transactions
✅ ₹12K+ GMV
✅ 3+ users made repeat bookings (retention signal!)
✅ 1+ provider earning ₹3K+/month
```

**If you hit these metrics:** You have validation. Proceed to Phase 2.

**If you don't:** Interview users. Find out why. Pivot or iterate.

---

## 📋 PHASE 2: PROVE ONE CATEGORY (Weeks 5-8)
**Goal:** 50 users, 10 providers, ₹100K GMV in ONE category

### Week 5-6: Double Down on What's Working

**Analyze Week 4 data:**
```
Which category had most bookings?
   → Home cook? Focus there.
   → Handyman? Recruit 5 more electricians/plumbers.
   → Tutor? Expand subjects.
```

**Example: Home Cook Works Best**

**Action Plan:**
1. Recruit 5 more home cooks (door-to-door in neighboring buildings)
2. Create "Verified Home Cook" badge
3. Add reviews/ratings prominently
4. Build trust: Show cook's past orders, customer testimonials
5. Expand radius: 200m → 500m → 1km

**Integrations to Add (Week 5-6):**

| Integration | Why Now? | Setup |
|-------------|----------|-------|
| **Google Maps API** | Show provider location on map | Free tier: 28,000 loads/month |
| **Push Notifications (FCM)** | Alert users when cook accepts order | Free via Firebase |
| **Ably Realtime** | Chat between user and cook | Free tier: 3M msgs/month |
| **PostHog Funnels** | Track drop-offs in booking flow | Already have, just set up funnels |

**Accounts to Create (Week 5-6):**
```
Google Cloud Platform:
  → Enable Maps JavaScript API, Places API, Geocoding API
  → Cost: ₹0 (free tier covers 100 users)
  → Setup: 2 hours (get API key, add to .env)

Firebase Cloud Messaging:
  → Push notifications (iOS + Android)
  → Cost: Free
  → Setup: 4 hours (FCM setup, device token storage)

Ably (Realtime chat):
  → Upgrade from hardcoded messages to live chat
  → Cost: Free tier (then $29/month)
  → Setup: Already integrated, just uncomment code
```

**What NOT to Add Yet:**
- ❌ DigiLocker (still not needed, manual KYC works)
- ❌ Aadhaar eSign (overkill for 50 users)
- ❌ Video calls (just use phone number for now)
- ❌ Payment gateway #2 (Razorpay is enough)

---

### Week 7-8: Scale to 50 Users in Same Locality

**User Acquisition:**
```
Week 7: Expand to 2 neighboring buildings
  → Flyers + door-to-door
  → Target: +15 users (total 35)

Week 8: Referral program
  → "Refer a friend, both get ₹100 wallet credit"
  → Target: +15 users (total 50)
```

**Provider Acquisition:**
```
Week 7: Recruit 5 more cooks
  → Show existing cooks' earnings (₹3K-10K/month)
  → Word-of-mouth spreads

Week 8: Quality control
  → Remove low-rated providers
  → Feature top 3 providers in app
```

**Target Metrics (Week 8 End):**
```
✅ 50 active users (opened app in last 7 days)
✅ 10 active peer providers (1+ booking in last 30 days)
✅ 50+ transactions (5-10 per week)
✅ ₹100K GMV (cumulative)
✅ ₹10K revenue (10% commission)
✅ D30 retention: 35%+ (17+ users return after 30 days)
✅ Repeat rate: 40%+ (20+ users made 2+ bookings)
```

**Key Insight:** One cook earning ₹10K/month + 5 customers ordering weekly = PROOF.

---

## 📋 PHASE 3: AUTOMATE & EXPAND (Weeks 9-12)
**Goal:** Remove manual work, add 2 more categories, scale to 200 users

### Week 9-10: Automate What's Manual

**1. Automated KYC (DigiLocker Integration)**

**Why now?** Manual verification doesn't scale past 50 users.

**DigiLocker API Setup:**
```
Step 1: Register as DigiLocker partner
  → Visit: https://www.digilocker.gov.in/partners
  → Submit: Company PAN, GSTIN, incorporation cert
  → Wait: 2-4 weeks for approval
  → Cost: Free (govt service)

Step 2: Technical integration
  → DigiLocker OAuth flow
  → Fetch Aadhaar XML (with user consent)
  → Parse and store: Name, DOB, Address, Photo
  → Auto-assign trust tier based on completeness

Step 3: Fallback for users without DigiLocker
  → Keep manual upload option
  → You verify via admin panel
```

**Implementation:**
```typescript
// src/app/api/mobile/kyc/digilocker/route.ts

export async function POST(req: Request) {
  const { userId, digilockerCode } = await req.json();
  
  // Exchange code for access token
  const token = await exchangeDigiLockerCode(digilockerCode);
  
  // Fetch Aadhaar XML
  const aadhaar = await fetchAadhaarXML(token);
  
  // Update user KYC
  await prisma.user.update({
    where: { id: userId },
    data: {
      kycTier: 'GOLD', // DigiLocker = highest trust
      kycVerifiedAt: new Date(),
      aadhaarName: aadhaar.name,
      aadhaarAddress: aadhaar.address,
    },
  });
  
  return Response.json({ success: true, tier: 'GOLD' });
}
```

**Timeline:** Start application in Week 9, likely approved by Week 13-14.

---

**2. Aadhaar eSign (For Peer Provider Agreements)**

**Why now?** Legal protection as GMV scales (₹100K → ₹1M/month).

**What is eSign?**
- Legally binding digital signature using Aadhaar OTP
- Required for: Service provider terms, commission agreements

**Setup:**
```
Partner options:
  1. NSDL e-Gov (govt-backed, cheaper)
  2. eMudhra (private, faster setup)
  3. Digio (easiest API, pricier)

Recommended: Digio
  → Website: https://www.digio.in/
  → Pricing: ₹15-25 per eSign
  → Setup: 3-5 days (KYC of your company)
  → API: REST API, good docs

Integration:
  → Generate PDF: "Lokul Peer Provider Agreement"
  → User signs via Aadhaar OTP
  → Store signed PDF in Cloudflare R2
  → Link to user record in Prisma
```

**When to mandate:**
- Any provider expecting >₹10K/month earnings
- OR Any service >₹5K (high-value bookings)

---

**3. Automated Payouts (Razorpay X)**

**Why now?** Manual bank transfers don't scale.

**Current:** You manually transfer earnings to providers via NEFT.

**After Razorpay X:**
```
Provider completes order
   ↓
User confirms delivery
   ↓
Automated payout API call
   ↓
Money hits provider's bank in 30 mins (IMPS)
```

**Setup:**
```
Razorpay X (Business Banking):
  → Open current account via Razorpay
  → Minimum balance: ₹25K
  → Cost: No monthly fee, ₹3-5 per payout
  → API: Already integrated (just needs RZP X account)

Enable in code:
// src/app/api/mobile/orders/[id]/complete/route.ts

const payout = await razorpayX.payouts.create({
  account_number: process.env.RAZORPAY_X_ACCOUNT,
  amount: order.amount * 0.9 * 100, // 90% to provider
  currency: 'INR',
  mode: 'IMPS',
  purpose: 'payout',
  fund_account: provider.fundAccountId,
  queue_if_low_balance: true,
});
```

---

### Week 11-12: Add 2 More Categories

**Validated Category 1:** Home Cook (proven in Phase 2)

**New Category 2:** Handyman/Home Services
```
Recruit: 5 electricians, 3 plumbers, 2 carpenters
Why now: Second-most requested in user feedback
Commission: 15% (vs 10% for cooks)
Approval: Require DigiLocker + eSign agreement
```

**New Category 3:** Classifieds (Buy/Sell/Rent)
```
Why: Zero marginal cost, high engagement
Examples: Sell old fridge, rent parking spot, buy used books
Monetization: FREE for now (builds engagement)
Moderation: Manual approval for first 100 listings
```

**What NOT to Add:**
- ❌ Telemedicine (requires doctor verification, legal risk)
- ❌ Insurance (requires IRDAI license)
- ❌ Real estate (requires RERA compliance)
- ❌ Pet care, kids, sports (nice-to-have, not need-to-have)

---

### Week 12 End Goal: Fundable Traction

**Target Metrics:**
```
✅ 200 active users (last 7 days)
✅ 25 peer providers (3 categories)
✅ 200+ transactions (cumulative)
✅ ₹300K+ GMV (cumulative)
✅ ₹30K+ revenue (10-15% commission)
✅ D30 retention: 40%+
✅ 3 power users (10+ orders each)
✅ 1 power provider (₹20K+ monthly earnings)
✅ Testimonials from 10 users (text + video)
```

**With this data, you can raise ₹50L-₹1Cr pre-seed.**

---

## 📋 PHASE 4: FUNDRAISE & SCALE (Week 13+)
**Goal:** Raise ₹50L-₹1Cr, expand to 3 localities, 1000 users

### What to Pitch Investors:

**Traction Deck (15 slides):**
```
Slide 1: Problem (neighbors don't know/trust each other)
Slide 2: Solution (verified hyperlocal marketplace)
Slide 3: How it works (3-step flow)
Slide 4: Market size (90% of urban India, 200M households)
Slide 5: Traction — USER METRICS
  → 200 users in 12 weeks
  → 40% D30 retention (vs 20% industry avg)
  → 3 power users with 10+ orders
Slide 6: Traction — GMV METRICS
  → ₹300K GMV in 12 weeks
  → ₹30K revenue (profitable unit economics)
  → 15% take rate (vs 20-30% for Swiggy/Zomato)
Slide 7: Traction — PROVIDER METRICS
  → 25 peer providers earning ₹5K-20K/month
  → 80% provider retention (they're making money!)
Slide 8: User testimonial (video of cook earning ₹15K/month)
Slide 9: Competitive moat (trust layer + P2P + radius-based)
Slide 10: Why now? (post-COVID trust, UPI adoption, smartphone penetration)
Slide 11: Go-to-market (bottom-up, society-by-society)
Slide 12: Roadmap (expand to 10 societies in Pune, then Bengaluru)
Slide 13: Business model (10-15% commission, freemium features later)
Slide 14: Team (you + 2-3 early hires)
Slide 15: Ask (₹50L-₹1Cr for 18-month runway)
```

**Use of Funds:**
```
₹20L: Team (hire 1 tech + 1 ops + 1 community manager)
₹15L: Marketing (flyering, referrals, local events)
₹10L: Infrastructure (Razorpay, Digio, Google Maps, servers)
₹5L: Legal (TOS, privacy policy, DPDPA compliance, CA fees)
```

---

## 🔧 COMPLETE INTEGRATION CHECKLIST

### CRITICAL (Phase 1, Week 1-4)

| Service | Purpose | Cost | Setup Time | Account Needed |
|---------|---------|------|------------|----------------|
| **Razorpay** | Payments (UPI, cards, payouts) | 2% + GST per txn | 2-3 days | PAN, GSTIN, bank account, KYC docs |
| **Twilio/MSG91** | Phone OTP | ₹0.15-0.25/SMS | 1 day | Email, company docs |
| **Cloudflare R2** | Image storage | Free (10GB) | 1 hour | Email |
| **Supabase/Neon** | PostgreSQL database | Free tier (500MB) | 30 mins | GitHub login |

---

### IMPORTANT (Phase 2, Week 5-8)

| Service | Purpose | Cost | Setup Time | Account Needed |
|---------|---------|------|------------|----------------|
| **Google Maps API** | Maps, geocoding, places | Free tier (28K loads/mo) | 2 hours | Google Cloud account, credit card (won't charge) |
| **Firebase (FCM)** | Push notifications | Free | 4 hours | Google account |
| **Ably** | Realtime chat | Free tier → $29/mo | Already in code | Email |
| **PostHog** | Analytics, funnels | Free tier (1M events) | 1 hour | Email |

---

### AUTOMATED KYC (Phase 3, Week 9-12)

| Service | Purpose | Cost | Setup Time | Account Needed |
|---------|---------|------|------------|----------------|
| **DigiLocker API** | Aadhaar verification | Free (govt) | 2-4 weeks approval | Company PAN, GSTIN, incorporation cert |
| **Digio/eMudhra** | Aadhaar eSign | ₹15-25/sign | 3-5 days | Company KYC, directors' KYC |
| **Razorpay X** | Automated payouts | ₹3-5/payout | 5-7 days | Current account opening docs |

---

### OPTIONAL (Phase 4, Post-Fundraise)

| Service | Purpose | Cost | Setup Time |
|---------|---------|------|------------|
| **Sentry** | Error tracking | $26/mo (paid plan) | 1 hour |
| **AWS SES** | Transactional emails | $0.10/1000 emails | 2 hours |
| **Clevertap/MoEngage** | Marketing automation | $200+/mo | 1 week |
| **Freshdesk/Intercom** | Customer support | $15-50/agent/mo | 2 hours |

---

### NOT NEEDED (Ever, or Much Later)

| Service | Why NOT Needed | Alternative |
|---------|----------------|-------------|
| **Stripe** | Razorpay is better for India | Razorpay |
| **Sendgrid** | Expensive, use AWS SES | AWS SES (later) |
| **Twilio Video** | Users will just call via phone | Phone number display |
| **Algolia** | Expensive search, use Postgres FTS | Prisma full-text search |
| **Auth0** | Overkill, phone OTP is enough | Custom auth (already built) |

---

## 📊 REGISTRATION FLOWS (How Users & Vendors Join)

### Flow 1: Regular User Registration

```
Step 1: Phone number entry
  → User opens app → "Enter phone number"
  → Trigger: Twilio/MSG91 sends 6-digit OTP
  → User enters OTP → Verified ✓

Step 2: Profile creation
  → Name (required)
  → Profile photo (optional, but encouraged)
  → Select locality from dropdown (Hadapsar, Baner, Indiranagar, etc.)
  → App auto-detects lat/lng via GPS (no Google Maps yet)

Step 3: Trust tier (Bronze by default)
  → Bronze: Phone verified only
  → Silver: Upload Aadhaar (manual review for now)
  → Gold: DigiLocker verification (Phase 3+)

Step 4: Onboarding complete
  → Show feed with posts from 500m radius
  → Prompt: "Find a home cook or handyman near you"
```

**No email required. No password. Just phone OTP.**

---

### Flow 2: Peer Provider Registration (Cook, Handyman, Tutor)

```
Step 1: Same as regular user (phone OTP → profile)

Step 2: "Become a Provider" button in profile
  → Select category: Cook, Handyman, Tutor, etc.
  → Add service description (100 chars)
  → Upload 3 photos (food pics for cook, past work for handyman)
  → Set pricing (₹/hour or ₹/month)

Step 3: Verification (MANUAL in Phase 1-2)
  → YOU review in admin panel
  → Call provider, check references
  → Approve or reject
  → If approved → Badge appears ("Verified Provider")

Step 4: Auto-verification (Phase 3+)
  → DigiLocker Aadhaar check (instant Gold tier)
  → eSign provider agreement (Digio API)
  → Auto-approve if:
      ✓ Aadhaar verified
      ✓ No negative reports in system
      ✓ Agreement signed

Step 5: Provider goes live
  → Appears in "Services" tab
  → Users can book → Chat → Pay
  → Earnings tracked in admin panel
  → Monthly payout (manual → auto via Razorpay X)
```

**Provider commission:**
- 10% for first 10 bookings (incentive)
- 15% after 10 bookings
- 20% for premium categories (tutor, telemedicine)

---

### Flow 3: Local Merchant/Shop Registration

```
Step 1: Phone OTP (same as above)

Step 2: Business profile
  → Business name (e.g., "Sharma Kirana Store")
  → Category: Kirana, Pharmacy, Bakery, Salon, etc.
  → Address + landmark
  → Upload shop photo
  → GSTIN (optional for now, required for >₹20L/year sales)

Step 3: Verification
  → YOU visit shop physically (Week 1-4)
  → Take photo, verify address
  → Check Google reviews if available
  → Approve in admin panel

Step 4: Merchant dashboard
  → Merchant can:
      - Post offers ("10% off on rice this week")
      - Accept online orders (if delivery available)
      - Track foot traffic (users who viewed profile)
  → Commission:
      - FREE for first 3 months (acquisition)
      - 5% on online orders (Phase 3+)
      - ₹500/month subscription (Phase 4+)
```

---

### Flow 4: Admin/Moderator Registration

```
Internal only (not public)

Step 1: YOU create admin user in database
  → Run seed script or use admin panel
  → Email: admin@lokul.club
  → Password: Set strong password (bcrypt hashed)

Step 2: Admin login
  → Admin navigates to /admin/login
  → Email + password (no OTP)
  → Access full admin panel

Roles:
  → SUPER_ADMIN: You (full access)
  → MODERATOR: Future hires (can approve providers, moderate posts)
  → SUPPORT: Customer support (view-only, can respond to tickets)
```

---

## 🚨 CRITICAL WARNINGS

### 1. DO NOT Add Features Before Validation

**Temptation:** "Let's add telemedicine while we're at it!"

**Reality:** Every feature you add is:
- 10+ hours of dev time
- 10+ screens to maintain
- New edge cases to handle
- New compliance requirements

**Rule:** Add feature ONLY after:
1. 10+ users explicitly ask for it
2. You can monetize it (or it drives retention)
3. It doesn't require new compliance/licenses

---

### 2. DO NOT Automate Too Early

**Temptation:** "Let's integrate DigiLocker in Week 1!"

**Reality:** Manual processes give you:
- Direct user interaction (learn what they need)
- Flexibility to pivot
- No wasted dev time if feature doesn't work

**Rule:** Do it manually until it hurts (50+ users).

**Example:**
- Manual KYC works until ~100 users
- Manual payouts work until ~50 providers
- Manual moderation works until ~500 posts/week

---

### 3. DO NOT Raise Money Too Early

**Temptation:** "We have great tech, let's raise ₹1Cr now!"

**Reality:** Investors want:
- Proof of product-market fit
- Proof users will pay
- Proof you can acquire users cost-effectively

**Rule:** Raise AFTER:
1. 100-200 active users (D30 retention >30%)
2. ₹100K-300K GMV (3 months)
3. Unit economics work (LTV > 3x CAC)

**Without above:** You'll get rejected or get terrible terms (25% for ₹50L).

**With above:** You'll get 5-10 term sheets (10% for ₹1Cr).

---

### 4. DO NOT Expand Geographically Too Fast

**Temptation:** "Let's launch in 10 cities at once!"

**Reality:**
- Each new city needs local provider recruitment
- Each new city needs local trust-building
- You can't manually onboard 10 cities solo

**Rule:** Go deep, not wide.

**Phase 1-2:** 1 building (20-50 users)
**Phase 3:** 3 buildings in same locality (200 users)
**Phase 4:** 3 localities in same city (1000 users)
**Phase 5:** 3 cities (10,000 users) — POST fundraise

---

## 🎯 SUCCESS CRITERIA (What "Good" Looks Like)

### After Week 4 (Phase 1 Complete):
```
Users: 20-30
Providers: 5-7
Transactions: 10-15
GMV: ₹12K-30K
Retention (D7): 30%+
Learnings: "Home cook works best" OR "Handyman has highest margin"
```

**If you hit this:** Proceed to Phase 2.  
**If not:** Iterate. Interview users. Find the real problem.

---

### After Week 8 (Phase 2 Complete):
```
Users: 50-80
Providers: 10-15
Transactions: 50-80
GMV: ₹100K-200K
Revenue: ₹10K-30K
Retention (D30): 35%+
Repeat rate: 40%+ (users making 2+ orders)
Word-of-mouth: 5+ organic signups (not directly recruited by you)
```

**If you hit this:** You have product-market fit in ONE category.  
**If not:** Double down on Phase 2. Don't rush to Phase 3.

---

### After Week 12 (Phase 3 Complete):
```
Users: 200-300
Providers: 25-35
Transactions: 200-300
GMV: ₹300K-500K
Revenue: ₹30K-75K (10-15% take rate)
Retention (D30): 40%+
CAC: <₹500 (mostly organic/referral)
LTV: ₹2000+ (repeat orders over 6 months)
LTV/CAC: 4x+ (healthy unit economics)
Testimonials: 10 users, 3 providers (video proof)
```

**If you hit this:** You're FUNDABLE. Start pitching investors.  
**If not:** You likely expanded too fast. Re-focus on core use case.

---

## 📝 WEEK-BY-WEEK CHECKLIST

### Week 1: Ship MVP
- [ ] Remove 90% of features (keep 5 core flows)
- [ ] Sign up: Razorpay, Twilio, Cloudflare R2
- [ ] Deploy mobile app: TestFlight + Play Console (internal)
- [ ] Create admin login (seed script)
- [ ] Test full flow: Signup → Browse → Book → Pay

### Week 2: Recruit Users
- [ ] Print 500 flyers (₹2000)
- [ ] Door-to-door in your building (target: 50 flats)
- [ ] Get 20 installs (40% conversion)
- [ ] Create WhatsApp beta group
- [ ] Onboard manually (help with each signup)

### Week 3: Recruit Providers
- [ ] Find 2 home cooks (ask neighbors)
- [ ] Find 2 handymen (ask security)
- [ ] Find 1 tutor (WhatsApp groups)
- [ ] Take photos, create profiles
- [ ] Manual KYC (Aadhaar photo via WhatsApp)

### Week 4: Facilitate Transactions
- [ ] Pre-sell services (WhatsApp users)
- [ ] Hand-hold first 5 bookings
- [ ] Manual payouts (bank transfer to providers)
- [ ] Collect feedback (10 user interviews)
- [ ] Analyze: What worked? What didn't?

### Week 5-6: Double Down
- [ ] Sign up: Google Maps API, Firebase FCM
- [ ] Add push notifications (booking confirmations)
- [ ] Add live chat (Ably integration)
- [ ] Recruit 5 more providers in winning category
- [ ] Expand radius (500m → 1km)

### Week 7-8: Scale to 50
- [ ] Expand to 2 neighboring buildings
- [ ] Referral program (₹100 for referrer + referee)
- [ ] Remove low-rated providers
- [ ] Feature top providers in app
- [ ] Target: 50 users, 10 providers, ₹100K GMV

### Week 9-10: Automate
- [ ] Apply for DigiLocker API (2-4 week wait)
- [ ] Integrate Digio eSign
- [ ] Set up Razorpay X payouts
- [ ] Auto-KYC flow (once DigiLocker approved)
- [ ] Automated weekly payouts

### Week 11-12: Expand Categories
- [ ] Add Handyman/Home Services (5 providers)
- [ ] Add Classifieds (buy/sell/rent)
- [ ] Moderate first 100 classifieds manually
- [ ] Run small paid ad campaign (₹5K Facebook ads)
- [ ] Target: 200 users, 25 providers, ₹300K GMV

### Week 13+: Fundraise
- [ ] Create traction deck (15 slides)
- [ ] Record user testimonials (video)
- [ ] Calculate LTV, CAC, retention cohorts
- [ ] Reach out to 20 pre-seed investors
- [ ] Close ₹50L-₹1Cr round

---

## 💰 BUDGET ESTIMATE (Weeks 1-12)

### Phase 1 (Weeks 1-4): ₹25,000
```
Razorpay fees (10 txns × ₹2000 × 2%):       ₹400
Twilio SMS (100 OTPs × ₹0.20):              ₹20
Flyers (500 prints):                        ₹2,000
User incentives (₹100 × 10 users):          ₹1,000
Provider incentives (₹500 × 5):             ₹2,500
TestFlight/Play Console:                    ₹2,000
Domain + SSL:                               ₹1,500
Miscellaneous (chai-pani, transport):       ₹2,000
Buffer:                                     ₹13,580
```

### Phase 2 (Weeks 5-8): ₹50,000
```
Razorpay fees (50 txns × ₹2500 × 2%):       ₹2,500
SMS (500 OTPs):                             ₹100
Flyers (1000 more):                         ₹4,000
Referral payouts (₹100 × 30):               ₹3,000
Google Maps API (free tier):                ₹0
Firebase (free tier):                       ₹0
Ably (free tier):                           ₹0
Provider bonuses (top 3 × ₹2000):           ₹6,000
Operations (transport, meetings):           ₹5,000
Buffer:                                     ₹29,400
```

### Phase 3 (Weeks 9-12): ₹1,00,000
```
Razorpay fees (200 txns × ₹2500 × 2%):      ₹10,000
SMS (2000 OTPs):                            ₹400
Digio eSign (50 providers × ₹25):           ₹1,250
Razorpay X setup:                           ₹0 (no setup fee)
Razorpay X payouts (100 × ₹5):              ₹500
Paid ads (Facebook/Google):                 ₹15,000
Event sponsorship (society event):          ₹10,000
CA fees (GST filing, compliance):           ₹20,000
Legal (TOS, privacy policy):                ₹25,000
Miscellaneous:                              ₹17,850
```

**Total (12 weeks): ₹1,75,000**

This is VERY lean. Most pre-seed startups spend ₹5-10L in first 3 months.

---

## 🚀 FINAL WORD

**You don't have a product problem. You have a validation problem.**

Your codebase is better than 90% of pre-seed startups. But code doesn't matter if no one uses it.

**Next 7 days:**
1. Remove all features except 5 core flows
2. Deploy to TestFlight
3. Recruit 10 users from your building
4. Recruit 2 providers (cook + handyman)
5. Facilitate 3 transactions

**That's it. No integrations. No Google Maps. No DigiLocker. Just real users.**

If you can't get 10 neighbors to use your app, investors won't give you ₹1Cr to scale it.

If you CAN get 10 neighbors using it weekly, you have a business.

**The clock starts now. Go build proof, not features.** 🚀

---

**Document Version:** 1.0  
**Last Updated:** July 27, 2026  
**Owner:** Lokul Founding Team  
**Status:** Ready to Execute
