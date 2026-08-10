# 🎯 Feed/Home Screen Redesign: Commerce-First UX Research

**Date**: August 11, 2026  
**Goal**: Transform social feed into a commerce-focused discovery & buying experience  
**Inspiration**: Zepto, Zomato, Swiggy, Blinkit, Dunzo

---

## 📊 Current State Analysis

### What You Have Now
✅ **Social Feed** (Twitter/Facebook style)
- Stories row
- Post cards (community updates, alerts, events)
- Filter chips (All, News, Events, Alerts)
- News cards from external sources
- Promo carousel
- Ad slots

### Problems with Current Design
❌ **Too Many Friction Points**
- Users need to navigate to separate screens to buy (Discover → Catalog → Merchant)
- 3-4 taps to reach checkout
- No direct "Add to Cart" on home screen
- Commerce is hidden in secondary navigation

❌ **Social > Commerce Priority**
- Feed optimized for reading, not buying
- No product cards with pricing/CTA
- No quick-order shortcuts
- Missing merchant spotlights

❌ **Discovery Inefficiency**
- Search requires navigation to Discover tab
- Categories buried under tabs
- No "previously ordered" quick reorder

---

## 🔬 Competitive Analysis

### 1. **Zepto** (10-Minute Grocery Delivery)

**Key Features:**
```
┌─────────────────────────────┐
│ 🏠 Deliver to: Tower-B, 302 │ ← Location prominent
├─────────────────────────────┤
│ [🔍 Search groceries]       │ ← Search on top
├─────────────────────────────┤
│ 🎨 Category Pills:          │
│ [🥬 Vegetables][🥛 Dairy]   │ ← Horizontal scroll
├─────────────────────────────┤
│ ⚡ Quick Add Grid:          │
│ ┌─────┬─────┬─────┐        │
│ │Milk │Bread│Eggs │        │ ← Product cards
│ │₹60  │₹40  │₹80  │        │   with instant +
│ │ [+] │ [+] │ [+] │        │
│ └─────┴─────┴─────┘        │
├─────────────────────────────┤
│ 🔥 Offers: 50% off dairy   │ ← Banner carousel
├─────────────────────────────┤
│ 📦 Previously Ordered:      │
│ → Tata Tea, Amul Butter...  │ ← Quick reorder
└─────────────────────────────┘
```

**UX Principles:**
- **Zero-tap to cart**: "+ button" on every product card
- **Visual hierarchy**: Categories → Products → Offers
- **Instant gratification**: See price immediately
- **Persistent search**: Always accessible at top
- **Location context**: Delivery address visible

---

### 2. **Zomato** (Food Delivery)

**Key Features:**
```
┌─────────────────────────────┐
│ 📍 Delivering to Tower B    │
│ [🔍 Search restaurants]     │
├─────────────────────────────┤
│ What's on your mind?        │
│ [🍕Pizza][🍔Burger][🍜Noodles]│ ← Food categories
├─────────────────────────────┤
│ 🌟 Top Picks for You        │
│ ┌─────────────┐             │
│ │ 🏪 Domino's │ 40% OFF     │ ← Restaurant cards
│ │ ⭐ 4.3 · 25 min          │   with badges
│ │ Pizza, Fast Food         │
│ └─────────────┘             │
├─────────────────────────────┤
│ 🔥 Offers Near You          │ ← Personalized deals
├─────────────────────────────┤
│ ♻️ Order Again             │ ← Recent orders
│ → Last ordered: Burger King │   with 1-tap reorder
└─────────────────────────────┘
```

**UX Principles:**
- **Personalization**: "Top picks for YOU"
- **Visual cards**: Photos, ratings, delivery time
- **Urgency indicators**: "40% OFF", "Closing soon"
- **Frictionless reordering**: Repeat orders in 1 tap
- **Category browsing**: Quick food type filtering

---

### 3. **Swiggy** (Food + Grocery + More)

**Key Features:**
```
┌─────────────────────────────┐
│ 🏠 Home | 📍 Other          │
│ [🔍 Search for dishes]      │
├─────────────────────────────┤
│ 🎯 Services Carousel:       │
│ [Food][Instamart][Genie]   │ ← Multi-service tabs
├─────────────────────────────┤
│ ⚡ What's on your mind?     │
│ [🍕][🍔][🥗][🍜][🍰][☕]    │ ← Icon grid
├─────────────────────────────┤
│ 🏆 Best in Food             │
│ ┌──────────────┐            │
│ │ 🏪 KFC       │ ⚡ 20 min  │ ← Rich cards
│ │ ⭐ 4.5 · ₹300 for two    │   with metadata
│ │ 🏷️ 50% off up to ₹100    │
│ └──────────────┘            │
├─────────────────────────────┤
│ 🔖 Your Favourites          │ ← Saved merchants
└─────────────────────────────┘
```

**UX Principles:**
- **Service clarity**: Clear tabs for Food/Grocery/More
- **Visual discovery**: Icon-based category grid
- **Rich metadata**: Price, time, offers visible upfront
- **Saved preferences**: Quick access to favorites

---

### 4. **Blinkit** (Quick Commerce)

**Key Features:**
```
┌─────────────────────────────┐
│ 🕐 Delivery in 15 minutes   │ ← Promise upfront
│ 📍 Tower B-302              │
│ [🔍 Search products]        │
├─────────────────────────────┤
│ 🎨 Shop by Category         │
│ [🥬][🥛][🍞][🧴][🧹][💊]   │ ← Icon grid
├─────────────────────────────┤
│ ⚡ Paan Corner             │
│ ├─ Vimal Pan Masala  [+]   │ ← Nested categories
│ ├─ Rajnigandha     ₹12 [+] │   with inline add
│ └─ Mouth Freshner   ₹8 [+] │
├─────────────────────────────┤
│ 🔥 Daily Essentials         │
│ ┌─────┬─────┬─────┐        │
│ │Milk │Bread│Tea  │        │ ← Product grid
│ │₹28  │₹30  │₹190 │        │   with pricing
│ │[+]  │[+]  │[+]  │        │
│ └─────┴─────┴─────┘        │
├─────────────────────────────┤
│ 🛒 Your Cart (3 items)      │ ← Sticky cart bar
│ ₹245  [Checkout →]         │
└─────────────────────────────┘
```

**UX Principles:**
- **Speed promise**: Delivery time visible at top
- **Inline adding**: No need to open product details
- **Sticky cart**: Always visible at bottom
- **Category depth**: Sub-categories for better organization
- **Visual pricing**: Price on every card

---

## 🎨 Redesign Proposal: Commerce-First Feed

### Design Philosophy
**"From Social Feed to Shopping Mall"**
- **Discovery**: Browse like window shopping
- **Speed**: Add to cart in 1 tap
- **Convenience**: Reorder frequently bought items
- **Trust**: Show ratings, verified badges, delivery time
- **Context**: Location-aware merchant suggestions

---

### New Information Architecture

```
┌─────────────────────────────────────┐
│ HEADER                              │
│ ├─ Location selector                │
│ ├─ Search bar (persistent)          │
│ └─ Cart badge (shows item count)    │
├─────────────────────────────────────┤
│ QUICK ACTIONS                       │
│ ├─ Service category pills           │
│ │  [🍕 Food][🛒 Grocery][💊 Pharmacy]│
│ └─ Browse all categories →          │
├─────────────────────────────────────┤
│ HERO SECTION                        │
│ ├─ Promotional carousel (offers)    │
│ └─ "Order again" if has history     │
├─────────────────────────────────────┤
│ MERCHANT SPOTLIGHT                  │
│ ├─ "Nearby & Open Now"              │
│ ├─ Merchant cards (photo, rating)   │
│ │  ┌──────────────┐                │
│ │  │ 🏪 Amul Parlor│ ⚡ 10 min     │
│ │  │ ⭐ 4.5 · 120 orders           │
│ │  │ 🏷️ 20% off · ₹50 delivery    │
│ │  │ [View Menu →]                 │
│ │  └──────────────┘                │
│ └─ Horizontal scroll                │
├─────────────────────────────────────┤
│ PRODUCT QUICK ADD                   │
│ ├─ "Daily Essentials"               │
│ ├─ Product cards (2-3 columns)      │
│ │  ┌─────────┐ ┌─────────┐        │
│ │  │ 🥛 Milk │ │ 🍞 Bread│        │
│ │  │ ₹60     │ │ ₹40     │        │
│ │  │ 500ml   │ │ 400g    │        │
│ │  │   [+]   │ │   [+]   │        │
│ │  └─────────┘ └─────────┘        │
│ └─ See all products →               │
├─────────────────────────────────────┤
│ COMMUNITY FEED (Secondary)          │
│ ├─ "What's happening in locality"   │
│ ├─ Condensed post cards             │
│ │  (smaller, less prominent)        │
│ └─ View all posts →                 │
├─────────────────────────────────────┤
│ STICKY CART BAR (if items > 0)      │
│ ├─ Item count & total               │
│ └─ [Checkout] button                │
└─────────────────────────────────────┘
```

---

## 🛠️ Implementation Strategy

### Phase 1: Quick Wins (Week 1-2)
1. **Add Search Bar to Top**
   - Persistent, always visible
   - Auto-complete for products & merchants
   
2. **Category Pills Row**
   - Replace current filter chips
   - Direct navigation to commerce screens
   
3. **Merchant Cards with CTA**
   - Add "View Menu" / "Order Now" buttons
   - Show ratings, delivery time, offers
   
4. **Sticky Cart Preview**
   - Bottom bar showing cart summary
   - Quick access to checkout

### Phase 2: Product Discovery (Week 3-4)
1. **Quick Add Product Grid**
   - Most ordered items from nearby stores
   - Inline "+ button" to add to cart
   - Price visibility
   
2. **Order Again Section**
   - Personal order history
   - 1-tap reorder functionality
   
3. **Merchant Spotlight Carousel**
   - Featured/promoted merchants
   - Rich cards with photos & metadata

### Phase 3: Personalization (Week 5-6)
1. **Smart Recommendations**
   - ML-based product suggestions
   - Time-of-day based (breakfast, lunch, dinner)
   
2. **Location-Based Filtering**
   - Auto-filter by delivery radius
   - Show "Open now" status
   
3. **Offer Engine**
   - Personalized discount banners
   - Time-limited deals

### Phase 4: Social Integration (Week 7-8)
1. **Move Social Feed Down**
   - Keep community posts, but lower priority
   - Condensed card design
   
2. **Social Proof on Products**
   - "3 neighbors ordered this"
   - Community reviews on merchants

---

## 📐 UI Component Specifications

### 1. Merchant Card (Spotlight)
```typescript
interface MerchantCard {
  photo: string;           // Hero image
  name: string;
  category: string;        // "Grocery · Pharmacy"
  rating: number;          // 4.5
  reviewCount: number;     // 120
  deliveryTime: number;    // 10 (minutes)
  minOrder: number;        // 50 (rupees)
  offers: string[];        // ["20% off", "Free delivery"]
  distance: number;        // 0.5 (km)
  isOpen: boolean;
  tags: string[];          // ["Fast delivery", "Verified"]
}

// Visual: 
// - 16:9 photo with gradient overlay
// - Rating badge (star + number) top-left
// - Offer badge top-right (if applicable)
// - CTA button: "View Menu" / "Order Now"
// - Delivery time with ⚡ icon
```

### 2. Product Quick Add Card
```typescript
interface ProductQuickAddCard {
  photo: string;
  name: string;
  unit: string;            // "500ml", "1kg"
  price: number;
  mrp?: number;            // Show strikethrough if discounted
  discount?: number;       // Percentage
  inStock: boolean;
  merchant: {
    id: string;
    name: string;
  };
}

// Visual:
// - Square 1:1 photo
// - Name (2 lines max, ellipsis)
// - Price prominent (₹60)
// - Unit below price (500ml)
// - Large [+] button at bottom
// - Out of stock: Gray overlay + "Notify me"
```

### 3. Category Icon Pill
```typescript
interface CategoryPill {
  id: string;
  icon: string;            // Emoji or icon name
  label: string;
  color: string;           // Brand color for active state
  route: string;           // Navigation target
}

// Visual:
// - Icon size: 32px
// - Pill height: 48px
// - Border radius: 24px (full)
// - Active: Colored background + white icon
// - Inactive: Gray background + colored icon
// - Horizontal scroll with 8px gap
```

### 4. Sticky Cart Bar
```typescript
interface CartBar {
  itemCount: number;
  totalAmount: number;
  deliveryFee: number;
  onCheckout: () => void;
}

// Visual:
// - Fixed at bottom, above tab bar
// - Height: 56px
// - Shadow elevation: 8dp
// - Left: Item count badge (e.g., "3 items")
// - Center: Total amount (e.g., "₹245")
// - Right: [Checkout →] button
// - Animate on item add/remove
```

---

## 🎯 Success Metrics

### North Star Metric
**"Time to First Purchase"**
- Target: < 90 seconds from app open to order placed
- Current: ~3-5 minutes (estimated)

### Supporting Metrics
1. **Conversion Rate**
   - Home → Product View: Target 60%
   - Product View → Add to Cart: Target 40%
   - Cart → Checkout: Target 80%

2. **Engagement**
   - Daily Active Users (DAU)
   - Session duration
   - Products viewed per session

3. **Revenue**
   - Average Order Value (AOV)
   - Orders per user per month
   - Repeat purchase rate

4. **User Satisfaction**
   - App Store rating
   - NPS score
   - Support tickets (reduce friction issues)

---

## 🚀 Migration Strategy

### Gradual Rollout
1. **Week 1-2: A/B Test**
   - 10% users get new feed
   - Monitor metrics vs. control group
   
2. **Week 3-4: Beta Release**
   - Opt-in "Try new home" toggle
   - Collect feedback
   
3. **Week 5-6: Full Launch**
   - 100% rollout if metrics positive
   - Keep old feed as "Social" tab

### Rollback Plan
- Feature flag to switch between feeds
- Old feed code remains in codebase
- Easy rollback if metrics drop

---

## 📱 Screen-by-Screen Mockup

### Home Screen (New)
```
┌─────────────────────────────────┐
│ 📍 Tower B-302        🛒[3] 🔔│  ← Header
├─────────────────────────────────┤
│ [🔍 Search food, groceries...] │  ← Search
├─────────────────────────────────┤
│ [🍕Food][🛒Grocery][💊Pharmacy]│  ← Categories
│ [🚗Ride][📦Delivery][➕More]   │
├─────────────────────────────────┤
│ 🎯 ORDER AGAIN                  │
│ ├─ Amul Milk · ₹60 [Add]      │  ← Quick reorder
│ └─ Britannia Bread · ₹40 [Add]│
├─────────────────────────────────┤
│ 🔥 HOT DEALS                    │
│ 🎨 [Carousel of offer banners]  │  ← Swipeable
├─────────────────────────────────┤
│ 🏪 NEARBY & OPEN NOW            │
│ ┌──────────────────┐            │
│ │ 📸 Amul Parlour │ ⚡ 10min   │  ← Merchant card
│ │ ⭐ 4.5 · 120 orders          │
│ │ 🏷️ 20% off · Free delivery  │
│ │        [View Menu]           │
│ └──────────────────┘            │
│ → Swipe for more                │
├─────────────────────────────────┤
│ ⚡ DAILY ESSENTIALS             │
│ ┌──────┬──────┬──────┐         │
│ │🥛Milk│🍞Bread│☕Tea│         │  ← Product grid
│ │₹60  │₹40   │₹190 │         │
│ │[+]  │[+]   │[+]  │         │
│ └──────┴──────┴──────┘         │
│ → See all                       │
├─────────────────────────────────┤
│ 💬 WHAT'S HAPPENING             │
│ ┌─────────────────┐             │
│ │ 🧑 RWA Notice   │             │  ← Condensed posts
│ │ Water tank...   │             │
│ └─────────────────┘             │
│ → View all updates              │
└─────────────────────────────────┘
│ 🛒 3 items · ₹245  [Checkout] │  ← Sticky cart bar
└─────────────────────────────────┘
```

---

## 🎨 Visual Design Tokens

### Colors
```typescript
export const commerceColors = {
  // Action colors
  addToCart: '#10B981',      // Green (success)
  checkout: '#1D65AF',       // Brand blue
  discount: '#F59E0B',       // Orange (attention)
  
  // Status colors
  inStock: '#22C55E',
  outOfStock: '#EF4444',
  openNow: '#10B981',
  closed: '#9CA3AF',
  
  // Rating colors
  ratingGold: '#F59E0B',
  ratingBg: '#FEF3C7',
};
```

### Typography
```typescript
export const commerceTypography = {
  productName: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.surface.heading,
  },
  mrp: {
    fontSize: 12,
    fontWeight: '400',
    textDecorationLine: 'line-through',
    color: colors.surface.textSecondary,
  },
  merchantName: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 24,
  },
  metadata: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.surface.textSecondary,
  },
};
```

### Spacing
```typescript
export const commerceSpacing = {
  productCard: {
    gap: spacing[2],        // 8px between elements
    padding: spacing[3],    // 12px internal padding
  },
  merchantCard: {
    gap: spacing[3],        // 12px between elements
    padding: spacing[4],    // 16px internal padding
  },
  section: {
    marginBottom: spacing[5],  // 20px between sections
  },
};
```

---

## 🔧 Technical Implementation

### New Components Needed

1. **MerchantSpotlightCard**
   ```typescript
   <MerchantSpotlightCard
     merchant={merchant}
     onViewMenu={() => router.push(`/merchant/${id}`)}
     showOffers={true}
     showDeliveryTime={true}
   />
   ```

2. **ProductQuickAddCard**
   ```typescript
   <ProductQuickAddCard
     product={product}
     onAdd={(productId) => addToCart(productId)}
     showMerchantName={true}
   />
   ```

3. **CategoryIconPill**
   ```typescript
   <CategoryIconPill
     category={category}
     active={activeCategory === category.id}
     onPress={() => navigateToCategory(category.id)}
   />
   ```

4. **StickyCartBar**
   ```typescript
   <StickyCartBar
     itemCount={cart.items.length}
     totalAmount={cart.total}
     onCheckout={() => router.push('/checkout')}
   />
   ```

5. **OrderAgainSection**
   ```typescript
   <OrderAgainSection
     recentOrders={userOrders}
     onReorder={(orderId) => reorderItems(orderId)}
   />
   ```

### Data Requirements

```typescript
// New API endpoints needed
GET /api/mobile/merchants/nearby
  ?pinCode=560001
  &lat=12.9716
  &lng=77.5946
  &radius=2km
  &status=open

GET /api/mobile/products/essentials
  ?pinCode=560001
  &category=grocery
  &limit=20

GET /api/mobile/orders/history
  ?userId=123
  &limit=10

GET /api/mobile/offers/active
  ?pinCode=560001
  &userId=123

POST /api/mobile/cart/add
  {
    "userId": "123",
    "productId": "456",
    "quantity": 1,
    "merchantId": "789"
  }
```

---

## 📋 Checklist for Implementation

### Design Phase
- [ ] Create high-fidelity mockups in Figma
- [ ] Design system update (new components)
- [ ] User flow diagrams
- [ ] Accessibility audit (color contrast, touch targets)
- [ ] Dark mode variants

### Development Phase
- [ ] New component library
- [ ] API integration
- [ ] Cart state management (Zustand store)
- [ ] Navigation updates
- [ ] Analytics instrumentation
- [ ] Performance optimization (lazy loading, caching)

### Testing Phase
- [ ] Unit tests for new components
- [ ] Integration tests for cart flow
- [ ] E2E tests for purchase journey
- [ ] A/B test infrastructure
- [ ] Beta user feedback collection

### Launch Phase
- [ ] Feature flag setup
- [ ] Gradual rollout plan
- [ ] Monitoring dashboard
- [ ] User communication (in-app announcement)
- [ ] Support team training

---

## 💡 Key Takeaways

### Do's ✅
1. **Prioritize speed**: Every tap counts. Aim for 1-2 taps to add items.
2. **Show prices upfront**: No surprises. Transparency builds trust.
3. **Visual hierarchy**: Commerce first, social second.
4. **Personalize**: Use order history, location, time of day.
5. **Sticky cart**: Always visible, easy access.
6. **Rich metadata**: Ratings, delivery time, offers visible.

### Don'ts ❌
1. **Don't hide commerce**: It should be the primary focus.
2. **Don't remove social**: Move it down, don't delete it.
3. **Don't over-complicate**: Keep UI clean and fast.
4. **Don't force login**: Allow guest browsing.
5. **Don't neglect search**: It's critical for quick discovery.
6. **Don't ignore offline**: Cache products for poor network.

---

## 📈 Expected Impact

### Before (Current)
- **Time to purchase**: 3-5 minutes
- **Conversion rate**: ~5-10%
- **Primary use case**: Social browsing
- **Commerce discovery**: Hidden in tabs

### After (New Design)
- **Time to purchase**: 60-90 seconds
- **Conversion rate**: 25-35%
- **Primary use case**: Shopping + Social
- **Commerce discovery**: Front and center

### ROI Projection
- **User engagement**: +40%
- **Order frequency**: +60%
- **Average order value**: +25%
- **Daily active users**: +30%

---

## 🎯 Next Steps

1. **Validate with users**: Show mockups to 10-15 beta testers
2. **Prioritize features**: Decide on MVP scope
3. **Create detailed specs**: Component-level documentation
4. **Estimate timeline**: Dev effort for each phase
5. **Build prototype**: Interactive Figma prototype
6. **Plan rollout**: A/B test strategy

---

**Questions for Discussion:**
1. Should we keep social feed on home, or move to separate "Community" tab?
2. What's the right balance between discovery and commerce?
3. Which categories should be featured in quick access pills?
4. How do we handle merchants from multiple localities?
5. What's the cart abandonment recovery strategy?
