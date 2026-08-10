# 🚀 Feed Redesign: Quick Implementation Guide

**Goal**: Step-by-step guide to implement the commerce-first home screen  
**Timeline**: 2-3 weeks for MVP  
**Status**: Ready to implement

---

## 📋 Implementation Phases

### Phase 1: Foundation (Days 1-3)
- [ ] Create new cart store
- [ ] Create base components
- [ ] API integration setup

### Phase 2: Components (Days 4-8)
- [ ] Build MerchantCard
- [ ] Build ProductCard with Add button
- [ ] Build CategoryPills
- [ ] Build StickyCartBar

### Phase 3: Integration (Days 9-12)
- [ ] Assemble new home screen
- [ ] Add navigation flows
- [ ] Cart functionality
- [ ] Testing & polish

### Phase 4: Launch (Days 13-15)
- [ ] A/B test setup
- [ ] Analytics
- [ ] Beta rollout

---

## 🛠️ Step 1: Create Cart Store

### File: `src/store/cartStore.ts`
```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CartItem {
  id: string;
  productId: string;
  merchantId: string;
  name: string;
  image: string;
  unit: string;
  price: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  merchantId: string | null;  // Cart locked to one merchant
  
  // Actions
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  
  // Computed
  itemCount: number;
  total: number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      merchantId: null,
      itemCount: 0,
      total: 0,

      addItem: (item, quantity = 1) => {
        const state = get();
        
        // Check if adding from different merchant
        if (state.merchantId && state.merchantId !== item.merchantId) {
          // Show alert: "Clear cart to order from different merchant?"
          console.warn('Different merchant detected');
          return;
        }

        const existingItem = state.items.find((i) => i.productId === item.productId);

        if (existingItem) {
          // Update quantity
          set({
            items: state.items.map((i) =>
              i.productId === item.productId
                ? { ...i, quantity: i.quantity + quantity }
                : i
            ),
          });
        } else {
          // Add new item
          set({
            items: [...state.items, { ...item, quantity }],
            merchantId: item.merchantId,
          });
        }

        // Update computed values
        const newState = get();
        set({
          itemCount: newState.items.reduce((sum, i) => sum + i.quantity, 0),
          total: newState.items.reduce((sum, i) => sum + i.price * i.quantity, 0),
        });
      },

      removeItem: (itemId) => {
        const state = get();
        const newItems = state.items.filter((i) => i.id !== itemId);
        
        set({
          items: newItems,
          merchantId: newItems.length === 0 ? null : state.merchantId,
          itemCount: newItems.reduce((sum, i) => sum + i.quantity, 0),
          total: newItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
        });
      },

      updateQuantity: (itemId, quantity) => {
        const state = get();
        
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }

        const newItems = state.items.map((i) =>
          i.id === itemId ? { ...i, quantity } : i
        );

        set({
          items: newItems,
          itemCount: newItems.reduce((sum, i) => sum + i.quantity, 0),
          total: newItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
        });
      },

      clearCart: () => {
        set({
          items: [],
          merchantId: null,
          itemCount: 0,
          total: 0,
        });
      },
    }),
    {
      name: 'lokul-cart',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

---

## 🛠️ Step 2: Product Quick Add Card

### File: `src/components/commerce/ProductQuickAddCard.tsx`
```typescript
import { useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { Plus, Minus } from 'lucide-react-native';
import { HStack, Text, VStack } from '@/components/ui';
import { colors, radius, spacing } from '@lokul/ui-tokens';
import { useCartStore } from '@/store/cartStore';
import { Haptics } from 'expo-haptics';

interface Product {
  id: string;
  name: string;
  image: string;
  unit: string;
  price: number;
  mrp?: number;
  inStock: boolean;
  merchantId: string;
  merchantName: string;
}

interface ProductQuickAddCardProps {
  product: Product;
  onPress?: () => void;  // Optional: Navigate to product detail
}

export function ProductQuickAddCard({ product, onPress }: ProductQuickAddCardProps) {
  const { items, addItem, updateQuantity } = useCartStore();
  const [isAdding, setIsAdding] = useState(false);

  const cartItem = items.find((i) => i.productId === product.id);
  const quantity = cartItem?.quantity ?? 0;

  const handleAdd = async () => {
    if (!product.inStock) return;
    
    setIsAdding(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      // Simulate API delay
      await new Promise((r) => setTimeout(r, 300));

      addItem({
        id: `cart-${Date.now()}`,
        productId: product.id,
        merchantId: product.merchantId,
        name: product.name,
        image: product.image,
        unit: product.unit,
        price: product.price,
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleIncrement = () => {
    if (cartItem) {
      updateQuantity(cartItem.id, quantity + 1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleDecrement = () => {
    if (cartItem && quantity > 0) {
      updateQuantity(cartItem.id, quantity - 1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const discount = product.mrp && product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : null;

  return (
    <Pressable
      style={[styles.card, !product.inStock && styles.outOfStock]}
      onPress={onPress}
      disabled={!product.inStock}
    >
      {/* Image */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: product.image }} style={styles.image} resizeMode="cover" />
        {discount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discount}% OFF</Text>
          </View>
        )}
        {!product.inStock && (
          <View style={styles.outOfStockOverlay}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        )}
      </View>

      {/* Info */}
      <VStack gap={1}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.unit}>{product.unit}</Text>
      </VStack>

      {/* Price */}
      <HStack gap={1.5} align="center">
        <Text style={styles.price}>₹{product.price}</Text>
        {product.mrp && product.mrp > product.price && (
          <Text style={styles.mrp}>₹{product.mrp}</Text>
        )}
      </HStack>

      {/* Add Button / Quantity Selector */}
      {product.inStock && (
        <>
          {quantity === 0 ? (
            <Pressable
              style={styles.addButton}
              onPress={handleAdd}
              disabled={isAdding}
            >
              {isAdding ? (
                <Text style={styles.addButtonText}>Adding...</Text>
              ) : (
                <>
                  <Plus size={16} color="#fff" />
                  <Text style={styles.addButtonText}>Add</Text>
                </>
              )}
            </Pressable>
          ) : (
            <HStack style={styles.quantitySelector} gap={0}>
              <Pressable style={styles.quantityButton} onPress={handleDecrement}>
                <Minus size={16} color={colors.brand[600]} />
              </Pressable>
              <View style={styles.quantityDisplay}>
                <Text style={styles.quantityText}>{quantity}</Text>
              </View>
              <Pressable style={styles.quantityButton} onPress={handleIncrement}>
                <Plus size={16} color={colors.brand[600]} />
              </Pressable>
            </HStack>
          )}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface.background,
    borderRadius: radius.lg,
    padding: spacing[3],
    gap: spacing[2],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  outOfStock: {
    opacity: 0.6,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.surface.surfaceMuted,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: spacing[1.5],
    paddingVertical: spacing[0.5],
    backgroundColor: colors.semantic.success,
    borderRadius: radius.sm,
  },
  discountText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  outOfStockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.surface.heading,
    lineHeight: 20,
  },
  unit: {
    fontSize: 12,
    color: colors.surface.textSecondary,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[1],
    marginTop: spacing[1],
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  quantitySelector: {
    height: 36,
    backgroundColor: colors.surface.surfaceMuted,
    borderRadius: radius.md,
    overflow: 'hidden',
    marginTop: spacing[1],
  },
  quantityButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface.background,
  },
  quantityDisplay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.surface.heading,
  },
});
```

---

## 🛠️ Step 3: Sticky Cart Bar

### File: `src/components/commerce/StickyCartBar.tsx`
```typescript
import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ShoppingCart } from 'lucide-react-native';
import { HStack, Text } from '@/components/ui';
import { colors, radius, spacing } from '@lokul/ui-tokens';
import { useCartStore } from '@/store/cartStore';

export function StickyCartBar() {
  const router = useRouter();
  const { itemCount, total } = useCartStore();
  const animatedValue = useRef(new Animated.Value(0)).current;
  const prevItemCount = useRef(0);

  // Slide up animation on mount
  useEffect(() => {
    if (itemCount > 0) {
      Animated.spring(animatedValue, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    } else {
      Animated.spring(animatedValue, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    }
  }, [itemCount > 0]);

  // Pulse animation on item count change
  useEffect(() => {
    if (itemCount !== prevItemCount.current && itemCount > 0) {
      const scale = useRef(new Animated.Value(1)).current;
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
      ]).start();
    }
    prevItemCount.current = itemCount;
  }, [itemCount]);

  if (itemCount === 0) return null;

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [100, 0],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
        },
      ]}
    >
      <Pressable
        style={styles.button}
        onPress={() => router.push('/(checkout)')}
        accessibilityRole="button"
        accessibilityLabel={`View cart with ${itemCount} items, total ${total} rupees`}
      >
        <HStack style={styles.left} gap={2} align="center">
          <View style={styles.iconContainer}>
            <ShoppingCart size={20} color="#fff" />
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{itemCount}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <Text style={styles.totalText}>₹{total}</Text>
        </HStack>

        <View style={styles.checkoutButton}>
          <Text style={styles.checkoutText}>Checkout</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 72,  // Above tab bar (56px tab + 16px gap)
    left: spacing[4],
    right: spacing[4],
    zIndex: 1000,
  },
  button: {
    height: 56,
    backgroundColor: colors.brand[600],
    borderRadius: radius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  left: {
    flex: 1,
  },
  iconContainer: {
    position: 'relative',
  },
  countBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.semantic.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  countText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  totalText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  checkoutButton: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    backgroundColor: '#fff',
    borderRadius: radius.lg,
  },
  checkoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.brand[600],
  },
});
```

---

## 🛠️ Step 4: Category Pills

### File: `src/components/commerce/CategoryPills.tsx`
```typescript
import { ScrollView, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { HStack, Text } from '@/components/ui';
import { colors, radius, spacing } from '@lokul/ui-tokens';

interface Category {
  id: string;
  icon: string;
  label: string;
  route: string;
  color: string;
}

const CATEGORIES: Category[] = [
  { id: 'food', icon: '🍕', label: 'Food', route: '/(discover)/catalog?category=food', color: '#EF4444' },
  { id: 'grocery', icon: '🛒', label: 'Grocery', route: '/(discover)/catalog?category=grocery', color: '#10B981' },
  { id: 'pharmacy', icon: '💊', label: 'Pharmacy', route: '/(discover)/catalog?category=pharmacy', color: '#3B82F6' },
  { id: 'laundry', icon: '👕', label: 'Laundry', route: '/(services)/laundry', color: '#8B5CF6' },
  { id: 'salon', icon: '💇', label: 'Salon', route: '/(services)/salon', color: '#EC4899' },
  { id: 'ride', icon: '🚗', label: 'Ride', route: '/(services)/ride', color: '#F59E0B' },
  { id: 'more', icon: '➕', label: 'More', route: '/(services)/all', color: '#6B7280' },
];

interface CategoryPillsProps {
  activeId?: string;
  onCategoryPress?: (category: Category) => void;
}

export function CategoryPills({ activeId, onCategoryPress }: CategoryPillsProps) {
  const router = useRouter();

  const handlePress = (category: Category) => {
    if (onCategoryPress) {
      onCategoryPress(category);
    } else {
      router.push(category.route);
    }
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {CATEGORIES.map((category) => {
        const isActive = activeId === category.id;
        return (
          <Pressable
            key={category.id}
            style={[
              styles.pill,
              isActive && { backgroundColor: category.color },
            ]}
            onPress={() => handlePress(category)}
            accessibilityRole="button"
            accessibilityLabel={`${category.label} category`}
            accessibilityState={{ selected: isActive }}
          >
            <Text style={styles.icon}>{category.icon}</Text>
            <Text
              style={[
                styles.label,
                isActive && styles.labelActive,
              ]}
            >
              {category.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.border,
  },
  content: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    gap: spacing[2],
  },
  pill: {
    height: 48,
    paddingHorizontal: spacing[4],
    borderRadius: radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1.5],
    backgroundColor: colors.surface.surfaceMuted,
  },
  icon: {
    fontSize: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.surface.heading,
  },
  labelActive: {
    color: '#fff',
  },
});
```

---

## 🛠️ Step 5: Merchant Spotlight Card

### File: `src/components/commerce/MerchantSpotlightCard.tsx`
```typescript
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Clock, MapPin, Star, Tag } from 'lucide-react-native';
import { Badge, HStack, Text, VStack } from '@/components/ui';
import { colors, radius, spacing } from '@lokul/ui-tokens';

interface Merchant {
  id: string;
  name: string;
  image: string;
  category: string;
  rating: number;
  reviewCount: number;
  deliveryTime: number;  // minutes
  deliveryFee: number;
  minOrder: number;
  offers?: string[];
  tags: string[];
  isOpen: boolean;
  distance: number;  // km
}

interface MerchantSpotlightCardProps {
  merchant: Merchant;
}

export function MerchantSpotlightCard({ merchant }: MerchantSpotlightCardProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/(merchant)/${merchant.id}`);
  };

  return (
    <Pressable style={styles.card} onPress={handlePress}>
      {/* Image */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: merchant.image }} style={styles.image} resizeMode="cover" />
        
        {/* Rating Badge */}
        <View style={styles.ratingBadge}>
          <Star size={12} color={colors.semantic.warning} fill={colors.semantic.warning} />
          <Text style={styles.ratingText}>{merchant.rating}</Text>
        </View>

        {/* Offer Badge */}
        {merchant.offers && merchant.offers.length > 0 && (
          <View style={styles.offerBadge}>
            <Tag size={10} color="#fff" />
            <Text style={styles.offerText}>{merchant.offers[0]}</Text>
          </View>
        )}

        {/* Closed Overlay */}
        {!merchant.isOpen && (
          <View style={styles.closedOverlay}>
            <Text style={styles.closedText}>Closed</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {merchant.name}
        </Text>
        
        <Text style={styles.category} numberOfLines={1}>
          {merchant.category}
        </Text>

        {/* Metadata */}
        <HStack gap={2} align="center" style={styles.metadata}>
          <HStack gap={0.5} align="center">
            <Clock size={12} color={colors.surface.textSecondary} />
            <Text style={styles.metaText}>{merchant.deliveryTime} min</Text>
          </HStack>
          
          <Text style={styles.separator}>·</Text>
          
          <HStack gap={0.5} align="center">
            <MapPin size={12} color={colors.surface.textSecondary} />
            <Text style={styles.metaText}>{merchant.distance} km</Text>
          </HStack>
          
          {merchant.deliveryFee === 0 && (
            <>
              <Text style={styles.separator}>·</Text>
              <Text style={[styles.metaText, { color: colors.semantic.success }]}>
                Free delivery
              </Text>
            </>
          )}
        </HStack>

        {/* Tags */}
        {merchant.tags.length > 0 && (
          <HStack gap={1.5} style={styles.tags}>
            {merchant.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} label={tag} size="sm" tone="neutral" />
            ))}
          </HStack>
        )}

        {/* CTA Button */}
        <Pressable
          style={[styles.ctaButton, !merchant.isOpen && styles.ctaButtonDisabled]}
          onPress={handlePress}
          disabled={!merchant.isOpen}
        >
          <Text style={styles.ctaText}>
            {merchant.isOpen ? 'View Menu' : 'Closed'}
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 280,
    height: 220,
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.surface.background,
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
    gap: spacing[0.5],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: radius.md,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.surface.heading,
  },
  offerBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[0.5],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    backgroundColor: colors.semantic.warning,
    borderRadius: radius.md,
  },
  offerText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  closedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closedText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  content: {
    padding: spacing[3],
    gap: spacing[1.5],
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.surface.heading,
  },
  category: {
    fontSize: 12,
    color: colors.surface.textSecondary,
  },
  metadata: {
    flexWrap: 'wrap',
  },
  metaText: {
    fontSize: 12,
    color: colors.surface.textSecondary,
  },
  separator: {
    fontSize: 12,
    color: colors.surface.textSecondary,
  },
  tags: {
    flexWrap: 'wrap',
  },
  ctaButton: {
    marginTop: spacing[1],
    paddingVertical: spacing[2],
    backgroundColor: colors.brand[600],
    borderRadius: radius.md,
    alignItems: 'center',
  },
  ctaButtonDisabled: {
    backgroundColor: colors.surface.surfaceMuted,
  },
  ctaText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
```

---

## 🛠️ Step 6: New Home Screen Layout

### File: `src/app/(tabs)/index-new.tsx`
```typescript
import { useCallback, useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MapPin, Bell, ShoppingCart, ChevronDown } from 'lucide-react-native';
import { HStack, Text, VStack, Card } from '@/components/ui';
import { colors, radius, spacing } from '@lokul/ui-tokens';
import { CategoryPills } from '@/components/commerce/CategoryPills';
import { ProductQuickAddCard } from '@/components/commerce/ProductQuickAddCard';
import { MerchantSpotlightCard } from '@/components/commerce/MerchantSpotlightCard';
import { StickyCartBar } from '@/components/commerce/StickyCartBar';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useCartStore } from '@/store/cartStore';

const { width: SCREEN_W } = Dimensions.get('window');
const PRODUCT_CARD_WIDTH = (SCREEN_W - 48) / 2;  // 2 columns with gaps

export default function HomeScreenNew() {
  const router = useRouter();
  const societyName = useOnboardingStore((s) => s.societyName) ?? 'your locality';
  const { itemCount } = useCartStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [merchants, setMerchants] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  // Load merchants & products
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // TODO: Replace with actual API calls
    // const merchantsData = await fetch('/api/merchants/nearby').then(r => r.json());
    // const productsData = await fetch('/api/products/essentials').then(r => r.json());
    
    // Dummy data for now
    setMerchants(DUMMY_MERCHANTS);
    setProducts(DUMMY_PRODUCTS);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData().finally(() => setRefreshing(false));
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <HStack style={styles.topRow} align="center">
          <Pressable
            style={styles.locationButton}
            onPress={() => router.push('/(settings)/location')}
          >
            <MapPin size={16} color={colors.surface.textSecondary} />
            <Text style={styles.locationText}>{societyName}</Text>
            <ChevronDown size={16} color={colors.surface.textSecondary} />
          </Pressable>

          <HStack gap={2}>
            <Pressable
              style={styles.iconButton}
              onPress={() => router.push('/(tabs)/chats')}
            >
              <Bell size={20} color={colors.surface.heading} />
            </Pressable>

            <Pressable
              style={styles.iconButton}
              onPress={() => router.push('/(checkout)')}
            >
              <ShoppingCart size={20} color={colors.surface.heading} />
              {itemCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{itemCount}</Text>
                </View>
              )}
            </Pressable>
          </HStack>
        </HStack>

        {/* Search Bar */}
        <Pressable
          style={styles.searchBar}
          onPress={() => router.push('/(discover)/search')}
        >
          <Text style={styles.searchPlaceholder}>Search food, groceries...</Text>
        </Pressable>
      </View>

      {/* Category Pills */}
      <CategoryPills />

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Merchants Spotlight */}
        <VStack gap={3} style={styles.section}>
          <HStack style={styles.sectionHeader} align="center">
            <Text style={styles.sectionTitle}>🏪 Nearby & Open Now</Text>
            <Pressable onPress={() => router.push('/(discover)/catalog')}>
              <Text style={styles.viewAll}>View all →</Text>
            </Pressable>
          </HStack>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {merchants.map((merchant) => (
              <View key={merchant.id} style={{ marginRight: spacing[3] }}>
                <MerchantSpotlightCard merchant={merchant} />
              </View>
            ))}
          </ScrollView>
        </VStack>

        {/* Product Quick Add */}
        <VStack gap={3} style={styles.section}>
          <HStack style={styles.sectionHeader} align="center">
            <Text style={styles.sectionTitle}>⚡ Daily Essentials</Text>
            <Pressable onPress={() => router.push('/(marketplace)')}>
              <Text style={styles.viewAll}>View all →</Text>
            </Pressable>
          </HStack>

          <View style={styles.productGrid}>
            {products.slice(0, 6).map((product) => (
              <View key={product.id} style={{ width: PRODUCT_CARD_WIDTH }}>
                <ProductQuickAddCard product={product} />
              </View>
            ))}
          </View>
        </VStack>

        {/* Community Feed (Condensed) */}
        <VStack gap={3} style={styles.section}>
          <HStack style={styles.sectionHeader} align="center">
            <Text style={styles.sectionTitle}>💬 What's Happening</Text>
            <Pressable onPress={() => router.push('/(tabs)/index-old')}>
              <Text style={styles.viewAll}>View all →</Text>
            </Pressable>
          </HStack>

          <Card padding={3}>
            <Text variant="body" tone="secondary">
              3 new posts in your community
            </Text>
          </Card>
        </VStack>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Sticky Cart Bar */}
      <StickyCartBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface.background,
  },
  header: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    paddingBottom: spacing[2],
    backgroundColor: colors.surface.background,
  },
  topRow: {
    height: 40,
    marginBottom: spacing[2],
  },
  locationButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1.5],
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
    position: 'relative',
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
    paddingHorizontal: spacing[4],
    justifyContent: 'center',
  },
  searchPlaceholder: {
    fontSize: 14,
    color: colors.surface.textSecondary,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing[20],
  },
  section: {
    paddingVertical: spacing[4],
  },
  sectionHeader: {
    paddingHorizontal: spacing[4],
    justifyContent: 'space-between',
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
  horizontalScroll: {
    paddingHorizontal: spacing[4],
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing[4],
    gap: spacing[3],
  },
});

// Dummy data (replace with API)
const DUMMY_MERCHANTS = [
  {
    id: '1',
    name: 'Amul Parlour',
    image: 'https://picsum.photos/400/300?random=1',
    category: 'Dairy · Ice Cream',
    rating: 4.5,
    reviewCount: 120,
    deliveryTime: 10,
    deliveryFee: 0,
    minOrder: 50,
    offers: ['20% off'],
    tags: ['Verified', 'Fast delivery'],
    isOpen: true,
    distance: 0.5,
  },
  // Add more...
];

const DUMMY_PRODUCTS = [
  {
    id: '1',
    name: 'Amul Taaza Milk',
    image: 'https://picsum.photos/200/200?random=1',
    unit: '500ml',
    price: 60,
    mrp: 70,
    inStock: true,
    merchantId: '1',
    merchantName: 'Amul Parlour',
  },
  // Add more...
];
```

---

## 🧪 Testing Guide

### Test Cart Flow
```bash
# Start simulator
npm run ios

# Test scenarios:
1. Add product → verify cart bar appears
2. Add multiple products → verify count & total
3. Add from different merchant → verify alert
4. Update quantity → verify animations
5. Remove item → verify cart updates
6. Clear cart → verify bar disappears
```

### Analytics Events
```typescript
// Track commerce events
import analytics from '@/utils/analytics';

// Product viewed
analytics.track('product_viewed', {
  productId: product.id,
  productName: product.name,
  merchantId: product.merchantId,
  price: product.price,
});

// Product added to cart
analytics.track('product_added_to_cart', {
  productId: product.id,
  quantity: 1,
  price: product.price,
  cartTotal: total,
});

// Merchant viewed
analytics.track('merchant_viewed', {
  merchantId: merchant.id,
  merchantName: merchant.name,
  source: 'home_spotlight',
});
```

---

## 📈 A/B Testing Setup

### Feature Flag
```typescript
// src/utils/featureFlags.ts
import { useExperiment } from '@/hooks/useExperiment';

export function useNewHomeScreen() {
  const { variant } = useExperiment('new_home_screen', {
    variants: ['control', 'treatment'],
    weights: [50, 50],  // 50/50 split
  });

  return variant === 'treatment';
}
```

### Usage
```typescript
// src/app/(tabs)/index.tsx
import { useNewHomeScreen } from '@/utils/featureFlags';
import HomeScreenOld from './index-old';
import HomeScreenNew from './index-new';

export default function HomeScreen() {
  const showNewHome = useNewHomeScreen();
  
  if (showNewHome) {
    return <HomeScreenNew />;
  }
  
  return <HomeScreenOld />;
}
```

---

## 🚀 Deployment Checklist

### Pre-launch
- [ ] All components built & tested
- [ ] API endpoints ready
- [ ] Cart store tested
- [ ] Analytics instrumented
- [ ] A/B test configured
- [ ] Error handling added
- [ ] Loading states designed
- [ ] Empty states designed
- [ ] Offline support added

### Launch
- [ ] Deploy backend changes
- [ ] Release app update
- [ ] Enable feature flag for 10%
- [ ] Monitor metrics for 24 hours
- [ ] Increase to 50% if positive
- [ ] Full rollout if metrics strong

### Post-launch
- [ ] Collect user feedback
- [ ] Monitor crash reports
- [ ] Track conversion funnel
- [ ] Iterate on issues
- [ ] Plan next optimizations

---

## 💡 Quick Wins & Optimizations

### Performance
1. **Image Optimization**
   ```typescript
   // Use WebP format with size variants
   const imageUrl = `${BASE}/images/${id}_${width}x${height}.webp`;
   ```

2. **List Virtualization**
   ```typescript
   // Already using FlatList - add windowSize
   windowSize={5}  // Render 5 screens worth of items
   ```

3. **Memoization**
   ```typescript
   const MerchantCard = memo(MerchantSpotlightCard);
   const ProductCard = memo(ProductQuickAddCard);
   ```

### UX Improvements
1. **Skeleton Screens**
   - Show placeholders while loading
   - Better than spinners

2. **Optimistic UI**
   - Update cart instantly
   - Rollback on error

3. **Haptic Feedback**
   - Confirm actions with vibration
   - Feel more responsive

---

## 🎉 You're Ready to Build!

Start with Phase 1 and build incrementally. Test each component in isolation before assembling the final screen.

**Questions?** Refer to the main research doc: `FEED_REDESIGN_RESEARCH.md`
