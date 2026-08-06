# 📱 Lokul Home Screen - Detailed Wireframe

## Current Screen: `apps/mobile/src/app/(tabs)/index.tsx`

---

## 🎨 Enhanced Home Feed with Catalog Integration

```
╔═══════════════════════════════════════════════════════════╗
║  🏠 Lokul · HSR Layout, Bangalore            🔔³   ⚙️    ║  ← Header Bar
╠═══════════════════════════════════════════════════════════╣
║                                                            ║
║  ┌──────────────────────────────────────────────────────┐ ║
║  │  📍 You're in HSR Sector 2                    [→]    │ ║  ← Location Banner
║  │  500+ shops & services nearby                       │ ║
║  └──────────────────────────────────────────────────────┘ ║
║                                                            ║
║  ╭─ 📖 STORIES ────────────────────────────────────────╮ ║
║  │ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐              │ ║  ← Stories Row
║  │ │ ⊕  │ │👤  │ │👤  │ │👤  │ │👤  │      →      │ ║     (Existing)
║  │ │Your│ │Amit│ │Priya││Raj │ │Sara│              │ ║
║  │ └────┘ └────┘ └────┘ └────┘ └────┘              │ ║
║  ╰──────────────────────────────────────────────────────╯ ║
║                                                            ║
║  ╭─ 🛍️ SHOP & SERVICES ────────────────────────────────╮ ║
║  │ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐          │ ║  ← NEW: Category
║  │ │  🍕   │ │  💇   │ │  🏥   │ │  🛒   │    →    │ ║     Quick Nav
║  │ │ Food  │ │ Salon │ │Clinic │ │Grocery│          │ ║
║  │ │ 45+   │ │ 12+   │ │  8+   │ │ 23+   │          │ ║
║  │ └───────┘ └───────┘ └───────┘ └───────┘          │ ║
║  ╰──────────────────────────────────────────────────────╯ ║
║                                                            ║
║  ═══════════════════════════════════════════════════════  ║  ← Divider
║                                                            ║
║  ╭─ 📰 COMMUNITY UPDATES ──────────────────────────────╮  ║
║  │                                                      │  ║  ← Existing Social
║  │  ┌────────────────────────────────────────────────┐ │  ║     Feed Posts
║  │  │ 👤 Amit Kumar                         •••      │ │  ║
║  │  │ 2 hours ago · HSR Sector 2                     │ │  ║
║  │  │                                                 │ │  ║
║  │  │ Anyone knows a good electrician? Need for     │ │  ║
║  │  │ urgent repair work.                            │ │  ║
║  │  │                                                 │ │  ║
║  │  │ ┌─────────────────────────────────────────┐   │ │  ║
║  │  │ │ 🛠️ Need an Electrician?                │   │ │  ║
║  │  │ │ ⚡ Anil AC & Electrical                │   │ │  ║  ← NEW: Smart
║  │  │ │ ⭐ 4.8 · 300m · Available now          │   │ │  ║     Suggestion Card
║  │  │ │ 📞 Contact Now              [Book →]   │   │ │  ║
║  │  │ └─────────────────────────────────────────┘   │ │  ║
║  │  │                                                 │ │  ║
║  │  │ ❤️ 12   💬 5   📤 Share                       │ │  ║
║  │  └────────────────────────────────────────────────┘ │  ║
║  │                                                      │  ║
║  ╰──────────────────────────────────────────────────────╯  ║
║                                                            ║
║  ╭─ 🎯 RECOMMENDED FOR YOU ─────────────────────────────╮ ║
║  │  Based on your recent activity                      │ ║  ← NEW: Personalized
║  │                                                      │ ║     Recommendations
║  │  ┌────────────────────────────────────────────────┐ │ ║
║  │  │ ┌──────────┐                                   │ │ ║
║  │  │ │          │  ⭐ Shah Medical Store            │ │ ║
║  │  │ │ [Image]  │  ⭐⭐⭐⭐⭐ 4.8 (240)              │ │ ║
║  │  │ │  500x300 │  📍 500m · HSR Sector 2           │ │ ║
║  │  │ │          │  🎁 10% off on first order        │ │ ║
║  │  │ └──────────┘  💊 Pharmacy · ₹₹                 │ │ ║
║  │  │                                                 │ │ ║
║  │  │              🛒 Quick Order              [→]   │ │ ║
║  │  └────────────────────────────────────────────────┘ │ ║
║  │                                                      │ ║
║  │  ┌────────────────────────────────────────────────┐ │ ║
║  │  │ ┌──────────┐                                   │ │ ║
║  │  │ │          │  ⭐ Kavita's Beauty Studio        │ │ ║
║  │  │ │ [Image]  │  ⭐⭐⭐⭐⭐ 4.9 (156)              │ │ ║
║  │  │ │  500x300 │  📍 1.2 km · HSR Sector 3         │ │ ║
║  │  │ │          │  🔥 50+ bookings this week        │ │ ║
║  │  │ └──────────┘  💇 Beauty Salon · ₹₹₹           │ │ ║
║  │  │                                                 │ │ ║
║  │  │              📅 Book Appointment        [→]   │ │ ║
║  │  └────────────────────────────────────────────────┘ │ ║
║  │                                                      │ ║
║  ╰──────────────────────────────────────────────────────╯ ║
║                                                            ║
║  ═══════════════════════════════════════════════════════  ║
║                                                            ║
║  ╭─ 📰 COMMUNITY POST ──────────────────────────────────╮ ║
║  │                                                      │ ║  ← Social Post
║  │  ┌────────────────────────────────────────────────┐ │ ║
║  │  │ 👤 Priya Sharma                      •••      │ │ ║
║  │  │ 5 hours ago · HSR Layout                       │ │ ║
║  │  │                                                 │ │ ║
║  │  │ Just got my groceries delivered from Venkat   │ │ ║
║  │  │ Grocery! Super fast service 🙌                │ │ ║
║  │  │                                                 │ │ ║
║  │  │ ┌─────────────────┐ ┌─────────────────┐       │ │ ║
║  │  │ │  [Image 1]      │ │  [Image 2]      │       │ │ ║
║  │  │ │   Fresh Veggies │ │   Delivery      │       │ │ ║
║  │  │ └─────────────────┘ └─────────────────┘       │ │ ║
║  │  │                                                 │ │ ║
║  │  │ ❤️ 28   💬 12   📤 Share                      │ │ ║
║  │  └────────────────────────────────────────────────┘ │ ║
║  │                                                      │ ║
║  ╰──────────────────────────────────────────────────────╯ ║
║                                                            ║
║  ╭─ 💰 PROMOTED ────────────────────────────── [AD] ───╮ ║
║  │                                                      │ ║  ← NEW: Promoted Ad
║  │  ┌────────────────────────────────────────────────┐ │ ║
║  │  │ ┌──────────┐                                   │ │ ║
║  │  │ │          │  🎉 Grand Opening!                │ │ ║
║  │  │ │ [Banner] │  ⭐ Deepa's Tiffin Services       │ │ ║
║  │  │ │  500x300 │  🍱 Homemade South Indian tiffin  │ │ ║
║  │  │ │          │  📍 800m · HSR Sector 2           │ │ ║
║  │  │ └──────────┘  🎁 50% OFF on first order!      │ │ ║
║  │  │                                                 │ │ ║
║  │  │              Order Now                  [→]   │ │ ║
║  │  └────────────────────────────────────────────────┘ │ ║
║  │                                                      │ ║
║  ╰──────────────────────────────────────────────────────╯ ║
║                                                            ║
║  ╭─ 🔥 POPULAR NEAR YOU ────────────────────────────────╮ ║
║  │                                                      │ ║  ← NEW: Popular
║  │  ┌────────┐  ┌────────┐  ┌────────┐               │ ║     Carousel
║  │  │[Image] │  │[Image] │  │[Image] │       →       │ ║
║  │  │        │  │        │  │        │               │ ║
║  │  │Anand   │  │RK      │  │Samrat  │               │ ║
║  │  │Tiffins │  │Biriyani│  │Resto   │               │ ║
║  │  │⭐ 4.9  │  │⭐ 4.7  │  │⭐ 4.6  │               │ ║
║  │  │500m    │  │800m    │  │1.2km   │               │ ║
║  │  │₹100    │  │₹250    │  │₹400    │               │ ║
║  │  └────────┘  └────────┘  └────────┘               │ ║
║  │                                                      │ ║
║  ╰──────────────────────────────────────────────────────╯ ║
║                                                            ║
║  ╭─ 📰 SAFETY ALERT ────────────────────────────────────╮ ║
║  │                                                      │ ║  ← Safety Post
║  │  ┌────────────────────────────────────────────────┐ │ ║     (Existing)
║  │  │ 🚨 RWA Committee                     📌 Pinned │ │ ║
║  │  │ 1 day ago · HSR Layout                         │ │ ║
║  │  │                                                 │ │ ║
║  │  │ ⚠️ IMPORTANT: Gate 3 will be closed for       │ │ ║
║  │  │ maintenance tomorrow (Aug 7) from 2-5 PM.     │ │ ║
║  │  │ Please use Gate 1 or Gate 2.                   │ │ ║
║  │  │                                                 │ │ ║
║  │  │ ❤️ 156   💬 23   📤 Share                     │ │ ║
║  │  └────────────────────────────────────────────────┘ │ ║
║  │                                                      │ ║
║  ╰──────────────────────────────────────────────────────╯ ║
║                                                            ║
║  ╭─ 📢 LOCALITY NEWS ────────────────────────────────────╮ ║
║  │                                                      │ ║  ← Locality News
║  │  ┌────────────────────────────────────────────────┐ │ ║     (Existing)
║  │  │ 📰 Bangalore Mirror · 3 hours ago              │ │ ║
║  │  │                                                 │ │ ║
║  │  │ New Metro Station Approved for HSR Layout     │ │ ║
║  │  │                                                 │ │ ║
║  │  │ ┌─────────────────────────────────────────┐   │ │ ║
║  │  │ │      [News Thumbnail Image]             │   │ │ ║
║  │  │ └─────────────────────────────────────────┘   │ │ ║
║  │  │                                                 │ │ ║
║  │  │              Read More                  [→]   │ │ ║
║  │  └────────────────────────────────────────────────┘ │ ║
║  │                                                      │ ║
║  ╰──────────────────────────────────────────────────────╯ ║
║                                                            ║
║  ╭─ 💡 DISCOVER MORE ────────────────────────────────────╮ ║
║  │                                                      │ ║  ← NEW: Explore CTA
║  │  ┌────────────────────────────────────────────────┐ │ ║
║  │  │    🔍 Explore all shops & services near you    │ │ ║
║  │  │                                                 │ │ ║
║  │  │         Browse Catalog              [→]       │ │ ║
║  │  └────────────────────────────────────────────────┘ │ ║
║  │                                                      │ ║
║  ╰──────────────────────────────────────────────────────╯ ║
║                                                            ║
║  [Pull to refresh...]                                    ║
║                                                            ║
╠═══════════════════════════════════════════════════════════╣
║  🏠      🔍      ➕      💬      👤                       ║  ← Bottom Nav
║  Feed   Catalog Create  Chats   You                      ║
╚═══════════════════════════════════════════════════════════╝
```

---

## 📐 Detailed Component Breakdown

### 1. **Header Bar** (Sticky)
```
┌─────────────────────────────────────────────────────┐
│ 🏠 Lokul · HSR Layout          🔔³  ⚙️             │
└─────────────────────────────────────────────────────┘

Components:
- App logo/name
- Current location (tappable to change)
- Notification bell with badge count
- Settings icon
```

**Behavior:**
- Tapping location opens location picker
- Bell opens notifications panel
- Header scrolls away, reappears on scroll up

---

### 2. **Location Banner** (New)
```
┌───────────────────────────────────────────────────┐
│ 📍 You're in HSR Sector 2                  [→]   │
│ 500+ shops & services nearby                     │
└───────────────────────────────────────────────────┘

Props:
- location: string
- merchantCount: number
- onPress: () => void (navigate to catalog)
```

**Behavior:**
- Shows user's current locality
- Displays nearby merchant count
- Tapping navigates to catalog hub

---

### 3. **Stories Row** (Existing - Keep as is)
```
┌──────────────────────────────────────────────────┐
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐           │
│ │ ⊕  │ │👤  │ │👤  │ │👤  │ │👤  │    →     │
│ │Your│ │User│ │User│ │User│ │User│           │
│ └────┘ └────┘ └────┘ └────┘ └────┘           │
└──────────────────────────────────────────────────┘

Component: <StoriesRow />
- Horizontal scroll
- First item: "Add your story"
- Remaining: Friends' stories
```

---

### 4. **Category Quick Nav** (NEW)
```
┌─────────────────────────────────────────────────────┐
│ 🛍️ SHOP & SERVICES                                 │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐              │
│ │  🍕  │ │  💇  │ │  🏥  │ │  🛒  │      →      │
│ │ Food │ │Salon │ │Clinic│ │Groc- │              │
│ │ 45+  │ │ 12+  │ │  8+  │ │ery   │              │
│ │      │ │      │ │      │ │ 23+  │              │
│ └──────┘ └──────┘ └──────┘ └──────┘              │
└─────────────────────────────────────────────────────┘

Component: <CategoryQuickNav />
Props:
- categories: Array<{
    slug: string
    icon: string (emoji)
    label: string
    count: number
  }>
- onCategoryPress: (slug) => void
```

**Categories to Show:**
1. 🍕 Food (45+)
2. 💇 Salon (12+)
3. 🏥 Clinic (8+)
4. 🛒 Grocery (23+)
5. 🧹 Home Services (18+)
6. 💊 Pharmacy (6+)
7. 🏋️ Fitness (9+)
8. 📚 Education (14+)

**Behavior:**
- Horizontal scroll
- Each chip navigates to category page
- Shows merchant count per category
- Dynamically updated based on location

---

### 5. **Social Feed Post** (Existing)
```
┌──────────────────────────────────────────────────┐
│ 👤 Amit Kumar                         •••       │
│ 2 hours ago · HSR Sector 2                      │
│                                                  │
│ Anyone knows a good electrician? Need for      │
│ urgent repair work.                             │
│                                                  │
│ ❤️ 12   💬 5   📤 Share                        │
└──────────────────────────────────────────────────┘

Component: <PostCard /> (existing)
- Keep all current functionality
- Add smart merchant suggestions (see below)
```

---

### 6. **Smart Suggestion Card** (NEW - In-Feed)
```
┌───────────────────────────────────────────────────┐
│ 🛠️ Need an Electrician?                          │
│ ⚡ Anil AC & Electrical                          │
│ ⭐ 4.8 · 300m · Available now                    │
│ 📞 Contact Now              [Book →]            │
└───────────────────────────────────────────────────┘

Component: <SmartSuggestionCard />
Props:
- keyword: string (detected from post)
- merchant: Merchant
- ctaText: string
```

**Logic:**
1. Detect keywords in post text ("electrician", "plumber", etc.)
2. Find nearby merchants matching category
3. Show top-rated merchant within 2km
4. Display inline in the post

**Behavior:**
- Shown below relevant posts (AI/keyword matching)
- Tapping "Contact Now" opens merchant detail
- "Book" button navigates to booking flow
- Non-intrusive, helpful context

---

### 7. **Recommended For You Section** (NEW)
```
┌─────────────────────────────────────────────────────┐
│ 🎯 RECOMMENDED FOR YOU                             │
│ Based on your recent activity                      │
│                                                     │
│ ┌─────────────────────────────────────────────────┐│
│ │ ┌─────────┐                                     ││
│ │ │         │  ⭐ Shah Medical Store              ││
│ │ │[Image]  │  ⭐⭐⭐⭐⭐ 4.8 (240)                ││
│ │ │500x300  │  📍 500m · HSR Sector 2             ││
│ │ │         │  🎁 10% off on first order          ││
│ │ └─────────┘  💊 Pharmacy · ₹₹                   ││
│ │                                                  ││
│ │             🛒 Quick Order              [→]    ││
│ └─────────────────────────────────────────────────┘│
│                                                     │
│ ┌─────────────────────────────────────────────────┐│
│ │ [Second merchant card...]                       ││
│ └─────────────────────────────────────────────────┘│
│                                                     │
└─────────────────────────────────────────────────────┘

Component: <RecommendationSection />
Props:
- title: string
- description: string
- merchants: Merchant[]
- reason: string (for analytics)
```

**Personalization Logic:**
- If user ordered from pharmacy → Show nearby pharmacies
- If user searched "salon" → Show top salons
- If new user → Show popular merchants
- If no activity → Show trending + nearby

**Card Structure:**
- Left: Merchant image (500x300px)
- Right: Info section
  - Name + rating
  - Distance + locality
  - Offer/promotion
  - Category + price range
- CTA button: "Quick Order" or "Book" or "View Menu"

---

### 8. **Promoted Ad Card** (NEW)
```
┌─────────────────────────────────────────────────────┐
│ 💰 PROMOTED ──────────────────────────── [AD] ──   │
│                                                     │
│ ┌─────────────────────────────────────────────────┐│
│ │ ┌─────────┐                                     ││
│ │ │         │  🎉 Grand Opening!                  ││
│ │ │[Banner] │  ⭐ Deepa's Tiffin Services         ││
│ │ │500x300  │  🍱 Homemade South Indian tiffin    ││
│ │ │         │  📍 800m · HSR Sector 2             ││
│ │ └─────────┘  🎁 50% OFF on first order!        ││
│ │                                                  ││
│ │             Order Now                  [→]     ││
│ └─────────────────────────────────────────────────┘│
│                                                     │
└─────────────────────────────────────────────────────┘

Component: <PromotedAdCard />
Props:
- listing: PromotedListing
- placement: "home_feed"
- onView: () => void (track impression)
- onPress: () => void (track click)
```

**Visual Indicators:**
- "[AD]" badge (top right)
- Subtle highlight border
- "PROMOTED" label
- Slightly different background color

**Behavior:**
- Track impression when 50% visible for 1 second
- Track click when user taps
- Budget management on backend
- Rotate ads based on remaining budget

**Frequency:**
- Every 5th item in feed
- Maximum 3 ads per screen scroll
- Native appearance (matches feed style)

---

### 9. **Popular Near You Carousel** (NEW)
```
┌─────────────────────────────────────────────────────┐
│ 🔥 POPULAR NEAR YOU                                │
│                                                     │
│ ┌────────┐  ┌────────┐  ┌────────┐                │
│ │[Image] │  │[Image] │  │[Image] │        →       │
│ │        │  │        │  │        │                │
│ │Anand   │  │RK      │  │Samrat  │                │
│ │Tiffins │  │Biriyani│  │Resto   │                │
│ │⭐ 4.9  │  │⭐ 4.7  │  │⭐ 4.6  │                │
│ │500m    │  │800m    │  │1.2km   │                │
│ │₹100    │  │₹250    │  │₹400    │                │
│ └────────┘  └────────┘  └────────┘                │
│                                                     │
└─────────────────────────────────────────────────────┘

Component: <PopularNearbyCarousel />
Props:
- merchants: Merchant[]
- maxDistance: number (in km)
```

**Card Structure:**
- Square merchant image (300x300px)
- Name (1 line, truncated)
- Rating with stars
- Distance from user
- Average cost for two

**Logic:**
- Fetch merchants with high order count in last 7 days
- Within user's radius (default 3km)
- Minimum 4.0 rating
- Sort by popularity score

**Behavior:**
- Horizontal scroll
- Tapping card opens merchant detail
- Peek next card (partial visibility)

---

### 10. **Discover More CTA** (NEW)
```
┌─────────────────────────────────────────────────────┐
│ 💡 DISCOVER MORE                                    │
│                                                     │
│ ┌─────────────────────────────────────────────────┐│
│ │    🔍 Explore all shops & services near you     ││
│ │                                                  ││
│ │         Browse Catalog              [→]        ││
│ └─────────────────────────────────────────────────┘│
│                                                     │
└─────────────────────────────────────────────────────┘

Component: <ExploreCtaCard />
Props:
- onPress: () => void (navigate to catalog)
```

**Behavior:**
- Shows after 10+ feed items
- Encourages catalog exploration
- Navigates to Catalog tab (explore screen)

---

## 🎨 Design Specifications

### Colors
```typescript
// From @lokul/ui-tokens
background: colors.surface.background      // #FFFFFF
primary:    colors.brand[600]             // #1D65AF
text:       colors.surface.text            // #111827
secondary:  colors.surface.textSecondary   // #6B7280
border:     colors.surface.border          // #E5E7EB
accent:     colors.secondary[600]          // #EA580C
success:    green-600                      // #059669
```

### Spacing
```typescript
// 4pt grid system
padding: {
  card: 16,           // p-4
  section: 12,        // p-3
  tight: 8,           // p-2
  compact: 4,         // p-1
}

margin: {
  section: 20,        // mb-5
  card: 12,           // mb-3
  element: 8,         // mb-2
}

gap: {
  chips: 8,           // gap-2
  carousel: 12,       // gap-3
}
```

### Typography
```typescript
// Poppins font family
heading: {
  fontSize: 20,         // text-xl
  fontWeight: '600',    // font-semibold
}

subheading: {
  fontSize: 16,         // text-base
  fontWeight: '500',    // font-medium
}

body: {
  fontSize: 14,         // text-sm
  fontWeight: '400',    // font-normal
}

caption: {
  fontSize: 12,         // text-xs
  fontWeight: '400',    // font-normal
  color: secondary,
}
```

### Card Shadows
```typescript
// Merchant cards
shadow: {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
}

// Promoted ads (stronger)
strongShadow: {
  shadowColor: colors.brand[600],
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.15,
  shadowRadius: 8,
  elevation: 5,
}
```

### Border Radius
```typescript
borderRadius: {
  card: 12,           // rounded-xl
  chip: 20,           // rounded-full
  image: 8,           // rounded-lg
  button: 8,          // rounded-lg
}
```

---

## 📊 Feed Algorithm

### Item Ordering
```typescript
const feedItems = [
  { type: 'location_banner', priority: 1 },
  { type: 'stories', priority: 2 },
  { type: 'category_nav', priority: 3 },
  
  // Then interleaved content:
  { type: 'social_post', index: 0 },
  { type: 'recommendation', index: 0 },    // 1st recommendation
  { type: 'social_post', index: 1 },
  { type: 'social_post', index: 2 },
  { type: 'promoted_ad', index: 0 },       // 1st ad
  { type: 'popular_carousel', index: 0 },
  { type: 'social_post', index: 3 },
  { type: 'recommendation', index: 1 },    // 2nd recommendation
  { type: 'social_post', index: 4 },
  { type: 'locality_news', index: 0 },
  { type: 'promoted_ad', index: 1 },       // 2nd ad
  { type: 'social_post', index: 5 },
  { type: 'discover_cta', index: 0 },
  
  // Continue pattern...
];
```

### Rules
1. **Location Banner:** Always first
2. **Stories:** Always second
3. **Category Nav:** Always third
4. **Recommendations:** Every 3-4 social posts
5. **Promoted Ads:** Every 5-7 items
6. **Popular Carousel:** Once per screen
7. **Discover CTA:** After 10+ items, then every 20 items

### Personalization
```typescript
function generateFeed(userId: string, lat: number, lng: number) {
  const socialPosts = await getSocialPosts(userId);
  const recommendations = await getRecommendations(userId, lat, lng);
  const ads = await getPromotedAds('home_feed', lat, lng);
  const popular = await getPopularMerchants(lat, lng);
  
  return interleaveFeedItems({
    socialPosts,
    recommendations,
    ads,
    popular,
  });
}
```

---

## 🔄 State Management

### Feed State (Zustand)
```typescript
interface FeedState {
  items: FeedItem[];
  loading: boolean;
  refreshing: boolean;
  hasMore: boolean;
  userLocation: { lat: number; lng: number } | null;
  
  // Actions
  loadFeed: () => Promise<void>;
  refreshFeed: () => Promise<void>;
  loadMore: () => Promise<void>;
  trackImpression: (itemId: string) => void;
  trackClick: (itemId: string) => void;
}
```

### Activity Tracking
```typescript
// Track every interaction
function trackActivity(type: CatalogActivityType, data: any) {
  fetch('/api/mobile/catalog/track', {
    method: 'POST',
    body: JSON.stringify({
      activityType: type,
      merchantId: data.merchantId,
      catalogItemId: data.catalogItemId,
      durationSec: data.durationSec,
      metadata: data.metadata,
    }),
  });
}

// Usage:
onMerchantCardPress(merchantId) {
  trackActivity('view_merchant', { merchantId });
  router.push(`/(catalog)/merchant/${merchantId}`);
}
```

---

## 📱 User Interactions

### Pull to Refresh
- Pull down to refresh entire feed
- Shows loading spinner
- Refetches all data (social + catalog)
- Updates recommendations

### Infinite Scroll
- Load more when user reaches 80% of feed
- Fetch next 10 social posts
- Fetch next batch of recommendations
- Seamless loading indicator

### Search Integration
- Search bar in header (optional)
- Quick search for merchants
- Navigate to catalog search results

### Offline Support
- Cache last feed state
- Show cached content when offline
- Display offline banner at top
- Sync activity when back online

---

## 🧪 A/B Testing Opportunities

### Test 1: Recommendation Frequency
- **A:** Every 3 posts (33% catalog)
- **B:** Every 5 posts (20% catalog)
- **Measure:** CTR, dwell time, orders

### Test 2: Card Layout
- **A:** Horizontal image + info
- **B:** Vertical image on top
- **Measure:** CTR, engagement

### Test 3: Category Nav Position
- **A:** After stories (current design)
- **B:** Fixed at top (sticky)
- **Measure:** Category tap rate

### Test 4: Ad Frequency
- **A:** Every 5 items
- **B:** Every 7 items
- **Measure:** User retention, ad CTR

---

## 📈 Success Metrics (Home Feed)

| Metric | Baseline | Target |
|--------|----------|--------|
| Avg Session Duration | 3 min | 8 min |
| Recommendation CTR | - | 12% |
| Category Nav CTR | - | 25% |
| Merchant Card CTR | - | 8% |
| Ad CTR | - | 2% |
| Orders from Feed | 0 | 50/day |
| Pull-to-Refresh Rate | 40% | 50% |
| Scroll Depth | 10 items | 20 items |

---

## 🚀 Implementation Priority

### Phase 1 (Week 1) - Foundation
- [x] Location banner component
- [x] Category quick nav component
- [ ] Basic recommendation section
- [ ] Merchant card component
- [ ] Integrate with existing feed

### Phase 2 (Week 2) - Personalization
- [ ] Activity tracking API
- [ ] Recommendation algorithm
- [ ] Smart suggestion cards
- [ ] Popular nearby carousel

### Phase 3 (Week 3) - Ads
- [ ] Promoted ad card component
- [ ] Ad placement logic
- [ ] Impression/click tracking
- [ ] Revenue dashboard

### Phase 4 (Week 4) - Polish
- [ ] Animations & transitions
- [ ] Loading states
- [ ] Error handling
- [ ] Performance optimization

---

## 💡 Next Steps

1. **Review this wireframe** - Get stakeholder approval
2. **Create Figma designs** - High-fidelity mockups
3. **Build components** - Start with Category Nav
4. **Integrate APIs** - Connect to backend
5. **Test on iOS simulator** - Already running!

---

**Ready to implement?** Let me know and I'll start building! 🚀
