# 13 — Profile, Trust Score & Settings

> Identity surface for the user, verification badges, trust score, and all user settings.

---

## 1. Goal

Give every user a profile they're proud of, an objective trust signal others can rely on, and clear, granular controls over their data and notifications.

---

## 2. User stories

- **US-13.1** As a resident, I can complete my profile with photo, bio, and interests.
- **US-13.2** As a resident, I can see my trust score and what improves it.
- **US-13.3** As a viewer, I can see other residents' KYC tier, trust score, and shared society/tower.
- **US-13.4** As a resident, I can manage privacy (who can see my flat number, last-seen, phone).
- **US-13.5** As a resident, I can export my data (DPDPA right) and delete my account.
- **US-13.6** As a resident, I can change my language anytime.

---

## 3. UX flows

### 3.1 My profile

```
You tab → Profile header (photo, name, badges, trust score, society)
→ Tabs: About · Activity · Reviews · Listings
→ Edit profile button
```

### 3.2 View another resident

```
Tap on any user (post, comment) → their profile
- Reduced info per privacy settings
- Actions: Chat / Call / Vouch / Report / Block
```

### 3.3 Settings

```
You → Settings:
- Account (phone, email)
- Profile
- Privacy
- Notifications (see module 12)
- Language
- Security (2FA, sessions, blocked users)
- Data (export, delete)
- About (version, ToS, privacy policy, support)
- Logout
```

---

## 4. Functional requirements

### Profile
- **FR-13.1** Profile fields: name (required), photo, bio (≤200 chars), interests (multi-select from a fixed taxonomy of 30 tags), public-facing flat label (e.g., "Tower A").
- **FR-13.2** Badges displayed: KYC tier (Bronze/Silver/Gold), Responsive (merchant), RWA Admin, Long-time resident (>1 year), Top Helper (>50 helpful reactions).
- **FR-13.3** Activity tab: counts of posts, comments, events hosted, listings sold, vouches given.
- **FR-13.4** Profile is public to society members only; outside-society viewers see name + photo + first-name-of-society only.

### Trust score
- **FR-13.5** Score range 0–100; computed daily.
- **FR-13.6** Formula (weights tunable):
  ```
  trust = 35 * kyc_factor       (Bronze=0.3, Silver=0.7, Gold=1.0)
        + 20 * tenure_factor    (months_active / 24, capped 1.0)
        + 15 * vouches_factor   (active_vouches / 5, capped 1.0)
        + 15 * positive_engagement_factor   (helpful reactions − reports)
        + 10 * transactions_factor  (completed bookings/listings without disputes)
        +  5 * profile_completeness_factor
        - penalties (active reports, suspensions)
  ```
- **FR-13.7** Penalties: -10 per active warning, -25 per active suspension; expire on resolution.
- **FR-13.8** Score visible publicly as a number; tooltip explains how to improve.

### Privacy
- **FR-13.9** Per-field privacy: phone (default hidden), last-seen (default tower-only), flat number (default tower-only).
- **FR-13.10** Block: prevents the blocked user from messaging, calling, reacting, or seeing your posts; reciprocal hiding.
- **FR-13.11** Last-seen visible to "society members" by default; per-user overrides via privacy panel.

### Security
- **FR-13.12** Active sessions list (device, last active, location); can revoke individually.
- **FR-13.13** 2FA: TOTP optional (Google Authenticator); required for RWA admins and merchants ≥ ₹50K monthly GMV.
- **FR-13.14** Login history (last 90 days) viewable.
- **FR-13.15** Password is N/A (OTP-only); but for sensitive actions, re-OTP within 5 min cached.

### Data rights (DPDPA-2023)
- **FR-13.16** Export: user requests; system generates ZIP within 7 days containing profile, posts, comments, chats (DM in plain text after server-decrypts using their identity), bookings, transactions; emailed link valid 72h.
- **FR-13.17** Delete: 30-day grace period; soft-delete during grace, irreversibly hard-delete after; legal-hold exception for ongoing disputes/audit.
- **FR-13.18** Consent log: every consent (notifications, location, marketing) recorded with timestamp.

### Language & accessibility
- **FR-13.19** Languages at v1: English (default), Hindi, Marathi.
- **FR-13.20** Font scale follows OS setting up to 200%.
- **FR-13.21** Screen-reader labels on all interactive elements.
- **FR-13.22** Color contrast WCAG AA.

---

## 5. Data model

```
profiles
  user_id (PK, FK users)
  bio, interests[]
  public_flat_label
  privacy_phone, privacy_lastseen, privacy_flatno   -- enum: 'public'|'society'|'tower'|'nobody'

trust_scores
  user_id, score (0-100)
  factors_json  -- breakdown for transparency
  computed_at

badges
  user_id, kind, granted_at, expires_at (nullable)

blocks
  blocker_id, blocked_id, created_at, reason (nullable)

sessions   (also in module 01)
  -- already defined

consents
  id, user_id, kind ('notif_push'|'location'|'marketing'|'kyc_processing')
  granted (bool), granted_at, revoked_at

data_export_jobs
  id, user_id, requested_at, completed_at, download_url, expires_at

account_deletions
  user_id, requested_at, scheduled_purge_at, status ('grace'|'purging'|'purged')

login_history
  id, user_id, ip, device_meta, login_at, success
```

---

## 6. APIs

```
GET    /v1/me                            → profile + tier + trust
PATCH  /v1/me                            { name, bio, photo, interests, public_flat_label, privacy_* }

GET    /v1/users/:id                     → public-facing view (filtered by privacy + viewer relation)

GET    /v1/me/trust-score                → score + factors
GET    /v1/me/badges

POST   /v1/blocks                        { user_id }
DELETE /v1/blocks/:user_id
GET    /v1/blocks

GET    /v1/me/sessions
DELETE /v1/me/sessions/:id

POST   /v1/me/2fa/enroll                 → { otpauth_uri }
POST   /v1/me/2fa/verify                 { code }
POST   /v1/me/2fa/disable

POST   /v1/me/data-export                → { job_id }
GET    /v1/me/data-export/:id

POST   /v1/me/delete                     → { scheduled_purge_at }
POST   /v1/me/delete/cancel              (within grace window)

PATCH  /v1/me/language                   { language }
```

---

## 7. Edge cases

- **EC-13.1** User changes phone → sessions invalidated except current; trust score tenure preserved.
- **EC-13.2** Trust score drops sharply (>20 in a day) → user notified with explanation.
- **EC-13.3** Block list contains 1000+ entries — supported, paginated.
- **EC-13.4** Data export size > 5GB → split into multi-part download.
- **EC-13.5** Deletion requested with positive wallet balance → block deletion until funds withdrawn/refunded.
- **EC-13.6** Deletion requested while merchant has active bookings → block deletion until completion or admin override.
- **EC-13.7** Profile photo deepfake / inappropriate → flag for moderation, blur until review.
- **EC-13.8** Language switch mid-form → in-progress drafts preserved with original-language strings until submission.

---

## 8. Metrics

| Metric | Target |
|---|---|
| Profile completion (photo+bio+interests) | ≥ 70% of Silver+ |
| Avg trust score across actives | ≥ 60 |
| Block uses / WAU | ≤ 0.5% (low = healthy community) |
| 2FA enrollment among RWA admins | 100% by T+90d |
| Data export jobs completed within 7d | ≥ 99% |
| Account deletion completion rate | ≥ 95% (no abandoned grace) |

---

## 9. Dependencies

- KYC module 01 (tiers feed into trust).
- Bookings & marketplace module 05 (transactions factor).
- Moderation module 14 (penalties).
- DPDPA legal review of export/delete flows.
- OS-level accessibility APIs.
- TOTP library.

---

## 10. Out of scope (v1.0)

- Public profile pages on the web (only inside app + minimal web view at module 15).
- Custom username (handle); name is real-name only.
- Profile themes / custom colors.
- Trust score leaderboard.
- Verified celebrity / influencer flow.
- Marketing-style profile banners.
