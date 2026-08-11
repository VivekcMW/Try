import { Image, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Clock, MapPin, Star, Tag, BadgeCheck } from 'lucide-react-native';
import { Badge, HStack, Text } from '@/components/ui';
import { colors, radius, spacing, fontSize, shadows } from '@lokul/ui-tokens';

interface Merchant {
  id: string;
  name: string;
  avatarUrl?: string;
  category: string;
  rating?: number;
  reviewCount?: number;
  deliveryTime?: number;  // minutes
  deliveryFeePaise?: number;
  freeDeliveryAbovePaise?: number;
  offer?: {
    type: 'percent_off' | 'flat_off' | 'bogo';
    value: number;
  };
  tags?: string[];
  isEndorsed?: boolean;
  isOpenNow?: boolean;
  acceptingOrders?: boolean;
  distanceKm?: number;
}

interface MerchantSpotlightCardProps {
  merchant: Merchant;
  width?: number;
}

export function MerchantSpotlightCard({ merchant, width = 280 }: Readonly<MerchantSpotlightCardProps>) {
  const router = useRouter();

  const handlePress = () => {
    router.push({ pathname: '/(marketplace)/merchant/[id]', params: { id: merchant.id } } as any);
  };

  const isOpen = merchant.isOpenNow !== false && merchant.acceptingOrders !== false;
  const hasOffer = !!merchant.offer;
  const deliveryFee = merchant.deliveryFeePaise ? `₹${(merchant.deliveryFeePaise / 100).toFixed(0)}` : null;
  const freeDelivery = merchant.freeDeliveryAbovePaise && merchant.freeDeliveryAbovePaise > 0;

  return (
    <Pressable 
      style={[styles.card, { width }]} 
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`${merchant.name}, ${merchant.category}`}
    >
      {/* Image */}
      <View style={styles.imageContainer}>
        {merchant.avatarUrl ? (
          <Image source={{ uri: merchant.avatarUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: colors.brand[100] }]}>
            <Text style={{ fontSize: 32, color: colors.brand[600] }}>
              {merchant.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        
        {/* Rating Badge */}
        {merchant.rating != null && merchant.rating > 0 && (
          <View style={styles.ratingBadge}>
            <Star size={11} color={colors.surface.background} fill={colors.surface.background} />
            <Text style={styles.ratingText}>{merchant.rating.toFixed(1)}</Text>
          </View>
        )}

        {/* Offer Badge */}
        {hasOffer && (
          <View style={styles.offerBadge}>
            <Tag size={10} color={colors.surface.background} />
            <Text style={styles.offerText}>
              {merchant.offer.type === 'percent_off' && `${merchant.offer.value}% OFF`}
              {merchant.offer.type === 'flat_off' && `₹${merchant.offer.value / 100} OFF`}
              {merchant.offer.type === 'bogo' && 'BOGO'}
            </Text>
          </View>
        )}

        {/* Endorsed Badge — labeled trust signal */}
        {merchant.isEndorsed && (
          <View style={styles.endorsedBadge}>
            <BadgeCheck size={12} color={colors.surface.background} />
            <Text style={styles.endorsedText}>Trusted by neighbors</Text>
          </View>
        )}

        {/* Closed Overlay */}
        {!isOpen && (
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
        <HStack gap={1.5} align="center" style={styles.metadata}>
          {merchant.deliveryTime != null && (
            <>
              <HStack gap={0.5} align="center">
                <Clock size={12} color={colors.surface.textSecondary} />
                <Text style={styles.metaText}>{merchant.deliveryTime} min</Text>
              </HStack>
              <Text style={styles.separator}>·</Text>
            </>
          )}
          
          {merchant.distanceKm !== undefined && (
            <HStack gap={0.5} align="center">
              <MapPin size={12} color={colors.surface.textSecondary} />
              <Text style={styles.metaText}>{merchant.distanceKm.toFixed(1)} km</Text>
            </HStack>
          )}
          
          {freeDelivery && (
            <>
              <Text style={styles.separator}>·</Text>
              <Text style={[styles.metaText, { color: colors.semantic.success }]}>
                Free delivery
              </Text>
            </>
          )}
          
          {deliveryFee != null && !freeDelivery && (
            <>
              <Text style={styles.separator}>·</Text>
              <Text style={styles.metaText}>
                {deliveryFee} delivery
              </Text>
            </>
          )}
        </HStack>

        {/* Tags */}
        {merchant.tags && merchant.tags.length > 0 && (
          <HStack gap={1.5} style={styles.tags}>
            {merchant.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} label={tag} size="sm" tone="neutral" />
            ))}
          </HStack>
        )}

        {/* CTA Button */}
        <Pressable
          style={[styles.ctaButton, !isOpen && styles.ctaButtonDisabled]}
          onPress={handlePress}
          disabled={!isOpen}
          accessibilityRole="button"
        >
          <Text style={[styles.ctaText, !isOpen && styles.ctaTextDisabled]}>
            {isOpen ? 'View Menu' : 'Closed'}
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    // No fixed height — a 220px cap clipped the tags + CTA button
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.surface.background,
    borderWidth: 1,
    borderColor: colors.surface.border,
    ...shadows.xs.ios,
    elevation: shadows.xs.android,
  },
  imageContainer: {
    height: 120,
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
  ratingBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[0.5],
    paddingHorizontal: spacing[1.5],
    paddingVertical: spacing[0.5],
    backgroundColor: colors.semantic.success,
    borderRadius: radius.xs,
  },
  ratingText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.surface.background,
  },
  offerBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[0.5],
    paddingHorizontal: spacing[1.5],
    paddingVertical: spacing[0.5],
    backgroundColor: colors.accent[500],
    borderRadius: radius.xs,
  },
  offerText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.surface.background,
  },
  endorsedBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[1.5],
    paddingVertical: spacing[0.5],
    backgroundColor: colors.brand[600],
    borderRadius: radius.xs,
  },
  endorsedText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.surface.background,
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
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.surface.background,
  },
  content: {
    flex: 1,
    padding: spacing[3],
    gap: spacing[1.5],
  },
  name: {
    fontSize: fontSize.base,
    fontWeight: '700',
    color: colors.surface.heading,
  },
  category: {
    fontSize: fontSize.xs,
    color: colors.surface.textSecondary,
  },
  metadata: {
    flexWrap: 'wrap',
  },
  metaText: {
    fontSize: fontSize.xs,
    color: colors.surface.textSecondary,
  },
  separator: {
    fontSize: fontSize.xs,
    color: colors.surface.textSecondary,
  },
  tags: {
    flexWrap: 'wrap',
  },
  ctaButton: {
    marginTop: 'auto',
    paddingVertical: spacing[2],
    backgroundColor: colors.brand[50],
    borderWidth: 1,
    borderColor: colors.brand[600],
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  ctaButtonDisabled: {
    backgroundColor: colors.surface.surfaceMuted,
    borderColor: colors.surface.border,
  },
  ctaText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.brand[600],
  },
  ctaTextDisabled: {
    color: colors.surface.textDisabled,
  },
});
