# 11 — Society Operations (Visitor Management & Staff Attendance)

> The MyGate-killer modules: e-passes for visitors and attendance tracking for domestic staff.

---

## 1. Goal

Replace paper registers and 3rd-party gate apps with a built-in flow that residents, gate guards, and RWA admins all share, integrated with the rest of Lokul.

---

## 2. User stories

### Visitor Management
- **US-11.1** As a resident, I can pre-approve a visitor (Swiggy, friend, plumber) and share an e-pass QR code.
- **US-11.2** As a resident, I get a notification when a visitor arrives at the gate; I tap "Allow" / "Deny".
- **US-11.3** As a gate guard, I can scan the QR to verify and log entry.
- **US-11.4** As a guard, for unannounced visitors I can ping the resident with a one-tap call request.
- **US-11.5** As an RWA admin, I see a daily visitor log.

### Staff Attendance
- **US-11.6** As a resident, I can register my maid/cook/driver as a staff and see when they enter/leave my flat.
- **US-11.7** As a staff member, I can punch in/out via the gate guard's terminal OR my own phone (geo-fenced).
- **US-11.8** As a resident, I see a monthly attendance sheet and can mark leaves/payments.
- **US-11.9** As a guard, I see all staff scheduled to enter the society today.

---

## 3. UX flows

### 3.1 Pre-approve visitor

```
+ → Visitor → "Who's coming?" → Name + phone (optional) → Purpose (Guest/Delivery/Service/Other)
→ Date/time window → Share e-pass (via WhatsApp/Lokul chat/QR) → Done
```

### 3.2 Visitor at gate (resident view)

```
Gate scans / types name → Push to resident with photo (if guard captured) → "Allow" or "Deny" / "Call to confirm"
→ If "Allow": pass turns green on guard terminal → entry logged
```

### 3.3 Staff onboarding

```
+ → Staff → "Add staff" → Role (Maid/Cook/Driver/Nanny/Gardener/Security/Other) → Name + photo +
phone + Aadhaar last-4 → Schedule (days, time) → Done → Lokul generates a staff card with QR
```

### 3.4 Punch in/out

```
Guard terminal: scan staff QR → punch IN (or OUT) → resident notified
OR Staff phone: open Lokul → "Punch In" button (greyed unless inside society geofence) → tap
```

---

## 4. Functional requirements

### Visitor management
- **FR-11.1** Entities: `visitor_invites` (pre-approved) and `visitor_visits` (actual arrivals; may exist without invite).
- **FR-11.2** Invite fields: name, phone (optional), purpose, valid_from, valid_until (default 4h), unit_resident (linked to flat).
- **FR-11.3** Invite generates a 12-char alphanumeric `pass_code` + QR; shareable via system share sheet.
- **FR-11.4** Visit lifecycle: `pre_approved → arrived (pending_resident) → allowed → entered → exited`.
- **FR-11.5** Guard terminal is a special "Guard Mode" within the same app (role-gated); requires Gold KYC for security staff.
- **FR-11.6** Walk-in (no invite): guard captures photo + name + purpose → push to resident → resident response within 60s, else escalate to RWA.
- **FR-11.7** Delivery shortcut: known delivery brands (Swiggy/Zomato/Amazon) auto-suggested; can be "auto-allowed" via resident setting (toggleable per brand).
- **FR-11.8** Visit logs retained 180 days, exportable to RWA admin as CSV.
- **FR-11.9** Geofence check: guard punches happen only inside society polygon (server validates).
- **FR-11.10** Frequent visitor: same phone visiting 3+ times in 30d → suggest "Add as recurring" (becomes a permanent pass).

### Staff attendance
- **FR-11.11** Each staff record is linked to one resident as primary employer (may serve multiple flats — multi-employer supported via additional links).
- **FR-11.12** Staff QR is unique and re-issuable.
- **FR-11.13** Punch events: `in` and `out`; mismatched events auto-paired (`in` without matching `out` after 12h → flagged).
- **FR-11.14** Resident view: calendar with present/absent/half-day per day; auto-derived from punches; manual override allowed.
- **FR-11.15** Salary worksheet: monthly summary (days present × per-day rate) − leaves; exportable; integrates with Wallet to pay staff in one tap.
- **FR-11.16** Staff phone-app punch: requires location permission AND inside geofence (radius = society polygon + 50m).
- **FR-11.17** Staff with no phone: punch via guard terminal QR scan only.
- **FR-11.18** Privacy: staff sees their own punch history; resident sees only their staff; RWA sees aggregate (not individual flats) unless dispute.

### Roles for guards
- **FR-11.19** RWA admin assigns "Guard" role to a user (Gold KYC required); guard sees a "Guard Mode" dashboard.
- **FR-11.20** Guard cannot post in feed from Guard Mode (read-only feed).
- **FR-11.21** Guards limited to 5 per society at a time; rotation supported.

---

## 5. Data model

```
visitor_invites
  id, resident_id, society_id, tower_id, flat
  visitor_name, visitor_phone (nullable)
  purpose ('guest'|'delivery'|'service'|'other')
  valid_from, valid_until
  pass_code, qr_image_url
  status ('active'|'used'|'expired'|'revoked')

visitor_visits
  id, society_id, tower_id, flat, resident_id
  invite_id (nullable)
  visitor_name, visitor_phone, visitor_photo_url
  purpose
  arrived_at, decision_at, entered_at, exited_at
  decision ('allowed'|'denied'|'auto_allowed'|'escalated')
  guard_user_id

auto_allow_rules
  resident_id, brand ('swiggy'|'zomato'|'amazon'|'flipkart'|'bluedart'|'custom')
  enabled (bool)

staff
  id, primary_resident_id
  role ('maid'|'cook'|'driver'|'nanny'|'gardener'|'security'|'other')
  name, phone, photo_url, aadhaar_last4
  qr_code
  created_at, archived_at

staff_employments    -- multi-employer link
  staff_id, resident_id, society_id, tower_id, flat
  schedule_json
  per_day_rate_paise, per_month_rate_paise
  active (bool)

staff_punches
  id, staff_id, employment_id
  direction ('in'|'out')
  recorded_at, recorded_lat, recorded_lng
  source ('guard'|'staff_phone'|'manual')
  recorded_by_user_id

staff_attendance_overrides
  staff_id, employment_id, date, status ('present'|'absent'|'half_day'|'leave_paid'|'leave_unpaid')
  set_by_user_id

guard_assignments
  user_id, society_id, role ('guard'|'head_guard')
  shift_start, shift_end, active (bool)
```

---

## 6. APIs

```
# Visitor
POST /v1/visitors/invites             { visitor_name, phone, purpose, valid_until, flat }
GET  /v1/visitors/invites             ?status=
DELETE /v1/visitors/invites/:id       (revoke)

POST /v1/visitors/visits              (guard) { invite_id? | walk_in_meta }
POST /v1/visitors/visits/:id/decision { decision }   (resident)
POST /v1/visitors/visits/:id/enter    (guard)
POST /v1/visitors/visits/:id/exit     (guard)

GET  /v1/me/auto-allow-rules
PATCH /v1/me/auto-allow-rules         { brand, enabled }

# Staff
POST /v1/staff                        { role, name, phone, ... }
GET  /v1/staff
PATCH /v1/staff/:id
DELETE /v1/staff/:id

POST /v1/staff/:id/employments        { resident_id, schedule, rate }
DELETE /v1/staff/:id/employments/:eid

POST /v1/staff/:id/punch              { direction, lat, lng, source }
GET  /v1/staff/:id/punches?from=&to=
GET  /v1/staff/:id/attendance?month=  → calendar matrix
POST /v1/staff/:id/attendance/override { date, status }

POST /v1/staff/:id/salary             { month, override_rate? } → { computed_paise, txn? }
```

---

## 7. Edge cases

- **EC-11.1** Visitor arrives outside invite window → guard treats as walk-in.
- **EC-11.2** Resident offline for visitor approval → escalate to spouse (linked household) or RWA admin after 60s.
- **EC-11.3** Multiple residents at same flat → all get push; first response wins.
- **EC-11.4** Auto-allow brand abused (someone impersonates Swiggy) → guard can override and require resident confirmation.
- **EC-11.5** Staff phone punch outside geofence → rejected with reason; nearest guard terminal suggested.
- **EC-11.6** Staff QR lost → resident re-issues; old QR auto-revoked.
- **EC-11.7** Staff serves 5 flats; same hour they punch in for flat A → flats B-E need their own punches (or shared via "shared session" toggle, default off).
- **EC-11.8** Power outage at gate → guard switches to phone mode; punches synced on reconnect.
- **EC-11.9** Punch in without punch out (forgot) → auto-pair with default 1h shift; resident can correct.
- **EC-11.10** Disputes about hours → punch source + GPS visible in audit log.

---

## 8. Metrics

| Metric | Target |
|---|---|
| Pre-approved visitors / WAU | ≥ 0.6 |
| Walk-in decisions p95 | ≤ 45s |
| % visits auto-allowed | ≥ 40% (after 90d adoption) |
| Active staff records / society | ≥ 30 |
| Staff with both in+out punch | ≥ 92% |
| Staff salary paid via Lokul | ≥ 50% |

---

## 9. Dependencies

- Camera access for visitor photo at gate.
- Geofence per society (lat/lng polygon stored).
- QR generation library.
- Payments module 06 for staff salary.
- Push notifications module 12.
- Guard onboarding & training material.

---

## 10. Out of scope (v1.0)

- Vehicle entry / number-plate OCR.
- Resident vehicle parking management.
- Staff police verification check (manual recommendation only).
- Multi-society staff portability (staff carries record across societies) — basic version supported via multi-employment but not auto-onboarded.
- Biometric (face/finger) punches.
- Children school bus pickup integration.
- Visitor pre-approval bulk import.
