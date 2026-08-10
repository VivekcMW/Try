# 📱 Home Screen Redesign: Detailed Wireframes & Component Specs

**Version**: 1.0  
**Last Updated**: August 11, 2026  
**Status**: Proposal / Design Phase

---

## 🎨 Complete Screen Layout

### Mobile Layout (375px width reference)
```
┌─────────────────────────────────────┐
│ SECTION 1: HEADER (72px)            │ ← Sticky
│ ├─ Location + Cart + Notifications  │
│ └─ Search bar                        │
├─────────────────────────────────────┤
│ SECTION 2: CATEGORY PILLS (64px)    │ ← Sticky
│ └─ Horizontal scrolling icons        │
├─────────────────────────────────────┤
│ ▼ SCROLLABLE CONTENT BELOW ▼        │
├─────────────────────────────────────┤
│ SECTION 3: QUICK ACTIONS (Optional) │
│ └─ Wallet balance, Recharge, etc.   │
├─────────────────────────────────────┤
│ SECTION 4: ORDER AGAIN (if history) │
│ └─ Last ordered items with [Add]    │
├─────────────────────────────────────┤
│ SECTION 5: PROMO CAROUSEL (180px)   │
│ └─ Auto-scrolling offer banners     │
├─────────────────────────────────────┤
│ SECTION 6: MERCHANT SPOTLIGHT       │
│ ├─ Section title + "View all" →     │
│ └─ Horizontal scroll merchant cards │
├─────────────────────────────────────┤
│ SECTION 7: PRODUCT QUICK ADD        │
│ ├─ Section title + "View all" →     │
│ └─ 2-column product grid            │
├─────────────────────────────────────┤
│ SECTION 8: FEATURED COLLECTIONS     │
│ └─ "Breakfast Combos", "Tea Time"   │
├─────────────────────────────────────┤
│ SECTION 9: COMMUNITY FEED           │
│ ├─ "What's happening"               │
│ └─ Condensed post cards             │
├─────────────────────────────────────┤
│ SECTION 10: FOOTER (80px)           │
│ └─ App info, version, links         │
└─────────────────────────────────────┘
│ STICKY CART BAR (56px)              │ ← Overlays content
│ └─ [3 items · ₹245] [Checkout →]   │
└─────────────────────────────────────┘
```

---

## 📐 Section 1: Header (Sticky)

### Layout Specs
```
┌───────────────────────────────────────┐
│ Row 1 (40px):                         │
│ ┌─────────────────────┬─────┬─────┐  │
│ │ 📍 Tower B-302      │ 🛒³ │ 🔔⁵ │  │
│ │ ▼ Change            │     │     │  │
│ └─────────────────────┴─────┴─────┘  │
│ Row 2 (44px + 8px margin):            │
│ ┌─────────────────────────────────┐  │
│ │ 🔍 Search food, groceries...    │  │
│ └─────────────────────────────────┘  │
└───────────────────────────────────────┘
Total Height: 72px (40 + 44 + 8)
Background: White (light mode) / Dark (dark mode)
Shadow: elevation 2dp on scroll
```

### Component Code
```typescript
interface HeaderProps {
  location: {
    label: string;        // "Tower B-302"
    subLabel?: string;    // "HSR Layout, Bangalore"
  };
  cartCount: number;
  notificationCount: number;
  onLocationPress: () => void;
  onCartPress: () => void;
  onNotificationPress: () => void;
  onSearchPress: () => void;
}

// Styles
const headerStyles = {
  container: {
    backgroundColor: colors.surface.background,
    paddingHorizontal: spacing[4],     // 16px
    paddingTop: spacing[3],            // 12px
    paddingBottom: spacing[2],         // 8px
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    marginBottom: spacing[2],          // 8px
  },
  locationButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1.5],                 // 6px
  },
  locationText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.surface.heading,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface.surfaceMuted,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.semantic.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  searchBar: {
    height: 44,
    backgroundColor: colors.surface.surfaceMuted,
    borderRadius: radius.full,
    paddingHorizontal: spacing[4],     // 16px
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2.5],                 // 10px
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.surface.heading,
  },
};
```

---

## 📐 Section 2: Category Pills (Sticky)

### Layout Specs
```
┌───────────────────────────────────────┐
│ [🍕Food][🛒Grocery][💊Pharmacy]     │ ← Scrollable
│ [🚗Ride][📦Delivery][➕More]        │
└───────────────────────────────────────┘
Height: 64px (48px pill + 16px padding)
Background: White with bottom shadow on scroll
```

### Component Code
```typescript
interface Category {
  id: string;
  icon: string;          // Emoji or Lucide icon name
  label: string;
  color: string;         // For active state
  route: string;
}

const categories: Category[] = [
  { id: 'food', icon: '🍕', label: 'Food', color: '#EF4444', route: '/(discover)/catalog?category=food' },
  { id: 'grocery', icon: '🛒', label: 'Grocery', color: '#10B981', route: '/(discover)/catalog?category=grocery' },
  { id: 'pharmacy', icon: '💊', label: 'Pharmacy', color: '#3B82F6', route: '/(discover)/catalog?category=pharmacy' },
  { id: 'ride', icon: '🚗', label: 'Ride', color: '#F59E0B', route: '/(services)/ride' },
  { id: 'delivery', icon: '📦', label: 'Delivery', color: '#8B5CF6', route: '/(services)/delivery' },
  { id: 'more', icon: '➕', label: 'More', color: '#6B7280', route: '/(services)/all' },
];

const categoryStyles = {
  container: {
    paddingHorizontal: spacing[4],     // 16px
    paddingVertical: spacing[2],       // 8px
    backgroundColor: colors.surface.background,
  },
  scrollContent: {
    gap: spacing[2],                   // 8px
  },
  pill: {
    height: 48,
    paddingHorizontal: spacing[4],     // 16px
    borderRadius: radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1.5],                 // 6px
    backgroundColor: colors.surface.surfaceMuted,
  },
  pillActive: {
    backgroundColor: colors.brand[600],
  },
  icon: {
    fontSize: 20,                      // Emoji size
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.surface.heading,
  },
  labelActive: {
    color: '#fff',
  },
};
```

---

## 📐 Section 4: Order Again

### Layout Specs
```
┌───────────────────────────────────────┐
│ ⚡ ORDER AGAIN                        │ ← Section title
│ ┌─────────────────────────────────┐  │
│ │ 🥛 Amul Milk · 500ml           │  │
│ │ ₹60              [+Add]        │  │
│ └─────────────────────────────────┘  │
│ ┌─────────────────────────────────┐  │
│ │ 🍞 Britannia Bread · 400g      │  │
│ │ ₹40              [+Add]        │  │
│ └─────────────────────────────────┘  │
└───────────────────────────────────────┘
Card Height: 64px each
Gap: 8px between cards
```

### Component Code
```typescript
interface OrderAgainItem {
  id: string;
  productId: string;
  name: string;
  unit: string;
  price: number;
  image: string;
  merchantId: string;
  lastOrderedAt: string;
}

const orderAgainStyles = {
  section: {
    paddingHorizontal: spacing[4],     // 16px
    paddingVertical: spacing[4],       // 16px
    gap: spacing[2],                   // 8px
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.surface.heading,
    marginBottom: spacing[2],          // 8px
  },
  card: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[3],               // 12px
    backgroundColor: colors.surface.background,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.surface.border,
    gap: spacing[3],                   // 12px
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
  },
  info: {
    flex: 1,
    gap: spacing[0.5],                 // 2px
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.surface.heading,
  },
  meta: {
    fontSize: 12,
    color: colors.surface.textSecondary,
  },
  addButton: {
    paddingHorizontal: spacing[3],     // 12px
    paddingVertical: spacing[1.5],     // 6px
    backgroundColor: colors.brand[600],
    borderRadius: radius.md,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
};
```

---

## 📐 Section 5: Promo Carousel

### Layout Specs
```
┌───────────────────────────────────────┐
│ 🎨 [===============================] │
│    │    FLAT 50% OFF ON DAIRY     │  │
│    │    Use code: DAIRY50         │  │
│    [===============================]  │
└───────────────────────────────────────┘
Height: 180px
Width: Full screen width - 32px margins
Auto-scroll: 5 second interval
Indicators: Dots at bottom
```

### Component Code
```typescript
interface PromoSlide {
  id: string;
  image: string;
  title: string;
  subtitle?: string;
  cta?: {
    label: string;
    action: string;        // Deep link or route
  };
  backgroundColor: string;
  textColor: string;
}

const promoStyles = {
  container: {
    height: 180,
    marginBottom: spacing[4],          // 16px
  },
  scrollView: {
    paddingHorizontal: spacing[4],     // 16px
  },
  slide: {
    width: SCREEN_WIDTH - 32,
    height: 180,
    borderRadius: radius.xl,
    overflow: 'hidden',
    marginRight: spacing[3],           // 12px gap between slides
  },
  slideImage: {
    width: '100%',
    height: '100%',
  },
  slideOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing[4],               // 16px
    background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
  },
  slideTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: spacing[1],          // 4px
  },
  slideSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing[1.5],                 // 6px
    marginTop: spacing[2],             // 8px
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surface.border,
  },
  dotActive: {
    width: 20,
    backgroundColor: colors.brand[600],
  },
};
```

---

## 📐 Section 6: Merchant Spotlight

### Layout Specs
```
┌───────────────────────────────────────┐
│ 🏪 NEARBY & OPEN NOW    [View all →] │
│ ┌──────────┬──────────┬──────────┐   │ ← Horizontal
│ │┌────────┐│┌────────┐│┌────────┐│   │   scroll
│ ││ Photo  ││ Photo  ││ Photo  ││   │
│ │└────────┘│└────────┘│└────────┘│   │
│ │Amul Shop │Big Basket│Local Med│   │
│ │⭐4.5·25m│⭐4.2·30m │⭐4.8·15m│   │
│ │🏷️20% off│Free del. │Verified │   │
│ │[View→]  │[View→]   │[View→]  │   │
│ └──────────┴──────────┴──────────┘   │
└───────────────────────────────────────┘
Card Width: 280px
Card Height: 220px
Gap: 12px between cards
```

### Component Code
```typescript
interface Merchant {
  id: string;
  name: string;
  image: string;
  category: string;
  rating: number;
  reviewCount: number;
  deliveryTime: number;      // minutes
  deliveryFee: number;
  minOrder: number;
  offers?: string[];
  tags: string[];            // ["Verified", "Fast delivery"]
  isOpen: boolean;
  distance: number;          // km
}

const merchantStyles = {
  section: {
    paddingVertical: spacing[4],       // 16px
    gap: spacing[3],                   // 12px
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],     // 16px
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.surface.heading,
  },
  viewAll: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.brand[600],
  },
  scrollView: {
    paddingHorizontal: spacing[4],     // 16px
  },
  card: {
    width: 280,
    height: 220,
    marginRight: spacing[3],           // 12px
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.surface.background,
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  imageContainer: {
    height: 120,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[0.5],                 // 2px
    paddingHorizontal: spacing[2],     // 8px
    paddingVertical: spacing[1],       // 4px
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: radius.md,
  },
  offerBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: spacing[2],     // 8px
    paddingVertical: spacing[1],       // 4px
    backgroundColor: colors.semantic.warning,
    borderRadius: radius.md,
  },
  content: {
    padding: spacing[3],               // 12px
    gap: spacing[1.5],                 // 6px
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.surface.heading,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],                   // 8px
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],                   // 4px
  },
  metaText: {
    fontSize: 12,
    color: colors.surface.textSecondary,
  },
  ctaButton: {
    marginTop: spacing[1],             // 4px
    paddingVertical: spacing[2],       // 8px
    backgroundColor: colors.brand[600],
    borderRadius: radius.md,
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
};
```

---

## 📐 Section 7: Product Quick Add

### Layout Specs
```
┌───────────────────────────────────────┐
│ ⚡ DAILY ESSENTIALS      [View all →] │
│ ┌──────────┬──────────┐              │ ← 2 columns
│ │ ┌──────┐ │ ┌──────┐ │              │
│ │ │ Milk │ │ │Bread │ │              │
│ │ └──────┘ │ └──────┘ │              │
│ │ Amul Milk│ Britann. │              │
│ │ 500ml    │ 400g     │              │
│ │ ₹60      │ ₹40      │              │
│ │   [+]    │   [+]    │              │
│ └──────────┴──────────┘              │
│ ┌──────────┬──────────┐              │
│ │ Tea      │ Sugar    │              │
│ │ ...      │ ...      │              │
│ └──────────┴──────────┘              │
└───────────────────────────────────────┘
Card Size: (Screen width - 48px) / 2
Card Height: Auto (min 200px)
Gap: 12px between cards
```

### Component Code
```typescript
interface Product {
  id: string;
  name: string;
  image: string;
  unit: string;              // "500ml", "1kg"
  price: number;
  mrp?: number;              // Original price if discounted
  discount?: number;         // Percentage
  inStock: boolean;
  merchant: {
    id: string;
    name: string;
  };
  tags?: string[];           // ["Bestseller", "Fresh"]
}

const productStyles = {
  section: {
    paddingVertical: spacing[4],       // 16px
    gap: spacing[3],                   // 12px
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],     // 16px
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing[4],     // 16px
    gap: spacing[3],                   // 12px
  },
  card: {
    width: (SCREEN_WIDTH - 48) / 2,    // 2 columns with gaps
    backgroundColor: colors.surface.background,
    borderRadius: radius.lg,
    padding: spacing[3],               // 12px
    gap: spacing[2],                   // 8px
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.surface.surfaceMuted,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: spacing[1.5],   // 6px
    paddingVertical: spacing[0.5],     // 2px
    backgroundColor: colors.semantic.success,
    borderRadius: radius.sm,
  },
  discountText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.surface.heading,
    numberOfLines: 2,
  },
  unit: {
    fontSize: 12,
    color: colors.surface.textSecondary,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1.5],                 // 6px
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.surface.heading,
  },
  mrp: {
    fontSize: 12,
    color: colors.surface.textSecondary,
    textDecorationLine: 'line-through',
  },
  addButton: {
    height: 36,
    backgroundColor: colors.brand[600],
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing[1],             // 4px
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  outOfStock: {
    opacity: 0.5,
  },
  outOfStockButton: {
    backgroundColor: colors.surface.surfaceMuted,
  },
  outOfStockText: {
    color: colors.surface.textSecondary,
  },
};
```

---

## 📐 Section 9: Community Feed (Condensed)

### Layout Specs
```
┌───────────────────────────────────────┐
│ 💬 WHAT'S HAPPENING      [View all →] │
│ ┌─────────────────────────────────┐  │
│ │ 🧑 RWA Admin · 2h ago          │  │
│ │ Water tank cleaning tomorrow... │  │
│ │ ❤️ 12  💬 3                    │  │
│ └─────────────────────────────────┘  │
│ ┌─────────────────────────────────┐  │
│ │ 👤 Amit Sharma · 5h ago        │  │
│ │ Found lost keys near gate 2... │  │
│ │ 👍 8  💬 1                     │  │
│ └─────────────────────────────────┘  │
└───────────────────────────────────────┘
Card Height: 80px (condensed from 200px)
Show max 3 posts, then "View all" button
```

### Component Code
```typescript
const condensedPostStyles = {
  section: {
    paddingVertical: spacing[4],       // 16px
    gap: spacing[2],                   // 8px
  },
  card: {
    marginHorizontal: spacing[4],      // 16px
    padding: spacing[3],               // 12px
    backgroundColor: colors.surface.background,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.surface.border,
    gap: spacing[2],                   // 8px
    minHeight: 80,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],                   // 8px
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.surface.heading,
  },
  timestamp: {
    fontSize: 12,
    color: colors.surface.textSecondary,
  },
  body: {
    fontSize: 14,
    color: colors.surface.foreground,
    numberOfLines: 2,                  // Max 2 lines
  },
  footer: {
    flexDirection: 'row',
    gap: spacing[4],                   // 16px
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],                   // 4px
  },
  statText: {
    fontSize: 12,
    color: colors.surface.textSecondary,
  },
};
```

---

## 📐 Sticky Cart Bar (Overlay)

### Layout Specs
```
┌───────────────────────────────────────┐
│ 🛒 3 items · ₹245        [Checkout] │
└───────────────────────────────────────┘
Height: 56px
Position: Fixed bottom (above tab bar)
Animation: Slide up on item add, pulse on update
```

### Component Code
```typescript
interface CartBarProps {
  itemCount: number;
  totalAmount: number;
  onCheckout: () => void;
}

const cartBarStyles = {
  container: {
    position: 'absolute',
    bottom: 64,                        // Above tab bar (56px tab + 8px gap)
    left: spacing[4],                  // 16px
    right: spacing[4],                 // 16px
    height: 56,
    backgroundColor: colors.brand[600],
    borderRadius: radius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],     // 16px
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],                   // 8px
  },
  itemCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  checkoutButton: {
    paddingHorizontal: spacing[4],     // 16px
    paddingVertical: spacing[2],       // 8px
    backgroundColor: '#fff',
    borderRadius: radius.lg,
  },
  checkoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.brand[600],
  },
};

// Animation code
const animatedValue = useRef(new Animated.Value(0)).current;

const slideUp = () => {
  Animated.spring(animatedValue, {
    toValue: 1,
    useNativeDriver: true,
    tension: 50,
    friction: 7,
  }).start();
};

const pulse = () => {
  Animated.sequence([
    Animated.timing(animatedValue, {
      toValue: 1.05,
      duration: 100,
      useNativeDriver: true,
    }),
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }),
  ]).start();
};
```

---

## 🎯 Interaction Patterns

### 1. Add to Cart Flow
```
User taps [+] button on product card
    ↓
Show loading spinner (500ms)
    ↓
API call: POST /cart/add
    ↓
Success: 
  - Button changes to [1][-][+] (quantity selector)
  - Cart bar slides up / updates
  - Haptic feedback
  - Toast: "Added to cart"
    ↓
Failure:
  - Button reverts to [+]
  - Error toast: "Failed to add"
```

### 2. Quick Reorder
```
User taps [Add] in "Order Again" section
    ↓
Modal: "Add previous order?"
  - Product list with quantities
  - Checkboxes to select items
  - [Add Selected (₹245)]
    ↓
Add all selected items to cart
    ↓
Cart bar updates
```

### 3. Merchant Card Navigation
```
User taps merchant card
    ↓
Navigate to: /merchant/{id}
  - Show full menu
  - Category tabs
  - Product grid with [+] buttons
  - Merchant info header
```

### 4. Category Pill Navigation
```
User taps category pill
    ↓
Navigate to: /discover/catalog?category={id}
  - Filter applied automatically
  - Show category-specific UI
```

### 5. Search Activation
```
User taps search bar
    ↓
Navigate to: /search
  - Full-screen search interface
  - Recent searches
  - Trending searches
  - Category filters
```

---

## 📱 Responsive Breakpoints

### Small Devices (< 375px)
- Reduce horizontal padding to `spacing[3]` (12px)
- Product grid: 2 columns (same)
- Merchant cards: 260px width
- Promo carousel: Full width - 24px margins

### Medium Devices (375px - 414px)
- Standard layout (reference design)
- Product grid: 2 columns
- Merchant cards: 280px width

### Large Devices (> 414px)
- Increase padding to `spacing[5]` (20px)
- Product grid: 3 columns on landscape
- Merchant cards: 300px width
- Max content width: 600px (centered)

---

## ♿ Accessibility Guidelines

### Touch Targets
- Minimum: 44x44 points (iOS), 48x48dp (Android)
- Applied to:
  - All buttons
  - Category pills
  - Product cards
  - Cart bar elements

### Color Contrast
- Text on background: 4.5:1 minimum
- Large text (18pt+): 3:1 minimum
- Interactive elements: 3:1 minimum
- Status indicators: Additional non-color cues (icons, text)

### Screen Reader Support
```typescript
// Example: Product card
<Pressable
  accessibilityRole="button"
  accessibilityLabel={`${product.name}, ${product.unit}, ${product.price} rupees`}
  accessibilityHint="Double tap to view details"
  onPress={handlePress}
>
  {/* Card content */}
</Pressable>

// Example: Add button
<Pressable
  accessibilityRole="button"
  accessibilityLabel="Add to cart"
  accessibilityHint={`Add ${product.name} to your cart`}
  onPress={handleAddToCart}
>
  <Plus size={18} />
</Pressable>
```

### Dynamic Type Support
- Use relative font sizes
- Scale with user's system preferences
- Test with max font size (Accessibility → Larger Text)

---

## 🎨 Dark Mode Adaptations

### Color Adjustments
```typescript
const darkModeColors = {
  // Surfaces
  background: '#0F172A',             // Darker background
  surface: '#1E293B',                // Elevated surfaces
  surfaceMuted: '#334155',           // Muted backgrounds
  
  // Text
  heading: '#F8FAFC',                // White text
  foreground: '#E2E8F0',             // Body text
  textSecondary: '#94A3B8',          // Secondary text
  
  // Border
  border: '#334155',                 // Subtle borders
  
  // Semantic (same, but test contrast)
  brand: '#3B82F6',                  // Lighter blue for dark mode
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
};
```

### Shadow Adjustments
- Reduce shadow opacity (0.1 → 0.3)
- Use colored glows instead of dark shadows
- Border emphasis for card separation

### Image Handling
- Add dark overlay on light product images
- Increase image brightness by 10%
- Test contrast of badges/overlays

---

## 📊 Performance Optimizations

### Image Loading
```typescript
// Lazy load images below fold
<Image
  source={{ uri: product.image }}
  defaultSource={require('@/assets/placeholder.png')}
  resizeMode="cover"
  loading="lazy"
/>

// Use optimized image sizes
const imageUrl = `${BASE_URL}/images/${productId}_${width}x${height}.webp`;
```

### List Virtualization
```typescript
// Use FlatList with optimizations
<FlatList
  data={products}
  renderItem={renderProduct}
  keyExtractor={(item) => item.id}
  
  // Performance props
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  updateCellsBatchingPeriod={50}
  initialNumToRender={8}
  windowSize={5}
  
  // Memory management
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
/>
```

### Caching Strategy
```typescript
// Cache merchant & product data
import { feedCache } from '@/services/feedCache';

const loadProducts = async (category: string) => {
  const cacheKey = `products.${category}.${pinCode}`;
  
  // Try cache first
  const cached = await feedCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
    return cached.data;
  }
  
  // Fetch fresh data
  const data = await fetchProducts(category);
  await feedCache.set(cacheKey, data);
  return data;
};
```

### Animation Performance
```typescript
// Use native driver for transforms
Animated.timing(animatedValue, {
  toValue: 1,
  duration: 300,
  useNativeDriver: true,  // Enable native driver
}).start();

// Avoid animating layout properties
// Good: transform, opacity
// Bad: width, height, margin
```

---

## 🚀 Implementation Checklist

### Design Phase
- [ ] Create Figma mockups (375px, 414px breakpoints)
- [ ] Design all component states (default, hover, active, disabled)
- [ ] Dark mode variants
- [ ] Animation specifications
- [ ] Accessibility annotations

### Development Phase
- [ ] New component library
  - [ ] MerchantSpotlightCard
  - [ ] ProductQuickAddCard
  - [ ] CategoryIconPill
  - [ ] StickyCartBar
  - [ ] OrderAgainSection
  - [ ] CondensedPostCard
- [ ] API integrations
  - [ ] /merchants/nearby
  - [ ] /products/essentials
  - [ ] /orders/history
  - [ ] /offers/active
  - [ ] /cart/add
- [ ] State management
  - [ ] Cart store (Zustand)
  - [ ] Product cache
  - [ ] Merchant cache
- [ ] Navigation updates
- [ ] Analytics events

### Testing Phase
- [ ] Unit tests (components)
- [ ] Integration tests (cart flow)
- [ ] E2E tests (purchase journey)
- [ ] Performance profiling
- [ ] Accessibility audit (VoiceOver, TalkBack)
- [ ] Visual regression tests

### Launch Phase
- [ ] Feature flag setup
- [ ] A/B test configuration
- [ ] Monitoring dashboard
- [ ] Beta user cohort
- [ ] Gradual rollout plan

---

**Next Steps:**
1. Review this spec with design team
2. Create interactive Figma prototype
3. Get user feedback on mockups
4. Estimate development effort
5. Plan sprint breakdown
