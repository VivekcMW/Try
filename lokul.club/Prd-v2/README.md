# Lokul Mobile App — PRD v2.0

> **Version:** 2.0  
> **Date:** 27 May 2026  
> **Status:** Active Draft — replaces Prd v1.0  
> **Core shift:** From RWA-centric society app → **Peer economy platform for micro-localities**

---

## The One-Line Thesis (v2)

> Every Indian neighborhood has a rich, informal economy — home cooks, local shops, peer coaches, neighbor riders, street-level communities. Lokul is the platform that makes all of it discoverable, transactable, and trusted within **200 meters of where you live.**

---

## What Changed from v1

| v1 Assumption | v2 Reality |
|---|---|
| RWA admin is the primary organizer | **Anyone** is an organizer |
| Merchant = formal verified business | **Anyone** can be a cook, rider, coach, reseller |
| Society = organizing unit | **200m radius** = organizing unit |
| Local business = out of scope | **Kirana, salon, clinic, school = first-class citizens** |
| Community = society/tower group | **Anyone creates any micro-community** |
| Feed = society notice board | **Feed = live neighborhood economy + community** |

---

## Module Index

| # | File | Module | Type | Status |
|---|---|---|---|---|
| 00 | [00-overview.md](./00-overview.md) | Vision, personas, KPIs, tech stack | Full rewrite | ✅ |
| 01 | [01-onboarding-identity.md](./01-onboarding-identity.md) | OTP login, KYC, locality + role selection | Revised | ✅ |
| 02 | [02-home-feed-radius.md](./02-home-feed-radius.md) | Feed, radius control, post types, business posts | Revised | ✅ |
| 03 | [03-safety-sos.md](./03-safety-sos.md) | Safety alerts, SOS broadcast | From v1 + minor updates | ✅ |
| 04 | [04-chat-calls.md](./04-chat-calls.md) | DMs, group chat, voice/video calls | From v1 + minor updates | ✅ |
| 05 | [05-peer-roles.md](./05-peer-roles.md) | Cook, Rider, Coach, Reseller peer gig roles | **NEW** | ✅ |
| 06 | [06-local-business-hub.md](./06-local-business-hub.md) | Kirana, salon, clinic, school business profiles | **NEW** | ✅ |
| 07 | [07-marketplace-booking.md](./07-marketplace-booking.md) | Unified marketplace (peer + business) | Revised | ✅ |
| 08 | [08-payments-wallet.md](./08-payments-wallet.md) | Wallet, UPI, escrow, payouts | From v1 + minor updates | ✅ |
| 09 | [09-classifieds-buy-sell.md](./09-classifieds-buy-sell.md) | Buy/sell classifieds | From v1 + minor updates | ✅ |
| 10 | [10-community-creation.md](./10-community-creation.md) | Anyone creates micro-communities | **NEW** | ✅ |
| 11 | [11-group-buying.md](./11-group-buying.md) | Community pool orders, group deals | **NEW** | ✅ |
| 12 | [12-events-stories.md](./12-events-stories.md) | Events, RSVP, 24h Stories | From v1 + minor updates | ✅ |
| 13 | [13-lost-found-polls-notices.md](./13-lost-found-polls-notices.md) | Lost & Found, notices, polls | From v1 + minor updates | ✅ |
| 14 | [14-map-discovery-carpool.md](./14-map-discovery-carpool.md) | Live map, discovery, carpool | From v1 + minor updates | ✅ |
| 15 | [15-society-ops.md](./15-society-ops.md) | Visitor mgmt, staff attendance | From v1 + minor updates | ✅ |
| 16 | [16-notifications-digest.md](./16-notifications-digest.md) | Push, inbox, AI digest | From v1 + minor updates | ✅ |
| 17 | [17-profile-multirole-trust.md](./17-profile-multirole-trust.md) | Multi-role profile, trust score, settings | Revised | ✅ |
| 18 | [18-moderation-admin.md](./18-moderation-admin.md) | Moderation, admin panel | From v1 + minor updates | ✅ |
| 19 | [19-web-companion.md](./19-web-companion.md) | Web app companion | From v1 + minor updates | ✅ |
| 20 | [20-launch-plan-kpis-risks.md](./20-launch-plan-kpis-risks.md) | Phased rollout, KPIs, risks | Revised | ✅ |

---

## Conventions (same as v1)

- **MUST / SHOULD / MAY** follow RFC-2119 semantics
- **FR-X.Y** = Functional Requirement (module.number)
- **US-X.Y** = User Story
- **EC-X.Y** = Edge Case
- All currency in **INR (₹)**, stored in paise
- All times **IST**, all IDs **ULIDs**
- **@USER** = authenticated user · **@BIZ** = business account · **@MOD** = Lokul moderator

---

## Change Log

| Date | Version | Change | Author |
|---|---|---|---|
| 27 May 2026 | 2.0 | Full PRD rewrite — peer economy vision, local business hub, peer roles, community creation, group buying | PM |
