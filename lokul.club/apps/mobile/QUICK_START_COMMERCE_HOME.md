# Quick Start: Testing the New Commerce Home Screen

## ⚡ TL;DR - How to Enable

1. Open `/src/app/(tabs)/index.tsx`
2. Set `USE_COMMERCE_HOME = true` (line 2)
3. Restart Metro bundler
4. Launch app - you should see the new commerce home!

## What You'll See

```
┌─────────────────────────────┐
│ 📍 Tower B-302 ▾   🔔 🛒   │ ← Header
│ 🔍 Search food, groceries  │
├─────────────────────────────┤
│ 🍕 🛒 💊 💇 👕 🚗 📦 ➕   │ ← Category pills (swipe →)
├─────────────────────────────┤
│ 🎉 Welcome Banner          │
│ 🏪 Nearby Merchants →      │ ← Horizontal scroll
│ ⚡ Daily Essentials →       │ ← 2-column product grid
│ 💬 Community Updates       │
└─────────────────────────────┘
       [  🛒② │ 2 items │ ₹100 │ Checkout  ]  ← Appears on add!
```

## Try These Interactions

### ✅ Add a Product
1. Scroll to "⚡ Daily Essentials" section
2. Tap **[ + ]** on "Amul Taaza Milk"
3. ✨ Cart bar slides up from bottom (smooth spring animation!)
4. Button changes to **[− 1 +]**

### ✅ Increase Quantity
1. Tap **[+]** again
2. ✨ Quantity updates, cart bar pulses
3. Badge on cart icon shows "2"

### ✅ View Merchant
1. Scroll to "🏪 Nearby & Open Now" section (horizontal scroll)
2. Tap a merchant card
3. → Navigates to merchant detail page

### ✅ Browse Category
1. Tap "🍕 Food" category pill at top
2. → Navigates to catalog filtered by food

### ✅ Search
1. Tap search bar in header
2. → Navigates to full search screen

### ✅ View Cart
1. Tap cart icon (top right) OR
2. Tap "Checkout" button on cart bar
3. → Navigates to checkout screen

## Test Cases

### ✅ Single Merchant Lock
1. Add item from "Amul Parlour"
2. Try adding item from "Fresh Veggies Store"
3. ⚠️ Should block and show error

### ✅ Empty Cart State
1. If cart has items, decrement all to 0
2. ✨ Cart bar slides down and disappears
3. Cart badge hides

### ✅ Out of Stock
1. Scroll to "Maggi Noodles" (6th product)
2. See gray overlay with "Out of Stock"
3. Add button disabled

### ✅ Discount Badge
1. Look at "Amul Taaza Milk" (₹60 ₹70)
2. Green badge shows "14% OFF"
3. MRP crossed out

## Switch Back to Old Feed

1. Open `/src/app/(tabs)/index.tsx`
2. Set `USE_COMMERCE_HOME = false`
3. Restart Metro - old social feed returns

## Known Limitations (Phase 1 MVP)

- **Dummy data** - Using hardcoded merchants and products
  - Fix: Replace `loadData()` in `index-commerce.tsx` with real API calls
  
- **No order history** - "Order Again" section not shown
  - Fix: Add order history API and create `OrderAgainSection` component
  
- **Static promo** - Using text banner instead of carousel
  - Fix: Replace with image carousel component
  
- **No analytics** - Interactions not tracked
  - Fix: Add event tracking (product_added, merchant_viewed, etc.)

## File Structure

```
apps/mobile/src/
├── app/
│   └── (tabs)/
│       ├── index.tsx ← Feature flag here!
│       └── index-commerce.tsx ← New home screen
├── components/
│   └── commerce/
│       ├── ProductQuickAddCard.tsx
│       ├── StickyCartBar.tsx
│       ├── MerchantSpotlightCard.tsx
│       ├── CategoryPills.tsx
│       └── index.ts
└── store/
    └── cartStore.ts ← Already existed!
```

## Next Steps After Testing

1. ✅ **Verify it works** - Test all interactions above
2. 📊 **Add real data** - Connect to backend APIs
3. 📈 **Add analytics** - Track user behavior
4. 🧪 **A/B test** - 50/50 old vs new for 2 weeks
5. 🚀 **Launch** - Make `USE_COMMERCE_HOME = true` permanent

## Need Help?

- **Cart not appearing?** - Make sure you added an item (cart is hidden when empty)
- **TypeScript errors?** - Check imports match your project structure
- **Styling looks off?** - Verify `@lokul/ui-tokens` package is installed
- **Animations janky?** - Ensure `useNativeDriver: true` in animations
- **Single merchant lock not working?** - Check cart store implementation

## Performance Tips

Once live, optimize:
- Add `React.memo()` to ProductQuickAddCard
- Use `FlatList` instead of map() for long product lists
- Add image caching with `react-native-fast-image`
- Lazy load merchant cards outside viewport
- Virtualize category pills if list grows >15

## Success Metrics to Watch

- **Time to first purchase**: Target <90 seconds
- **Add-to-cart rate**: Target 25-35%
- **Checkout completion**: Target 60%+
- **Average order value**: Monitor for increases

---

**Ready to go live?** Change flag → Test thoroughly → Deploy! 🚀
