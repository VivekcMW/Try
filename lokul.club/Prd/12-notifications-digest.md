# 12 — Notifications, Inbox & AI Feed Digest

> Push, in-app inbox, and a daily AI-summarized digest that keeps users informed without overwhelming them.

---

## 1. Goal

Deliver the **right notification to the right person at the right time** — and never spam. The AI digest condenses 50+ feed items into a 30-second read.

---

## 2. User stories

- **US-12.1** As a resident, I get push notifications for things I care about (safety, mentions, RSVPs).
- **US-12.2** As a resident, I can see all past notifications in an Inbox.
- **US-12.3** As a resident, I open the app each morning to a "3 things to know today" AI digest.
- **US-12.4** As a resident, I can customize notification preferences (per-category, quiet hours).
- **US-12.5** As an admin, I can broadcast an announcement push to all society members.

---

## 3. UX flows

### 3.1 Inbox

```
Bell icon (Navbar) → unread count badge → Inbox panel
- Tabs: All · Mentions · Safety · Bookings · RWA
- Tap notification → deep link to source (post/booking/chat)
- Long-press → mark read/unread, delete
```

### 3.2 AI Digest

```
Feed top → "Your morning brief" card
- 3 bullets summarizing last 24h: e.g.
  • "2 power-outage alerts in your tower last night, resolved by 6am"
  • "Diwali decoration meeting Sat 5pm — 23 RSVPs"
  • "Maintenance dues for Nov posted by Mr. Shah, ₹4,200/flat"
- Tap → expanded view with source post links
- "Skip today" + "Mute" controls
```

### 3.3 Settings

```
Settings → Notifications →
- Master toggle
- Per-category toggle (10 categories)
- Quiet hours (default 22:00–07:00)
- Critical (SOS) override-DND toggle
```

---

## 4. Functional requirements

### Push delivery
- **FR-12.1** Provider: FCM for Android, APNs (via OneSignal) for iOS. VOIP push (PushKit) for calls.
- **FR-12.2** Notification categories (10): `safety`, `sos`, `mention`, `comment`, `reaction`, `booking`, `payment`, `rwa_notice`, `event_reminder`, `digest`.
- **FR-12.3** Each push includes: title, body, deep_link, category, priority, optional thumbnail.
- **FR-12.4** Priority: `critical` (SOS, fire, child lost), `high` (safety, mention), `normal` (others).
- **FR-12.5** Quiet hours suppress all `normal` pushes; `critical` and `high` still deliver if user toggled "DND override".
- **FR-12.6** Per-device tokens stored; stale tokens (>30 days inactive) cleaned up nightly.
- **FR-12.7** Push delivery target p95 ≤ 15s; failures retried 3× with backoff.

### Inbox
- **FR-12.8** Every push generates a row in `notifications` table (idempotent on `dedup_key`).
- **FR-12.9** Inbox shows last 90 days; older auto-archived.
- **FR-12.10** Unread count debounced (recomputed every 5s max).
- **FR-12.11** Mark-read on tap; bulk "Mark all read" available.

### AI Digest
- **FR-12.12** Runs daily at 06:30 IST per active user.
- **FR-12.13** Input: posts from user's society + tower from last 24h that user has NOT yet seen.
- **FR-12.14** Selection: top 3–5 by relevance (engagement + safety priority + RWA priority).
- **FR-12.15** Summarization: GPT-4o-mini with strict prompt (no hallucination of facts not in source posts).
- **FR-12.16** Cost cap: ≤ ₹0.30 per user per day.
- **FR-12.17** Fallback if AI fails: rule-based digest (top 3 posts by engagement) with template strings.
- **FR-12.18** PII redaction in digest prompt: phone numbers, emails masked before sending to LLM.
- **FR-12.19** Digest stored in `digests` table; reused if user opens app within 6h of generation; regenerated for next-day's view.
- **FR-12.20** Digest opt-out at any time; saves cost + removes card.

### Broadcasts
- **FR-12.21** RWA admins can send 1 broadcast push per day (cap), to all society members.
- **FR-12.22** Lokul system can send broadcasts only for: city alerts (BMC/IMD), critical platform updates, security advisories.

---

## 5. Data model

```
device_tokens
  id, user_id, platform ('ios'|'android'|'web')
  token, app_version, last_seen_at
  -- unique (user_id, token)

notifications
  id (ULID), user_id
  category, priority
  title, body, deep_link
  thumbnail_url
  dedup_key       -- prevent duplicate sends
  status ('queued'|'sent'|'delivered'|'failed'|'read')
  sent_at, read_at
  source_kind, source_id  -- e.g. 'post', '<post_id>'

notification_prefs
  user_id, category, enabled (bool)
  quiet_hours_start, quiet_hours_end
  override_dnd_for_critical (bool)

digests
  id, user_id, society_id
  for_date (YYYY-MM-DD)
  bullets_json  -- array of {text, source_post_ids[]}
  llm_model, prompt_version
  cost_paise
  generated_at, viewed_at (nullable)

broadcasts
  id, sender_id, scope_kind ('society'|'pin'|'platform')
  scope_id, title, body
  scheduled_at, sent_at
  delivered_count
```

---

## 6. APIs

```
POST   /v1/devices                       { token, platform, app_version }
DELETE /v1/devices/:id

GET    /v1/notifications?cursor=&category=
POST   /v1/notifications/:id/read
POST   /v1/notifications/read-all
DELETE /v1/notifications/:id

GET    /v1/me/notification-prefs
PATCH  /v1/me/notification-prefs         { per-category, quiet_hours, ... }

GET    /v1/digest/today                  → { bullets, generated_at }
POST   /v1/digest/today/skip
POST   /v1/digest/optout

POST   /v1/broadcasts                    (admin) { scope, title, body, scheduled_at? }
```

---

## 7. Edge cases

- **EC-12.1** User has 3 devices: same notification sent to all; read-state sync via realtime.
- **EC-12.2** Push delivery failure → silently re-queue once; surface to user only if persistent (>10 failures in 24h).
- **EC-12.3** Inbox overflow (>10K rows for a power user) → background archive job; inbox query LIMIT 200 newest.
- **EC-12.4** Digest LLM returns hallucination → schema validation rejects bullet if source_post_ids empty; fallback to rules.
- **EC-12.5** User in quiet hours misses SOS push → push still delivered (critical override) AND in-app banner on next open.
- **EC-12.6** Quiet hours timezone drift — always IST.
- **EC-12.7** RWA broadcast spam (>1/day attempt) → 2nd attempt blocked with 24h cooldown UI.
- **EC-12.8** Digest fails for all users (LLM down) → fallback rule-based digest auto-runs.
- **EC-12.9** User reads digest in evening (after 6h regeneration) → today's regenerated digest replaces it.

---

## 8. Metrics

| Metric | Target |
|---|---|
| Push opt-in rate at install | ≥ 75% |
| Push CTR (open→source) | ≥ 18% |
| Push delivery p95 | ≤ 15s |
| Unsubscribe / disable rate | ≤ 8% per 30d |
| Digest open rate | ≥ 40% of recipients |
| Digest CTR (bullet tap) | ≥ 25% |
| Avg digest cost / user / day | ≤ ₹0.30 |

---

## 9. Dependencies

- FCM + APNs credentials and certificates.
- OneSignal account (iOS APNs path).
- OpenAI / Azure OpenAI quota for GPT-4o-mini.
- Cron worker scheduler for nightly digest generation.
- DPDPA review of LLM data handling.
- PII redaction utility library.

---

## 10. Out of scope (v1.0)

- WhatsApp notification channel (legal cost / template approval friction).
- Email notifications.
- In-app banner ads / promotional pushes.
- Per-thread custom notification sound.
- Voice digest (audio podcast).
- Notification analytics dashboard for users.
