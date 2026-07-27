# 17 — Profile, Multi-Role Identity & Trust (v2)

> One profile that represents the whole person — resident, cook, rider, coach, reseller, community organizer, business owner — with a trust score that reflects every dimension of their participation in the neighborhood economy.

---

## 1. Goal

Give every user a unified, rich profile that honestly represents all the roles they play in the neighborhood — so neighbors, buyers, and organizers can make quick, informed trust decisions without leaving the app.

---

## 2. User Stories

- **US-17.1** My profile shows all my active roles: Resident · Cook · Rider · Coach · and links to my business profile.
- **US-17.2** Visitors to my profile see: my KYC badge, trust score, my cook ratings, my coach ratings, my community contributions — organized by role tab.
- **US-17.3** I can set which roles are publicly visible and which are private.
- **US-17.4** My business profile links back to my personal profile as "Meet the owner."
- **US-17.5** My trust score reflects all dimensions: verified identity + reliable delivery as cook + punctual coach + helpful neighbor.
- **US-17.6** I can see a breakdown of my trust score and what to do to improve it.
- **US-17.7** I can switch my active role mode (Cook mode / Rider mode / Coach mode / Resident mode) and the app adapts its home experience to that role.
- **US-17.8** I control my privacy: who sees my flat number, phone, last-seen, and individual role ratings.

---

## 3. UX Flows

### 3.1 My Profile Page

```
You Tab → Profile:
  ┌──────────────────────────────────────────┐
  │  [Photo]  Priya Sharma                   │
  │  🥇 Gold KYC · Trust 82 · Tower A        │
  │  Active in Lokul since 6 months          │
  │                                          │
  │  Roles:                                  │
  │  👩‍🍳 Cook ⭐4.9 (83 orders)              │
  │  🚴 Rider ⭐4.7 (12 trips)               │
  │  👥 Community Organizer (2 communities)  │
  │                                          │
  │  [Edit Profile]  [Switch Role Mode]      │
  ├──────────────────────────────────────────┤
  │  Tabs: [About][Cook][Rider][Community]   │
  ├──────────────────────────────────────────┤
  │  About:                                  │
  │  "Love cooking North Indian food.        │
  │   Morning cyclist. Happy to help!"       │
  │  Interests: Cooking, Cycling, Books      │
  │  Vouches received: 4                     │
  │                                          │
  │  Cook tab:                               │
  │  Cuisine: North Indian, Punjabi, Sweets  │
  │  Avg rating: ⭐4.9 · 83 orders done      │
  │  [Today's Menu →]                        │
  │  Recent reviews from neighbors...        │
  │                                          │
  │  Rider tab:                              │
  │  Vehicle: Bicycle · Radius: 500m         │
  │  Avg rating: ⭐4.7 · 12 trips done       │
  │  Currently: [Available] toggle           │
  └──────────────────────────────────────────┘
```

### 3.2 Role Mode Switching

```
Profile → [Switch Role Mode]
  → Role picker:
      🏠 Resident Mode   (default view)
      👩‍🍳 Cook Mode      (shows order queue, menu editor at top)
      🚴 Rider Mode      (shows available toggle, errand board)
      👨‍🏫 Coach Mode     (shows batch calendar, booking queue)
  
  → Selected mode changes:
      - Tab bar label on + (Compose) button
      - Home tab shows role-specific quick actions
      - Notification priority shifts to that role's events
  
  Mode is a UI context only; does not affect what others see.
  User is always all roles simultaneously.
```

### 3.3 View Another User's Profile

```
Tap username anywhere → Public Profile:
  ┌──────────────────────────────────────────┐
  │  [Photo]  Arjun S.  · Tower B           │
  │  ⭐ Silver KYC · Trust 71               │
  │  👩‍🍳 Cook  👥 Community Organizer        │
  │                                          │
  │  [Chat] [Vouch] [Report] [Block]         │
  ├──────────────────────────────────────────┤
  │  About  ·  Cook Reviews  ·  Communities  │
  └──────────────────────────────────────────┘
  
  Info shown based on privacy settings:
  - Name: always visible
  - Photo: always visible
  - KYC tier: always visible
  - Trust score: always visible
  - Active roles: visible (unless hidden by user)
  - Flat number: controlled by privacy setting
  - Phone: never shown on profile
  - Last seen: controlled by privacy setting
```

### 3.4 Trust Score Breakdown

```
Profile → Trust Score (82) → Tap for breakdown:
  ┌──────────────────────────────────────────┐
  │  Your Trust Score: 82 / 100             │
  │                                          │
  │  ✅ KYC Gold                  +35       │
  │  ✅ 6 months active           +14       │
  │  ✅ 4 vouches received        +12       │
  │  ✅ 83 orders, 0 disputes     +10       │
  │  ✅ Profile complete          +5        │
  │  ✅ Community organizer       +6        │
  │  ⚠️  2 reports (resolved)      0        │
  │                                          │
  │  To improve: Get 1 more vouch → +3     │
  │  To improve: Complete 20 more orders    │
  └──────────────────────────────────────────┘
```

---

## 4. Functional Requirements

### Profile Fields
- **FR-17.1** Core fields: name, photo, bio (≤200 chars), interests (from 40-tag taxonomy), primary locality, KYC tier.
- **FR-17.2** Role display: shows each active role with its aggregate rating and activity count (orders, trips, sessions, communities).
- **FR-17.3** Business link: if user owns a business, "My Business: [name]" shown on profile with tap-through.
- **FR-17.4** Public flat label (e.g., "Tower A" or "Near Main Gate") — finer detail controlled by privacy.
- **FR-17.5** Badges: KYC tier, Responsive (merchant/peer), Trusted Reseller, Hygiene (cook), Long-timer (>1 year), Top Helper (>50 helpful reactions), RWA Admin, Community Creator.

### Role Mode
- **FR-17.6** Role mode is a client-side UI state stored per user; affects home screen layout only.
- **FR-17.7** Cook mode: home shows today's orders, menu editor shortcut, earnings today.
- **FR-17.8** Rider mode: home shows available toggle, open errand requests board, earnings today.
- **FR-17.9** Coach mode: home shows today's sessions, batch member list, upcoming bookings.
- **FR-17.10** Resident mode: default; home shows main feed.
- **FR-17.11** Mode auto-resets to Resident at midnight IST.

### Trust Score (v2 expanded formula)
- **FR-17.12** Score range 0–100; computed daily at 3am IST.
- **FR-17.13** Formula:
  ```
  trust = 30 × kyc_factor            (Bronze=0.2, Silver=0.6, Gold=1.0)
        + 15 × tenure_factor         (months_active / 24, capped 1.0)
        + 12 × vouch_factor          (vouches_received / 5, capped 1.0)
        + 15 × transaction_factor    (completed_transactions / 100, capped 1.0; penalised by disputes)
        + 10 × peer_role_factor      (avg rating across roles, if any active)
        + 8  × engagement_factor     (helpful reactions − reports, normalised)
        + 5  × community_factor      (active community organizer = +5; member of 3+ = +2)
        + 5  × profile_completeness
        - penalties                  (−10/active warning; −25/active suspension)
  ```
- **FR-17.14** Role-specific rating: each role (cook, rider, coach, reseller) has its own avg rating; displayed separately on profile; all feed into `peer_role_factor` (avg of all active role ratings).
- **FR-17.15** Score displayed publicly as a number. Breakdown shown only to the user.
- **FR-17.16** Drop > 15 points in one day → push notification to user with explanation.

### Privacy Controls
- **FR-17.17** Per-field privacy:

| Field | Default | Options |
|---|---|---|
| Phone | Hidden | Nobody / Lokul only |
| Flat number | Tower-only | Nobody / Tower / Society |
| Last seen | Society | Nobody / Society / Tower |
| Role ratings | Public | Public / Society / Nobody |
| Business link | Public | Public / Nobody |

- **FR-17.18** Block: blocks messaging, calling, reacting, viewing posts; reciprocal.
- **FR-17.19** Report: 5 reasons; queued for moderation.

### Settings
- **FR-17.20** Language: EN / HI / MR; changeable anytime; app re-renders.
- **FR-17.21** Font scale: follows OS setting to 200%.
- **FR-17.22** Session management: list active devices; revoke individually.
- **FR-17.23** 2FA (TOTP): optional for residents; required for RWA admins and merchants with ≥ ₹50K monthly GMV.
- **FR-17.24** Data export: DPDPA-2023 right; ZIP with all personal data; ready within 7 days.
- **FR-17.25** Account deletion: 30-day grace; hard-purge after; blocked if active bookings or positive wallet balance.
- **FR-17.26** Consent log: every consent (location, notifications, marketing, KYC processing) with timestamp.

---

## 5. Data Model

```sql
profiles
  user_id (PK, FK users)
  bio, interests TEXT[]
  public_flat_label
  privacy_phone     ('nobody'|'lokul_only')
  privacy_flat      ('nobody'|'tower'|'society')
  privacy_lastseen  ('nobody'|'society'|'tower')
  privacy_roles     ('public'|'society'|'nobody')
  privacy_business  ('public'|'nobody')

trust_scores
  user_id (PK), score (0–100)
  factors_json   -- full breakdown
  computed_at

badges
  user_id, kind, granted_at, expires_at (nullable)
  -- kind enum: 'kyc_bronze'|'kyc_silver'|'kyc_gold'|'responsive'|'trusted_reseller'
  --            |'hygiene_cook'|'long_timer'|'top_helper'|'rwa_admin'|'community_creator'

role_ratings_summary
  user_id, role ('cook'|'rider'|'coach'|'reseller'|'merchant')
  rating_avg, rating_count
  total_transactions
  last_updated

blocks
  blocker_id, blocked_id, created_at

consents
  id, user_id, kind, granted (bool), granted_at, revoked_at

data_export_jobs
  id, user_id, requested_at, completed_at, download_url, expires_at

account_deletions
  user_id, requested_at, scheduled_purge_at, status

login_history
  id, user_id, ip, device_meta, login_at, success

user_role_mode  -- client preference, stored server-side
  user_id (PK), active_role ('resident'|'cook'|'rider'|'coach')
  updated_at
```

---

## 6. APIs

```
GET    /v1/me                          → profile + tier + trust + roles
PATCH  /v1/me                          { name, bio, photo, interests, public_flat_label, privacy_* }
PATCH  /v1/me/role-mode                { active_role }

GET    /v1/users/:id                   → public profile (filtered by viewer relation + privacy)
GET    /v1/me/trust-score              → score + factors breakdown
GET    /v1/me/badges

POST   /v1/blocks                      { user_id }
DELETE /v1/blocks/:user_id
GET    /v1/blocks

GET    /v1/me/sessions
DELETE /v1/me/sessions/:id
POST   /v1/me/2fa/enroll               → { otpauth_uri }
POST   /v1/me/2fa/verify               { code }
POST   /v1/me/2fa/disable

PATCH  /v1/me/language                 { language }

GET    /v1/me/consents
PATCH  /v1/me/consents/:kind           { granted: bool }

POST   /v1/me/data-export
GET    /v1/me/data-export/:id

POST   /v1/me/delete
POST   /v1/me/delete/cancel
```

---

## 7. Edge Cases

- **EC-17.1** User has Cook + Rider roles but deactivates both → profile shows only Resident; trust score peer_role_factor drops to 0.
- **EC-17.2** Trust score drops sharply (>20 in a day) due to multiple reports → push notification; user can view reason and appeal.
- **EC-17.3** Role mode auto-resets to Resident at midnight → ensures no one wakes up to a Cook mode home screen by accident.
- **EC-17.4** Business linked to profile but business is suspended → business link hidden from profile; "Under review" shown if user navigates to business.
- **EC-17.5** Data export requested with active food orders or errand → export generates snapshot; includes order history; export does not block active transactions.
- **EC-17.6** Deletion requested while cook has tiffin subscriptions active → block deletion; show "You have 3 active tiffin subscribers — please notify them before deleting."
- **EC-17.7** Profile photo flagged as inappropriate → blurred pending moderation; user notified.
- **EC-17.8** User changes name → KYC-verified name persists in system; display name updated; if Gold KYC, system warns "Your Aadhaar name is different."

---

## 8. Metrics

| Metric | Target |
|---|---|
| Profile completion (photo + bio + interests) | ≥ 72% of Silver+ |
| Users with ≥ 1 active peer role | ≥ 25% of Silver+ |
| Avg trust score across active users | ≥ 62 |
| Role mode switching / week across platform | ≥ 8,000 (proxy for active peer economy) |
| 2FA enrollment among RWA admins + high-GMV merchants | 100% |
| Data export requests completed within 7 days | ≥ 99% |

---

## 9. Dependencies

- Module 01 (KYC feeds trust score + badge)
- Module 05 (peer role ratings)
- Module 06 (business link on profile)
- Module 10 (community organizer badge + factor)
- Module 18 (moderation penalties feed trust score)
- DPDPA-2023 legal review for export/delete

---

## 10. Out of Scope (v2.0)

- Custom username / handle (real name only)
- Profile themes / custom colors
- Trust score leaderboard (privacy concern)
- Verified celebrity / public figure flow
- Portfolio page for professionals
- Multi-language bio (single language per bio)
- Public profiles on web (web companion shows minimal view only)
