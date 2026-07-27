# 10 — Community Creation (v2 NEW)

> Any resident can create a micro-community around any shared interest, activity, or need — within their locality radius. No permission needed. No admin gatekeeping. Just neighbors organizing around what matters to them.

---

## 1. Goal

Give every resident the tools to build a micro-community in under 2 minutes — with a dedicated feed, group chat, events, polls, and group buying — while ensuring all communities stay geographically rooted in the locality.

---

## 2. Community Types

| Type | Examples | Who creates |
|---|---|---|
| **Interest / Hobby** | Cycling club, Book club, Bird watchers, Photography | Any resident |
| **Activity / Fitness** | Morning walkers, Yoga group, Cricket team, Swimming group | Any resident |
| **Parenting / School** | Parents of DPS Andheri, School bus group, After-school playgroup | Any resident |
| **Cultural / Festival** | Navratri garba group, Eid celebration, Ganpati committee | Any resident |
| **Buying / Consumer** | Vegetable group, Bulk grocery club, Organic food buyers | Any resident |
| **Professional / WFH** | Work from home network, Startup founders nearby, Freelancers | Any resident |
| **Cause / Civic** | Clean street initiative, Tree planting, Water conservation | Any resident |
| **Pet Owners** | Dog walkers, Pet owners, Cat café | Any resident |
| **Business-linked** | Parent community of XYZ School, Patients of Dr. Sharma Clinic | Business or resident |

---

## 3. User Stories

### Community Creator
- **US-10.1** As a resident, I create a community in 3 taps: name, type, and radius.
- **US-10.2** I write a short description of what the community is about and add a cover photo.
- **US-10.3** I choose who can join: Open (anyone within radius), Invite-only, or Request-to-join.
- **US-10.4** I invite neighbors via a shareable link or QR code visible only within the locality.
- **US-10.5** I post in the community feed, run polls, create events, and start group buys.
- **US-10.6** I assign co-admins to help manage the community.
- **US-10.7** I see who is active and can remove members who violate community rules.

### Community Member
- **US-10.8** As a resident, I discover communities within my radius on the Discover tab.
- **US-10.9** I join an open community in one tap; request membership for invite-only communities.
- **US-10.10** I see the community's feed, which is separate from the main feed.
- **US-10.11** I chat with community members in the community group chat.
- **US-10.12** I vote in community polls, RSVP to community events, and join community group buys.
- **US-10.13** I can leave a community at any time.

### Local Business Community
- **US-10.14** As a school, I create a "Parents of XYZ School" community linked to my business profile.
- **US-10.15** As a clinic, I create a patient community for health tips and appointment reminders.
- **US-10.16** As a gym, I create a members community for workout challenges and batch updates.

---

## 4. UX Flows

### 4.1 Create Community

```
+ → "Create a Community"
  → Step 1 — Basics:
      Community name (≤60 chars)
      Category (Interest / Activity / Parenting / Cultural / Buying / Professional / Cause / Pets / Other)
      Description (≤300 chars — "What is this community about?")
      Cover photo (optional; default: category illustration)

  → Step 2 — Reach:
      Who can join?
        ○ Open — anyone nearby can join instantly
        ○ Request to join — anyone can request, you approve
        ○ Invite only — only via your link/QR
      Radius: 200m / 500m / 1km / 2km
      (community visible to users within this radius in Discover)

  → Step 3 — First post (optional but recommended):
      "Introduce your community — what's the first thing you'll do together?"
      → text + optional photo → Post or Skip

  → Created! Community is live.
  → Share invite: [Copy link] [Show QR] [Share on feed]
```

### 4.2 Community Home Screen

```
Community Page:
  ┌──────────────────────────────────────────┐
  │  [Cover photo]                           │
  │  🚴 Cycling Enthusiasts · 34 members     │
  │  500m · Open · Created by Arjun S.       │
  │                                          │
  │  [Join] or [Joined ✓]                    │
  ├──────────────────────────────────────────┤
  │  Tabs: [Feed] [Chat] [Events] [Buy] [Members] │
  ├──────────────────────────────────────────┤
  │  Feed tab — posts from members only:     │
  │  "Sunday 6am ride — Juhu beach!"         │
  │  "Anyone have a good tire pump?"         │
  │  [Poll: Best time for group rides?]      │
  │  ...                                     │
  └──────────────────────────────────────────┘
```

### 4.3 Join Flow

```
Discover → Communities → tap community card
  Open community: [Join] → immediately added → community feed unlocked
  
  Request-to-join: [Request] → admin gets push → approve/reject
    → On approval: member notified + added
    → On rejection: member notified (no reason required)
  
  Invite-only: only reachable via link/QR from an existing member
    → tap link → same page → [Join via invite] → immediately added
```

### 4.4 Community Feed vs Main Feed

```
Community feed: posts visible ONLY to community members; 
  NOT mixed into the main feed (unless creator sets "also share to neighborhood")

Post in community:
  Community Home → Feed tab → + → Composer opens with community scope locked
  Types: Update, Poll, Event, Group Buy, Lost (within community), Sell (to members)

"Also share to neighborhood": optional per post; community-scoped post
  appears in the main feed too, with a "From: [Community name]" tag
```

### 4.5 Admin Tools

```
Community Settings (admin only):
  → Edit name / description / cover photo
  → Change join policy (Open / Request / Invite-only)
  → Manage members: list + remove
  → Assign co-admins (max 5)
  → Pin a post (max 3)
  → Quiet hours for community chat
  → Archive community (soft-close; no new posts; members can leave)
  → Delete community (irreversible; requires all content removal confirmation)
```

---

## 5. Functional Requirements

### Creation
- **FR-10.1** Any Silver+ user can create a community. No approval needed.
- **FR-10.2** Max active communities a single user can own: 3 (as creator). Can be member of unlimited communities.
- **FR-10.3** Community name: 3–60 chars, unique within locality + category (prevent duplicates).
- **FR-10.4** Community radius binds all members — only users within the radius at signup time can join. Moving out of radius does not auto-remove (to avoid churn).
- **FR-10.5** Business profiles can create communities linked to the business (school → parent community). Business community creation follows same rules; linked business profile shown on community page.

### Membership
- **FR-10.6** Open communities: instant join.
- **FR-10.7** Request-to-join: admin has 48h to respond; auto-reject after 48h if no action (prevents dead communities from blocking requesters).
- **FR-10.8** Invite-only: join link has a 72h expiry; admin can revoke any link.
- **FR-10.9** Member cap: 500 members per community (prevents mega-groups; split encouraged).
- **FR-10.10** Lokul can close a community with > 30 reported posts in 7 days pending moderation review.

### Community Feed
- **FR-10.11** Community feed is separate from main feed; visible only to members.
- **FR-10.12** Post types in community: `update`, `poll`, `event`, `group_buy`, `lost_found`, `sell` (classifieds within community), `announcement` (admin-only, pinned).
- **FR-10.13** "Also share to neighborhood": one-time cross-post to the main feed. Original community-feed post remains.
- **FR-10.14** Community posts do not appear in non-member feeds unless "also share to neighborhood" is selected.
- **FR-10.15** Community admin can pin up to 3 posts. Pinned posts appear at top of community feed.

### Community Chat
- **FR-10.16** Every community gets an auto-created group chat (type `community_group`).
- **FR-10.17** New member added to chat on join; removed from chat on leave/removal.
- **FR-10.18** Chat carries forward community quiet hours setting.
- **FR-10.19** Community chat max 500 members (same as community cap); sharding if > 500 deferred.

### Discovery
- **FR-10.20** Communities visible in Discover → "Communities" section for users within the community's radius.
- **FR-10.21** Community card shows: cover, name, category, member count, join type, distance.
- **FR-10.22** Communities sorted by: proximity + member count + recent activity.
- **FR-10.23** Users see communities they're in at the top of the list.

### Moderation
- **FR-10.24** Community admin can remove any member or post within their community.
- **FR-10.25** Lokul moderators can override community admin actions and remove content / suspend communities.
- **FR-10.26** Disbanding a community with > 50 members requires Lokul review (to prevent sudden loss of community infrastructure).

---

## 6. Data Model

```sql
communities
  id (ULID, PK)
  name, description, cover_photo_url
  category  -- enum
  creator_user_id (FK)
  linked_business_id (FK nullable)
  join_policy ('open'|'request'|'invite_only')
  radius_m
  pin_code, lat, lng
  member_count
  status ('active'|'archived'|'suspended')
  chat_thread_id (FK)
  created_at

community_members
  community_id (FK), user_id (FK)
  role ('member'|'admin'|'creator')
  joined_at
  -- composite PK

community_join_requests
  id, community_id, user_id
  requested_at, decided_at
  decision ('approved'|'rejected'|'pending')
  decided_by (FK nullable)

community_invite_links
  id, community_id, created_by (FK)
  token (unique random)
  expires_at, revoked_at
  uses_count

community_posts
  -- references posts table with scope = community
  -- posts.scope_community_id links to communities.id
  -- "also share to neighborhood" creates a second post row with neighborhood scope

community_pinned_posts
  community_id, post_id, pinned_by, pinned_at
  -- max 3; oldest auto-unpinned on 4th
```

---

## 7. APIs

```
# Create & manage
POST  /v1/communities             { name, category, description, cover_photo, join_policy, radius_m }
GET   /v1/communities             ?radius_m=&category=  → list nearby
GET   /v1/communities/mine        → communities user is member/admin of
GET   /v1/communities/:id
PATCH /v1/communities/:id         (admin only)
DELETE /v1/communities/:id        (creator only; soft-archive)

# Members
POST   /v1/communities/:id/join              → instant (open) or creates request
GET    /v1/communities/:id/members?cursor
DELETE /v1/communities/:id/members/:user_id  (admin: remove member)
POST   /v1/communities/:id/admins            { user_id }
DELETE /v1/communities/:id/admins/:user_id

# Join requests
GET   /v1/communities/:id/requests           (admin)
POST  /v1/communities/:id/requests/:id/decide  { decision: 'approved'|'rejected' }

# Invite links
POST  /v1/communities/:id/invite-links
GET   /v1/communities/:id/invite-links
DELETE /v1/communities/:id/invite-links/:id

# Community feed
GET   /v1/communities/:id/feed?cursor
POST  /v1/communities/:id/posts
      { type, body, media[], also_share_to_neighborhood: bool }
POST  /v1/communities/:id/posts/:id/pin
DELETE /v1/communities/:id/posts/:id/pin

# Join via invite link (public endpoint)
GET   /v1/join/:token             → { community preview }
POST  /v1/join/:token             → joins community
```

---

## 8. Edge Cases

- **EC-10.1** Community name collision in same locality → add number suffix suggestion ("Morning Walkers 2").
- **EC-10.2** Creator leaves community → ownership transferred to oldest admin; if no admin, oldest member.
- **EC-10.3** Community hits 500 members → new join requests queued with "Community full" message; creator notified to create sub-community or increase limit (admin override available).
- **EC-10.4** Invite link shared outside Lokul (WhatsApp forward) → only users within radius can join; others see "This community is for residents within Xm of [area name]."
- **EC-10.5** "Also share to neighborhood" on a sensitive post (safety, health) → same moderation rules apply as main feed posts.
- **EC-10.6** Business creates community but business profile gets suspended → community continues but loses business link; displayed as user community.
- **EC-10.7** Community chat grows to 500 → new members still added; older messages paginated; no auto-split.
- **EC-10.8** Admin abuses power (mass-removing legitimate members) → 5 removal complaints in 24h → admin role flagged for Lokul review.

---

## 9. Metrics

| Metric | Target |
|---|---|
| Communities created / locality (first 90d) | ≥ 8 |
| Avg members / active community | ≥ 25 |
| Community posts / active community / week | ≥ 5 |
| Community chat messages / member / day | ≥ 3 |
| Members who are in ≥ 2 communities | ≥ 30% |
| Community join rate from Discover | ≥ 20% of viewers |
| Community 30-day retention | ≥ 60% |

---

## 10. Dependencies

- Module 01 (Silver KYC to create)
- Module 02 (community posts cross-post to main feed)
- Module 04 (community group chat)
- Module 06 (business-linked communities)
- Module 11 (group buying within a community)
- Module 12 (event notifications, new post notifications to members)
- Module 18 (moderation of community content)

---

## 11. Out of Scope (v2.0)

- Cross-locality communities (city-wide groups)
- Paid / subscription communities
- Community-level wallet (shared fund)
- Community brand page (separate from creator's profile)
- Community leaderboards
- Community-specific marketplace (use classifieds with community scope for v2.0)
- Public communities visible to non-locality users
- Community merging
