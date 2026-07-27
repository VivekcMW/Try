# 04 — Chat & Calls

> 1-1 chat, group chat (society / tower / topic), voice & video calls — all in-app, end-to-end where possible.

---

## 1. Goal

Replace the resident's WhatsApp society group **and** their 1-1 messaging for neighbors, with a chat that is **searchable**, **moderated**, and **tied to verified identity**.

---

## 2. User stories

- **US-4.1** As a resident, I'm auto-added to my society group on KYC Silver.
- **US-4.2** As a tower 5 resident, I'm auto-added to my "Tower 5" group.
- **US-4.3** As a resident, I can join interest groups (Pets, Cycling, Parents) in my society.
- **US-4.4** As a resident, I can DM any other resident from a post / profile.
- **US-4.5** As a resident, I can voice-call any neighbor in my society.
- **US-4.6** As a resident, I can video-call any neighbor I've chatted with.
- **US-4.7** As an admin, I can mute the group during noisy hours (22:00–07:00 default).
- **US-4.8** As a resident, I can search across all my chats.
- **US-4.9** As a resident, I get read receipts (toggleable).

---

## 3. UX flows

### 3.1 Chat list

```
Tab "Chats" (accessed from Navbar inbox)
- Sections: Pinned · Society/Tower groups · Topic groups · DMs · Requests
- Each row: avatar, name, last message, unread badge, timestamp
- Long-press: mute, archive, pin
```

### 3.2 Chat thread

```
- Top bar: avatar + name + presence (online/last seen)
- Message bubbles: text, image, file, voice note, location, contact card
- Composer: text, attach (camera/gallery/file/location/contact), voice note hold-to-record
- Reactions: tap message → emoji bar
- Reply / forward / copy / delete on long-press
```

### 3.3 Group group settings

```
Group avatar → Settings
- Description, members list, admins
- Quiet hours toggle (22:00–07:00)
- Message permissions (Everyone / Admins only)
- Pin message
- Leave group
```

### 3.4 Call flow

```
Profile → Call button → Voice/Video picker → Ringing →
In-call UI (mute, speaker, video on/off, end)
- Background fallback: notification ribbon
- Incoming call: full-screen on lock; CallKit (iOS) / ConnectionService (Android)
```

---

## 4. Functional requirements

### Chats & groups
- **FR-4.1** On Silver verification, user MUST be auto-added to: society main group, their tower group, and one default "Welcome" group.
- **FR-4.2** Group types: `society_main`, `tower`, `topic`, `dm`.
- **FR-4.3** Society main group: max **5,000 members**; sharded automatically if larger.
- **FR-4.4** Tower group: max **500 members**.
- **FR-4.5** Topic group: 3–500 members, created by any Silver+ user; subject to admin approval if `auto_approve=false`.
- **FR-4.6** DM: 1-1 only; requires either same-society or one shared post-comment thread to initiate.
- **FR-4.7** Messages: text (≤4000 chars), images (≤6, ≤5MB each), file (≤20MB pdf/doc), voice note (≤2 min), location, contact, link preview.
- **FR-4.8** Forwarding limit: 5 chats per forward action (anti-spam).
- **FR-4.9** Quiet hours: when ON, push is silent for non-admins between configured hours.
- **FR-4.10** Read receipts: per-user toggle; double-tick UI (sent → delivered → read).
- **FR-4.11** Typing indicator: per-thread; 5s debounce.
- **FR-4.12** Presence: online / last-seen X min ago / hidden (per privacy setting).
- **FR-4.13** Search: full-text across all chats user is a member of; via Meilisearch index `chat_messages`.
- **FR-4.14** Auto-delete: optional per-thread (off / 24h / 7d / 30d).

### Encryption
- **FR-4.15** DMs use **end-to-end encryption** (Signal Protocol via libsignal); server stores ciphertext only.
- **FR-4.16** Groups use **transport encryption** (TLS) at v1; E2EE for groups deferred.
- **FR-4.17** Media uploaded encrypted-at-rest (R2 server-side encryption); for DMs, client-side AES-GCM before upload.

### Calls
- **FR-4.18** Voice + video calls via **WebRTC** with TURN servers hosted on Cloudflare Calls.
- **FR-4.19** 1-1 calls only at v1 (no group calls).
- **FR-4.20** Voice: Opus 48kHz; Video: VP9/H.264 simulcast, max 720p.
- **FR-4.21** Calls work P2P when both peers on same NAT, else relayed.
- **FR-4.22** Incoming call uses CallKit (iOS) and ConnectionService (Android) so full-screen + native UI.
- **FR-4.23** Call records logged: started_at, duration, type, end_reason. Content NOT recorded.
- **FR-4.24** Eligibility: call requires either society membership OR existing DM thread.
- **FR-4.25** Calls disabled during quiet hours unless caller is admin.

---

## 5. Data model

```
chat_threads
  id (ULID)
  type ('society_main'|'tower'|'topic'|'dm')
  scope_society_id, scope_tower_id (nullable)
  name, photo_url, description
  quiet_hours_start, quiet_hours_end (nullable)
  permissions ('all'|'admins')
  auto_delete_days (int nullable)
  created_at

chat_members
  thread_id, user_id
  role ('member'|'admin'|'owner')
  joined_at, last_read_at, muted_until

chat_messages
  id, thread_id, sender_id
  body_cipher (bytea for DM E2EE; text for groups)
  type ('text'|'image'|'file'|'voice'|'location'|'contact'|'system')
  reply_to_id (nullable)
  forwarded_from_id (nullable)
  created_at, deleted_at

chat_attachments
  message_id, kind, storage_key, size_bytes, duration_ms

chat_reactions
  message_id, user_id, emoji

chat_receipts
  message_id, user_id, delivered_at, read_at

calls
  id, caller_id, callee_id
  type ('voice'|'video')
  started_at, ended_at
  end_reason ('hangup'|'missed'|'declined'|'failed')
  duration_seconds

call_signaling (ephemeral, Redis)
  channel_id, sdp_offer, ice_candidates...
```

---

## 6. APIs

```
GET    /v1/chats                            → [Thread...] with last message
GET    /v1/chats/:id/messages?cursor
POST   /v1/chats/:id/messages               { body_cipher, type, ... }
DELETE /v1/messages/:id

POST   /v1/chats                            { type, name, members[] }
POST   /v1/chats/:id/members                { user_ids[] }
DELETE /v1/chats/:id/members/:user_id
POST   /v1/chats/:id/read                   { up_to_message_id }
POST   /v1/chats/:id/typing
POST   /v1/messages/:id/reactions           { emoji }
POST   /v1/messages/:id/forward             { thread_ids[] }

GET    /v1/chat/search?q=...                → [{ message_id, thread_id, snippet }]

# Signaling (calls)
POST   /v1/calls/start                      { callee_id, type } → { call_id, ice_servers }
POST   /v1/calls/:id/sdp                    { sdp }
POST   /v1/calls/:id/ice                    { candidate }
POST   /v1/calls/:id/end                    { reason }
GET    /v1/calls/history
```

**Realtime (Ably):**
- `chat:{thread_id}` — messages, typing, receipts, reactions
- `presence:{user_id}` — online/last_seen
- `call:{call_id}` — signaling fallback if WebSocket fails

---

## 7. Edge cases

- **EC-4.1** User changes phone → re-derive Signal identity; warn other party of new key.
- **EC-4.2** Message sent offline → queued locally with `pending` status; sent on reconnect; ordered by client timestamp.
- **EC-4.3** Same user in 3 devices → all receive messages; read receipt sent only once per user (last-device wins).
- **EC-4.4** Society sharded into 2 groups (>5k members) → admin chooses primary; new joins go to lighter shard.
- **EC-4.5** User leaves group then rejoins → does NOT see history before rejoin.
- **EC-4.6** Forwarded message preserves "Forwarded" badge but not sender attribution if forwarded ≥ 3 hops.
- **EC-4.7** Call attempted to muted user → ring suppressed; missed-call notification still logged.
- **EC-4.8** Mid-call network switch (Wi-Fi → 4G) → ICE restart; ≤ 3s reconnection target.
- **EC-4.9** Voice note > 2 min → reject at composer.
- **EC-4.10** DM to a user who blocked you → silent failure (delivered locally only).

---

## 8. Metrics

| Metric | Target |
|---|---|
| Daily message senders / DAU | ≥ 35% |
| Messages / DAU | ≥ 12 |
| Voice notes / DAU | ≥ 0.4 |
| Calls / WAU (voice + video) | ≥ 0.8 |
| Call setup p95 | ≤ 3s |
| Call drop rate | ≤ 3% |
| Search → tap-through rate | ≥ 25% |

---

## 9. Dependencies

- libsignal-client RN binding (E2EE).
- Cloudflare Calls (TURN) — contract + IN region availability.
- Meilisearch index per thread.
- CallKit / ConnectionService entitlements.
- VOIP push (PushKit on iOS; FCM data-only on Android).

---

## 10. Out of scope (v1.0)

- Group voice/video calls.
- Stickers / GIF library.
- Disappearing messages with screenshot detection.
- Live location sharing in chat (separate from SOS).
- Chat backup to cloud (E2EE backup deferred).
- Bots / chat commands.
- Reactions with custom emoji.
