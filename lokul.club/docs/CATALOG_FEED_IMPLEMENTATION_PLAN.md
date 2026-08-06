# 🛍️ Catalog Feed System - Detailed Implementation Plan

## 📋 Overview
Transform the Lokul app into a Zomato-like discovery platform with personalized catalog recommendations, location-based merchant discovery, and intelligent ad placement.

---

## 🎯 Core Features

### 1. **Catalog Browse System** (Zomato-like)
- Browse merchants by category (Restaurants, Salons, Clinics, Grocery, etc.)
- Each merchant has their catalog/menu
- Visual cards with images, ratings, distance, offers
- Filter by: distance, rating, price range, open now, delivery available

### 2. **Personalization Engine**
- Track user behavior (views, searches, orders)
- Analyze last 30-60 days history
- ML-based recommendations
- Interest profiling (food, health, services, etc.)

### 3. **Location Intelligence**
- Show nearby merchants (within 1-5km radius)
- "Open Near Me" feature
- Geofencing for hyper-local discovery
- Real-time distance calculation

### 4. **Ad Integration**
- Native ad slots between catalog cards
- Promoted merchant listings
- Third-party advertiser banners
- Revenue sharing model

---

## 📱 Screen-by-Screen Breakdown

### **SCREEN 1: Enhanced Home Feed** 
**Route:** `/(tabs)/index.tsx`

#### Current State
- Shows social posts, stories, locality news
- Has ad slots (AdSlot component)
- Basic feed with reactions/comments

#### New Implementation
```
┌─────────────────────────────────────┐
│  🏠 Lokul · HSR Layout         🔔   │
├─────────────────────────────────────┤
│  📍 Nearby Shops & Services         │
│  ┌──────┐  ┌──────┐  ┌──────┐      │
│  │ 🍕   │  │ 💇   │  │ 🛒   │      │
│  │ Food │  │Salon │  │Groc- │      │
│  │      │  │      │  │ ery  │  →   │
│  └──────┘  └──────┘  └──────┘      │
│                                      │
│  📰 Community Updates               │
│  [Social Post Card]                 │
│                                      │
│  🎯 Recommended For You             │
│  ┌────────────────────────────┐    │
│  │ 🖼️ [Merchant Image]        │    │
│  │ ⭐ Shah Medical            │    │
│  │ 4.8 · 200m · ₹₹           │    │
│  │ "10% off on first order"  │    │
│  └────────────────────────────┘    │
│                                      │
│  [Promoted Ad - Highlighted]       │
│                                      │
│  [Social Post Card]                 │
│                                      │
│  🔥 Popular Near You               │
│  [Horizontal Scroll - 3 merchants] │
│                                      │
│  [Social Post Card]                 │
└─────────────────────────────────────┘
```

#### Components to Build
1. **CategoryQuickNav** - Horizontal scrollable category chips
2. **RecommendedMerchantCard** - Personalized merchant card
3. **PopularNearbyCarousel** - Trending local merchants
4. **PromotedAdCard** - Highlighted promoted listings

#### Data Requirements
- Fetch merchants by proximity
- User's last 30 days activity
- Merchant ratings & offers
- Ad inventory for this user's location

#### API Endpoints Needed
```typescript
GET /api/mobile/catalog/nearby
  ?lat=12.9141&lng=77.6411&radius=2
  &categories=food,grocery,pharmacy

GET /api/mobile/catalog/recommended
  ?userId={userId}&days=30&limit=10

GET /api/mobile/ads/feed
  ?location={pinCode}&context=home_feed
```

---

### **SCREEN 2: Discover/Catalog Hub**
**Route:** `/(tabs)/explore.tsx` → Rename to **Catalog Tab**

#### Current State
- Module cards (Services, Carpool, etc.)
- Basic search
- Feature flag filtering

#### New Implementation
```
┌─────────────────────────────────────┐
│  🔍 [Search: "restaurants..."]  🎛️ │
├─────────────────────────────────────┤
│  📍 HSR Layout, Bangalore     [≡]   │
│                                      │
│  🍽️ Categories                      │
│  ┌──────┬──────┬──────┬──────┐     │
│  │ 🍕   │ 💇   │ 🏥   │ 🛒   │     │
│  │ Food │Salon │Clinic│Groc- │ →  │
│  │      │      │      │ ery  │     │
│  └──────┴──────┴──────┴──────┘     │
│                                      │
│  ⚡ Just For You                    │
│  ┌────────────────────────────┐    │
│  │ Based on your recent orders     │
│  │ ┌────┐ ┌────┐ ┌────┐           │
│  │ │[M] │ │[M] │ │[M] │     →     │
│  │ └────┘ └────┘ └────┘           │
│  └────────────────────────────┘    │
│                                      │
│  🔥 Trending Now (HSR Layout)      │
│  ┌─────────────────────────┐       │
│  │ 🖼️ Anand Tiffins        │       │
│  │ ⭐ 4.9 · 500m · ₹       │       │
│  │ 📦 Free delivery         │       │
│  └─────────────────────────┘       │
│  [2 more cards...]                  │
│                                      │
│  💰 Great Offers Near You          │
│  [Horizontal Scroll]                │
│                                      │
│  📢 Featured Listings [AD]         │
│  [Promoted merchant card]           │
│                                      │
│  🏪 All Merchants                  │
│  [Infinite scroll list]             │
└─────────────────────────────────────┘
```

#### Components to Build
1. **CategoryGrid** - 8-12 main categories
2. **JustForYouSection** - ML-based personalized merchants
3. **TrendingNearby** - Popularity + proximity algorithm
4. **OffersCarousel** - Active offers/coupons
5. **FeaturedAdCard** - Promoted listings
6. **MerchantListItem** - Standard merchant row

#### Key Features
- **Smart Search:** As-you-type with history
- **Advanced Filters:** Open now, rating, distance, price, cuisine
- **Sort Options:** Relevance, Distance, Rating, Price

#### API Endpoints Needed
```typescript
GET /api/mobile/catalog/categories
  ?pinCode=560102

GET /api/mobile/catalog/trending
  ?lat=12.9141&lng=77.6411&limit=10

GET /api/mobile/catalog/offers
  ?pinCode=560102&active=true

GET /api/mobile/catalog/merchants
  ?category=food&radius=5
  &openNow=true&minRating=4.0
  &sort=distance&page=1
```

---

### **SCREEN 3: Category Browse**
**New Route:** `/(catalog)/category/[slug].tsx`

#### Implementation
```
┌─────────────────────────────────────┐
│  ← 🍽️ Restaurants            🔍 ⚙️ │
├─────────────────────────────────────┤
│  📍 Within 3 km        [Change]     │
│                                      │
│  🔖 Filters                         │
│  ┌──────┬──────┬──────┬──────┐     │
│  │ 🟢   │ ⭐   │ 💸   │ 🥗   │     │
│  │ Open │ 4.5+ │ ₹₹  │ Veg  │ +   │
│  └──────┴──────┴──────┴──────┘     │
│                                      │
│  Sort: Distance ▼                   │
│                                      │
│  📌 Promoted                        │
│  ┌─────────────────────────┐ [AD]  │
│  │ 🖼️  Samrat Restaurant   │       │
│  │     ⭐ 4.6 · 1.2 km     │       │
│  │     🎁 50% off upto ₹100 │      │
│  └─────────────────────────┘       │
│                                      │
│  ┌─────────────────────────┐       │
│  │ 🖼️  Anand Tiffins       │       │
│  │     ⭐ 4.9 · 500m       │       │
│  │     ⏱️ 20-30 min        │       │
│  │     💰 ₹100 for two     │       │
│  └─────────────────────────┘       │
│                                      │
│  ┌─────────────────────────┐       │
│  │ 🖼️  RK Biriyani House   │       │
│  │     ⭐ 4.7 · 800m       │       │
│  │     🔥 Trending #3       │       │
│  └─────────────────────────┘       │
│                                      │
│  [Infinite scroll...]               │
└─────────────────────────────────────┘
```

#### Components to Build
1. **FilterChips** - Active filters with remove
2. **SortDropdown** - Distance, Rating, Price, Relevance
3. **PromotedMerchantCard** - Highlighted with [AD] badge
4. **MerchantCard** - Standard merchant listing
5. **QuickFiltersSheet** - Bottom sheet with all filters

#### Filter Options
- **Open Now:** Boolean
- **Distance:** 1km, 2km, 5km, 10km
- **Rating:** 4.0+, 4.5+, 4.8+
- **Price:** ₹, ₹₹, ₹₹₹
- **Cuisine (Food):** North Indian, South Indian, Chinese, etc.
- **Features:** Free Delivery, Offers, Fast Delivery

#### API Endpoint
```typescript
GET /api/mobile/catalog/category/{slug}
  ?lat=12.9141&lng=77.6411
  &radius=3&openNow=true&minRating=4.5
  &priceRange=1-2&features=free_delivery
  &sort=distance&page=1
```

---

### **SCREEN 4: Merchant Detail + Catalog**
**New Route:** `/(catalog)/merchant/[id].tsx`

#### Implementation
```
┌─────────────────────────────────────┐
│  ←                           ❤️ 📤  │
│  ┌─────────────────────────────────┐│
│  │  🖼️  [Hero Image]              ││
│  │                                 ││
│  └─────────────────────────────────┘│
│                                      │
│  ⭐ Shah Medical Store               │
│  ⭐⭐⭐⭐⭐ 4.8 (240 ratings)          │
│  📍 500m · HSR Sector 2             │
│  ⏱️ Typically delivers in 15-20 min │
│  💰 Free delivery above ₹299        │
│  🕐 Open now · Closes 10:00 PM      │
│                                      │
│  ┌──────────────────┐               │
│  │ 🎁 Welcome offer │               │
│  │ Get 10% off on first order      │
│  └──────────────────┘               │
│                                      │
│  📋 Menu / Catalog                  │
│  ┌──────┬──────┬──────┬──────┐     │
│  │ All  │ OTC  │ Pres-│ Baby │     │
│  │      │      │cript │      │  →  │
│  └──────┴──────┴──────┴──────┘     │
│                                      │
│  💊 Over the Counter                │
│  ┌─────────────────────────┐       │
│  │ Dolo 650                │  +    │
│  │ ₹15 · 10 tablets        │       │
│  └─────────────────────────┘       │
│                                      │
│  ┌─────────────────────────┐       │
│  │ Vicks Vaporub           │  +    │
│  │ ₹95 · 50ml jar          │       │
│  └─────────────────────────┘       │
│                                      │
│  [More items...]                    │
│                                      │
│  ⭐ Reviews (240)                   │
│  ┌─────────────────────────┐       │
│  │ 👤 Priya Sharma         │       │
│  │ ⭐⭐⭐⭐⭐ 2 days ago      │       │
│  │ "Quick delivery, genuine │       │
│  │  medicines"              │       │
│  └─────────────────────────┘       │
│                                      │
│  ℹ️ Info · Photos · About           │
└─────────────────────────────────────┘
│  🛒 Cart: 3 items · ₹240   [→]     │
└─────────────────────────────────────┘
```

#### Components to Build
1. **MerchantHeroSection** - Image, name, ratings, distance
2. **MerchantInfoBar** - Delivery time, fees, hours
3. **OfferBanner** - Active offers/coupons
4. **CatalogTabs** - Category navigation
5. **CatalogItemCard** - Product/menu item with add button
6. **ReviewsList** - User reviews
7. **StickyCartBar** - Bottom cart summary

#### Key Features
- **Add to Cart:** Smooth animation
- **Item Customization:** Variants, add-ons
- **Search in Catalog:** Find items quickly
- **Favorites:** Save for later

#### API Endpoints
```typescript
GET /api/mobile/merchant/{id}
  ?lat=12.9141&lng=77.6411

GET /api/mobile/merchant/{id}/catalog
  ?category=otc

GET /api/mobile/merchant/{id}/reviews
  ?page=1&sort=recent
```

---

### **SCREEN 5: Cart & Checkout**
**Route:** `/(catalog)/cart.tsx`

#### Implementation
```
┌─────────────────────────────────────┐
│  ← Cart                              │
├─────────────────────────────────────┤
│  🏪 Shah Medical Store               │
│                                      │
│  ┌─────────────────────────┐        │
│  │ Dolo 650         [- 2 +]│  ₹30  │
│  │ 10 tablets              │        │
│  └─────────────────────────┘        │
│                                      │
│  ┌─────────────────────────┐        │
│  │ Vicks Vaporub   [- 1 +]│  ₹95  │
│  │ 50ml jar                │        │
│  └─────────────────────────┘        │
│                                      │
│  🏷️ Apply Coupon           [>]      │
│                                      │
│  📍 Delivery Address                │
│  ┌─────────────────────────┐        │
│  │ 🏠 Home                 │  ✓    │
│  │ HSR Sector 2, #205      │        │
│  │ 500m from merchant      │        │
│  └─────────────────────────┘        │
│                                      │
│  💰 Bill Details                    │
│  Item total            ₹125         │
│  Delivery fee          ₹20          │
│  Discount             -₹13          │
│  ─────────────────────────          │
│  To Pay                ₹132         │
│                                      │
└─────────────────────────────────────┘
│  Place Order                    [→] │
└─────────────────────────────────────┘
```

#### Components to Build
1. **CartItemCard** - Quantity controls, remove
2. **CouponSelector** - Apply/remove coupons
3. **AddressSelector** - Choose/edit delivery address
4. **BillSummary** - Breakdown of charges
5. **PaymentMethods** - COD, UPI, Wallet

---

### **SCREEN 6: Personalized Feed (Core ML)**
**New Route:** `/(catalog)/for-you.tsx`

#### Implementation
```
┌─────────────────────────────────────┐
│  ← Just For You              ⚙️     │
├─────────────────────────────────────┤
│  Based on your activity in last 30  │
│  days and what's popular nearby     │
│                                      │
│  🎯 Because you ordered from        │
│     "Shah Medical"                  │
│  ┌─────────────────────────┐        │
│  │ 🖼️  Anil Medicals       │        │
│  │     ⭐ 4.7 · 600m       │        │
│  │     Similar medicines    │        │
│  └─────────────────────────┘        │
│                                      │
│  🔥 Trending in your area           │
│  ┌─────────────────────────┐        │
│  │ 🖼️  Kavita Beauty Studio│        │
│  │     ⭐ 4.9 · 1.2 km     │        │
│  │     50+ bookings today   │        │
│  └─────────────────────────┘        │
│                                      │
│  🥗 Your favorite cuisine           │
│  South Indian restaurants near you  │
│  [Horizontal scroll - 3 merchants]  │
│                                      │
│  📢 Promoted [AD]                   │
│  [Third-party advertiser]           │
│                                      │
│  💰 New offers you might like       │
│  [Horizontal scroll - offers]       │
│                                      │
│  🏪 Recently viewed                 │
│  [Grid of 4 merchants]              │
│                                      │
│  [Load more...]                     │
└─────────────────────────────────────┘
```

#### Personalization Algorithm
1. **User Activity Analysis:**
   - Recent searches (30 days)
   - Orders placed (60 days)
   - Merchants viewed (30 days)
   - Categories browsed (30 days)
   - Time spent on merchants/items

2. **Interest Profiling:**
   - Extract categories (food, health, beauty, grocery)
   - Identify preferences (veg/non-veg, price range)
   - Detect patterns (weekend dining, weekday grocery)

3. **Recommendation Logic:**
   ```
   Score = (
     similarityScore * 0.3 +
     proximityScore * 0.3 +
     popularityScore * 0.2 +
     recencyScore * 0.1 +
     offerScore * 0.1
   )
   ```

4. **Section Types:**
   - "Because you ordered from X"
   - "Trending in your area"
   - "Your favorite [category]"
   - "New offers you might like"
   - "Recently viewed"
   - "Frequently visited"
   - "Similar to your favorites"

#### API Endpoint
```typescript
GET /api/mobile/recommendations/personalized
  ?userId={userId}
  &lat=12.9141&lng=77.6411
  &days=30&limit=20
```

---

## 🗄️ Database Schema Changes

### New Tables

#### 1. **UserCatalogActivity**
Track user interactions for personalization

```prisma
model UserCatalogActivity {
  id            String   @id @default(cuid())
  userId        String
  merchantId    String?
  catalogItemId String?
  category      String?
  activityType  CatalogActivityType // view, search, order, favorite
  durationSec   Int?     // Time spent
  metadata      Json?    // { searchQuery, filters applied, etc. }
  lat           Float?
  lng           Float?
  createdAt     DateTime @default(now())

  user         User                 @relation(fields: [userId], references: [id])
  merchant     Merchant?            @relation(fields: [merchantId], references: [id])
  catalogItem  MerchantCatalogItem? @relation(fields: [catalogItemId], references: [id])

  @@index([userId, createdAt])
  @@index([userId, activityType])
  @@index([merchantId])
  @@index([category])
}

enum CatalogActivityType {
  view_merchant
  view_catalog_item
  search
  order_placed
  add_to_cart
  favorite
  share
}
```

#### 2. **UserInterestProfile**
Computed interest profile for faster recommendations

```prisma
model UserInterestProfile {
  id                   String   @id @default(cuid())
  userId               String   @unique
  topCategories        Json     // ["food", "pharmacy", "salon"]
  preferredPriceRange  String?  // "budget", "mid", "premium"
  avgOrderFrequency    Int?     // Orders per month
  favoriteTimeSlots    Json?    // ["morning", "evening"]
  dietaryPreferences   Json?    // ["veg", "jain"]
  lastUpdated          DateTime @default(now()) @updatedAt
  
  user User @relation(fields: [userId], references: [id])
}
```

#### 3. **PromotedListing**
Track promoted/sponsored merchants

```prisma
model PromotedListing {
  id              String   @id @default(cuid())
  merchantId      String?
  advertiserId    String?  // Third-party advertiser
  title           String
  description     String?
  imageUrl        String?
  targetUrl       String?  // Deep link or external
  placementType   PromotedPlacementType
  targetLocations String[] // PinCodes
  targetCategories String[] // ["food", "pharmacy"]
  budgetPaise     Int
  spentPaise      Int      @default(0)
  impressions     Int      @default(0)
  clicks          Int      @default(0)
  startsAt        DateTime
  endsAt          DateTime
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  
  merchant    Merchant?   @relation(fields: [merchantId], references: [id])
  advertiser  Advertiser? @relation(fields: [advertiserId], references: [id])

  @@index([placementType, isActive])
  @@index([targetLocations])
}

enum PromotedPlacementType {
  home_feed
  catalog_hub
  category_listing
  search_results
  merchant_detail
}
```

#### 4. **AdImpression**
Track ad views and clicks

```prisma
model AdImpression {
  id              String   @id @default(cuid())
  promotedListingId String
  userId          String?
  action          AdAction // view | click
  lat             Float?
  lng             Float?
  deviceInfo      Json?
  createdAt       DateTime @default(now())

  promotedListing PromotedListing @relation(fields: [promotedListingId], references: [id])
  user            User?           @relation(fields: [userId], references: [id])

  @@index([promotedListingId, action])
  @@index([userId])
  @@index([createdAt])
}

enum AdAction {
  view
  click
}
```

#### 5. **MerchantCatalogCategory**
Hierarchical categories for better organization

```prisma
model MerchantCatalogCategory {
  id          String   @id @default(cuid())
  slug        String   @unique
  name        String
  description String?
  iconName    String?  // Lucide icon name
  parentId    String?  // For subcategories
  sortOrder   Int      @default(0)
  isActive    Boolean  @default(true)
  
  parent   MerchantCatalogCategory?  @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children MerchantCatalogCategory[] @relation("CategoryHierarchy")
}
```

---

## 🔧 API Endpoints to Build

### 1. Catalog Discovery
```typescript
// Get nearby merchants by category
GET /api/mobile/catalog/nearby
  ?lat=12.9141&lng=77.6411&radius=5
  &category=food&openNow=true
  &minRating=4.0&sort=distance

// Get trending merchants
GET /api/mobile/catalog/trending
  ?pinCode=560102&limit=10

// Get merchants with active offers
GET /api/mobile/catalog/offers
  ?lat=12.9141&lng=77.6411&radius=5

// Search merchants and catalog items
GET /api/mobile/catalog/search
  ?q=dolo&pinCode=560102
  &type=all  // merchant | item | all
```

### 2. Personalized Recommendations
```typescript
// Get personalized feed
GET /api/mobile/recommendations/personalized
  ?userId={userId}&days=30&limit=20

// Get "because you ordered from X" suggestions
GET /api/mobile/recommendations/similar
  ?merchantId={merchantId}&limit=5

// Get category-based suggestions
GET /api/mobile/recommendations/category
  ?userId={userId}&category=food&limit=10
```

### 3. Merchant & Catalog
```typescript
// Get merchant details
GET /api/mobile/merchant/{id}
  ?lat=12.9141&lng=77.6411

// Get merchant catalog
GET /api/mobile/merchant/{id}/catalog
  ?category=starters

// Get merchant reviews
GET /api/mobile/merchant/{id}/reviews
  ?page=1&sort=recent
```

### 4. Activity Tracking
```typescript
// Track user activity (non-blocking)
POST /api/mobile/catalog/track
Body: {
  activityType: "view_merchant",
  merchantId: "...",
  durationSec: 45,
  metadata: { source: "home_feed" }
}

// Update interest profile (background job)
POST /api/mobile/recommendations/update-profile
Body: { userId: "..." }
```

### 5. Ads & Promotions
```typescript
// Get promoted listings for placement
GET /api/mobile/ads/promoted
  ?placement=home_feed
  &pinCode=560102&limit=3

// Track ad impression/click
POST /api/mobile/ads/track
Body: {
  promotedListingId: "...",
  action: "click"
}
```

### 6. Cart & Orders
```typescript
// Add to cart
POST /api/mobile/cart/add
Body: {
  merchantId: "...",
  catalogItemId: "...",
  quantity: 2
}

// Get cart
GET /api/mobile/cart

// Place order
POST /api/mobile/orders/place
Body: { merchantId, items[], deliveryAddress, paymentMethod }
```

---

## 🎨 Component Library

### Shared Components

#### 1. **MerchantCard**
```tsx
<MerchantCard
  id="123"
  name="Shah Medical"
  imageUrl="..."
  rating={4.8}
  ratingCount={240}
  distance={500}  // meters
  category="Pharmacy"
  tags={["Free Delivery", "10% Off"]}
  isPromoted={false}
  onPress={() => router.push(`/(catalog)/merchant/${id}`)}
/>
```

#### 2. **CatalogItemCard**
```tsx
<CatalogItemCard
  id="456"
  name="Dolo 650"
  description="10 tablets"
  pricePaise={1500}
  imageUrl="..."
  isVeg={false}
  isAvailable={true}
  onAdd={() => addToCart(id)}
  quantity={cartQuantity}
/>
```

#### 3. **CategoryChip**
```tsx
<CategoryChip
  slug="food"
  icon={<UtensilsCrossed />}
  label="Food"
  isActive={selectedCategory === "food"}
  onPress={() => setSelectedCategory("food")}
/>
```

#### 4. **PromotedAdCard**
```tsx
<PromotedAdCard
  listing={promotedListing}
  placement="home_feed"
  onView={() => trackImpression("view")}
  onPress={() => {
    trackImpression("click");
    navigate(listing.targetUrl);
  }}
/>
```

#### 5. **RecommendationSection**
```tsx
<RecommendationSection
  title="Because you ordered from Shah Medical"
  reason="similar_merchant"
  merchants={[...]}
  layout="horizontal"  // horizontal | grid | list
/>
```

---

## 🧠 Recommendation Algorithm Details

### Step 1: Data Collection
Track these events in `UserCatalogActivity`:
- Merchant page views (with duration)
- Catalog item views
- Search queries
- Add to cart
- Orders placed
- Favorites/bookmarks
- Share actions

### Step 2: Interest Profile Computation
Run nightly job to compute `UserInterestProfile`:

```typescript
async function computeUserInterestProfile(userId: string) {
  const activities = await prisma.userCatalogActivity.findMany({
    where: {
      userId,
      createdAt: { gte: dayjs().subtract(60, 'days').toDate() }
    }
  });

  // Category affinity
  const categoryScores = {};
  activities.forEach(a => {
    if (a.category) {
      categoryScores[a.category] = (categoryScores[a.category] || 0) + 1;
    }
  });
  const topCategories = Object.entries(categoryScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([cat]) => cat);

  // Price range analysis
  const orders = activities.filter(a => a.activityType === 'order_placed');
  const avgOrderValue = calculateAvgOrderValue(orders);
  const preferredPriceRange = categorizePriceRange(avgOrderValue);

  // Order frequency
  const orderCount = orders.length;
  const avgOrderFrequency = orderCount / 2; // per month

  // Time slot analysis
  const hourlyDistribution = orders.reduce((acc, o) => {
    const hour = new Date(o.createdAt).getHours();
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {});
  const favoriteTimeSlots = identifyPeakTimeSlots(hourlyDistribution);

  await prisma.userInterestProfile.upsert({
    where: { userId },
    create: { userId, topCategories, preferredPriceRange, avgOrderFrequency, favoriteTimeSlots },
    update: { topCategories, preferredPriceRange, avgOrderFrequency, favoriteTimeSlots }
  });
}
```

### Step 3: Real-time Recommendations
When user opens "For You" feed:

```typescript
async function getPersonalizedRecommendations(userId: string, lat: number, lng: number) {
  const profile = await prisma.userInterestProfile.findUnique({ where: { userId } });
  const recentActivity = await getRecentActivity(userId, 30); // last 30 days
  
  const recommendations = [];

  // 1. "Because you ordered from X"
  const lastOrder = recentActivity.find(a => a.activityType === 'order_placed');
  if (lastOrder?.merchantId) {
    const similar = await findSimilarMerchants(lastOrder.merchantId, lat, lng);
    recommendations.push({
      title: `Because you ordered from ${lastOrder.merchant.name}`,
      reason: 'similar_merchant',
      merchants: similar
    });
  }

  // 2. "Trending in your area"
  const trending = await getTrendingMerchants(lat, lng, profile.topCategories);
  recommendations.push({
    title: 'Trending in your area',
    reason: 'trending',
    merchants: trending
  });

  // 3. "Your favorite [category]"
  if (profile.topCategories.length > 0) {
    const favCategory = profile.topCategories[0];
    const categoryMerchants = await getMerchantsByCategory(favCategory, lat, lng);
    recommendations.push({
      title: `Your favorite: ${favCategory}`,
      reason: 'favorite_category',
      merchants: categoryMerchants
    });
  }

  // 4. "Recently viewed"
  const recentlyViewed = recentActivity
    .filter(a => a.activityType === 'view_merchant')
    .slice(0, 10);
  if (recentlyViewed.length > 0) {
    recommendations.push({
      title: 'Recently viewed',
      reason: 'recently_viewed',
      merchants: await getMerchantsByIds(recentlyViewed.map(a => a.merchantId))
    });
  }

  // 5. "New offers you might like"
  const offers = await getMerchantsWithOffers(lat, lng, profile.topCategories);
  if (offers.length > 0) {
    recommendations.push({
      title: 'New offers you might like',
      reason: 'offers',
      merchants: offers
    });
  }

  return recommendations;
}
```

### Step 4: Scoring Algorithm
Score each merchant for relevance:

```typescript
function scoreMerchant(
  merchant: Merchant,
  userLat: number,
  userLng: number,
  profile: UserInterestProfile,
  recentActivity: UserCatalogActivity[]
) {
  // 1. Similarity Score (0-1)
  const categoryMatch = profile.topCategories.includes(merchant.category);
  const similarityScore = categoryMatch ? 1 : 0.3;

  // 2. Proximity Score (0-1)
  const distanceKm = calculateDistance(userLat, userLng, merchant.lat, merchant.lng);
  const proximityScore = Math.max(0, 1 - (distanceKm / 10)); // 10km = 0 score

  // 3. Popularity Score (0-1)
  const popularityScore = Math.min(1, (merchant.ratingAvg ?? 0) / 5);

  // 4. Recency Score (0-1)
  const lastInteraction = recentActivity.find(a => a.merchantId === merchant.id);
  const daysAgo = lastInteraction 
    ? dayjs().diff(dayjs(lastInteraction.createdAt), 'days')
    : 999;
  const recencyScore = Math.max(0, 1 - (daysAgo / 30));

  // 5. Offer Score (0-1)
  const hasOffer = merchant.offers.some(o => o.isActive && new Date(o.endsAt) > new Date());
  const offerScore = hasOffer ? 1 : 0;

  // Weighted average
  return (
    similarityScore * 0.3 +
    proximityScore * 0.3 +
    popularityScore * 0.2 +
    recencyScore * 0.1 +
    offerScore * 0.1
  );
}
```

---

## 💰 Ad Integration Strategy

### Ad Placement Locations

1. **Home Feed**
   - Every 5th item in feed
   - Native card format
   - Labeled "[Promoted]"

2. **Catalog Hub**
   - Top banner (above categories)
   - Between "Trending" and "Offers" sections
   - Bottom banner

3. **Category Listings**
   - 1st position (highlighted)
   - Every 10th merchant

4. **Search Results**
   - Top 2 results marked "[Ad]"

5. **Merchant Detail**
   - Related ads at bottom
   - "Similar merchants" section

### Ad Types

#### 1. **Local Merchant Promotion**
- Merchant pays to boost visibility
- ₹500-2000/month per placement
- Targeted by location + category

#### 2. **Third-Party Advertisers**
- E-commerce (Amazon, Flipkart)
- Fintech (Paytm, PhonePe)
- Insurance, Education, etc.
- CPM or CPC model

#### 3. **Platform Promotions**
- Feature launches
- Referral campaigns
- Cross-sell other modules

### Revenue Model

```typescript
// Merchant promotion pricing
const PROMOTION_PRICING = {
  home_feed: 2000,        // ₹2000/month
  category_top: 1500,     // ₹1500/month
  search_results: 1000,   // ₹1000/month
};

// Third-party ads
const AD_RATES = {
  cpm: 50,  // ₹50 per 1000 impressions
  cpc: 5,   // ₹5 per click
};
```

### Ad Rotation Logic

```typescript
async function getPromotedListingsForPlacement(
  placement: PromotedPlacementType,
  pinCode: string,
  category?: string
) {
  const now = new Date();
  
  const listings = await prisma.promotedListing.findMany({
    where: {
      placementType: placement,
      isActive: true,
      startsAt: { lte: now },
      endsAt: { gte: now },
      targetLocations: { has: pinCode },
      ...(category && { targetCategories: { has: category } }),
      budgetPaise: { gt: prisma.promotedListing.fields.spentPaise }
    },
    orderBy: [
      { impressions: 'asc' },  // Rotate evenly
      { createdAt: 'desc' }
    ],
    take: 3
  });

  return listings;
}
```

---

## 📊 Analytics & Tracking

### Events to Track

1. **User Actions**
   - Screen views
   - Search queries
   - Filter applications
   - Merchant views
   - Catalog item views
   - Add to cart
   - Order placed
   - Review submitted

2. **Performance Metrics**
   - Conversion rate (view → order)
   - Average order value
   - Cart abandonment rate
   - Search success rate
   - Popular categories
   - Peak order times

3. **Ad Metrics**
   - Impressions
   - Click-through rate (CTR)
   - Cost per click (CPC)
   - Return on ad spend (ROAS)

### Dashboard for Merchants
Show merchants their performance:
- Total views
- Orders received
- Revenue
- Top selling items
- Customer reviews
- Ad campaign performance (if promoted)

---

## 🚀 Implementation Phases

### **Phase 1: Foundation** (Week 1-2)
- ✅ Database schema updates
- ✅ Migration scripts
- ✅ Core API endpoints (nearby, trending, search)
- ✅ Basic activity tracking

### **Phase 2: Catalog Hub** (Week 3-4)
- ✅ Category grid UI
- ✅ Merchant listing screens
- ✅ Filters and sorting
- ✅ Merchant detail page
- ✅ Catalog items display

### **Phase 3: Cart & Orders** (Week 5-6)
- ✅ Cart management
- ✅ Checkout flow
- ✅ Order placement API
- ✅ Order tracking

### **Phase 4: Personalization** (Week 7-8)
- ✅ Interest profiling algorithm
- ✅ Recommendation engine
- ✅ "For You" feed
- ✅ Activity tracking improvements

### **Phase 5: Ad Integration** (Week 9-10)
- ✅ Promoted listings system
- ✅ Ad placement logic
- ✅ Impression/click tracking
- ✅ Merchant promotion portal

### **Phase 6: Polish & Optimize** (Week 11-12)
- ✅ Performance optimization
- ✅ Caching strategy
- ✅ Analytics dashboard
- ✅ A/B testing setup
- ✅ Beta launch

---

## 🎯 Success Metrics

### User Engagement
- **Daily Active Users (DAU):** Target 5,000
- **Session Duration:** Target 10 min/session
- **Return Rate:** Target 40% D7 retention

### Business Metrics
- **Orders Per Day:** Target 500
- **Average Order Value:** Target ₹300
- **Merchant Sign-ups:** Target 1,000 merchants

### Personalization Effectiveness
- **Click-through Rate (CTR):** Target 15% on recommendations
- **Conversion Rate:** Target 8% (view → order)
- **Recommendation Accuracy:** Target 70%+ relevance score

### Ad Performance
- **Ad CTR:** Target 2-3%
- **Ad Revenue:** Target ₹50,000/month
- **Merchant Promotion Adoption:** Target 20% of merchants

---

## 🛠️ Technical Stack

### Mobile App
- **Framework:** Expo / React Native
- **State Management:** Zustand
- **API Client:** React Query
- **Maps:** Google Maps / Mapbox
- **Analytics:** Mixpanel / Firebase Analytics

### Backend
- **Runtime:** Node.js (Next.js API routes)
- **Database:** PostgreSQL (Prisma ORM)
- **Caching:** Redis
- **Background Jobs:** Bull/BullMQ
- **Search:** Elasticsearch (future)

### ML/Recommendations
- **Collaborative Filtering:** User-item matrix
- **Content-Based:** TF-IDF on merchant descriptions
- **Hybrid Approach:** Weighted combination
- **Tools:** Python (scikit-learn) or TensorFlow Recommenders

---

## 🔐 Security & Privacy

### User Data
- Activity tracking opt-out option
- GDPR compliance (data export, deletion)
- Anonymized analytics where possible

### Merchant Data
- Secure API keys for integrations
- Rate limiting on catalog APIs
- Protection against scraping

### Payment Security
- PCI DSS compliance
- Tokenized payments
- Fraud detection

---

## 📝 Next Steps

1. **Review this plan** - Validate with stakeholders
2. **Prioritize features** - MVP vs. nice-to-have
3. **Assign tasks** - Frontend, backend, ML teams
4. **Set milestones** - Weekly check-ins
5. **Start with Phase 1** - Database + basic APIs
6. **Iterate rapidly** - Ship early, get feedback

---

**Ready to start implementation?** 🚀

Let me know which phase you want to begin with, and I'll start building the components!
