import { useState } from 'react';
import { Image, Pressable, StyleSheet, View, ActivityIndicator } from 'react-native';
import { Plus, Minus } from 'lucide-react-native';
import { HStack, Text, VStack } from '@/components/ui';
import { colors, radius, spacing, fontSize, shadows } from '@lokul/ui-tokens';
import { useCartStore } from '@/store/cartStore';
import * as Haptics from 'expo-haptics';

interface Product {
  id: string;
  name: string;
  imageUrl?: string;
  unit?: string;
  pricePaise: number;
  mrpPaise?: number;
  inStock: boolean;
  merchantId: string;
  merchantName: string;
  kind: string;
}

interface ProductQuickAddCardProps {
  product: Product;
  onPress?: () => void;
}

export function ProductQuickAddCard({ product, onPress }: Readonly<ProductQuickAddCardProps>) {
  const { items, addItem, updateQuantity } = useCartStore();
  const [isAdding, setIsAdding] = useState(false);

  const cartItem = items.find((i) => i.id === product.id);
  const quantity = cartItem?.quantity ?? 0;

  const lightTap = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
  };

  const handleAdd = () => {
    if (!product.inStock) return;

    setIsAdding(true);
    lightTap();

    try {
      addItem({
        id: product.id,
        merchantId: product.merchantId,
        merchantName: product.merchantName,
        name: product.name,
        pricePaise: product.pricePaise,
        unit: product.unit,
        imageUrl: product.imageUrl,
        kind: product.kind,
      });
    } finally {
      setTimeout(() => setIsAdding(false), 300);
    }
  };

  const handleIncrement = () => {
    if (cartItem) {
      updateQuantity(cartItem.id, quantity + 1);
      lightTap();
    }
  };

  const handleDecrement = () => {
    if (cartItem && quantity > 0) {
      updateQuantity(cartItem.id, quantity - 1);
      lightTap();
    }
  };

  const discount = product.mrpPaise && product.mrpPaise > product.pricePaise
    ? Math.round(((product.mrpPaise - product.pricePaise) / product.mrpPaise) * 100)
    : null;

  const price = (product.pricePaise / 100).toFixed(0);
  const mrp = product.mrpPaise ? (product.mrpPaise / 100).toFixed(0) : null;

  return (
    <Pressable
      style={[styles.card, !product.inStock && styles.outOfStock]}
      onPress={onPress}
      disabled={!product.inStock}
      accessibilityRole="button"
      accessibilityLabel={`${product.name}, ${product.unit || ''}, ${price} rupees`}
    >
      {/* Image */}
      <View style={styles.imageContainer}>
        {product.imageUrl ? (
          <Image source={{ uri: product.imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: colors.brand[100] }]}>
            <Text style={{ fontSize: 24, color: colors.brand[600] }}>
              {product.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        {discount != null && (
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
        {product.unit != null && product.unit !== '' && (
          <Text style={styles.unit}>{product.unit}</Text>
        )}
      </VStack>

      {/* Price */}
      <HStack gap={1.5} align="center">
        <Text style={styles.price}>₹{price}</Text>
        {mrp != null && Number.parseInt(mrp, 10) > Number.parseInt(price, 10) && (
          <Text style={styles.mrp}>₹{mrp}</Text>
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
              accessibilityRole="button"
              accessibilityLabel="Add to cart"
            >
              {isAdding ? (
                <ActivityIndicator size="small" color={colors.brand[600]} />
              ) : (
                <HStack gap={1} align="center">
                  <Plus size={14} color={colors.brand[600]} strokeWidth={2.5} />
                  <Text style={styles.addButtonText}>ADD</Text>
                </HStack>
              )}
            </Pressable>
          ) : (
            <HStack style={styles.quantitySelector} gap={0}>
              <Pressable 
                style={styles.quantityButton} 
                onPress={handleDecrement}
                accessibilityRole="button"
                accessibilityLabel="Decrease quantity"
              >
                <Minus size={14} color={colors.surface.background} strokeWidth={2.5} />
              </Pressable>
              <View style={styles.quantityDisplay}>
                <Text style={styles.quantityText}>{quantity}</Text>
              </View>
              <Pressable 
                style={styles.quantityButton} 
                onPress={handleIncrement}
                accessibilityRole="button"
                accessibilityLabel="Increase quantity"
              >
                <Plus size={14} color={colors.surface.background} strokeWidth={2.5} />
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
    borderWidth: 1,
    borderColor: colors.surface.border,
    ...shadows.xs.ios,
    elevation: shadows.xs.android,
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
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
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
    color: colors.surface.background,
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
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.surface.background,
  },
  name: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.surface.heading,
    lineHeight: 20,
  },
  unit: {
    fontSize: fontSize.xs,
    color: colors.surface.textSecondary,
  },
  price: {
    fontSize: fontSize.base,
    fontWeight: '700',
    color: colors.surface.heading,
  },
  mrp: {
    fontSize: fontSize.xs,
    color: colors.surface.textSecondary,
    textDecorationLine: 'line-through',
  },
  addButton: {
    height: 36,
    backgroundColor: colors.brand[50],
    borderWidth: 1,
    borderColor: colors.brand[600],
    borderRadius: radius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[1],
    marginTop: spacing[1],
  },
  addButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.brand[600],
    letterSpacing: 0.5,
  },
  quantitySelector: {
    height: 36,
    backgroundColor: colors.brand[600],
    borderRadius: radius.sm,
    overflow: 'hidden',
    marginTop: spacing[1],
  },
  quantityButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityDisplay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.surface.background,
  },
});
