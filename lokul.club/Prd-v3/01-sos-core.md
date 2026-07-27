# Phase 3 — Feature 01 — SOS Core (MVP)

> **Status:** Draft v1 · **Owner:** TBD · **Target:** Phase 3 first release
>
> **Source priority:** [`neighbourhood-safety-features.md`](./neighbourhood-safety-features.md) — Priority items 1 & 2:
> *"SOS + auto-record + auto-upload"* and *"Trusted contact circle + live location"*.
>
> This PRD is **scoped to ship** — it intentionally excludes everything not on the critical safety path (no fall-detection, no IoT, no mesh BLE, no smart-doorbell, no fake-call). Those are subsequent PRDs.

---

## 1. Problem statement

Lokul has admin and mobile *scaffolding* for SOS — `/admin/safety`, `/admin/safety-contacts`, `/admin/incidents`, `/admin/volunteers`, mobile `(safety)/hub`, `(safety)/sos-active`, `safetyStore`, `incidentStore`, and four `/api/mobile/sos/*` routes — but **no end-to-end SOS flow that a user could actually trust in an emergency**. The trigger UI, evidence capture, contact fan-out, and admin response loop are individually stubbed but not wired together with the latency, durability, and audit guarantees an emergency feature requires.

## 2. Goal

A resident can press a single button (or trigger a configured gesture), and within **5 seconds** their **trusted contacts** are notified with the resident's **live GPS location**, their **device starts recording**, and any uploaded clip is **durably stored server-side** before the device could be destroyed. A locality admin sees the active incident on `/admin/safety` in real time and can mark it resolved.

## 3. Non-goals (this PRD)

- Auto-call to 112/108/police PCR (regulatory + telephony scope — separate PRD).
- Volunteer first-responder dispatch (next PRD; admin/route + mobile screen already stubbed).
- Fall / cardiac detection.
- Offline SMS fallback.
- Child geofence, women's journey-miss escalation (extend later).
- Mesh / BLE / IoT.

## 4. Success metrics

| Metric | Target |
|---|---|
| Trigger → contact push delivered (P95) | ≤ 5 s |
| Trigger → first video segment in object storage (P95) | ≤ 15 s |
| Server-side persistence before client deletion possible | 100 % (no client-only state) |
| False-positive cancel rate (within 10 s grace) | < 30 % of triggers (UX metric, not a blocker) |
| Admin sees active incident in `/admin/safety` (P95 latency) | ≤ 3 s after trigger |

## 5. Existing surface (don't rebuild)

| Layer | Module | Status | Action |
|---|---|---|---|
| API | [src/app/api/mobile/sos/route.ts](../src/app/api/mobile/sos/route.ts) | exists | extend payload (see §7) |
| API | [src/app/api/mobile/sos/[id]/route.ts](../src/app/api/mobile/sos/[id]/route.ts) | exists | add `PATCH` for status, `GET` for poll |
| API | [src/app/api/mobile/sos/[id]/escalate/route.ts](../src/app/api/mobile/sos/[id]/escalate/route.ts) | exists | reused later (volunteers PRD) |
| API | [src/app/api/mobile/sos/escalate-batch/route.ts](../src/app/api/mobile/sos/escalate-batch/route.ts) | exists | cron, reused |
| Mobile screen | `apps/mobile/src/app/(tabs)/safety.tsx` | exists | adds Big Red Button |
| Mobile screen | `apps/mobile/src/app/(safety)/sos-active.tsx` | exists | wire to new state machine (§8) |
| Mobile screen | `apps/mobile/src/app/(safety)/contacts.tsx` | exists | finish CRUD, push to API |
| Mobile screen | `apps/mobile/src/app/(safety)/evidence.tsx` | exists | wire to upload pipeline (§9) |
| Mobile store | `apps/mobile/src/store/safetyStore.ts` | exists | extend with `activeIncidentId`, `phase` |
| Mobile lib | `apps/mobile/src/lib/locationTracker.ts` | exists | call `forceFlush()` on trigger |
| Admin page | `/admin/safety` | exists | add "Active incidents" panel with realtime |
| Admin page | `/admin/safety-contacts` | exists | no change |
| Admin page | `/admin/incidents` | exists | link from SOS detail |

## 6. User stories

1. **As a resident**, I tap the SOS button on the Safety tab; a 5-second countdown begins with a loud cancel button; if I don't cancel, all my trusted contacts receive a push with my live location link, and my phone starts recording video.
2. **As a trusted contact** (in-app), I receive a high-priority push notification with the resident's name, their last known location on a map, and a link to view the live location until they mark themselves safe.
3. **As a trusted contact without the app**, I receive an SMS with a tokenised public URL showing the live location (no Lokul account required to view).
4. **As a locality admin**, I see active SOS incidents at the top of `/admin/safety` with name, locality, started-at, current location, and a "Resolve / mark false alarm" action.
5. **As a resident who triggered by mistake**, I tap "I'm safe" in the active-SOS screen; contacts receive a follow-up "Safe" push; the incident is closed in admin with reason `false_alarm`.

## 7. Data model (Prisma — additions only)

> All names match the existing `prisma/schema.prisma` convention (`camelCase` fields, `PascalCase` models).

```prisma
model SosIncident {
  id            String      @id @default(cuid())
  userId        String
  user          User        @relation(fields: [userId], references: [id])
  societyId     String?
  startedAt     DateTime    @default(now())
  resolvedAt    DateTime?
  status        SosStatus   @default(active)        // active | resolved | false_alarm | timed_out
  resolveReason String?                              // free text from resolver
  startLat      Float
  startLng      Float
  startAccuracy Float?                               // metres
  shareToken    String      @unique                  // public read-only token for SMS recipients
  evidence      SosEvidence[]
  fanouts       SosFanout[]
  pings         SosLocationPing[]

  @@index([userId, startedAt])
  @@index([status, startedAt])
}

enum SosStatus { active resolved false_alarm timed_out }

model SosLocationPing {
  id          String      @id @default(cuid())
  incidentId  String
  incident    SosIncident @relation(fields: [incidentId], references: [id], onDelete: Cascade)
  lat         Float
  lng         Float
  accuracy    Float?
  ts          DateTime    @default(now())
  @@index([incidentId, ts])
}

model SosEvidence {
  id          String      @id @default(cuid())
  incidentId  String
  incident    SosIncident @relation(fields: [incidentId], references: [id], onDelete: Cascade)
  kind        EvidenceKind                          // video_segment | photo | audio
  s3Key       String                                // immutable; bucket lifecycle = retain 90d
  durationMs  Int?
  uploadedAt  DateTime    @default(now())
  @@index([incidentId, uploadedAt])
}

enum EvidenceKind { video_segment photo audio }

model SosFanout {
  id          String      @id @default(cuid())
  incidentId  String
  incident    SosIncident @relation(fields: [incidentId], references: [id], onDelete: Cascade)
  contactId   String                                 // FK to TrustedContact
  channel     FanoutChannel                          // push | sms
  sentAt      DateTime?
  deliveredAt DateTime?
  failedAt    DateTime?
  failureCode String?
  @@index([incidentId, channel])
}

enum FanoutChannel { push sms }

// TrustedContact already exists in the safety-contacts surface — only add
// a `pushToken` denormalised cache + an `isAppUser` flag if missing.
```

## 8. API contract (new + extensions)

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/mobile/sos` | Create incident. Body: `{ lat, lng, accuracy }`. Returns `{ id, shareToken }`. Side-effects: insert `SosIncident`, snapshot trusted-contact list, enqueue fanout jobs (push + sms), broadcast via Ably channel `sos.<societyId>`. **MUST return in < 800 ms.** |
| POST | `/api/mobile/sos/[id]/pings` | Body: `{ pings: [{ lat, lng, accuracy, ts }] }`. Batched, accepts up to 60 pings per call. |
| PATCH | `/api/mobile/sos/[id]` | Body: `{ status: 'resolved' \| 'false_alarm', reason? }`. Auth: incident owner OR admin. Triggers "safe" fanout if resident-initiated. |
| GET | `/api/mobile/sos/[id]` | Returns incident + latest 50 pings (gated by owner / admin / valid shareToken). |
| POST | `/api/mobile/sos/[id]/evidence` | Returns S3 presigned PUT URL. Body: `{ kind, contentType, durationMs? }`. **Multipart not required** — client uploads 5-second video segments individually. |
| GET | `/sos/share/[token]` | Public web route (no auth). Shows live map; polls `/api/sos/share/[token]/pings` every 5 s. No Lokul account required. |

**Realtime:** Ably channel `sos.society.<societyId>` carries `{ type: 'incident.created' \| 'incident.updated' \| 'ping', payload }`. Admin page subscribes. **Fallback:** admin page also polls every 10 s — Ably is an enhancement, not a dependency.

**Rate limits:** POST `/api/mobile/sos` — 5 per user per hour (sane-default abuse cap; resident can always cancel).

## 9. Evidence upload pipeline

1. On trigger, client starts recording with `expo-camera` in **5-second segments**.
2. After each segment, client calls `POST /api/mobile/sos/[id]/evidence` → receives presigned S3 PUT URL.
3. Client `PUT`s directly to S3. On success, client calls back `POST /api/mobile/sos/[id]/evidence/confirm` with the S3 key (server inserts `SosEvidence` row).
4. **Bucket policy:** `s3:DeleteObject` is denied to the application IAM role; segments are write-once. 90-day lifecycle rule.
5. On `incident.status = resolved` or `false_alarm`, **client stops recording** but already-uploaded segments are retained.

## 10. Mobile UX state machine

```
   IDLE
    │  press SOS
    ▼
ARMED ──── cancel ───▶ IDLE
    │  5s elapse
    ▼
ACTIVE  (recording, pinging GPS every 5s, contacts notified)
    │  tap "I'm safe"
    ▼
RESOLVED ──▶ summary screen
```

- `safetyStore` gains: `phase: 'idle' | 'armed' | 'active' | 'resolved'`, `activeIncidentId: string | null`, `armCountdownStartedAt: number | null`.
- The armed countdown UI must be **dismissable with one tap** in a >= 88 pt hit target (false-positive recovery is a first-class concern).

## 11. Admin UX

`/admin/safety` gets a new section **"Active SOS incidents"** at the top, above the existing content. Each row: avatar · name · started X min ago · current location chip · "View on map" link · "Resolve" button (opens confirm modal asking for `resolveReason`). Empty state: "No active incidents — neighbourhood is calm." (matches existing `EmptyState` component.)

Detail drilldown lives on a new route `/admin/safety/incidents/[id]` that shows map with ping trail, evidence thumbnail list (clicking a row opens an S3-presigned GET in a new tab), fanout delivery table, and timeline.

## 12. Acceptance criteria (testable)

- [ ] `POST /api/mobile/sos` creates an `SosIncident` row, snapshots ≥ 0 contacts, enqueues N fanout jobs, returns in < 800 ms (verified by a load test asserting P95).
- [ ] After `POST /api/mobile/sos`, a subsequent `GET /api/mobile/sos/[id]` from the owner returns the incident; `GET /sos/share/[token]` returns the incident with **only** name + locality + latest 5 pings (no other PII).
- [ ] `PATCH /api/mobile/sos/[id]` with `status: 'resolved'` flips the row, sets `resolvedAt`, and broadcasts an Ably `incident.updated` event.
- [ ] Evidence upload: presigned-PUT works against `MinIO` in the dev compose stack; `s3:DeleteObject` from the app IAM role is forbidden (negative test).
- [ ] Mobile: pressing SOS, NOT cancelling within 5 s, then immediately tapping "I'm safe" produces exactly one `incident.created` and one `incident.updated` event (no duplicates).
- [ ] Admin: with one active incident in DB, `/admin/safety` shows it within 3 s of page open (polling fallback) and updates without reload when the resident marks safe (Ably).
- [ ] Playwright e2e in `E2E_TEST=1` mode covers: create incident → fetch by owner → resolve → list shows it as resolved. (Uses an in-memory store analogous to `e2e-escrow.ts`.)
- [ ] Mobile jest tests cover the `safetyStore` phase transitions: `idle → armed → idle` (cancel), `idle → armed → active → resolved`, and the constraint that `activeIncidentId` is non-null iff `phase ∈ {active}`.

## 13. Threats & mitigations

| Threat | Mitigation |
|---|---|
| Aggressor seizes phone, deletes app data | Evidence streamed to S3 in 5 s segments; bucket forbids `DeleteObject` from app role; client-side state is irrelevant to incident persistence. |
| Adversary triggers SOS on someone else's account | Rate limit 5/hour; mobile trigger requires unlocked device; suspicious cluster (≥ 3 in 10 min from same IP) → admin moderation queue. |
| Contact phone number is wrong → SMS leaks location to stranger | `shareToken` is 32-byte random, single-incident, auto-expires 24 h after `resolvedAt`. Public share page shows only first name + locality, not full PII. |
| Battery dies mid-incident | Server marks incident `timed_out` if no ping for 10 min while `status='active'`; fanout sends a "device went silent" follow-up push to contacts. |
| Spam-trigger to harass contacts | After 3 `false_alarm` resolutions in 24 h, contact fanout is throttled (still recorded server-side, but push/SMS suppressed) and the user is flagged in `/admin/moderation`. |

## 14. Rollout

1. **Week 1:** Prisma migration, API routes, in-memory E2E shim, Playwright tests, admin "Active incidents" panel.
2. **Week 2:** Mobile state machine, recording pipeline, evidence upload, share page.
3. **Week 3:** Closed beta to lokul.club team (10 users), tune fanout latency, ship to a single pilot society.
4. **Gate to GA:** P95 trigger→push ≤ 5 s for 100 consecutive triggers on real devices; zero data-loss incidents in beta.

## 15. Open questions

- **Telephony provider for SMS fanout** — Twilio (works internationally, costs ₹0.50/SMS) vs. Gupshup (India-only, cheaper)? Recommendation: Gupshup for India SMS, Twilio for international fallback. Decision needed before week 2.
- **Public share page hosting** — same Next.js app on `lokul.club/sos/share/[token]` (simpler, hits same server) vs. a separate subdomain (better isolation if compromised). Recommendation: same app, hardened route — separate subdomain is over-engineering for v1.
- **Video segment length** — 5 s vs. 10 s. 5 s = more durable but more S3 PUTs; 10 s = fewer puts but a lost segment loses more. Recommendation: ship 5 s, measure, tune.

---

*Next PRDs in the Phase 3 safety series:* volunteer first-responder dispatch · offline SMS-SOS · women's journey guardian extension · fall/cardiac detection · child geofence.
