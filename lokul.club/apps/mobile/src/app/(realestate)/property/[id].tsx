/**
 * Property detail
 * Route: /(realestate)/property/[id]
 */
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, BadgeCheck, Building, Home, MapPin, MessageCircle, Phone } from 'lucide-react-native';
import { Badge, Button, Card, HStack, Text, VStack } from '@/components/ui';
import { colors, spacing } from '@lokul/ui-tokens';
import { formatPrice, type PropertyDealType } from '../index';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

type ApiProperty = {
  id: string;
  title: string;
  dealType: PropertyDealType;
  buildingType: 'apartment' | 'house' | 'villa' | 'plot' | 'pg';
  bhk: string | null;
  areaSqft: number;
  pricePaise: number;
  priceUnit: string | null;
  location: string;
  amenities: string[];
  furnishing: string | null;
  floor: string | null;
  availableFrom: string | null;
  description: string | null;
  verified: boolean;
  createdAt: string;
  owner: { id: string; name: string; kycTier: string };
};

export default function PropertyDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [property, setProperty] = useState<ApiProperty | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/realestate/properties/${id}`);
      const data = await res.json();
      setProperty(res.ok ? data.property : null);
    } catch {
      setProperty(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ActivityIndicator style={{ marginTop: spacing[12] }} color={colors.brand[600]} />
      </SafeAreaView>
    );
  }

  if (!property) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <HStack style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <ArrowLeft size={24} color={colors.foreground} />
          </Pressable>
          <Text variant="h3" style={{ fontWeight: '700' }}>Property not found</Text>
        </HStack>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <HStack style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={24} color={colors.foreground} />
        </Pressable>
        <Text variant="h3" style={{ fontWeight: '700', flex: 1 }} numberOfLines={1}>{property.title}</Text>
      </HStack>

      <ScrollView contentContainerStyle={styles.content}>
        <VStack gap="lg">
          <View style={styles.imagePlaceholder}>
            {property.buildingType === 'apartment' ? (
              <Building size={48} color={colors.textSecondary} />
            ) : (
              <Home size={48} color={colors.textSecondary} />
            )}
          </View>

          <Card style={styles.card}>
            <HStack style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <Text variant="h2" style={{ fontWeight: '700', color: colors.brand[600] }}>
                {formatPrice(property.pricePaise, property.dealType)}{property.priceUnit ?? ''}
              </Text>
              {property.verified && <BadgeCheck size={18} color={colors.success} />}
            </HStack>
            <Text variant="body" style={{ fontWeight: '600', marginTop: spacing.xs }}>{property.title}</Text>
            <HStack gap="xs" style={{ marginTop: spacing.xs }}>
              <MapPin size={13} color={colors.brand[600]} />
              <Text variant="caption" style={{ color: colors.brand[600] }}>{property.location}</Text>
            </HStack>
          </Card>

          <Card style={styles.card}>
            <Text variant="label" tone="secondary" style={{ marginBottom: spacing.sm }}>Details</Text>
            <VStack gap="sm">
              {property.bhk && (
                <HStack style={{ justifyContent: 'space-between' }}>
                  <Text variant="caption" tone="secondary">Configuration</Text>
                  <Text variant="body" style={{ fontWeight: '500' }}>{property.bhk}</Text>
                </HStack>
              )}
              <HStack style={{ justifyContent: 'space-between' }}>
                <Text variant="caption" tone="secondary">Area</Text>
                <Text variant="body" style={{ fontWeight: '500' }}>{property.areaSqft} sq.ft</Text>
              </HStack>
              {property.furnishing && (
                <HStack style={{ justifyContent: 'space-between' }}>
                  <Text variant="caption" tone="secondary">Furnishing</Text>
                  <Text variant="body" style={{ fontWeight: '500' }}>{property.furnishing}</Text>
                </HStack>
              )}
              {property.floor && (
                <HStack style={{ justifyContent: 'space-between' }}>
                  <Text variant="caption" tone="secondary">Floor</Text>
                  <Text variant="body" style={{ fontWeight: '500' }}>{property.floor}</Text>
                </HStack>
              )}
              {property.availableFrom && (
                <HStack style={{ justifyContent: 'space-between' }}>
                  <Text variant="caption" tone="secondary">Available from</Text>
                  <Text variant="body" style={{ fontWeight: '500' }}>{property.availableFrom}</Text>
                </HStack>
              )}
            </VStack>
          </Card>

          {property.amenities.length > 0 && (
            <Card style={styles.card}>
              <Text variant="label" tone="secondary" style={{ marginBottom: spacing.sm }}>Amenities</Text>
              <HStack gap="sm" style={{ flexWrap: 'wrap' }}>
                {property.amenities.map((a) => (
                  <Badge key={a} label={a} tone="neutral" />
                ))}
              </HStack>
            </Card>
          )}

          {property.description && (
            <Card style={styles.card}>
              <Text variant="label" tone="secondary" style={{ marginBottom: spacing.xs }}>Description</Text>
              <Text variant="body">{property.description}</Text>
            </Card>
          )}

          <Card style={styles.card}>
            <Text variant="label" tone="secondary" style={{ marginBottom: spacing.xs }}>Posted by</Text>
            <HStack gap="xs">
              <Text variant="body" style={{ fontWeight: '600' }}>{property.owner.name}</Text>
              {property.owner.kycTier !== 'bronze' && <BadgeCheck size={14} color={colors.success} />}
            </HStack>
          </Card>

          <HStack gap="md">
            <Button
              label="Call"
              variant="secondary"
              leftIcon={<Phone size={16} color={colors.brand[600]} />}
              onPress={() => Alert.alert('Call', `Calling ${property.owner.name}…`)}
              fullWidth
            />
            <Button
              label="Message"
              leftIcon={<MessageCircle size={16} color="#fff" />}
              onPress={() => Alert.alert('Message sent', `${property.owner.name} will get back to you shortly.`)}
              fullWidth
            />
          </HStack>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  content: { padding: spacing.lg, paddingBottom: 100 },
  card: { padding: spacing.md },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
