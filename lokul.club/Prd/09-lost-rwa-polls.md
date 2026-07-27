# 09 — Lost & Found, RWA Notices, Polls

> Three closely-related community modules: report lost items, post RWA notices, run polls.

---

## 1. Goal

Give residents structured ways to (a) recover lost items, (b) read official RWA communication, and (c) participate in society decisions via polls.

---

## 2. User stories

### Lost & Found
- **US-9.1** As a resident, I can post a lost item (or found item) with photo, location, and details.
- **US-9.2** As a resident who finds something, I can match it with open lost posts.
- **US-9.3** As either party, I can chat in-app to coordinate handover.

### RWA Notices
- **US-9.4** As an RWA admin, I can post an official notice that is auto-pinned for 24h.
- **US-9.5** As a resident, I can see all past notices in a Notice Board view.
- **US-9.6** As an RWA admin, I can mark a notice as "Action required" and track read confirmations.

### Polls
- **US-9.7** As a resident or admin, I can create a poll with 2–6 options.
- **US-9.8** As a resident, I can vote anonymously or visibly (creator's choice).
- **US-9.9** As a resident, I see live results in a bar chart that updates in real time.

---

## 3. UX flows

### 3.1 Lost & Found

```
+ → Lost / Found → "What did you lose/find?" → Category (Wallet · Keys · Phone · Pet · Document · Bag · Other)
→ Photos → Location pin + when → Description → Post
Card shows in feed + "Lost & Found" board (Feed filter chip)
```

### 3.2 RWA Notice

```
RWA admin → "Post Notice" → Title + body + attachments (optional) →
Mark "Action required" toggle → Expiry (default 24h pin, up to 7d) →
Post → Auto-pinned to entire society feed
```

### 3.3 Polls

```
+ → Poll → Question → Options (min 2, max 6) → Anonymous toggle →
Multi-select toggle → Closes at (default 7 days) → Post
Vote: tap option → see live bar chart instantly
```

---

## 4. Functional requirements

### Lost & Found
- **FR-9.1** Sub-type: `lost` or `found`.
- **FR-9.2** High-severity categories (Pet, Child, Phone) auto-pinned 6h.
- **FR-9.3** Lost/Found posts auto-resolved after 14 days unless author marks `recovered`.
- **FR-9.4** Marking `recovered` prompts a thank-you to the helper (optional).
- **FR-9.5** A simple text-similarity match suggests potential matches between lost and found posts in the same society.

### RWA Notices
- **FR-9.6** Only users with role `rwa_admin` can post notices.
- **FR-9.7** Notice fields: title (≤120 chars), body (≤5000 chars), attachments (≤5 PDFs, ≤10MB each), `action_required` flag, `expires_at` (max 30 days).
- **FR-9.8** Pinned for `pin_duration_hours` (default 24h, configurable per-notice up to 168h).
- **FR-9.9** "Action required" notices show a "Mark read" button; admin sees a count of confirmations.
- **FR-9.10** Notice Board view: searchable archive of all society notices (last 365 days).

### Polls
- **FR-9.11** Poll question ≤ 200 chars; options ≤ 80 chars each.
- **FR-9.12** Poll types: single-select, multi-select (max selectable configurable).
- **FR-9.13** Anonymity: if `anonymous=true`, individual votes hidden; only counts shown.
- **FR-9.14** Voters: only Silver+ residents in scope (society/tower).
- **FR-9.15** Live results via Ably channel `poll:{id}`.
- **FR-9.16** Closes at `closes_at`; voting blocked after.
- **FR-9.17** Poll creator can `extend` or `close_early` (admins only can override on others' polls within their society).
- **FR-9.18** Special "binding poll" type (RWA-admin only): results saved as official society decision, downloadable as PDF.

---

## 5. Data model

```
# Lost & Found extends posts (type='lost')
lost_found_meta
  post_id (PK), kind ('lost'|'found')
  item_category, lost_at, lat, lng
  status ('open'|'recovered'|'expired')
  recovered_helper_user_id (nullable)

# RWA notices extend posts (type='rwa_notice')
rwa_notices_meta
  post_id (PK), action_required (bool)
  pin_until, expires_at
  attachments[] (file refs)

notice_reads
  notice_id, user_id, read_at

# Polls extend posts (type='poll')
polls
  id (=post_id), question, allow_multi (bool), max_selectable, anonymous (bool)
  scope ('society'|'tower')
  starts_at, closes_at
  is_binding (bool)
  status ('open'|'closed')

poll_options
  id, poll_id, label, order_index

poll_votes
  poll_id, option_id, user_id
  voted_at
  -- unique (poll_id, user_id, option_id) for multi-select
  -- unique (poll_id, user_id) for single-select
```

---

## 6. APIs

```
# Lost & Found
POST  /v1/posts        (type='lost' or 'found' with meta)
PATCH /v1/lost-found/:post_id/recovered  { helper_user_id? }
GET   /v1/lost-found?society_id=&kind=

# RWA notices
POST  /v1/notices                  { title, body, attachments[], action_required, pin_hours }
GET   /v1/notices?society_id=&page
POST  /v1/notices/:id/read
GET   /v1/notices/:id/read-stats   (admin only)

# Polls
POST  /v1/polls                    { question, options[], allow_multi, anonymous, scope, closes_at, is_binding }
GET   /v1/polls/:id                → with live tallies
POST  /v1/polls/:id/vote           { option_ids[] }
POST  /v1/polls/:id/close          (creator/admin)
POST  /v1/polls/:id/extend         { new_closes_at }
GET   /v1/polls/:id/export.pdf     (binding polls only)
```

---

## 7. Edge cases

- **EC-9.1** Lost-and-found auto-resolve after 14 days even if author silent.
- **EC-9.2** Pet category mistakenly tagged "Wallet" → editable within 15 min like any post.
- **EC-9.3** Notice author removed from RWA admins → notice remains; future actions disabled.
- **EC-9.4** Notice attachment is malicious PDF → ClamAV scan at upload; reject + alert.
- **EC-9.5** Two RWA admins post conflicting notices → both visible; community can comment.
- **EC-9.6** Poll vote after `closes_at` (clock drift) → server-time authoritative; reject.
- **EC-9.7** Poll creator deletes account → poll preserved; ownership transfers to RWA admin.
- **EC-9.8** Binding poll with < 30% turnout → flagged as "low turnout" in export; not invalidated.
- **EC-9.9** Anonymous poll: ensure tally counter increments without exposing user_id in API response.

---

## 8. Metrics

| Metric | Target |
|---|---|
| Lost items recovered (self-reported) | ≥ 45% |
| Notices / active society / month | ≥ 6 |
| % Action-required notices acknowledged | ≥ 80% within 48h |
| Polls / active society / month | ≥ 2 |
| Poll vote turnout | ≥ 35% of eligible residents |
| Binding polls per onboarded RWA | ≥ 1 in first 90 days |

---

## 9. Dependencies

- Feed module 02 (posts table + pinning).
- Moderation module 14 (notice + poll abuse).
- File scanning (ClamAV / Cloudflare Files-scan).
- Society admin role assignment (module 14).
- Ably for live poll updates.

---

## 10. Out of scope (v1.0)

- Cross-society polls.
- Ranked-choice / weighted voting.
- Notice version history.
- Multilingual notice translation auto-generation (manual at v1).
- Petitions (deferred to v1.2).
- Lost item insurance integration.
