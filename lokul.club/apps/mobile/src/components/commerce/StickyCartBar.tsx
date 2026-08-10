import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { ShoppingCart, ArrowRight } from 'lucide-react-native';
import { HStack, Text } from '@/components/ui';
import { colors, radius, spacing, fontSize, shadows } from '@lokul/ui-tokens';
import { useCartStore } from '@/store/cartStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function StickyCartBar() {
  const router = useRouter();
  const getTotalItems = useCartStore((s) => s.getTotalItems);
  const getTotalPrice = useCartStore((s) => s.getTotalPrice);
  
  const itemCount = getTotalItems();
  const totalPaise = getTotalPrice();
  const total = (totalPaise / 100).toFixed(0);
  
  const animatedValue = useRef(new Animated.Value(0)).current;
  const prevItemCount = useRef(0);

  // Slide up animation when items added
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
      const scale = new Animated.Value(1);
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
        onPress={() => router.push('/(marketplace)/cart' as any)}
        accessibilityRole="button"
        accessibilityLabel={`View cart with ${itemCount} items, total ${total} rupees`}
      >
        <HStack style={styles.left} gap={2} align="center">
          <View style={styles.iconContainer}>
            <ShoppingCart size={20} color={colors.surface.background} />
            {itemCount > 0 && (
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{itemCount}</Text>
              </View>
            )}
          </View>
          <View style={styles.divider} />
          <Text style={styles.itemsText}>{itemCount} item{itemCount > 1 ? 's' : ''}</Text>
          <View style={styles.divider} />
          <Text style={styles.totalText}>₹{total}</Text>
        </HStack>

        <HStack style={styles.checkoutButton} gap={1} align="center">
          <Text style={styles.checkoutText}>Checkout</Text>
          <ArrowRight size={16} color={colors.brand[600]} />
        </HStack>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Tab navigator already reserves the tab bar area, so only a small inset is needed
    position: 'absolute',
    bottom: spacing[3],
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
    ...shadows.md.ios,
    elevation: shadows.md.android,
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
    color: colors.surface.background,
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  itemsText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.surface.background,
  },
  totalText: {
    fontSize: fontSize.base,
    fontWeight: '700',
    color: colors.surface.background,
  },
  checkoutButton: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    backgroundColor: colors.surface.background,
    borderRadius: radius.lg,
  },
  checkoutText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.brand[600],
  },
});
