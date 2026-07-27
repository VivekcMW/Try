# Lokul Mobile App — Product Requirements Documents (PRD)

> **Version:** v1.0 (First Launch)
> **Last updated:** 27 May 2026
> **Owner:** Product · Lokul
> **Status:** Draft → Engineering review pending

---

## What is this folder?

This folder contains the **end-to-end PRD set** for Lokul Mobile App v1.0.
The PRD is split into one **master overview** and **per-module specs** so engineering, design, and QA can work on modules in parallel without context loss.

---

## File index

| # | File | Module | Owner |
|---|---|---|---|
| 00 | [00-overview.md](./00-overview.md) | Vision, personas, KPIs, tech stack, release plan | PM |
| 01 | [01-onboarding-identity.md](./01-onboarding-identity.md) | OTP login, KYC, locality verification | PM + Auth team |
| 02 | [02-home-feed.md](./02-home-feed.md) | Feed, post composer, reactions, comments | PM + Feed team |
| 03 | [03-safety-sos.md](./03-safety-sos.md) | Safety alerts + SOS broadcast | PM + Safety squad |
| 04 | [04-chat-calls.md](./04-chat-calls.md) | 1-1 chat, group chat, voice & video calls | PM + Realtime team |
| 05 | [05-marketplace-services-booking.md](./05-marketplace-services-booking.md) | Verified merchants, services, booking + scheduling | PM + Marketplace team |
| 06 | [06-payments-wallet.md](./06-payments-wallet.md) | In-app wallet, UPI, escrow, refunds | PM + Payments team |
| 07 | [07-classifieds.md](./07-classifieds.md) | Buy/Sell classifieds | PM + Marketplace team |
| 08 | [08-events-stories.md](./08-events-stories.md) | Events, RSVP, Stories/Status | PM + Feed team |
| 09 | [09-lost-rwa-polls.md](./09-lost-rwa-polls.md) | Lost & Found, RWA notices, Polls | PM + Community team |
| 10 | [10-map-discovery-carpool.md](./10-map-discovery-carpool.md) | Live map, discovery, carpool matching | PM + Maps team |
| 11 | [11-society-ops.md](./11-society-ops.md) | Visitor mgmt / e-passes, staff attendance | PM + Society team |
| 12 | [12-notifications-digest.md](./12-notifications-digest.md) | Push notifs, in-app inbox, AI feed digest | PM + ML team |
| 13 | [13-profile-trust-settings.md](./13-profile-trust-settings.md) | Profile, verification badges, trust score, settings | PM + Identity team |
| 14 | [14-moderation-admin.md](./14-moderation-admin.md) | Report queue, RWA admin panel, content moderation | PM + Trust & Safety |
| 15 | [15-web-companion.md](./15-web-companion.md) | Web companion app | PM + Web team |
| 16 | [16-launch-plan-kpis-risks.md](./16-launch-plan-kpis-risks.md) | Phased rollout, KPIs, risk register, DPDPA compliance | PM + Legal |

---

## How to read

1. **Start with `00-overview.md`** for context, personas, success metrics, and how modules fit together.
2. **Open any module file** — each follows the same template:
   - `Goal` → `User Stories` → `UX Flows` → `Functional Requirements (FR)` → `Data Model` → `APIs` → `Edge Cases` → `Metrics` → `Dependencies` → `Out of Scope`
3. **`16-launch-plan-kpis-risks.md`** locks the rollout phases, KPIs and compliance.

---

## Conventions

- **MUST / SHOULD / MAY** follow RFC-2119 semantics.
- **FR-X.Y** = Functional Requirement, where X = module number, Y = requirement number.
- **`@USER`** = an authenticated end user; **`@ADMIN`** = RWA admin; **`@MOD`** = Lokul trust & safety moderator; **`@MERCHANT`** = verified merchant.
- **Distance / radius** uses metres unless otherwise stated.
- All times in **IST**.
- All currency in **INR (₹)**.
- All identifiers are **ULIDs** unless legacy.

---

## Change log

| Date | Version | Change | Author |
|---|---|---|---|
| 27 May 2026 | 0.1 | Initial draft of PRD set | PM |
