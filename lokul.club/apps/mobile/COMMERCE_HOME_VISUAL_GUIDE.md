# Commerce Home Screen Structure

```
┌─────────────────────────────────────┐
│ 🏠 COMMERCE HOME SCREEN             │
└─────────────────────────────────────┘

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ HEADER (72px)                      ┃
┃ ┌─────────────────┬───────────────┐┃
┃ │ 📍 Tower B-302 ▾│ 🔔  🛒(2)    │┃ ← Location, Notifications, Cart
┃ └─────────────────┴───────────────┘┃
┃ ┌──────────────────────────────────┐┃
┃ │ 🔍 Search food, groceries...     │┃ ← Tappable search bar
┃ └──────────────────────────────────┘┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ CATEGORY PILLS (64px, sticky)      ┃
┃ ┌────┬────┬────┬────┬────┬────┐   ┃ ← Horizontal scroll
┃ │🍕  │🛒  │💊  │💇  │👕  │🚗  │   ┃
┃ │Food│Groc│Phar│Salo│Laun│Ride│...┃
┃ └────┴────┴────┴────┴────┴────┘   ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┌─────────────────────────────────────┐
│ SCROLLABLE CONTENT                  │
│                                     │
│ ┌─────────────────────────────────┐│
│ │ 🎉 Welcome to Quick Commerce    ││ ← Promo Banner
│ │ Order from local shops, deli... ││
│ └─────────────────────────────────┘│
│                                     │
│ 🏪 Nearby & Open Now      View all →│
│ ┌──────────┐ ┌──────────┐         │
│ │ Amul     │ │ Fresh    │ →       │ ← Merchant Spotlight
│ │ Parlour  │ │ Veggies  │         │   (horizontal scroll)
│ │ ★4.5 20% │ │ ★4.3     │         │   280x220px cards
│ │ 10min·0.5│ │ 15min·0.8│         │
│ │[View Menu]│ │[View Menu]│        │
│ └──────────┘ └──────────┘         │
│                                     │
│ ⚡ Daily Essentials       View all →│
│ ┌────────┬────────┐                │
│ │ Amul   │Britain │                │ ← Product Grid
│ │ Taaza  │Bread   │                │   2 columns
│ │ Milk   │400g    │                │   Quick add buttons
│ │ 500ml  │        │                │
│ │ ₹60 ₹70│ ₹40 ₹45│                │
│ │ [ + ]  │ [− 2 +]│                │
│ ├────────┼────────┤                │
│ │ Tata   │ Amul   │                │
│ │ Tea    │ Butter │                │
│ │ Gold   │ 100g   │                │
│ │ 1kg    │        │                │
│ │ ₹190   │ ₹55    │                │
│ │ [ + ]  │ [ + ]  │                │
│ └────────┴────────┘                │
│                                     │
│ 💬 What's Happening      View all →│
│ ┌─────────────────────────────────┐│
│ │ Community Updates                ││ ← Feed Teaser
│ │ 3 new posts in your locality     ││
│ └─────────────────────────────────┘│
│                                     │
│                                     │ ← Spacer (120px)
│                                     │
└─────────────────────────────────────┘

                    ↓ OVERLAYS ↓

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ STICKY CART BAR (appears on add)   ┃ ← 72px from bottom
┃ ┌─────────────────────────────────┐┃   Spring slide-up
┃ │ 🛒② │ 2 items │ ₹100 │[Checkout]│┃   Pulse on update
┃ └─────────────────────────────────┘┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ TAB BAR (56px, native)              ┃
┃ [Home] [Explore] [+] [Chats] [You] ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

## Component Hierarchy

```
HomeScreenCommerce
├── SafeAreaView
│   ├── OfflineBanner
│   ├── Header (View)
│   │   ├── TopRow (HStack)
│   │   │   ├── LocationButton (Pressable)
│   │   │   └── IconButtons (HStack)
│   │   │       ├── Bell (Pressable)
│   │   │       └── Cart (Pressable + Badge)
│   │   └── SearchBar (Pressable)
│   ├── CategoryPills (ScrollView)
│   ├── ScrollView
│   │   ├── PromoBanner (Card)
│   │   ├── MerchantSpotlight (VStack)
│   │   │   ├── SectionHeader (HStack)
│   │   │   └── ScrollView (horizontal)
│   │   │       └── MerchantSpotlightCard[] (280x220px)
│   │   ├── ProductGrid (VStack)
│   │   │   ├── SectionHeader (HStack)
│   │   │   └── Grid (View)
│   │   │       └── ProductQuickAddCard[] (2 columns)
│   │   └── CommunityTeaser (VStack)
│   │       ├── SectionHeader (HStack)
│   │       └── Card
│   └── StickyCartBar (Animated.View, fixed overlay)
```

## User Flow Example

```
1. User opens app
   └→ Sees commerce home with categories and products

2. User taps "🍕 Food" pill
   └→ Routes to catalog?category=food

3. User taps product "+ Add"
   ├→ Item added to cart (haptic feedback)
   ├→ Button changes to [− 1 +]
   └→ Cart bar slides up from bottom (spring animation)

4. User taps [+] to increment
   ├→ Quantity updates to 2 (haptic feedback)
   ├→ Cart bar pulses
   └→ Total price updates

5. User taps another product from SAME merchant
   ├→ Item added successfully
   ├→ Cart bar updates: "3 items │ ₹150"
   └→ Badge on cart icon shows "3"

6. User tries to add from DIFFERENT merchant
   ├→ Cart store blocks (single merchant lock)
   └→ Shows error: "Clear cart to order from another shop"

7. User taps "Checkout" on cart bar
   └→ Routes to /(checkout)

8. User taps cart icon in header
   └→ Also routes to /(checkout)
```

## Interaction States

### ProductQuickAddCard States
```
State 1: Not in cart
┌──────────┐
│ Amul     │
│ Taaza    │
│ Milk     │
│ 500ml    │
│ ₹60 ₹70  │ ← Discount badge if MRP > price
│ [ + ]    │ ← "Add" button (brand blue)
└──────────┘

State 2: In cart (quantity > 0)
┌──────────┐
│ Amul     │
│ Taaza    │
│ Milk     │
│ 500ml    │
│ ₹60 ₹70  │
│ [− 2 +]  │ ← Quantity selector (gray bg)
└──────────┘

State 3: Out of stock
┌──────────┐
│ █████████│ ← 60% opacity overlay
│ █ Out of █│
│ █ Stock █│
│ ██ 500ml █│
│ █ ₹60 ₹70█│
│ ██████████│ ← No add button
└──────────┘
```

### MerchantSpotlightCard States
```
State 1: Open, with offer
┌────────────┐
│ ★4.5  20% │ ← Rating badge (left), Offer badge (right)
│ [IMAGE]   │ ← 120px height
│ Amul      │ ← 16px bold
│ Dairy·Ice │ ← 12px gray
│ 🕐10m·0.5k│ ← Metadata row
│ [View Menu]│ ← CTA (brand blue bg)
└────────────┘

State 2: Closed
┌────────────┐
│ ███████   │ ← Dark overlay 60%
│ █Closed█  │ ← "Closed" text
│ ██████    │
│ [IMAGE]   │
│ Amul      │
│ Dairy·Ice │
│ 🕐10m·0.5k│
│ [Closed]  │ ← CTA disabled (gray)
└────────────┘
```

### StickyCartBar States
```
State 1: Hidden (itemCount = 0)
[Nothing rendered]

State 2: Visible with items
┌─────────────────────────────────────┐
│ 🛒② │ 2 items │ ₹100 │ [Checkout →] │ ← 56px height
└─────────────────────────────────────┘
  ↑       ↑        ↑          ↑
  Icon   Count    Total      CTA
  +Badge          (paise/100) (white bg)
```

## Color Reference

```css
/* Brand Primary (Blue) */
colors.brand[50]  = #EEF4FB  /* Subtle backgrounds */
colors.brand[100] = #D5E7F5  /* Placeholders */
colors.brand[600] = #1D65AF  /* Primary buttons, links */
colors.brand[700] = #165499  /* Hover/pressed */

/* Semantic Colors */
colors.semantic.success = #059669  /* Discount badges, free delivery */
colors.semantic.danger  = #DC2626  /* Cart badge, errors */
colors.semantic.warning = #F59E0B  /* Offer badges */

/* Surface Colors */
colors.surface.background      = #FFFFFF  /* Cards, content */
colors.surface.surfaceMuted    = #F3F4F6  /* Search, inputs, inactive pills */
colors.surface.border          = #E5E7EB  /* Dividers */
colors.surface.heading         = #111827  /* Headings, important text */
colors.surface.textSecondary   = #6B7280  /* Metadata, placeholders */
```

## Animation Specs

```typescript
// Cart Bar Slide Up (on first item added)
Animated.spring(animatedValue, {
  toValue: 1,
  tension: 50,   // Spring stiffness
  friction: 7,   // Damping
  useNativeDriver: true,
});

// Cart Badge Pulse (on item count change)
Animated.sequence([
  Animated.timing(scale, {
    toValue: 1.05,
    duration: 100,
    useNativeDriver: true,
  }),
  Animated.timing(scale, {
    toValue: 1,
    duration: 100,
    useNativeDriver: true,
  }),
]);

// Haptic Feedback (on add/increment/decrement)
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
```

## Spacing Grid

All components follow 4px grid:
```
spacing[0.5] = 2px   spacing[1]  = 4px   spacing[1.5] = 6px   spacing[2]  = 8px
spacing[2.5] = 10px  spacing[3]  = 12px  spacing[4]   = 16px  spacing[5]  = 20px
spacing[6]   = 24px  spacing[8]  = 32px  spacing[10]  = 40px  spacing[12] = 48px
```

## Border Radius Values

```typescript
radius.sm   = 4px   // Small elements (badges)
radius.md   = 8px   // Medium elements (buttons, cards)
radius.lg   = 12px  // Large elements (product cards)
radius.xl   = 16px  // Extra large (merchant cards, cart bar)
radius.full = 999px // Pills, icon buttons
```
