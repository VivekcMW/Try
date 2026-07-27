# 14 — Moderation & Admin

> The trust & safety backbone: report queues, RWA admin panel, content moderation, and the strike system.

---

## 1. Goal

Keep Lokul a safe, civil, India-context-appropriate community. Every reported piece of content gets reviewed within 24h; repeat offenders are removed.

---

## 2. User stories

### As a resident
- **US-14.1** I can report any post, comment, chat message, listing, merchant, profile.
- **US-14.2** I get feedback on the outcome of my report.

### As a Lokul moderator (@MOD)
- **US-14.3** I see a queue of reports filtered by category and severity, with context.
- **US-14.4** I can take actions: dismiss, warn, hide, remove, suspend user, escalate.
- **US-14.5** I see my SLA dashboard.

### As an RWA admin (@ADMIN)
- **US-14.6** I see reports specific to my society and can locally moderate (hide-for-society, blacklist merchant).
- **US-14.7** I can grant/revoke roles for residents (admin, guard) of my society.
- **US-14.8** I can view a society dashboard (active members, posts/day, incidents, dues collection).

---

## 3. UX flows

### 3.1 Reporting

```
Long-press content → Report → reason picker (5 reasons + free text)
→ Submit → toast "Thanks, we'll review within 24 hours" → content hidden for reporter
```

### 3.2 Mod queue (internal web tool, but available in app via Mod Mode)

```
Mod Mode → Queue → filter (severity, category, society, age)
- Each item: content preview, reporter context, author trust score, prior reports
- Actions sidebar: Dismiss / Warn / Hide / Remove / Suspend 7d / Suspend 30d / Ban
- Notes field, action goes to audit log
```

### 3.3 RWA admin panel

```
Settings → Society admin (visible only to RWA admins) →
- Members (search, role assign)
- Notices (compose, history)
- Dues cycles (module 06)
- Endorsed/blacklisted merchants (module 05)
- Local reports queue
- Society dashboard (charts: members, posts, incidents)
```

---

## 4. Functional requirements

### Reports
- **FR-14.1** Reportable entities: post, comment, chat_message, story, listing, merchant, profile, review, event.
- **FR-14.2** Reasons (taxonomy): `spam`, `harassment`, `misinformation`, `nudity`, `hate_speech`, `violence`, `child_safety`, `illegal_goods`, `impersonation`, `other`.
- **FR-14.3** Reports automatically routed by category to either RWA local moderation (society-bounded) OR Lokul T&S (cross-society, severe categories).
- **FR-14.4** Auto-routing rules:
  - `child_safety`, `violence`, `illegal_goods`, `hate_speech` → **Lokul T&S** only (RWA cannot see/act).
  - `spam`, `misinformation` (society scope) → RWA first; Lokul if escalated.
  - `harassment` → both, Lokul has override authority.
- **FR-14.5** Each report has an SLA: critical 1h, high 6h, normal 24h.

### Auto-moderation (pre-filtering)
- **FR-14.6** All posts/messages/listings pass through a moderation pipeline at write time:
  1. **Keyword filter** (Hindi/English/Marathi lists, fuzzy match)
  2. **PII redaction** (phone, Aadhaar, vehicle number)
  3. **NSFW image classifier** (CLIP-based; threshold tuned)
  4. **LLM check** (Llama-3.1 self-hosted) for nuanced abuse/hate
- **FR-14.7** Pipeline outputs: `allow`, `warn` (post but flag for mod review), `block` (do not post; tell user why).
- **FR-14.8** False-positive appeals: user can request review within 7 days; mod resolves within 48h.

### Actions & strikes
- **FR-14.9** Strike system: 3 strikes in 90 days → 30-day suspension; 5 strikes → permanent ban; warnings count as 0.5 strike.
- **FR-14.10** Actions auto-trigger downstream: hide post → reaction/comment counters frozen; suspend user → sessions revoked, listings paused, bookings completed-only; ban → permanent block + data purged per retention.
- **FR-14.11** All mod actions are logged in `audit_log` with reason, actor, target, timestamp; immutable.

### RWA admin
- **FR-14.12** RWA admin role granted via society sign-up flow OR transferred by existing admin OR appointed by Lokul (with society email proof).
- **FR-14.13** Up to 5 RWA admins per society; max 2 with billing/dues authority.
- **FR-14.14** RWA admin can: post notices, pin posts (≤24h, override Lokul), endorse/blacklist merchants, run polls (incl. binding), grant guard role, view society dashboard.
- **FR-14.15** RWA admin CANNOT: see private chats, edit/delete others' posts, suspend non-society users.

### Audit & transparency
- **FR-14.16** Every removal/suspension shown to affected user with reason category (not reporter identity).
- **FR-14.17** Quarterly transparency report (aggregate counts) published publicly.

---

## 5. Data model

```
reports
  id, reporter_id
  target_kind, target_id
  reason, free_text
  status ('open'|'in_review'|'resolved'|'dismissed')
  routed_to ('rwa'|'lokul'|'both')
  priority ('critical'|'high'|'normal')
  society_scope_id (nullable)
  created_at, resolved_at

mod_actions
  id, actor_id (mod or admin)
  target_kind, target_id
  action ('dismiss'|'warn'|'hide'|'remove'|'suspend_7d'|'suspend_30d'|'ban'|'reinstate')
  reason_category, internal_notes
  related_report_ids[]
  created_at

user_strikes
  id, user_id, weight (1.0 or 0.5)
  reason_category, related_action_id
  expires_at  -- 90 days
  created_at

user_suspensions
  id, user_id, kind ('warning'|'suspend'|'ban')
  starts_at, ends_at (nullable for ban)
  reason_category, mod_id

audit_log
  id, actor_id, action, target_kind, target_id, metadata_json, recorded_at

roles
  user_id, society_id, role ('rwa_admin'|'rwa_billing_admin'|'guard'|'head_guard'|'lokul_mod'|'lokul_admin')
  granted_at, granted_by, revoked_at

mod_pipeline_decisions
  content_kind, content_id, decision, signals_json
  created_at
```

---

## 6. APIs

```
# Reporting
POST  /v1/reports                  { target_kind, target_id, reason, free_text? }
GET   /v1/me/reports               (reporter sees status)

# Mod queue (internal)
GET   /v1/mod/queue                ?priority=&category=&society=
POST  /v1/mod/actions              { target, action, reason, notes }
GET   /v1/mod/audit                ?from=&to=&actor=

# Strikes / suspensions
GET   /v1/mod/users/:id            → user mod profile (strikes, suspensions, history)
POST  /v1/mod/users/:id/suspend    { duration_days, reason }
POST  /v1/mod/users/:id/reinstate

# RWA admin
GET   /v1/societies/:id/members    ?role=
POST  /v1/societies/:id/roles      { user_id, role }
DELETE /v1/societies/:id/roles/:user_id/:role
GET   /v1/societies/:id/reports    (RWA-scoped queue)
GET   /v1/societies/:id/dashboard  → charts data

# Appeals
POST  /v1/appeals                  { mod_action_id, reason }
GET   /v1/me/appeals
```

---

## 7. Edge cases

- **EC-14.1** Report from a banned/suspended user → still recorded, lower priority.
- **EC-14.2** Mass-report brigading (>10 reports same target in 1h from same society) → auto-flag for human review, do not auto-action.
- **EC-14.3** Conflict: RWA admin reports a Lokul mod → escalate to head admin; mod recused.
- **EC-14.4** Banned user creates new account (same phone after deletion) → device fingerprint + phone hash check blocks for 180 days.
- **EC-14.5** Moderation pipeline down → fall back to "post but auto-queue for review".
- **EC-14.6** LLM false positive blocks legitimate content → in-product appeal opens immediately; SLA 24h.
- **EC-14.7** RWA admin abuses role (suspends critics) → Lokul reviews; can reinstate + warn/remove admin.
- **EC-14.8** User suspended mid-booking → booking refunded; merchant notified.
- **EC-14.9** Audit log access — read-only after write; tamper-evident hash chain stored daily.

---

## 8. Metrics

| Metric | Target |
|---|---|
| Reports resolved within SLA | ≥ 95% |
| Auto-mod precision (blocks reviewed as correct) | ≥ 90% |
| False-positive appeals overturned | < 10% |
| % reports auto-handled (no human) | ≥ 50% |
| Repeat offender rate (>2 actions) | < 5% of monthly actives |
| RWA admin satisfaction (survey) | ≥ 4.2 / 5 |

---

## 9. Dependencies

- Llama-3.1 self-hosted (GPU instance) for nuanced moderation.
- CLIP / NSFW classifier model.
- ClamAV for file scans.
- Audit chain (hash) for tamper evidence.
- Legal review (IT Rules 2021, DPDPA).
- Mod console (web tool — separate sub-project but in same repo).

---

## 10. Out of scope (v1.0)

- Public-facing transparency report dashboard (only quarterly PDF at v1).
- User-trained moderation models (use static models at v1).
- Multi-language hate-speech with sarcasm detection (best-effort, not guaranteed).
- Whisper-based audio moderation in voice notes / calls (privacy concerns; deferred).
- Crowdsourced jury moderation (Reddit-style).
- Restore feature for deleted content (admins can view but not undelete after 30d).
