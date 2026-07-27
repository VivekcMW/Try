# 15 — Web Companion App

> A lightweight web app that complements the mobile experience for residents and is essential for RWA admins and merchants.

---

## 1. Goal

A trustworthy web companion that lets residents check the feed, RWAs manage their society, and merchants manage bookings from a laptop. Mobile-first feature parity is **NOT** a goal; this is a deliberate subset.

---

## 2. User stories

### Resident (read-mostly)
- **US-15.1** As a resident, I can log in on web with OTP, browse the feed, react, and comment.
- **US-15.2** I can search past posts and notices.
- **US-15.3** I can update my profile and settings.

### RWA admin (web-primary)
- **US-15.4** I can run the entire RWA admin panel on web (notices, dues, members, reports, dashboard).
- **US-15.5** I can compose long notices with rich text and PDF attachments comfortably.

### Merchant (web-secondary)
- **US-15.6** I can manage my service catalog, calendar, and bookings on a desktop.
- **US-15.7** I can view earnings and request payouts.

### Mod (web-only)
- **US-15.8** Lokul moderators use the web for all queue work.

---

## 3. UX flows

### 3.1 Auth

```
landing → /login → Phone OTP → Logged in
- Web session 30 days; "Remember this device"
- 2FA challenge if enrolled
```

### 3.2 Layout

```
- Top nav: logo, search, bell, profile
- Left sidebar: Feed · Marketplace · Map · Events · Society Admin (if admin) · Merchant Hub (if merchant) · Mod (if mod)
- Right column: contextual widgets (digest, upcoming events, top merchants)
- Mobile responsive (works ≥ 768px; ≤ 768px nudges to install app)
```

---

## 4. Functional requirements

### Auth & sessions
- **FR-15.1** Same OTP auth backend; web stores refresh-token in HttpOnly Secure cookie.
- **FR-15.2** Web sessions tracked alongside mobile in `sessions` table; revocable.
- **FR-15.3** 2FA same flow as mobile.

### Feature parity (in v1)

| Module | Web supports | Web does NOT support (use app) |
|---|---|---|
| 01 Onboarding | Login + profile only | KYC document upload (mobile only) |
| 02 Feed | Read, react, comment, post (text + image) | Video upload, Stories |
| 03 Safety | Read incidents | SOS (mobile-only) |
| 04 Chat | Read + send text + image | Voice/video calls (deferred) |
| 05 Marketplace | Browse + chat | Booking (mobile only at v1) |
| 06 Payments | Statement view | Top-up (mobile-only via UPI Intent) |
| 07 Classifieds | Browse + list (with photos) | — |
| 08 Events | Browse + RSVP + create | Stories (mobile only) |
| 09 Lost/RWA/Polls | Full | — |
| 10 Map/Carpool | Map view only | Carpool (mobile only) |
| 11 Society Ops | RWA admin full; Visitor approvals (push to mobile only) | Guard terminal (mobile/tablet only) |
| 12 Notifications | Inbox + prefs | Push (uses web-push optionally) |
| 13 Profile/Settings | Full | — |
| 14 Moderation/Admin | Full RWA + Mod | — |

### Technology
- **FR-15.4** **Next.js 16** (app router) — same `/Users/vivekanandchoudhari/try/lokul.club/` project as the marketing site, with `/app` route group for authed area.
- **FR-15.5** Reuses the same Node/Fastify backend APIs; auth via cookies + JWT.
- **FR-15.6** Real-time updates via the same Ably channels (web SDK).
- **FR-15.7** Web-push (VAPID) for notifications opt-in.
- **FR-15.8** SSR for SEO-relevant pages (public merchant profiles, society landing pages); auth pages CSR.

### Performance
- **FR-15.9** Lighthouse score ≥ 90 (Performance, Accessibility, Best Practices).
- **FR-15.10** Time-to-interactive ≤ 2s on broadband.
- **FR-15.11** Bundle size budget: ≤ 300KB gzipped for first route.

### Cross-device sync
- **FR-15.12** Read state synced via API (notifications, messages).
- **FR-15.13** Draft sync: posts/messages drafts saved server-side; pick-up where you left off.

---

## 5. Data model

No new entities — web is a client over the same APIs. Adds:
```
web_sessions  (extends sessions with user_agent classification)
web_push_subscriptions
  user_id, endpoint, p256dh, auth, ua, created_at
```

---

## 6. APIs

Same APIs as mobile, plus:
```
POST   /v1/web-push/subscribe       { endpoint, keys: { p256dh, auth } }
DELETE /v1/web-push/subscribe       { endpoint }
POST   /v1/auth/web/refresh         (HttpOnly cookie-based)
```

---

## 7. Edge cases

- **EC-15.1** User logs in on web while on call → web shows "in call" banner; cannot start a 2nd call.
- **EC-15.2** Stale tab: real-time disconnect after 10 min idle → banner "Reconnect" CTA.
- **EC-15.3** Resident at gate trying to approve visitor on web → web pushes "Open app" because cellular push faster.
- **EC-15.4** Pasting Aadhaar number in post → same PII pipeline strips/blocks.
- **EC-15.5** Browser disables cookies → fall back to localStorage with warning about persistence.
- **EC-15.6** Mobile-first viewport (< 768px) → install banner prominent; navigation reduced.

---

## 8. Metrics

| Metric | Target |
|---|---|
| RWA admins active weekly on web | ≥ 70% |
| Merchants active weekly on web | ≥ 40% |
| Resident web sessions / MAU | ≥ 0.5 |
| Web → mobile install attribution | ≥ 25% of web visitors install within 30d |
| Web Core Vitals (LCP/CLS/INP) | all "Good" |

---

## 9. Dependencies

- Next.js setup at lokul.club domain.
- Cloudflare CDN.
- Web push VAPID keys.
- 2FA library on web (same TOTP).
- Ably web SDK.

---

## 10. Out of scope (v1.0)

- Native desktop app (Electron).
- Browser extension.
- Voice/video calls on web (deferred to v1.1 with WebRTC).
- Mobile camera capture from web (use mobile app).
- Offline web (PWA install supported, but offline read/write deferred).
- Multi-tab session sync of unsent drafts (best-effort).
