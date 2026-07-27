# 03 — Safety & SOS

> The "why install Lokul" module: real-time safety for your home and street.

---

## 1. Goal

When a resident faces a threat or emergency, the right neighbors are alerted within **15 seconds** and the first responder ETA is **≤ 90 seconds**.

---

## 2. User stories

- **US-3.1** As a resident, I can post a safety alert with one tap from anywhere in the app.
- **US-3.2** As a resident in danger, I can trigger SOS that broadcasts my live location to nearby neighbors + emergency contacts.
- **US-3.3** As a resident, I see live safety incidents pinned to my map.
- **US-3.4** As a neighbor, I get a high-priority push when an SOS is triggered ≤ 500m from me.
- **US-3.5** As a resident, I can mark myself "safe" during an active incident.
- **US-3.6** As a society admin, I see all active safety incidents in my society on one dashboard.
- **US-3.7** As a resident, I can subscribe to BMC / city alerts (waterlogging, traffic, monsoon).

---

## 3. UX flows

### 3.1 Safety alert post

```
+ → Safety → Severity (Info · Caution · Danger) → Category
(Theft · Suspicious person · Fire · Medical · Traffic · Other)
→ Body text + photo (optional) → Location pin (auto, editable)
→ Post → Auto-pinned 6h (Caution) / 24h (Danger)
```

### 3.2 SOS trigger

```
Long-press SOS button (3-tab modal, also accessible from lock screen widget) →
3-2-1 countdown (cancel-able) → SOS Active screen with:
  - Live location streaming
  - Responder list ("3 neighbors on the way")
  - Big "Call 112" button
  - Big "I'm safe" cancel button
- Audio + vibration alarm broadcasts to nearby phones
```

### 3.3 Responder flow

```
Neighbor receives critical push (bypass DND if granted) →
Tap → SOS incident screen with map + ETA →
"I'm coming" button → broadcasts ETA back to victim →
Live walking/driving directions
```

### 3.4 Mark-safe

```
During a Danger-level area incident, residents within blast radius get
"Are you safe?" prompt → tap "I'm safe" → status visible to incident
followers; reduces alert noise
```

---

## 4. Functional requirements

### Safety posts
- **FR-3.1** Severity levels: `info` (no push) · `caution` (push to society) · `danger` (push to neighborhood ≤ 2km).
- **FR-3.2** Categories enum: `theft, suspicious, fire, medical, traffic, infra, animal, other`.
- **FR-3.3** Safety posts MUST attach location (lat/lng + accuracy radius).
- **FR-3.4** A safety post auto-creates a "live incident" if severity = `danger`; auto-resolved after 6h or by author/admin.
- **FR-3.5** Bronze users CAN post safety alerts (no Silver gate, but rate-limited 1/hour).

### SOS
- **FR-3.6** Only Gold users can broadcast SOS (verified identity to prevent abuse).
- **FR-3.7** SOS triggers via: in-app long-press, lock-screen widget (iOS 16+, Android 12+), power-button triple-press (Android shortcut intent).
- **FR-3.8** 3-second cancellable countdown; cancel within 3s leaves no record.
- **FR-3.9** SOS broadcast scope: all Silver+ users within 500m (configurable up to 2km).
- **FR-3.10** SOS push MUST use FCM `priority=high` + `android_channel_id=sos` (DND bypass when granted).
- **FR-3.11** Live location streamed every 5s via Ably for up to 30 min.
- **FR-3.12** SOS auto-shares with emergency contacts (configured in profile, max 5) via SMS + WhatsApp.
- **FR-3.13** "I'm safe" cancel terminates broadcast + notifies all responders.
- **FR-3.14** Abuse mitigation: 3 false SOS in 30d → Gold→Silver downgrade + 24h cooldown.

### Mark-safe
- **FR-3.15** Mark-safe prompts shown to users in incident radius via Ably channel `incident:{id}`.
- **FR-3.16** Mark-safe responses visible to all incident followers in a simple list/map view.

### City alerts
- **FR-3.17** Pre-defined feeds: BMC, traffic police Twitter (filtered), IMD monsoon alerts (per PIN).
- **FR-3.18** City alerts shown as system posts authored by `@lokul-system` (badged).

---

## 5. Data model

```
safety_posts (extends posts; type='safety')
  severity ('info'|'caution'|'danger')
  category
  lat, lng, accuracy_m
  incident_id (FK incidents, nullable)

incidents
  id (ULID)
  origin_post_id (FK posts)
  origin_user_id
  category, severity
  lat, lng, radius_m
  status ('live'|'resolved'|'false_alarm')
  created_at, resolved_at, resolved_by

sos_events
  id, user_id (FK)
  started_at, ended_at
  end_reason ('safe'|'auto_timeout'|'admin_cancel'|'false_alarm')
  broadcast_radius_m
  responder_count

sos_locations
  sos_id, recorded_at, lat, lng, accuracy_m, battery_pct
  -- time-series; retained 30 days

sos_responders
  sos_id, user_id, status ('coming'|'arrived'|'cancelled')
  eta_seconds, started_at, arrived_at

mark_safe_responses
  incident_id, user_id, response ('safe'|'help_needed')
  responded_at

emergency_contacts
  user_id, name, phone, relationship
  -- max 5 per user
```

---

## 6. APIs

```
POST   /v1/safety/posts                { severity, category, body, lat, lng, media }
GET    /v1/incidents/live?radius=2000  → [Incident...]
POST   /v1/incidents/:id/resolve

POST   /v1/sos/start                   { lat, lng, scope_m }
PATCH  /v1/sos/:id/location            { lat, lng } (called every 5s)
POST   /v1/sos/:id/respond             { eta_seconds }
POST   /v1/sos/:id/end                 { reason }

POST   /v1/incidents/:id/mark-safe     { response }

GET    /v1/me/emergency-contacts
POST   /v1/me/emergency-contacts
DELETE /v1/me/emergency-contacts/:id

GET    /v1/city-alerts?pin=400058
```

**Realtime:**
- `sos:{id}` — location + responder updates
- `incident:{id}` — incident lifecycle + mark-safe responses
- `safety:pin:{pincode}` — new safety posts in PIN

---

## 7. Edge cases

- **EC-3.1** SOS triggered in low/no network → buffer locations on device; flush on reconnect; show "offline" badge to user.
- **EC-3.2** Phone dies during SOS → last known location pinned; broadcast continues 5 min then auto-ends.
- **EC-3.3** SOS triggered accidentally → 3-sec countdown + easy cancel; if missed, "I'm safe" inside 60s = no false-alarm count.
- **EC-3.4** Caller ID mismatch (Aadhaar name vs profile) — block SOS with a "Verify Gold" CTA.
- **EC-3.5** Multiple concurrent SOSes in same building — group them under one incident.
- **EC-3.6** Responder navigating opens external map app — Lokul still tracks "intent to respond" but ETA may drift.
- **EC-3.7** Incident author marks resolved while others still see live — Ably broadcasts state change; UI updates.
- **EC-3.8** False alarm reported by 5 responders → auto-resolve with `false_alarm` flag.

---

## 8. Metrics

| Metric | Target |
|---|---|
| SOS push delivery p95 | ≤ 5s |
| First responder ETA p50 | ≤ 90s |
| % SOS with ≥ 1 responder | ≥ 80% |
| False-alarm rate | ≤ 8% |
| Safety posts / week / society | ≥ 3 |
| Mark-safe response rate | ≥ 40% |

---

## 9. Dependencies

- Gold KYC (module 01) for SOS authorization.
- FCM critical/high-priority push (module 12).
- Ably for live location.
- Ola Maps for ETA + directions.
- Cron for incident auto-resolve.
- Notification channel pre-registration on first run.

---

## 10. Out of scope (v1.0)

- Direct integration with police / 112 dispatch (one-way call only).
- CCTV stream integration.
- Wearable SOS triggers (Apple Watch / Mi Band).
- Voice-activated SOS ("Hey Lokul").
- Public broadcasting (non-resident visibility).
- AI threat detection from CCTV feeds.
