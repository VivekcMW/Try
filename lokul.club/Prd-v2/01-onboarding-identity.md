# 01 — Onboarding & Identity (v2)

> Get any user — resident, local business owner, or peer seller — from install to active in ≤ 5 minutes, bound to a verified location, with the right role selected from day one.

---

## 1. Goal

Convert installs into **locality-verified participants** with a role intent captured on Day 1 — so the feed and discovery are immediately relevant, and supply (cooks, businesses, coaches) activates alongside demand (residents, buyers).

Three parallel onboarding tracks:
- **Track A — Resident:** phone → locality → society/flat → roles → feed
- **Track B — Local Business:** phone → locality → business type → catalogue → feed
- **Track C — Peer Seller (Cook/Coach/Rider):** same as Track A + role toggle in step 4

---

## 2. User Stories

### Resident
- **US-1.1** I sign up with my phone number and OTP — no email, no password.
- **US-1.2** I confirm my locality (GPS-detected or manual PIN entry).
- **US-1.3** I pick my society / building / street, or add a new one.
- **US-1.4** I am shown "What can you offer?" — I can declare one or more roles (Cook, Rider, Coach, Reseller) on Day 1.
- **US-1.5** I see a relevant local feed immediately, even before address verification.
- **US-1.6** A neighbor can vouch for me to fast-track Silver KYC.

### Local Business Owner
- **US-1.7** I tap "Add my business" during or after resident signup.
- **US-1.8** I select my business type (Kirana, Salon, Clinic, School, etc.).
- **US-1.9** I add my business name, photo, location, hours, and at least 3 catalogue items.
- **US-1.10** My business is discoverable in the local feed and Discover tab immediately (pending basic review).
- **US-1.11** I can manage my business profile from the same app as my personal profile.

### Senior / Low-literacy User
- **US-1.12** I can complete onboarding in Hindi or Marathi with large fonts.
- **US-1.13** Each step has a voice instruction option (TTS) in the selected language.

---

## 3. UX Flows

### 3.1 Resident Onboarding (Track A)

```
Splash (language select: EN / HI / MR)
  → Permission Primer (location + notifications — why explained)
  → Phone Entry (+91) → OTP (6-digit, auto-read)
  → Name + Profile Photo
  → Locality Detection:
      GPS auto-detect PIN + neighborhood name
      → "Is this your area?" [Yes / Change]
      → Society / Building / Street picker OR "I live independently"
      → Tower + Flat (for gated society) OR Street + House (for independent)
  → "What brings you to Lokul?" (multi-select — sets feed interests)
      ☐ Stay connected with my neighborhood
      ☐ Find local food & services
      ☐ Buy or sell things nearby
      ☐ Find my local shops
      ☐ Build a community
      ☐ Safety & alerts
  → "Do you have anything to offer?" (role selection — OPTIONAL, skip-able)
      ☐ I cook / sell home-made food    → activates Cook role
      ☐ I can run errands / deliver     → activates Rider role
      ☐ I teach / coach / train         → activates Coach role
      ☐ I buy & resell things           → activates Reseller role
      ☐ I have a local shop / business  → branches to Business Setup (3.2)
  → Welcome Screen → Feed (Bronze tier, read + limited post)
```

### 3.2 Business Setup Flow (Track B — branched from 3.1 or standalone)

```
"Let's set up your business"
  → Business Type picker (grid):
      🛒 Kirana / Grocery    💇 Salon & Beauty    🏥 Clinic / Pharmacy
      🍽️ Food & Restaurant   🏋️ Gym / Fitness      🏫 School / Classes
      🔧 Home Services       👗 Retail / Fashion    📦 Other
  → Business Name + Logo / Photo
  → Business Location:
      GPS auto-filled → confirm or drag pin
      Operating radius: 200m / 500m / 1km / 2km
  → Opening Hours (days + time, or "Call to confirm")
  → "Add your catalogue" (optional, recommended)
      Add item / service: Name, Photo, Price, Description
      Min 1 item to go live; can add more later
  → "How should customers contact you?"
      ☑ In-app order      ☑ WhatsApp (auto-filled from phone)     ☑ Call
  → Business Profile Preview → "Go Live" → Pending basic review (auto in <1h)
```

### 3.3 Silver Verification (all tracks)

```
"Verify your address to unlock more"
  → Proof type: Rent agreement / Electricity bill / Society NOC / Aadhaar address
  → Upload photo of document
  → OCR auto-reads address (fallback: manual 24h review)
  → Silver badge granted → unlocks: posting, peer roles, community creation, ordering
```

### 3.4 Gold Verification (for RWA admin, high-value merchants, SOS)

```
"Verify your identity with Aadhaar"
  → Aadhaar e-KYC redirect (DigiLocker via SETU)
  → Selfie liveness check
  → ID + face match → Gold badge
  → Unlocks: SOS broadcast, RWA admin role, high-value listings, formal merchant listing
```

### 3.5 Vouch Flow

```
Existing Silver+ user → sees new neighbor in "People nearby"
  → "I know this person" → confirm vouch (max 5/month)
  → Vouchee reaches Silver when 3 vouches received
```

---

## 4. Functional Requirements

### Phone & OTP
- **FR-1.1** +91 Indian phone numbers only at v2; international deferred.
- **FR-1.2** OTP: 6 digits, 5-min validity, 3 retries, 10-min cooldown after 3 fails.
- **FR-1.3** OTP delivery: MSG91 primary → Firebase Phone Auth fallback → WhatsApp OTP as final fallback.
- **FR-1.4** Auto-read OTP on Android via SMS Retriever API.
- **FR-1.5** Max 3 active sessions; new session revokes oldest.

### Locality Detection
- **FR-1.6** GPS reverse-geocode via Ola Maps → PIN code + neighborhood name shown to user.
- **FR-1.7** User can override to any valid Indian PIN. PIN validated against postal-codes table.
- **FR-1.8** Locality = PIN code + lat/lng. Every user is bound to a primary locality.
- **FR-1.9** Users may set a secondary locality (e.g., office area) for the Discovery tab only.

### Role Selection on Signup
- **FR-1.10** Role selection is optional at signup; can be activated anytime from profile.
- **FR-1.11** Roles Cook, Rider, Coach, Reseller require Silver KYC to go live (role can be declared at Bronze but not activated).
- **FR-1.12** Business profile requires Silver KYC for listing and Silver+ for payment collection.
- **FR-1.13** Role activation shows a simple onboarding checklist specific to that role (e.g., Cook must add menu before going live).

### KYC Tiers
- **FR-1.14** Tier definitions:

| Tier | Requires | Unlocks |
|---|---|---|
| **Bronze** | Phone OTP | Read feed (last 48h), browse marketplace, browse business catalogue |
| **Silver** | Address proof OR 3 vouches | Post in feed, peer roles, community creation, ordering, classifieds, chat |
| **Gold** | Aadhaar e-KYC + selfie | SOS broadcast, RWA admin, high-value items >₹10K, formal merchant |

- **FR-1.15** Vouching: Silver+ users vouch. 3 vouches = Silver. Voucher limited to 5/month.

### Business Onboarding
- **FR-1.16** Business profile is linked to personal profile but has its own identity (name, logo, category).
- **FR-1.17** One personal account can own up to 3 business profiles (e.g., a person who runs a kirana and a tiffin service).
- **FR-1.18** Business goes live in "Unverified" state with a banner; "Verified Business" badge after Silver KYC + business document upload (shop license, GSTIN, or self-declaration for micro-businesses).
- **FR-1.19** Micro-business self-declaration: name + photo + affirmation that the business is real. Auto-approved in <1h. Suitable for kirana, home salon, tiffin service.
- **FR-1.20** Formal verification (GSTIN / shop license): manual review within 48h; unlocks higher payout limits.

### Permissions
- **FR-1.21** Location permission: "while using app" at LocalityPicker; "always" only for Visitor module or Rider active mode.
- **FR-1.22** Notification permission: requested after first feed view (not on splash).
- **FR-1.23** Camera: only when posting media or uploading KYC.
- **FR-1.24** Contacts: never requested.

---

## 5. Data Model

```sql
users
  id (ULID, PK)
  phone (E.164, unique)
  name
  photo_url
  language ('en'|'hi'|'mr')
  kyc_tier ('bronze'|'silver'|'gold')
  trust_score (0–100)
  active_roles  TEXT[]  -- ['cook','rider','coach','reseller']
  created_at, updated_at, deleted_at

user_localities
  user_id (FK)
  pin_code, city, region
  lat, lng
  kind ('primary'|'secondary')

user_residences
  id, user_id (FK)
  residence_kind ('society'|'independent'|'business')
  society_id (FK nullable), tower_id (FK nullable), flat_number
  street_label, house_number
  verified_at, verification_method

societies
  id, name, address, pin_code, lat, lng, polygon_json
  status ('approved'|'pending')
  rwa_contact_email

business_profiles
  id (ULID, PK)
  owner_user_id (FK users)
  business_name, logo_url, description
  category  -- enum (see module 06)
  pin_code, lat, lng
  service_radius_m
  hours_json
  contact_phone, contact_whatsapp, contact_in_app
  status ('pending'|'unverified_live'|'verified_live'|'suspended')
  verification_kind ('self_declared'|'gstin'|'shop_license')
  created_at

vouches
  voucher_user_id, vouchee_user_id
  created_at
  -- unique (voucher, vouchee)

kyc_documents
  id, user_id (FK), business_id (FK nullable)
  type ('rent'|'bill'|'noc'|'aadhaar'|'gstin'|'shop_license'|'self_decl')
  storage_key, status ('pending'|'approved'|'rejected')
  reviewed_at

sessions
  id, user_id, device_id, device_meta_json
  last_active_at, revoked_at

onboarding_state
  user_id (PK), step_completed (int), roles_declared TEXT[]
  business_setup_started (bool)
  created_at, updated_at
```

---

## 6. APIs

```
# Auth
POST  /v1/auth/otp/request      { phone, channel:'sms'|'whatsapp' }
POST  /v1/auth/otp/verify       { phone, otp } → { access_token, refresh_token, user }
POST  /v1/auth/token/refresh    { refresh_token }

# Onboarding
POST  /v1/me/profile            { name, photo_url, language }
POST  /v1/me/locality           { pin_code, lat?, lng? }
GET   /v1/localities/suggest    ?pin= → [{ id, name, type }]
GET   /v1/societies             ?pin= → [{ id, name, distance_m }]
POST  /v1/societies             { name, address, pin }
POST  /v1/me/residence          { residence_kind, society_id?, tower_id?, flat?, street?, house? }
POST  /v1/me/interests          { tags[] }
POST  /v1/me/roles/declare      { roles[] }  -- declares intent; Silver needed to activate

# KYC
POST  /v1/kyc/upload            multipart: type, file
POST  /v1/kyc/aadhaar/init      → { redirect_url }
POST  /v1/kyc/liveness          { video_blob_id }
GET   /v1/me/kyc                → { tier, documents[], vouches_received }

# Vouch
POST  /v1/vouch                 { vouchee_user_id }
DELETE /v1/vouch/:id

# Business onboarding
POST  /v1/businesses            { business_name, category, lat, lng, service_radius_m, hours_json, contact }
PATCH /v1/businesses/:id
POST  /v1/businesses/:id/verify { kind, document_id? }
GET   /v1/businesses/mine       → [BusinessProfile]
```

---

## 7. Edge Cases

- **EC-1.1** GPS PIN ≠ manually entered PIN → show both, user picks.
- **EC-1.2** User declares Cook role but doesn't add menu → role shows "Incomplete" badge; not visible in marketplace until menu added.
- **EC-1.3** Business at same location as user's home (home cook, home salon) → same lat/lng allowed; distinct profile.
- **EC-1.4** User tries to create 4th business profile → blocked with upgrade prompt (v2.1 feature).
- **EC-1.5** Two users claim same flat → both flagged; either provides NOC or vouches to resolve.
- **EC-1.6** Aadhaar name mismatch with profile name → block Gold, surface "Name must match your Aadhaar" error.
- **EC-1.7** Business self-declaration abuse detected (fake shop) → auto-review flag; suspend within 24h on confirmed report.
- **EC-1.8** New user in area with no societies or businesses → onboarding prompts "Add your building" and "Is there a shop nearby?"; crowdsourced growth.

---

## 8. Metrics

| Metric | Target |
|---|---|
| Install → OTP verified | ≥ 75% |
| OTP → Bronze complete (locality + residence) | ≥ 78% |
| Bronze → Silver within 7 days | ≥ 55% |
| Users declaring ≥ 1 peer role at signup | ≥ 25% |
| Businesses completing full catalogue (≥ 3 items) at setup | ≥ 70% |
| Business go-live (unverified) within 24h of signup | ≥ 85% |
| Avg time to Bronze | ≤ 5 min |
| OTP delivery p95 | ≤ 15s |

---

## 9. Dependencies

- MSG91 + WhatsApp Business API templates
- DigiLocker/SETU for Aadhaar e-KYC
- Ola Maps reverse-geocode API
- India postal-codes table
- Pre-seeded society/locality list for Mumbai MMR + Pune

---

## 10. Out of Scope (v2.0)

- Email / Google / Apple SSO
- International phone numbers
- Multi-society household membership
- Voice OTP
- 4th+ business profile per user
- Business-to-business (B2B) transactions
- Franchise / multi-branch business management
