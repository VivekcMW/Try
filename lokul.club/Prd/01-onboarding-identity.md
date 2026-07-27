# 01 — Onboarding & Identity

> Bringing a new user from app install to a fully verified, locality-tagged resident — with the least friction and the highest trust.

---

## 1. Goal

Convert installs into **verified residents** with a clear KYC tier, locality and society binding, and notification opt-in — in **≤ 5 minutes** for Bronze, **≤ 3 days** for Silver, **≤ 7 days** for Gold.

---

## 2. User stories

- **US-1.1** As a new user, I sign up with my phone number and OTP only — no email, no password.
- **US-1.2** As a new user, I confirm my locality (PIN + city) using GPS or manual entry.
- **US-1.3** As a new user, I pick my society and tower, or request to add a new one.
- **US-1.4** As a new user, I see relevant content immediately even before address proof.
- **US-1.5** As a returning user, I can log in on a new device with OTP and have data sync.
- **US-1.6** As a senior citizen, I can complete onboarding in Hindi/Marathi with large fonts.
- **US-1.7** As an existing resident, I can **vouch** for a new neighbor to fast-track their Silver tier.
- **US-1.8** As a user, I can request my locality be **added** if it isn't listed.

---

## 3. UX flows

### 3.1 Sign-up flow (Bronze tier)

```
Splash → Permission primer (notif + location) →
Phone entry (+91) → OTP (6-digit) → Name + Photo →
Locality (GPS or PIN entry) → Society picker → Tower + Flat number →
Interest tags → "Welcome" → Feed (limited preview, gated until Silver)
```

**Screens (10):** Splash · PermissionPrimer · PhoneEntry · OtpEntry · ProfileBasics · LocalityPicker · SocietyPicker · TowerFlatPicker · InterestTags · WelcomeFeed

### 3.2 Silver verification

Triggered by user tapping "Verify address" (or after 3 days of Bronze use).

```
Pick proof type → Upload (rent agreement / electricity bill / society NOC)
  → Submit → "Under review" state →
Reviewed (auto OCR + manual fallback within 24h) → Silver badge
```

**Screens (4):** ProofPicker · UploadFlow · UnderReview · SilverGranted

### 3.3 Gold verification

```
Aadhaar e-KYC redirect (DigiLocker) → Selfie liveness check
  → ID + face match → Gold badge
```

**Screens (3):** AadhaarConsent · LivenessCheck · GoldGranted

### 3.4 Vouch flow (existing user → new user)

```
User taps "I know them" on neighbor list →
Confirm vouch (read implications) → Vouched →
New neighbor sees vouch counter increase + gains Silver if 3 vouches
```

### 3.5 Add-new-society flow

```
SocietyPicker → "Not listed?" → Society name + address + RWA email →
Submit → "Under review" → Admin approval in 48h → User notified
```

---

## 4. Functional requirements

### Phone & OTP
- **FR-1.1** App MUST support **+91 phone numbers only** at v1.
- **FR-1.2** OTP MUST be **6 digits**, **5 min validity**, **3 retries**, then 10-min cooldown.
- **FR-1.3** OTP MUST be deliverable in **≤ 15 sec p95** (MSG91 primary, Firebase Phone Auth fallback).
- **FR-1.4** App MUST support **WhatsApp OTP fallback** if SMS fails (via MSG91 WhatsApp template).
- **FR-1.5** Auto-read OTP MUST work on Android (SMS Retriever API).
- **FR-1.6** Re-login on a new device MUST invalidate the old session within 60s.
- **FR-1.7** Concurrent sessions across devices: max **3 active devices**.

### Locality detection
- **FR-1.8** App SHOULD auto-detect PIN code from GPS via Ola Maps reverse-geocode (already implemented for web in `src/lib/geo.ts` — reuse server endpoint).
- **FR-1.9** User MUST be able to override detected PIN.
- **FR-1.10** PIN MUST be validated as a valid 6-digit Indian PIN against the postal-codes table.

### Society & tower
- **FR-1.11** Societies are seeded from RWA partnerships + crowdsourced; user-submitted societies enter `pending_review`.
- **FR-1.12** Tower list is per society; user-submitted towers auto-approved.
- **FR-1.13** Flat number is **free-text** (not validated), but format-hinted (e.g., "A-204").
- **FR-1.14** Two users CAN claim the same flat → triggers a "current resident" review.

### KYC tiers
- **FR-1.15** Tier definitions:
  | Tier | Requires | Unlocks |
  |---|---|---|
  | **Bronze** | Phone OTP | Read-only feed (last 24h), join society chat (mute by default) |
  | **Silver** | Address proof OR 3 vouches | Post in feed, RSVP events, chat unmuted, marketplace browse, polls vote |
  | **Gold** | Aadhaar + selfie liveness | SOS broadcast, list as merchant, classifieds high-value (>₹10,000), host events, become RWA admin |
- **FR-1.16** Tier upgrade is **manual or auto**; downgrade only on report-driven moderation action.
- **FR-1.17** Vouching: each user can vouch ≤ 5 new users per month. Self-vouching prohibited.

### Permissions
- **FR-1.18** Notification permission requested AFTER first feed view (not on splash).
- **FR-1.19** Location permission requested at LocalityPicker step (with "while using app" framing first; "always" only requested if user opts into Visitor module).
- **FR-1.20** Camera permission requested only when posting media.
- **FR-1.21** Contacts permission NEVER requested at v1.

### Persistence
- **FR-1.22** Onboarding state MUST persist across kills; user can resume mid-flow.
- **FR-1.23** Partial signups expire after 7 days.

### Internationalisation
- **FR-1.24** Language picker shown on Splash if device locale isn't English/Hindi/Marathi.
- **FR-1.25** Language can be changed in Settings; entire app re-renders.

---

## 5. Data model

### Tables (Postgres)

```
users
  id (ULID, PK)
  phone (E.164, unique, indexed)
  name
  photo_url
  language ('en'|'hi'|'mr')
  kyc_tier ('bronze'|'silver'|'gold')
  trust_score (0–100, denormalised)
  created_at, updated_at
  deleted_at (soft delete)

user_localities
  user_id (FK users)
  pin_code (text(6))
  city, region
  is_primary (bool)

user_residences
  id, user_id (FK)
  society_id (FK)
  tower_id (FK)
  flat_number (text)
  verified_at (nullable)
  verification_method ('proof'|'vouch'|'aadhaar')

societies
  id, name, address, pin_code, lat, lng
  status ('approved'|'pending'|'rejected')
  rwa_contact_email
  created_by (FK users)

towers
  id, society_id (FK)
  name
  flat_count_hint

kyc_documents
  id, user_id (FK)
  type ('rent'|'bill'|'noc'|'aadhaar')
  storage_key (R2 path; encrypted at rest)
  status ('pending'|'approved'|'rejected')
  reviewer_id (FK users nullable)
  reviewed_at

vouches
  voucher_user_id (FK)
  vouchee_user_id (FK)
  created_at
  -- composite unique key (voucher, vouchee)

sessions
  id, user_id, device_id, device_meta_json
  last_active_at, revoked_at
```

---

## 6. APIs

### Public auth (no token)
```
POST   /v1/auth/otp/request        { phone, channel: "sms"|"whatsapp" }
POST   /v1/auth/otp/verify         { phone, otp } → { access_token, refresh_token, user_id, tier }
POST   /v1/auth/token/refresh      { refresh_token }
```

### Onboarding (authenticated, partial)
```
POST   /v1/me/profile              { name, photo_url, language }
POST   /v1/me/locality             { pin_code } → reverse-geocoded city/region echoed
GET    /v1/societies?pin=400058    → [{ id, name, distance_m }]
POST   /v1/societies               { name, address, pin, rwa_email } → pending
GET    /v1/societies/:id/towers
POST   /v1/me/residence            { society_id, tower_id, flat_number }
POST   /v1/me/interests            { tags: ["safety", "market"] }
```

### KYC
```
POST   /v1/kyc/upload              multipart: type, file → { document_id, status: "pending" }
POST   /v1/kyc/aadhaar/init        → { redirect_url } (DigiLocker)
POST   /v1/kyc/aadhaar/callback    (server-to-server)
POST   /v1/kyc/liveness            { video_blob_id }
GET    /v1/me/kyc                  → { tier, documents, vouches_received, vouches_needed }
```

### Vouch
```
POST   /v1/vouch                   { vouchee_user_id }
DELETE /v1/vouch/:id
```

---

## 7. Edge cases

- **EC-1.1** User changes phone number — must re-verify; old number archived.
- **EC-1.2** Same phone tries to sign up twice — log them in.
- **EC-1.3** OTP intercepted (delayed delivery) — accept OTP up to 5 min after generation; show resend after 30s.
- **EC-1.4** GPS PIN ≠ user-entered PIN — show both; let user choose.
- **EC-1.5** Society auto-detected from GPS but user lives just outside — manual override.
- **EC-1.6** User uploads wrong document type — OCR rejects → ask to re-upload with reason.
- **EC-1.7** Two users claim same flat — both marked `under_dispute`; either provides society NOC to confirm.
- **EC-1.8** Aadhaar e-KYC fails (name mismatch with profile) — block Gold; surface clear error.
- **EC-1.9** Vouch by a Bronze user — only count vouches by Silver+ users.
- **EC-1.10** RWA email bounces during society creation — admin manually reaches out within 48h.

---

## 8. Metrics

| Metric | Target |
|---|---|
| Install → OTP verified | ≥ 75% |
| OTP verified → Bronze complete (locality + society + flat) | ≥ 80% |
| Bronze → Silver within 7 days | ≥ 55% |
| Silver → Gold within 30 days | ≥ 25% |
| Avg time to Bronze | ≤ 5 min |
| OTP delivery p95 | ≤ 15s |
| Vouches given / vouched user | avg 2.4 |
| Onboarding drop-off at locality step | ≤ 8% |

---

## 9. Dependencies

- MSG91 contract + WhatsApp template approval.
- DigiLocker partner agreement (via SETU or Karza).
- Postal-codes table (seeded from India Post CSV).
- Pre-seeded society list for Mumbai MMR + Pune (≥ 500 societies).
- Notification permission strings localised in English/Hindi/Marathi.

---

## 10. Out of scope (v1.0)

- Email login
- Google/Apple SSO
- Magic-link login
- Multi-society membership (one residence at a time in v1)
- International phone numbers
- Voice-OTP (only SMS + WhatsApp at v1)
- Family/household linking (deferred to v1.1)
