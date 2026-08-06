# 🚀 Catalog Feed System - Quick Start Guide

## ✅ Current Status
- **iOS Simulator:** ✅ Running (iPhone 17 Pro)
- **Metro Bundler:** ✅ Running (localhost:8081)
- **Web Admin:** ✅ Running (localhost:3000)
- **Database:** ✅ Connected (Local PostgreSQL)

---

## 📊 System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     CATALOG FEED SYSTEM                       │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐     │
│  │   Mobile    │  │   Web App    │  │   Admin Panel   │     │
│  │   (Expo)    │  │  (Next.js)   │  │   (Next.js)     │     │
│  └──────┬──────┘  └──────┬───────┘  └────────┬────────┘     │
│         │                │                     │              │
│         └────────────────┴─────────────────────┘              │
│                          │                                     │
│                    ┌─────▼──────┐                            │
│                    │  API Layer │                            │
│                    │  (Next.js)  │                            │
│                    └─────┬──────┘                            │
│         ┌────────────────┼────────────────┐                  │
│         │                │                │                  │
│    ┌────▼─────┐   ┌─────▼──────┐   ┌────▼─────┐           │
│    │PostgreSQL│   │   Redis    │   │  ML/Rec  │           │
│    │ Database │   │   Cache    │   │  Engine  │           │
│    └──────────┘   └────────────┘   └──────────┘           │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

---

## 🎯 6 Core Screens

### 1. **Enhanced Home Feed**
```
Location: apps/mobile/src/app/(tabs)/index.tsx
Status:   🟡 Needs Enhancement
```
**Add:**
- Category quick nav chips
- Personalized merchant cards
- Promoted ads integration
- "Popular Near You" carousel

### 2. **Catalog Hub** (Discovery)
```
Location: apps/mobile/src/app/(tabs)/explore.tsx
Status:   🟡 Needs Transformation
```
**Transform to:**
- Main catalog landing
- Category grid (8-12 categories)
- "Just For You" recommendations
- Search with filters

### 3. **Category Browse**
```
Location: apps/mobile/src/app/(catalog)/category/[slug].tsx
Status:   🔴 New Screen (To Build)
```
**Features:**
- List all merchants in category
- Advanced filters (distance, rating, price, open now)
- Sort options
- Promoted listings at top

### 4. **Merchant Detail + Catalog**
```
Location: apps/mobile/src/app/(catalog)/merchant/[id].tsx
Status:   🔴 New Screen (To Build)
```
**Features:**
- Hero image, ratings, distance
- Business hours, delivery info
- Full catalog with categories
- Add to cart functionality
- Reviews section

### 5. **Cart & Checkout**
```
Location: apps/mobile/src/app/(catalog)/cart.tsx
Status:   🔴 New Screen (To Build)
```
**Features:**
- Cart items with quantity controls
- Apply coupons
- Delivery address selection
- Bill summary
- Payment methods

### 6. **Personalized Feed**
```
Location: apps/mobile/src/app/(catalog)/for-you.tsx
Status:   🔴 New Screen (To Build)
```
**Features:**
- ML-powered recommendations
- "Because you ordered from X"
- "Trending in your area"
- "Your favorite cuisine"
- Recently viewed

---

## 📦 New Database Tables (5 Tables)

### 1. `UserCatalogActivity`
**Purpose:** Track all user interactions for ML
**Records:** View merchant, search, order, favorite, etc.
**Indexes:** userId+createdAt, activityType

### 2. `UserInterestProfile`
**Purpose:** Computed user preferences
**Data:** Top categories, price range, order frequency
**Update:** Nightly batch job

### 3. `PromotedListing`
**Purpose:** Manage promoted/sponsored merchants
**Features:** Budget tracking, targeting by location/category
**Placements:** Home feed, category, search results

### 4. `AdImpression`
**Purpose:** Track ad views and clicks
**Usage:** Attribution, billing, analytics

### 5. `MerchantCatalogCategory`
**Purpose:** Hierarchical category structure
**Examples:** Food → North Indian → Biryani

---

## 🔧 API Endpoints (20+ Endpoints)

### **Catalog Discovery**
- `GET /api/mobile/catalog/nearby` - Get nearby merchants
- `GET /api/mobile/catalog/trending` - Trending merchants
- `GET /api/mobile/catalog/offers` - Active offers
- `GET /api/mobile/catalog/search` - Search merchants/items
- `GET /api/mobile/catalog/categories` - All categories

### **Recommendations**
- `GET /api/mobile/recommendations/personalized` - ML feed
- `GET /api/mobile/recommendations/similar` - Similar merchants
- `GET /api/mobile/recommendations/category` - Category-based

### **Merchant & Catalog**
- `GET /api/mobile/merchant/:id` - Merchant details
- `GET /api/mobile/merchant/:id/catalog` - Full catalog
- `GET /api/mobile/merchant/:id/reviews` - Reviews

### **Activity Tracking**
- `POST /api/mobile/catalog/track` - Track user actions
- `POST /api/mobile/recommendations/update-profile` - Recompute profile

### **Ads**
- `GET /api/mobile/ads/promoted` - Get ads for placement
- `POST /api/mobile/ads/track` - Track impression/click

### **Cart & Orders**
- `POST /api/mobile/cart/add` - Add to cart
- `GET /api/mobile/cart` - Get cart
- `POST /api/mobile/orders/place` - Place order

---

## 🧩 Reusable Components (10 Components)

1. **MerchantCard** - Standard merchant listing
2. **CatalogItemCard** - Product/menu item with add button
3. **CategoryChip** - Filter/navigation chips
4. **PromotedAdCard** - Highlighted ad format
5. **RecommendationSection** - Titled recommendation group
6. **FilterSheet** - Bottom sheet with filters
7. **SortDropdown** - Sort options
8. **CartItemCard** - Cart item with quantity
9. **AddressSelector** - Delivery address picker
10. **BillSummary** - Order breakdown

---

## 🧠 Recommendation Algorithm

### Input Data
```typescript
{
  user: {
    recentOrders: [...],      // Last 30-60 days
    searches: [...],           // Search queries
    merchantViews: [...],      // Viewed merchants
    timeSpent: {...},          // Engagement time
    location: { lat, lng }     // Current location
  }
}
```

### Scoring Formula
```
Merchant Score = 
  similarityScore  × 0.3  (category match, past orders)
+ proximityScore   × 0.3  (distance from user)
+ popularityScore  × 0.2  (rating, order count)
+ recencyScore     × 0.1  (last interaction)
+ offerScore       × 0.1  (has active offers)
```

### Output Sections
1. "Because you ordered from X" (similar merchants)
2. "Trending in your area" (popular + nearby)
3. "Your favorite [category]" (category affinity)
4. "New offers you might like" (offers + preferences)
5. "Recently viewed" (last 10 viewed)
6. "Frequently visited" (repeat orders)

---

## 💰 Revenue Model

### Merchant Promotions
- **Home Feed Placement:** ₹2,000/month
- **Category Top Slot:** ₹1,500/month
- **Search Results:** ₹1,000/month

### Third-Party Ads
- **CPM Model:** ₹50 per 1,000 impressions
- **CPC Model:** ₹5 per click

### Target Revenue (Month 3)
- 50 promoted merchants × ₹1,500 = **₹75,000**
- 100,000 ad impressions × ₹0.05 = **₹5,000**
- **Total: ₹80,000/month**

---

## 📈 Success Metrics

### User Engagement
| Metric | Target |
|--------|--------|
| Daily Active Users | 5,000 |
| Avg Session Duration | 10 min |
| D7 Retention Rate | 40% |
| Recommendation CTR | 15% |

### Business Metrics
| Metric | Target |
|--------|--------|
| Orders Per Day | 500 |
| Average Order Value | ₹300 |
| Conversion Rate (View→Order) | 8% |
| Merchant Sign-ups | 1,000 |

### Ad Performance
| Metric | Target |
|--------|--------|
| Ad CTR | 2-3% |
| Ad Revenue | ₹50,000/month |
| Merchant Adoption | 20% |

---

## 🚀 Implementation Roadmap

### **Phase 1: Foundation** (2 weeks)
- [ ] Create 5 new database tables
- [ ] Run Prisma migrations
- [ ] Build core API endpoints (nearby, trending, search)
- [ ] Implement activity tracking
- [ ] Set up Redis caching

### **Phase 2: Catalog Hub** (2 weeks)
- [ ] Build category grid UI
- [ ] Create merchant listing screens
- [ ] Implement filters and sorting
- [ ] Build merchant detail page
- [ ] Display catalog items

### **Phase 3: Cart & Orders** (2 weeks)
- [ ] Cart management UI
- [ ] Checkout flow
- [ ] Order placement API
- [ ] Order tracking

### **Phase 4: Personalization** (2 weeks)
- [ ] Interest profiling algorithm
- [ ] Recommendation engine
- [ ] "For You" feed screen
- [ ] Background job for profile updates

### **Phase 5: Ad Integration** (2 weeks)
- [ ] Promoted listings system
- [ ] Ad placement logic
- [ ] Impression/click tracking
- [ ] Merchant promotion portal (admin)

### **Phase 6: Polish & Launch** (2 weeks)
- [ ] Performance optimization
- [ ] Analytics dashboard
- [ ] A/B testing setup
- [ ] Beta launch to 100 users
- [ ] Gather feedback & iterate

**Total Timeline: 12 weeks** (3 months)

---

## 🛠️ Development Workflow

### Step 1: Start with Database
```bash
# 1. Add new models to schema.prisma
# 2. Create migration
npx prisma migrate dev --name add_catalog_system

# 3. Generate Prisma client
npx prisma generate

# 4. Seed initial data (categories, test merchants)
npm run prisma:seed
```

### Step 2: Build API Endpoints
```bash
# Create API routes in src/app/api/mobile/catalog/
- nearby/route.ts
- trending/route.ts
- search/route.ts
- recommendations/personalized/route.ts
```

### Step 3: Build Mobile Screens
```bash
# Create new routes in apps/mobile/src/app/
- (catalog)/
  - category/[slug].tsx
  - merchant/[id].tsx
  - cart.tsx
  - for-you.tsx
```

### Step 4: Build Components
```bash
# Create reusable components in apps/mobile/src/components/catalog/
- MerchantCard.tsx
- CatalogItemCard.tsx
- CategoryChip.tsx
- PromotedAdCard.tsx
```

### Step 5: Test End-to-End
```bash
# 1. Test on iOS simulator (already running!)
# 2. Test API endpoints with Postman/Thunder Client
# 3. Test recommendations with real user data
# 4. Test ad tracking
```

---

## 🎨 Design System (Already Available)

### Colors
- **Primary:** `colors.brand[600]` (#1D65AF)
- **Secondary:** `colors.secondary[600]` (#EA580C)
- **Success:** `green-600` (#059669)
- **Warning:** `amber-500` (#D97706)
- **Error:** `red-600` (#DC2626)

### Typography
- **Font:** Poppins (already loaded)
- **Sizes:** xs (12), sm (14), base (16), lg (18), xl (20)

### Spacing
- **4pt Grid:** 4, 8, 12, 16, 20, 24, 32, 40, 48, 64

### Components (from @lokul/ui-tokens)
- Card, Button, Badge, Avatar, HStack, VStack, Text

---

## 📱 Mobile App Navigation Update

### Current Tabs
```
Home  |  Explore  |  +Create  |  Chats  |  Profile
```

### Proposed Update
```
Feed  |  Catalog  |  +Create  |  Chats  |  Profile
```

**Changes:**
1. "Explore" → "Catalog" (clearer purpose)
2. Home feed gets catalog integration
3. New deep routes for catalog browsing

---

## 🔥 Quick Implementation Checklist

### This Week (Week 1)
- [x] ✅ Review implementation plan
- [ ] 🟡 Approve database schema
- [ ] 🟡 Create Prisma migration
- [ ] 🟡 Build `/api/mobile/catalog/nearby` endpoint
- [ ] 🟡 Build `MerchantCard` component
- [ ] 🟡 Test on iOS simulator

### Next Week (Week 2)
- [ ] 🟡 Build recommendation algorithm
- [ ] 🟡 Create activity tracking
- [ ] 🟡 Build "For You" feed
- [ ] 🟡 Add ad placement logic

---

## 🤝 Team Responsibilities

### Backend Developer
- Database schema & migrations
- API endpoints
- Recommendation algorithm
- Background jobs

### Mobile Developer
- UI screens & components
- Navigation updates
- State management
- API integration

### ML/Data Engineer
- User profiling algorithm
- Recommendation scoring
- A/B testing framework
- Analytics pipeline

### Designer
- Screen mockups
- Component library
- User flow diagrams
- Interaction patterns

---

## 📚 Key Documentation

1. **Full Implementation Plan:** `/docs/CATALOG_FEED_IMPLEMENTATION_PLAN.md`
2. **Database Schema:** `/prisma/schema.prisma`
3. **API Documentation:** (To be created)
4. **Component Storybook:** (To be created)

---

## 🎯 Next Action Items

1. **Review this plan** with your team
2. **Prioritize MVP features** (what must ship in Phase 1?)
3. **Assign tasks** to team members
4. **Set up project board** (Jira/Linear/GitHub Projects)
5. **Start Phase 1 implementation** tomorrow!

---

## 💡 Pro Tips

### Performance
- Cache merchant listings in Redis (5 min TTL)
- Use React Query for data fetching
- Implement infinite scroll with windowing
- Lazy load images

### UX
- Show skeleton loaders while loading
- Optimistic UI updates for cart
- Pull-to-refresh on all lists
- Error boundaries for graceful failures

### Analytics
- Track every screen view
- Log all user actions (search, view, order)
- Monitor API latency
- Set up error tracking (Sentry)

---

## ❓ FAQs

**Q: How long will this take?**
A: 12 weeks for full implementation. MVP in 6 weeks.

**Q: Do we need ML expertise?**
A: No, start with rule-based recommendations. Add ML later.

**Q: What about Android?**
A: Expo/React Native works on both iOS and Android automatically!

**Q: How do we handle merchant onboarding?**
A: Separate admin portal for merchants to add catalog items.

**Q: What about payments?**
A: Integrate Razorpay (already in codebase!).

---

**Ready to build the future of hyperlocal commerce?** 🚀

Let me know which phase you want to start with, and I'll begin implementation immediately!
