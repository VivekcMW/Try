import { Pressable, StyleSheet, View } from 'react-native';
import { MapPin, Star, Clock, TrendingUp, BadgeCheck } from 'lucide-react-native';
import { Card, HStack, VStack, Text, Badge } from '@/components/ui';
import { colors, radius, spacing } from '@lokul/ui-tokens';
import type { MerchantNearby, MerchantTrending, MerchantRecommendation } from '@/services/catalogService';

type MerchantData = MerchantNearby | MerchantTrending | MerchantRecommendation;

interface MerchantCardProps {
  merchant: MerchantData;
  onPress?: () => void;
  showDistance?: boolean;
  showTrendingScore?: boolean;
  showRecommendationScore?: boolean;
}

export function MerchantCard({ 
  merchant, 
  onPress,
  showDistance = true,
  showTrendingScore = false,
  showRecommendationScore = false,
}: MerchantCardProps) {
  const hasRating = merchant.rating && merchant.rating > 0;
  const hasOffer = 'offer' in merchant && merchant.offer;
  const distanceKm = 'distanceKm' in merchant ? merchant.distanceKm : null;
  const trendingScore = 'trendingScore' in merchant ? merchant.trendingScore : null;
  const recommendationScore = 'recommendationScore' in merchant ? merchant.recommendationScore : null;
  
  // Format delivery fee
  const deliveryFee = 'deliveryFeePaise' in merchant && merchant.deliveryFeePaise
    ? `₹${(merchant.deliveryFeePaise / 100).toFixed(0)}`
    : null;
  
  const freeDelivery = 'freeDeliveryAbovePaise' in merchant && merchant.freeDeliveryAbovePaise;
  
  // Check if open now
  const isOpenNow = 'isOpenNow' in merchant ? merchant.isOpenNow : true;
  const acceptingOrders = 'acceptingOrders' in merchant ? merchant.acceptingOrders : true;

  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      <Card padding={0} elevation="sm" style={styles.card}>
        {/* Image placeholder or avatar */}
        <View style={styles.imageContainer}>
          {merchant.avatarUrl ? (
            <View style={styles.imagePlaceholder}>
              {/* TODO: Add image component */}
              <Text variant="caption" tone="secondary">Image</Text>
            </View>
          ) : (
            <View style={[styles.imagePlaceholder, { backgroundColor: colors.brand[100] }]}>
              <Text variant="h3" style={{ color: colors.brand[600] }}>
                {merchant.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          
          {/* Badges */}
          <View style={styles.badges}>
            {merchant.isEndorsed && (
              <View style={styles.endorsedBadge}>
                <BadgeCheck size={14} color="#fff" fill={colors.brand[600]} />
              </View>
            )}
            {hasOffer && (
              <Badge variant="success" size="sm" style={styles.offerBadge}>
                {merchant.offer.type === 'percent_off' && `${merchant.offer.value}% OFF`}
                {merchant.offer.type === 'flat_off' && `₹${merchant.offer.value / 100} OFF`}
                {merchant.offer.type === 'bogo' && 'BOGO'}
              </Badge>
            )}
          </View>
        </View>

        {/* Content */}
        <VStack gap={1.5} style={styles.content}>
          <VStack gap={0.5}>
            <HStack gap={2} align="center" justify="space-between">
              <Text variant="body" style={styles.name} numberOfLines={1}>
                {merchant.name}
              </Text>
              {merchant.subscriptionTier === 'premium' && (
                <Badge variant="brand" size="sm">Premium</Badge>
              )}
            </HStack>
            
            <Text variant="caption" tone="secondary" numberOfLines={1} style={{ textTransform: 'capitalize' }}>
              {merchant.category}
            </Text>
          </VStack>

          {/* Rating & Distance */}
          <HStack gap={3} align="center">
            {hasRating && (
              <HStack gap={1} align="center">
                <Star size={14} color={colors.amber[500]} fill={colors.amber[500]} />
                <Text variant="caption" style={{ fontWeight: '600' }}>
                  {merchant.rating.toFixed(1)}
                </Text>
                <Text variant="caption" tone="secondary">
                  ({merchant.ratingCount})
                </Text>
              </HStack>
            )}
            
            {showDistance && distanceKm !== null && (
              <HStack gap={1} align="center">
                <MapPin size={14} color={colors.surface.textSecondary} />
                <Text variant="caption" tone="secondary">
                  {distanceKm.toFixed(1)} km
                </Text>
              </HStack>
            )}

            {showTrendingScore && trendingScore !== null && (
              <HStack gap={1} align="center">
                <TrendingUp size={14} color={colors.brand[600]} />
                <Text variant="caption" style={{ color: colors.brand[600], fontWeight: '600' }}>
                  {(trendingScore * 100).toFixed(0)}
                </Text>
              </HStack>
            )}

            {showRecommendationScore && recommendationScore !== null && (
              <HStack gap={1} align="center">
                <Star size={14} color={colors.brand[600]} />
                <Text variant="caption" style={{ color: colors.brand[600], fontWeight: '600' }}>
                  {(recommendationScore * 100).toFixed(0)}% match
                </Text>
              </HStack>
            )}
          </HStack>

          {/* Delivery info */}
          {'estimatedDeliveryMins' in merchant && merchant.estimatedDeliveryMins && (
            <HStack gap={2} align="center">
              <HStack gap={1} align="center">
                <Clock size={14} color={colors.surface.textSecondary} />
                <Text variant="caption" tone="secondary">
                  {merchant.estimatedDeliveryMins} mins
                </Text>
              </HStack>
              
              {freeDelivery && (
                <Text variant="caption" style={{ color: colors.success[600], fontWeight: '600' }}>
                  Free delivery ₹{(merchant.freeDeliveryAbovePaise / 100).toFixed(0)}+
                </Text>
              )}
              
              {deliveryFee && !freeDelivery && (
                <Text variant="caption" tone="secondary">
                  Delivery {deliveryFee}
                </Text>
              )}
            </HStack>
          )}

          {/* Status */}
          {!isOpenNow || !acceptingOrders && (
            <HStack gap={1} align="center">
              <View style={[styles.statusDot, { backgroundColor: colors.error[500] }]} />
              <Text variant="caption" style={{ color: colors.error[600] }}>
                {'closedReason' in merchant && merchant.closedReason ? merchant.closedReason : 'Closed'}
              </Text>
            </HStack>
          )}
        </VStack>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  imageContainer: {
    height: 120,
    position: 'relative',
    backgroundColor: colors.surface.surfaceMuted,
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badges: {
    position: 'absolute',
    top: spacing[2],
    right: spacing[2],
    gap: spacing[1.5],
  },
  endorsedBadge: {
    width: 24,
    height: 24,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  offerBadge: {
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    padding: spacing[3.5],
  },
  name: {
    fontWeight: '700',
    color: colors.surface.heading,
    flex: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: radius.full,
  },
});
